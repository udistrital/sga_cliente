import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormGroup, FormBuilder, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
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
import { MatSelectChange } from '@angular/material/select';
import { DatosPagador } from '../../../@core/data/models/datos_pagador/datos_pagador';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'dialogo-formulario-pagador',
  templateUrl: './dialogo-formulario-pagador.component.html',
  styleUrls: ['./dialogo-formulario-pagador.component.scss']
})
export class DialogoFormularioPagadorComponent implements OnInit, OnDestroy {
  // Datos del pagador
  info_info_persona: InfoPersona;
  revisionForm: FormGroup;
  datosPagador: DatosPagador;
  datosPagadorOriginal: DatosPagador = null;
  
  // Datos de pago
  selectedLevel: any;
  selectedProject: any;
  recibo_pago: ReciboPago;
  periodo: Periodo;
  parametro: string;
  inscripcionProjects: any[];
  recibo_generado: any;
  periodos = [];
  
  // Estado del componente
  loading: boolean = false;
  esJuridica: boolean = false;
  mostrarDigitoVerificacion: boolean = false;
  formularioModificado: boolean = false;
  deshabilitarBotonContinuar: boolean = true;
  direccionPreview: string = '';
  accion: string;
  
  // Datos para selección
  dataSource: LocalDataSource;
  parametros_nomenclatura_dian = [];
  vias = [];
  interior = [];
  naturalezas = [
    { value: 'N', nombre: 'Natural' },
    { value: 'J', nombre: 'Jurídica' }
  ];
  
  // Gestión de suscripciones
  private suscripciones: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogoFormularioPagadorComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private builder: FormBuilder,
    private sgaMidService: SgaMidService,
    private parametrosService: ParametrosService,
    private agoraService: AgoraService
  ) {
    this.accion = data.accion || 'descargar';
    this.crearForm();
    this.suscripciones.push(
      this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close())
    );
    this.cargarPeriodo();
    this.cargarNomenclaturasDian();
  }

  ngOnInit() {
    // Configurar observadores para campos de dirección
    const camposDireccion = [
      'tipoVia', 'numeroVia', 'numeroSecundario', 'complementoDireccion',
      'tipoInterior1', 'numeroInterior1', 'tipoInterior2', 'numeroInterior2'
    ];

    camposDireccion.forEach(campo => {
      this.suscripciones.push(
        this.revisionForm.get(campo).valueChanges.subscribe(() => {
          this.actualizarDireccionPreview();
        })
      );
    });

    // Configurar observadores para validación del dígito
    const camposQueAfectanDigito = ['naturaleza', 'tipoDocumento', 'numeroDocumento'];
    camposQueAfectanDigito.forEach(campo => {
      this.suscripciones.push(
        this.revisionForm.get(campo).valueChanges.subscribe(() => {
          setTimeout(() => this.actualizarValidacionDigito(), 0);
        })
      );
    });

    // Detectar modificaciones en el formulario
    this.suscripciones.push(
      this.revisionForm.valueChanges.subscribe(() => {
        this.formularioModificado = this.datosPagadorOriginal ? this.hayModificaciones() : true;
      })
    );

    // Cargar datos del pagador si existen
    this.consultarDatosPagador();
  }
  
  ngOnDestroy() {
    // Liberar recursos al destruir el componente
    this.suscripciones.forEach(sub => sub.unsubscribe());
  }

  /**
   * Método para manejar cambio de naturaleza (jurídica/natural)
   */
  onNaturalezaChange(event: MatSelectChange): void {
    this.esJuridica = event.value === 'J';
    this.actualizarValidadoresPorNaturaleza(event.value);
  }

  /**
   * Carga nomenclaturas DIAN para vías e interiores
   */
  cargarNomenclaturasDian() {
    this.setLoading(true);
    
    this.suscripciones.push(
      this.agoraService.get('parametro_nomenclatura_dian?limit=0')
        .pipe(finalize(() => this.setLoading(false)))
        .subscribe(
          grupo => {
            this.parametros_nomenclatura_dian = grupo['Data'];
            
            // Filtrar vías e interiores
            this.vias = this.parametros_nomenclatura_dian
              .filter(element => element['Tipo'] === 1)
              .map(element => ({
                Abreviatura: element.Abreviatura,
                Nomenclatura: element.Nomenclatura
              }));
              
            this.interior = this.parametros_nomenclatura_dian
              .filter(element => element['Tipo'] === 0)
              .map(element => ({
                Abreviatura: element.Abreviatura,
                Nomenclatura: element.Nomenclatura
              }));
          },
          (error: HttpErrorResponse) => this.manejarError(error, 'admision.nomenclatura_dian')
        )
    );
  }

  /**
   * Carga información del periodo activo
   */
  cargarPeriodo() {
    this.setLoading(true);
    
    return new Promise((resolve, reject) => {
      this.suscripciones.push(
        this.parametrosService.get('periodo?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1')
          .pipe(finalize(() => this.setLoading(false)))
          .subscribe(
            res => {
              const r = <any>res;
              if (res !== null && r.Status === '200') {
                this.periodo = <any>res['Data'][0];
                window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
                
                const periodos = <any[]>res['Data'];
                periodos.forEach(element => {
                  this.periodos.push(element);
                });
                
                resolve(this.periodo);
              }
            },
            (error: HttpErrorResponse) => {
              reject([]);
            }
          )
      );
    });
  }

  /**
   * Método completo para descargar recibo y cerrar diálogo
   * (Solución para el problema de descarga)
   */
  descargarReciboCompletoYCerrar() {
    // Mostrar indicador de carga
    this.setLoading(true);
    
    // Preparar los datos básicos
    const nivel = this.selectedLevel || parseInt(this.data.info_recibo.NivelPP, 10);
    const proyecto = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10);
    const numeroRecibo = Array.isArray(this.data.info_recibo.ReciboInscripcion) 
      ? this.data.info_recibo.ReciboInscripcion[0] 
      : this.data.info_recibo.ReciboInscripcion;
    const periodoId = localStorage.getItem('IdPeriodo');
    const parametro = nivel === 1 ? '13' : '12';
    
    // Preparar el objeto recibo
    const recibo = new ReciboPago();
    recibo.NombreDelAspirante = this.data.info_info_persona.PrimerNombre + ' ' +
      this.data.info_info_persona.SegundoNombre + ' ' + this.data.info_info_persona.PrimerApellido + ' ' + 
      this.data.info_info_persona.SegundoApellido;
    recibo.DocumentoDelAspirante = this.data.info_info_persona.NumeroIdentificacion;
    recibo.Periodo = this.periodo.Nombre;
    recibo.ProyectoAspirante = this.data.info_recibo.ProgramaAcademicoId;
    recibo.Comprobante = numeroRecibo;
    
    // Secuencia de solicitudes en cadena para garantizar el orden correcto
    this.sgaMidService.get(`consulta_calendario_proyecto/nivel/${nivel}/periodo/${periodoId}`)
      .subscribe((calendario: any[]) => {
        // Verificar si tenemos proyectos
        if (!calendario || calendario.length === 0) {
          this.popUpManager.showAlert(
            this.translate.instant('GLOBAL.info'), 
            this.translate.instant('calendario.sin_proyecto_curricular')
          );
          this.setLoading(false);
          return;
        }
        
        // Buscar el proyecto y establecer la fecha
        for (const proyecto_item of calendario) {
          if (proyecto_item.ProyectoId === proyecto && proyecto_item.Evento) {
            recibo.Fecha_pago = moment(proyecto_item.Evento.FechaFinEvento, 'YYYY-MM-DD').format('DD/MM/YYYY');
            break;
          }
        }
        
        // Obtener parámetros
        const anioConcepto = this.periodo.Ciclo === '1' ? this.periodo.Year - 1 : this.periodo.Year;
        this.parametrosService.get(
          `parametro_periodo?query=ParametroId.TipoParametroId.Id:2,ParametroId.CodigoAbreviacion:${parametro},PeriodoId.Year:${anioConcepto},PeriodoId.CodigoAbreviacion:VG`
        ).subscribe((parametros: any) => {
          if (!parametros || !parametros.Data || parametros.Data.length === 0) {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            this.setLoading(false);
            return;
          }
          
          // Configurar descripción y valor
          const parametro_data = parametros.Data[0];
          recibo.Descripcion = parametro_data.ParametroId.Nombre;
          const valor = JSON.parse(parametro_data.Valor);
          recibo.ValorDerecho = valor.Costo;
          
          // Generar el recibo
          this.sgaMidService.post('generar_recibo', recibo)
            .subscribe((respuesta: any) => {
              this.setLoading(false);
              
              if (respuesta && respuesta.Data) {
                // Procesar el PDF
                const reciboData = new Uint8Array(atob(respuesta.Data).split('').map(char => char.charCodeAt(0)));
                const pdf = new Blob([reciboData], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(pdf);
                
                // Abrir el PDF en una nueva ventana
                window.open(url, '_blank');
                
                // Esperar un breve momento para asegurarnos de que el navegador procese la apertura
                setTimeout(() => {
                  // Una vez abierto el PDF, ahora podemos cerrar el diálogo
                  this.dialogRef.close();
                }, 100);
              } else {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.no_generado'));
              }
            }, error => {
              this.setLoading(false);
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.no_generado'));
              console.error('Error generando recibo:', error);
            });
        }, error => {
          this.setLoading(false);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          console.error('Error obteniendo parámetros:', error);
        });
      }, error => {
        this.setLoading(false);
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.info'), 
          this.translate.instant('calendario.sin_proyecto_curricular')
        );
        console.error('Error consultando calendario:', error);
      });
  }

  /**
   * Crea el formulario con validaciones iniciales
   */
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
      razonSocial: ['', [Validators.required, Validators.maxLength(100)]],
      tipoVia: ['', Validators.required],
      numeroVia: ['', [Validators.required, this.noEspaciosValidator()]],
      numeroSecundario: ['',  [Validators.required, this.noEspaciosValidator()]],
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
    
    // Observar cambios en naturaleza
    this.suscripciones.push(
      this.revisionForm.get('naturaleza').valueChanges.subscribe(value => {
        this.esJuridica = value === 'J';
        this.actualizarValidadoresPorNaturaleza(value);
      })
    );
    
    // Observar cambios en tipo de documento
    this.suscripciones.push(
      this.revisionForm.get('tipoDocumento').valueChanges.subscribe(value => {
        if (this.esJuridica && (value === 'N' || value === 'X')) {
          this.mostrarDigitoVerificacion = true;
          this.revisionForm.get('digito_verificacion').setValidators([
            Validators.required, 
            Validators.pattern(/^[0-9]$/)
          ]);
        } else {
          this.mostrarDigitoVerificacion = false;
          this.revisionForm.get('digito_verificacion').clearValidators();
        }
        this.revisionForm.get('digito_verificacion').updateValueAndValidity();
      })
    );
  }

  /**
   * Actualiza validadores según naturaleza del pagador
   */
  actualizarValidadoresPorNaturaleza(naturaleza: string) {
    const controles = {
      primerNombre: this.revisionForm.get('primerNombre'),
      segundoNombre: this.revisionForm.get('segundoNombre'),
      primerApellido: this.revisionForm.get('primerApellido'),
      segundoApellido: this.revisionForm.get('segundoApellido'),
      razonSocial: this.revisionForm.get('razonSocial'),
      digito_verificacion: this.revisionForm.get('digito_verificacion')
    };
    
    if (naturaleza === 'J') { // Jurídica
      controles.primerNombre.clearValidators();
      controles.segundoNombre.clearValidators();
      controles.primerApellido.clearValidators();
      controles.segundoApellido.clearValidators();
      controles.razonSocial.setValidators([Validators.required, Validators.maxLength(100)]);
    } else { // Natural
      controles.primerNombre.setValidators([Validators.required]);
      controles.primerApellido.setValidators([Validators.required]);
      controles.razonSocial.clearValidators();
      controles.digito_verificacion.clearValidators();
    }

    // Actualizar validez de controles
    Object.values(controles).forEach(control => control.updateValueAndValidity());
  }

  /**
   * Guarda revisión del pagador
   */
  guardarRevision() {
    if (this.revisionForm.valid) {
      this.popUpManager.showConfirmAlert(this.translate.instant('admision.seguro_pagador')).then(
        ok => {
          if (ok.value) {
            this.guardarDatosPagador().then(() => {
              this.deshabilitarBotonContinuar = false;
              
              if (this.accion === 'descargar') {
                // Usar el nuevo método que maneja todo el proceso
                this.descargarReciboCompletoYCerrar();
              } else if (this.accion === 'pagar') {
                this.dialogRef.close({ continuar: true });
              }
            }).catch(error => {
              this.popUpManager.showErrorAlert(this.translate.instant('ERROR.guardar_pagador'));
            });
          } else {
            this.revisionForm.patchValue({ aprobado: false });
          }
        }
      );
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('GLOBAL.vacio'));
      this.marcarCamposComoTocados(this.revisionForm);
    }
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  marcarCamposComoTocados(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control.markAsTouched({ onlySelf: true });
      
      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      }
    });
  }

  /**
   * Actualiza la vista previa de la dirección
   */
  actualizarDireccionPreview() {
    const form = this.revisionForm;
    const campos = {
      tipoVia: form.get('tipoVia').value || '',
      numeroVia: form.get('numeroVia').value || '',
      numeroSecundario: form.get('numeroSecundario').value || '',
      complemento: form.get('complementoDireccion').value || '',
      tipoInterior1: form.get('tipoInterior1').value || '',
      numeroInterior1: form.get('numeroInterior1').value || '',
      tipoInterior2: form.get('tipoInterior2').value || '',
      numeroInterior2: form.get('numeroInterior2').value || ''
    };
    
    // Construir dirección principal
    let direccion = '';
    
    if (campos.tipoVia) direccion += campos.tipoVia;
    if (campos.numeroVia) direccion += ' ' + campos.numeroVia;
    if (campos.numeroSecundario) direccion += ' # ' + campos.numeroSecundario;
    if (campos.complemento) direccion += ' - ' + campos.complemento;
    
    // Añadir interiores
    if (campos.tipoInterior1 && campos.numeroInterior1) {
      direccion += ', ' + campos.tipoInterior1 + ' ' + campos.numeroInterior1;
    }
    
    if (campos.tipoInterior2 && campos.numeroInterior2) {
      direccion += ', ' + campos.tipoInterior2 + ' ' + campos.numeroInterior2;
    }
    
    this.direccionPreview = direccion.trim();
  }

  /**
   * Calcula el dígito de verificación para un NIT
   */
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
    }
    
    const modulo = suma % 11;
    
    return (modulo === 0 || modulo === 1) ? modulo.toString() : (11 - modulo).toString();
  }

  /**
   * Validador del dígito de verificación
   */
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

  /**
   * Actualiza validación del dígito
   */
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

  /**
   * Continúa con el proceso según la acción seleccionada
   */
  continuar() {
    if (this.accion === 'descargar') {
      // Usar el nuevo método que maneja todo el proceso
      this.descargarReciboCompletoYCerrar();
    } else if (this.accion === 'pagar') {
      this.dialogRef.close({ continuar: true });
    }
  }
  
  /**
   * Consulta datos existentes del pagador
   */
  consultarDatosPagador() {
    this.setLoading(true);
    
    // Extraer número de recibo
    const numeroRecibo = Array.isArray(this.data.info_recibo.ReciboInscripcion) 
      ? this.data.info_recibo.ReciboInscripcion[0] 
      : this.data.info_recibo.ReciboInscripcion;
    
    this.suscripciones.push(
      this.sgaMidService.get(`facturacion_electronica/${numeroRecibo}`)
        .pipe(finalize(() => this.setLoading(false)))
        .subscribe(
          (response: any) => {
            let entries = [];
            
            // Fix para evitar error TS1109: Expression expected
            if (response && response.Data && response.Data.Entries && response.Data.Entries.Entry) {
              entries = response.Data.Entries.Entry;
            } else if (response && response.Entries && response.Entries.Entry) {
              entries = response.Entries.Entry;
            }
            
            if (Array.isArray(entries) && entries.length > 0) {
              // Filtrar registros activos
              const registrosActivos = entries.filter(
                entry => entry.TERPA_ESTADO_REGISTRO === "A"
              );
              
              if (registrosActivos.length === 0) {
                // Formulario nuevo
                this.datosPagadorOriginal = null;
                this.formularioModificado = false;
                this.deshabilitarBotonContinuar = true;
              } else if (registrosActivos.length === 1) {
                // Edición de registro existente
                this.datosPagador = registrosActivos[0];
                this.cargarDatosEnFormulario();
                this.formularioModificado = false;
                this.deshabilitarBotonContinuar = false;
              } else {
                // Error: múltiples registros
                this.popUpManager.showErrorAlert(this.translate.instant('admision.error_multiples_registros'));
                this.formularioModificado = false;
              }
            }
          },
          (error: HttpErrorResponse) => {
            this.manejarError(error, 'ERROR.general');
          }
        )
    );
  }
  
  /**
   * Carga datos del pagador en el formulario
   */
  cargarDatosEnFormulario() {
    if (!this.datosPagador) return;
    
    // Guardar copia para comparar después
    this.datosPagadorOriginal = JSON.parse(JSON.stringify(this.datosPagador));
    this.formularioModificado = false;

    try {
      // Determinar si es persona jurídica
      const esJuridica = this.datosPagador.TERPA_NATURALEZA === 'J';
      this.esJuridica = esJuridica;
      
      // Cargar datos básicos
      this.revisionForm.patchValue({
        naturaleza: this.datosPagador.TERPA_NATURALEZA || '',
        tipoDocumento: this.datosPagador.TERPA_TDO_CODVAR || '',
        numeroDocumento: this.datosPagador.TERPA_NRO_DOCUMENTO || '',
        telefono: this.datosPagador.TERPA_TELEFONO || '',
        correo: this.datosPagador.TERPA_EMAIL || ''
      });
      
      // Cargar datos específicos según tipo de persona
      if (esJuridica) {
        this.revisionForm.patchValue({
          razonSocial: this.datosPagador.TERPA_RAZON_SOCIAL || '',
          digito_verificacion: this.datosPagador.TERPA_DIGITO_CHEQUEO || ''
        });
      } else {
        this.revisionForm.patchValue({
          primerNombre: this.datosPagador.TERPA_PRIMER_NOMBRE || '',
          segundoNombre: this.datosPagador.TERPA_SEGUNDO_NOMBRE || '',
          primerApellido: this.datosPagador.TERPA_PRIMER_APELLIDO || '',
          segundoApellido: this.datosPagador.TERPA_SEGUNDO_APELLIDO || ''
        });
      }
      
      // Procesar dirección
      if (this.datosPagador.TERPA_DIRECCION) {
        this.procesarDireccion(this.datosPagador.TERPA_DIRECCION);
      }
      
      // Actualizar validadores
      this.actualizarValidadoresPorNaturaleza(this.datosPagador.TERPA_NATURALEZA);
      this.actualizarValidacionDigito();
    } catch (error) {
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.cargar_datos'));
    }
  }
  
  /**
   * Procesa dirección y la separa en componentes
   */
  procesarDireccion(direccionCompleta: string) {    
    if (!direccionCompleta) return;
    
    const partes = direccionCompleta.split(' ');
    
    if (partes.length >= 3) {
      try {
        const valoresDireccion = {
          tipoVia: partes[0] || '',
          numeroVia: partes[1] || '',
          numeroSecundario: partes[2] || '',
          complementoDireccion: partes[3] || '',
          tipoInterior1: partes[4] || '',
          numeroInterior1: partes[5] || '',
          tipoInterior2: partes[6] || '',
          numeroInterior2: partes[7] || '',
        };
        
        this.revisionForm.patchValue(valoresDireccion);
        this.actualizarDireccionPreview();
      } catch (e) {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.procesar_direccion'));
      }
    }
  }

  /**
   * Guarda datos del pagador
   */
  guardarDatosPagador(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Verificar cambios
      if (!this.hayModificaciones()) {
        this.popUpManager.showInfoToast(this.translate.instant('recibo_pago.no_hay_cambios'));
        resolve();
        return;
      }
      
      this.setLoading(true);
      
      // Extraer número de recibo
      const numeroRecibo = Array.isArray(this.data.info_recibo.ReciboInscripcion) 
        ? this.data.info_recibo.ReciboInscripcion[0] 
        : this.data.info_recibo.ReciboInscripcion;
      
      // Flujo de guardado según existencia de datos
      if (this.datosPagadorOriginal) {
        // Actualizar registro existente
        this.inactivarRegistro(this.datosPagadorOriginal)
          .then(() => this.crearNuevoRegistro(numeroRecibo))
          .then(() => {
            this.setLoading(false);
            this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.pagador_actualizado'));
            resolve();
          })
          .catch(error => {
            this.setLoading(false);
            this.popUpManager.showErrorAlert(
              error.message === 'Error al inactivar el registro existente' 
                ? this.translate.instant('ERROR.inactivar_registro')
                : this.translate.instant('ERROR.actualizar_pagador')
            );
            reject(error);
          });
      } else {
        // Crear nuevo registro
        this.crearNuevoRegistro(numeroRecibo)
          .then(() => {
            this.setLoading(false);
            this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.pagador_guardado'));
            resolve();
          })
          .catch(error => {
            this.setLoading(false);
            this.popUpManager.showErrorAlert(this.translate.instant('ERROR.guardar_pagador'));
            reject(error);
          });
      }
    });
  }
  
  /**
   * Construye dirección formateada para guardado
   */
  construirDireccionFormateada(): string {
    const values = this.revisionForm.value;
    
    const partes = [
      values.tipoVia || '',
      values.numeroVia || '',
      values.numeroSecundario || '',
      values.complementoDireccion || ''
    ];
    
    // Agregar interiores solo si tienen valores
    if (values.tipoInterior1 && values.numeroInterior1) {
      partes.push(values.tipoInterior1, values.numeroInterior1);
    }
    
    if (values.tipoInterior2 && values.numeroInterior2) {
      partes.push(values.tipoInterior2, values.numeroInterior2);
    }

    return partes.filter(parte => parte !== '').join(' ');
  }

  /**
   * Inactiva un registro existente
   */
  private inactivarRegistro(registro: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Clonar el registro
      const registroInactivado = JSON.parse(JSON.stringify(registro));
      
      // Cambiar estado a inactivo
      registroInactivado.TERPA_ESTADO_REGISTRO = 'I';
      
      // Obtener secuencia
      const secuencia = registroInactivado.TERPA_SECUENCIA;
      
      // Formatear fecha
      const fechaObj = new Date(registroInactivado.TERPA_FECHA_REGISTRO);
      const dia = fechaObj.getDate().toString().padStart(2, '0');
      const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaObj.getFullYear();
      registroInactivado.TERPA_FECHA_REGISTRO = `${dia}/${mes}/${anio}`;
      
      // Convertir a números
      registroInactivado.TERPA_ANO_PAGO = parseInt(registroInactivado.TERPA_ANO_PAGO, 10);
      registroInactivado.TERPA_NRO_DOCUMENTO = parseInt(registroInactivado.TERPA_NRO_DOCUMENTO, 10);
      registroInactivado.TERPA_TELEFONO = parseInt(registroInactivado.TERPA_TELEFONO, 10);
      
      if (registroInactivado.TERPA_DIGITO_CHEQUEO) {
        registroInactivado.TERPA_DIGITO_CHEQUEO = parseInt(registroInactivado.TERPA_DIGITO_CHEQUEO, 10);
      }

      registroInactivado.TERPA_SECUENCIA = parseInt(registroInactivado.TERPA_SECUENCIA, 10);
      
      // Crear objeto de petición
      const datosRequest = {
        _puttercero_pago_secuencia: registroInactivado
      };
      
      // Hacer petición PUT
      this.sgaMidService.put(`facturacion_electronica/${secuencia}`, datosRequest).subscribe(
        (response: any) => {
          if (response && response.Success) {
            resolve();
          } else {
            reject(new Error('Error al inactivar el registro existente'));
          }
        },
        (error: HttpErrorResponse) => {
          reject(error);
        }
      );
    });
  }
  
  /**
   * Crea un nuevo registro de pagador
   */
  private crearNuevoRegistro(numeroRecibo: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const formValues = this.revisionForm.value;
      
      // Formatear fecha
      const fechaActual = new Date();
      const fechaFormateada = `${fechaActual.getDate().toString().padStart(2, '0')}/${
        (fechaActual.getMonth() + 1).toString().padStart(2, '0')}/${
        fechaActual.getFullYear()}`;
      
      // Construir dirección
      const direccionFormateada = this.construirDireccionFormateada();
      
      // Crear objeto de datos
      const pagador = {
        TERPA_SECUENCIA: parseInt(numeroRecibo, 10),
        TERPA_ANO_PAGO: fechaActual.getFullYear(),
        TERPA_NATURALEZA: formValues.naturaleza,
        TERPA_TDO_CODVAR: formValues.tipoDocumento,
        TERPA_NRO_DOCUMENTO: parseInt(formValues.numeroDocumento, 10),
        TERPA_DIGITO_CHEQUEO: formValues.digito_verificacion ? parseInt(formValues.digito_verificacion, 10) : null,
        TERPA_DIRECCION: direccionFormateada,
        TERPA_TELEFONO: parseInt(formValues.telefono, 10),
        TERPA_EMAIL: formValues.correo,
        TERPA_ESTADO_REGISTRO: "A",
        TERPA_FECHA_REGISTRO: fechaFormateada
      };
      
      // Agregar campos específicos según tipo de persona
      if (formValues.naturaleza === 'J') {
        // Jurídica
        pagador['TERPA_RAZON_SOCIAL'] = formValues.razonSocial;
        pagador['TERPA_PRIMER_APELLIDO'] = null;
        pagador['TERPA_SEGUNDO_APELLIDO'] = null;
        pagador['TERPA_PRIMER_NOMBRE'] = null;
        pagador['TERPA_SEGUNDO_NOMBRE'] = null;
      } else {
        // Natural
        pagador['TERPA_RAZON_SOCIAL'] = null;
        pagador['TERPA_PRIMER_APELLIDO'] = formValues.primerApellido;
        pagador['TERPA_SEGUNDO_APELLIDO'] = formValues.segundoApellido || null;
        pagador['TERPA_PRIMER_NOMBRE'] = formValues.primerNombre;
        pagador['TERPA_SEGUNDO_NOMBRE'] = formValues.segundoNombre || null;
      }
      
      // Crear objeto completo
      const datosRequest = {
        _posttercero_pago: pagador
      };
      
      // Hacer petición POST
      this.sgaMidService.post('facturacion_electronica', datosRequest).subscribe(
        (response: any) => {
          if (response && response.Success) {
            resolve();
          } else {
            reject(new Error('Error al crear el nuevo registro'));
          }
        },
        (error: HttpErrorResponse) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Comprueba si hay modificaciones respecto a datos originales
   */
  hayModificaciones(): boolean {
    if (!this.datosPagadorOriginal) {
      return true;
    }
    
    const formValues = this.revisionForm.value;
    
    // Comparar datos básicos
    if (this.normalizar(formValues.naturaleza) !== this.normalizar(this.datosPagadorOriginal.TERPA_NATURALEZA)) return true;
    if (this.normalizar(formValues.tipoDocumento) !== this.normalizar(this.datosPagadorOriginal.TERPA_TDO_CODVAR)) return true;
    if (this.normalizar(formValues.numeroDocumento) !== this.normalizar(this.datosPagadorOriginal.TERPA_NRO_DOCUMENTO)) return true;
    if (this.normalizar(formValues.telefono) !== this.normalizar(this.datosPagadorOriginal.TERPA_TELEFONO)) return true;
    if (this.normalizar(formValues.correo) !== this.normalizar(this.datosPagadorOriginal.TERPA_EMAIL)) return true;
    
    // Comparar según tipo de persona
    if (formValues.naturaleza === 'J') {
      // Jurídica
      if (this.normalizar(formValues.razonSocial) !== this.normalizar(this.datosPagadorOriginal.TERPA_RAZON_SOCIAL)) return true;
      if (this.normalizar(formValues.digito_verificacion) !== this.normalizar(this.datosPagadorOriginal.TERPA_DIGITO_CHEQUEO)) return true;
    } else {
      // Natural
      if (this.normalizar(formValues.primerNombre) !== this.normalizar(this.datosPagadorOriginal.TERPA_PRIMER_NOMBRE)) return true;
      if (this.normalizar(formValues.segundoNombre) !== this.normalizar(this.datosPagadorOriginal.TERPA_SEGUNDO_NOMBRE)) return true;
      if (this.normalizar(formValues.primerApellido) !== this.normalizar(this.datosPagadorOriginal.TERPA_PRIMER_APELLIDO)) return true;
      if (this.normalizar(formValues.segundoApellido) !== this.normalizar(this.datosPagadorOriginal.TERPA_SEGUNDO_APELLIDO)) return true;
    }
    
    // Comparar dirección
    const direccionFormateada = this.construirDireccionFormateada();
    if (this.normalizar(direccionFormateada) !== this.normalizar(this.datosPagadorOriginal.TERPA_DIRECCION)) return true;
    
    // Sin cambios
    return false;
  }

  /**
   * Normaliza valores para comparación
   */
  private normalizar(valor: any): string {
    if (valor === null || valor === undefined || valor === '') {
      return '';
    }
    return String(valor).trim().replace(/\s+/g, ' ');
  }

  /**
   * Control centralizado de estado de carga
   */
  private setLoading(estado: boolean): void {
    this.loading = estado;
  }

  /**
   * Manejo centralizado de errores
   */
  private manejarError(error: HttpErrorResponse, contexto: string): void {
    this.setLoading(false);
    
    Swal.fire({
      icon: 'error',
      title: error.status + '',
      text: this.translate.instant('ERROR.' + error.status),
      footer: this.translate.instant('GLOBAL.cargar') + ' - ' +
        this.translate.instant(contexto),
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    });
  }

  /**
   * Validador espacios
   */
  noEspaciosValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control || !control.value) {
        return null;
      }
      
      // Verificar si el valor contiene espacios
      const contieneEspacios = /\s/.test(control.value);
      
      return contieneEspacios ? { contieneEspacios: true } : null;
    };
  }
}