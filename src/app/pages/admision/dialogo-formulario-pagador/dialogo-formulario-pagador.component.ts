import { Component, OnInit, Inject} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormGroup, FormBuilder, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { InfoPersona } from '../../../@core/data/models/informacion/info_persona';
import { ReciboPago } from '../../../@core/data/models/inscripcion/recibo_pago';
import { Periodo } from '../../../@core/data/models/periodo/periodo';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import * as moment from 'moment';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalDataSource } from 'ng2-smart-table';
import { AgoraService } from '../../../@core/data/agora.service';
import Swal from 'sweetalert2';
import { forEach } from 'jszip';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'dialogo-formulario-pagador',
  templateUrl: './dialogo-formulario-pagador.component.html',
  styleUrls: ['./dialogo-formulario-pagador.component.scss']
})
export class DialogoFormularioPagadorComponent implements OnInit {

  info_info_persona: InfoPersona;
  revisionForm: FormGroup;
  loading: boolean;
  selectedLevel: any;
  selectedProject: any;
  recibo_pago: ReciboPago;
  periodo: Periodo;
  parametro: string;
  inscripcionProjects: any[];
  recibo_generado: any;
  periodos = [];
  dataSource: LocalDataSource;
  direccionForm: FormGroup;
  parametros_nomenclatura_dian = [];
  vias = [];
  interior = [];
  naturalezas = [];
  mostrarDigitoVerificacion: boolean;
  esJuridica: boolean = false;
  direccionPreview: string = '';
  accion: string;

  constructor(
    public dialogRef: MatDialogRef<DialogoFormularioPagadorComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private builder: FormBuilder,
    private sgaMidService: SgaMidService,
    private parametrosService: ParametrosService,
    private AgoraService: AgoraService,
    private fb: FormBuilder,
  ) {
    this.crearForm();
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
    this.cargarPeriodo();
    this.cargarNomenclaturasDian();
    this.direccionForm = this.fb.group({
      tipoVia: ['']
    });
    this.naturalezas = [
      { value: 'N', nombre: 'Natural' },
      { value: 'J', nombre: 'Jurídica' }
    ];
    this.mostrarDigitoVerificacion = false;
    this.accion = data.accion || 'descargar';
  }

  ngOnInit() {
    const camposDireccion = [
      'tipoVia', 'numeroVia', 'numeroSecundario', 'complementoDireccion',
      'tipoInterior1', 'numeroInterior1', 'tipoInterior2', 'numeroInterior2'
    ];

    camposDireccion.forEach(campo => {
      this.revisionForm.get(campo).valueChanges.subscribe(() => {
        this.actualizarDireccionPreview();
      });
    });

    // this.revisionForm.get('digito_verificacion').statusChanges.subscribe(status => {
    //   console.log('Estado de validación:', status);
    //   console.log('Errores:', this.revisionForm.get('digito_verificacion').errors);
    // });

    const camposQueAfectanDigito = ['naturaleza', 'tipoDocumento', 'numeroDocumento'];
    camposQueAfectanDigito.forEach(campo => {
      this.revisionForm.get(campo).valueChanges.subscribe(() => {
        setTimeout(() => this.actualizarValidacionDigito(), 0);
      });
    });

    // this.revisionForm.get('digito_verificacion').statusChanges.subscribe(status => {
    //   const errors = this.revisionForm.get('digito_verificacion').errors;
    //   console.log('Estado de validación:', status);
    //   console.log('Errores:', errors);
      
    //   // Verificar específicamente el error de dígito incorrecto
    //   if (errors && errors['digitoIncorrecto']) {
    //     console.log('¡ERROR DE DÍGITO DETECTADO!');
    //   }
    // });
  }

  onNaturalezaChange(event: MatSelectChange): void {
    this.esJuridica = event.value === 'J';
    this.actualizarValidadoresPorNaturaleza(event.value);
  }

  cargarNomenclaturasDian() {
    this.AgoraService.get('parametro_nomenclatura_dian?limit=0')
      .subscribe(grupo => {
          this.parametros_nomenclatura_dian = grupo['Data'];
          this.parametros_nomenclatura_dian.forEach(element => {
            if (element['Tipo'] === 1) {
              this.vias.push({
                Abreviatura: element.Abreviatura, 
                Nomenclatura: element.Nomenclatura
              });
            } 
            if (element['Tipo'] === 0)  {
              this.interior.push({
                Abreviatura: element.Abreviatura,
                Nomenclatura: element.Nomenclatura
              });
            }
          });    
          console.log(this.vias);
          console.log(this.interior);
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + ' - ' +
              this.translate.instant('admision.nomenclatura_dian'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });

  }

  cargarPeriodo() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = <any>res['Data'][0];
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
          }
          this.loading = false;
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            reject([]);
          });
    });
  }

  descargarReciboPago() {
    if (this.selectedLevel === undefined) {
      this.selectedLevel = parseInt(this.data.info_recibo.NivelPP, 10);
    }
    this.info_info_persona = this.data.info_info_persona;
    if (this.info_info_persona != null) {
      this.selectedProject = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10)
      this.recibo_pago = new ReciboPago();
      this.recibo_pago.NombreDelAspirante = this.info_info_persona.PrimerNombre + ' ' +
        this.info_info_persona.SegundoNombre + ' ' + this.info_info_persona.PrimerApellido + ' ' + this.info_info_persona.SegundoApellido;
      this.recibo_pago.DocumentoDelAspirante = this.info_info_persona.NumeroIdentificacion;
      this.recibo_pago.Periodo = this.periodo.Nombre;
      this.recibo_pago.ProyectoAspirante = this.data.info_recibo['ProgramaAcademicoId']
      this.recibo_pago.Comprobante = this.data.info_recibo['ReciboInscripcion'][0];
      if (this.selectedLevel === 1) {
        this.parametro = '13';
      } else if (this.selectedLevel === 2) {
        this.parametro = '12';
      }
      this.loading = true;
      let periodo = localStorage.getItem('IdPeriodo');
      this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + this.selectedLevel + '/periodo/' + periodo).subscribe(
        (response: any[]) => {
          this.loading = false;
          if (response !== null && response.length !== 0) {
            this.inscripcionProjects = response;
            this.inscripcionProjects.forEach(proyecto => {
              if (proyecto.ProyectoId === this.selectedProject && proyecto.Evento != null) {
                this.recibo_pago.Fecha_pago = moment(proyecto.Evento.FechaFinEvento, 'YYYY-MM-DD').format('DD/MM/YYYY');
              }
            });
            this.loading = true;
            const anioConcepto = this.periodo.Ciclo === '1' ? this.periodo.Year - 1 : this.periodo.Year;
            this.parametrosService.get('parametro_periodo?query=ParametroId.TipoParametroId.Id:2,' +
              'ParametroId.CodigoAbreviacion:' + this.parametro + ',PeriodoId.Year:' + anioConcepto + ',PeriodoId.CodigoAbreviacion:VG').subscribe(
                response => {
                  this.loading = false;
                  const parametro = <any>response['Data'][0];
                  this.recibo_pago.Descripcion = parametro['ParametroId']['Nombre'];
                  const valor = JSON.parse(parametro['Valor']);
                  this.recibo_pago.ValorDerecho = valor['Costo']
                  this.sgaMidService.post('generar_recibo', this.recibo_pago).subscribe(
                    response => {
                      this.loading = false;
                      const reciboData = new Uint8Array(atob(response['Data']).split('').map(char => char.charCodeAt(0)));
                      this.recibo_generado = window.URL.createObjectURL(new Blob([reciboData], { type: 'application/pdf' }));
                      window.open(this.recibo_generado);
                    },
                    error => {
                      this.loading = false;
                      this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
                    },
                  );
                },
                error => {
                  this.loading = false;
                  this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
                },
              );
          }
        },
        error => {
          this.loading = false;
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('calendario.sin_proyecto_curricular'));
        },
      );
    }
  }

  crearForm() {
    this.revisionForm = this.builder.group({
      aprobado: [false, Validators.required],
      naturaleza: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      razonSocial: [''],
      tipoVia: ['', Validators.required],
      numeroVia: ['', Validators.required],
      numeroSecundario: ['', Validators.required],
      complementoDireccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)]],
      correo: ['', [Validators.required, Validators.email]],

      digito_verificacion: ['', {
        validators: [
          Validators.required, 
          Validators.pattern(/^[0-9]$/),
          this.validarDigito()
        ],
        updateOn: 'blur'
      }],

      tipoInterior1: [''],
      numeroInterior1: [''],
      tipoInterior2: [''],
      numeroInterior2: [''],
    });
    
    this.revisionForm.get('naturaleza')!.valueChanges.subscribe(value => {
      this.esJuridica = value === 'J';
      this.actualizarValidadoresPorNaturaleza(value);
    });

    this.revisionForm.get('tipoDocumento')!.valueChanges.subscribe(value => {
      if (this.esJuridica && (value === 'N' || value === 'X')) {
        this.mostrarDigitoVerificacion = true;
        this.revisionForm.get('digito_verificacion')!.setValidators([Validators.required, Validators.pattern(/^[0-9]$/)]);
      } else {
        this.mostrarDigitoVerificacion = false;
        this.revisionForm.get('digito_verificacion')!.clearValidators();
      }
      this.revisionForm.get('digito_verificacion')!.updateValueAndValidity();
    });
  }

  actualizarValidadoresPorNaturaleza(naturaleza: string) {
    const primerNombreControl = this.revisionForm.get('primerNombre');
    const segundoNombreControl = this.revisionForm.get('segundoNombre');
    const primerApellidoControl = this.revisionForm.get('primerApellido');
    const segundoApellidoControl = this.revisionForm.get('segundoApellido');
    const razonSocialControl = this.revisionForm.get('razonSocial');
    const digitoVerificacionControl = this.revisionForm.get('digito_verificacion');
    
    if (naturaleza === 'J') { // Es jurídica
      primerNombreControl.clearValidators();
      segundoNombreControl.clearValidators();
      primerApellidoControl.clearValidators();
      segundoApellidoControl.clearValidators();
      razonSocialControl.setValidators([Validators.required]);
      digitoVerificacionControl.setValidators([Validators.required, Validators.pattern(/^[0-9]$/)]);
    } else { // Es natural
      primerNombreControl.setValidators([Validators.required]);
      primerApellidoControl.setValidators([Validators.required]);
      razonSocialControl.clearValidators();
      digitoVerificacionControl.clearValidators();
    }

    primerNombreControl.updateValueAndValidity();
    segundoNombreControl.updateValueAndValidity();
    primerApellidoControl.updateValueAndValidity();
    segundoApellidoControl.updateValueAndValidity();
    razonSocialControl.updateValueAndValidity();
    digitoVerificacionControl.updateValueAndValidity();
  }

  guardarRevision() {
    if (this.revisionForm.valid) {
      this.popUpManager.showConfirmAlert(this.translate.instant('admision.seguro_pagador')).then(
        ok => {
          if (ok.value) {
            this.dialogRef.close();
            
            if (this.accion === 'descargar') {
              this.descargarReciboPago();
            } else if (this.accion === 'pagar') {
              this.dialogRef.close({ continuar: true });
            }
          } else {
            this.revisionForm.patchValue({
              aprobado: false,
            });
          }
        }
      );
    } else {
      this.popUpManager.showErrorAlert(
        this.translate.instant('GLOBAL.vacio')
      );
    }
  }

  actualizarDireccionPreview() {
    // Dirección principal
    const tipoVia = this.revisionForm.get('tipoVia').value || '';
    const numeroVia = this.revisionForm.get('numeroVia').value || '';
    const numeroSecundario = this.revisionForm.get('numeroSecundario').value || '';
    const complemento = this.revisionForm.get('complementoDireccion').value || '';
    
    // Interiores
    const tipoInterior1 = this.revisionForm.get('tipoInterior1').value || '';
    const numeroInterior1 = this.revisionForm.get('numeroInterior1').value || '';
    const tipoInterior2 = this.revisionForm.get('tipoInterior2').value || '';
    const numeroInterior2 = this.revisionForm.get('numeroInterior2').value || '';
    
    // Construir la dirección principal
    let direccion = '';
    
    if (tipoVia) {
      direccion += tipoVia;
    }
    
    if (numeroVia) {
      direccion += ' ' + numeroVia;
    }
    
    if (numeroSecundario) {
      direccion += ' # ' + numeroSecundario;
    }
    
    if (complemento) {
      direccion += ' - ' + complemento;
    }
    
    // Añadir interior 1 si existe
    if (tipoInterior1 && numeroInterior1) {
      direccion += ', ' + tipoInterior1 + ' ' + numeroInterior1;
    }
    
    // Añadir interior 2 si existe
    if (tipoInterior2 && numeroInterior2) {
      direccion += ', ' + tipoInterior2 + ' ' + numeroInterior2;
    }
    
    this.direccionPreview = direccion.trim();
  }

  calcularDigitoVerificacion(nit: string): string {
    nit = nit.replace(/[^0-9]/g, '');
    
    const factores = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    
    if (nit.length > factores.length) {
      nit = nit.substring(nit.length - factores.length);
    }
    
    let suma = 0;
    
    for (let i = 0; i < nit.length; i++) {
      const posicion = nit.length - 1 - i;
      const digito = parseInt(nit.charAt(posicion), 10);
      suma += digito * factores[i];      
      //console.log(`Posición ${posicion}: ${digito} × ${factores[i]} = ${digito * factores[i]}`);
    }
    
    const modulo = suma % 11;
    
    let digitoVerificacion;
    if (modulo === 0 || modulo === 1) {
      digitoVerificacion = modulo.toString();
    } else {
      digitoVerificacion = (11 - modulo).toString();
    }
    
    return digitoVerificacion;
  }

  validarDigito(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || !control.value || !this.revisionForm) {
        return null;
      }
      
      const numeroDocumentoControl = this.revisionForm.get('numeroDocumento');
      const naturalezaControl = this.revisionForm.get('naturaleza');
      const tipoDocumentoControl = this.revisionForm.get('tipoDocumento');
      
      if (!numeroDocumentoControl || !naturalezaControl || !tipoDocumentoControl) {
        return null;
      }
      
      const numeroDocumento = numeroDocumentoControl.value;
      const naturaleza = naturalezaControl.value;
      const tipoDocumento = tipoDocumentoControl.value;
      
      // Solo validar para jurídicas con NIT
      if (naturaleza === 'J' && (tipoDocumento === 'N' || tipoDocumento === 'X') && numeroDocumento) {
        const digitoCalculado = this.calcularDigitoVerificacion(numeroDocumento);
        const digitoIngresado = control.value.toString();
        
        if (digitoIngresado !== digitoCalculado) {
          return { digitoIncorrecto: true };
        }
      }
      
      return null;
    };
  }

  actualizarValidacionDigito() {
    const digitoControl = this.revisionForm.get('digito_verificacion');
    const naturaleza = this.revisionForm.get('naturaleza').value;
    const tipoDoc = this.revisionForm.get('tipoDocumento').value;
    
    digitoControl.clearValidators();
    
    if (naturaleza === 'J' && (tipoDoc === 'N' || tipoDoc === 'X')) {
      digitoControl.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]$/),
        this.validarDigito()
      ]);
    } else {
      digitoControl.setValidators([]);
    }
    
    digitoControl.updateValueAndValidity();
  }

  continuar() {
    if (this.accion === 'descargar') {
      this.dialogRef.close();
      this.descargarReciboPago();
    } else if (this.accion === 'pagar') {
      this.dialogRef.close({ continuar: true });
    }
  }
}
