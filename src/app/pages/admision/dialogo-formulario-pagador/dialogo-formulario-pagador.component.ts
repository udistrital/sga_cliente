import { Component, OnInit, Inject} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
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
import Swal from 'sweetalert2';
import { forEach } from 'jszip';

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

  constructor(
    public dialogRef: MatDialogRef<DialogoFormularioPagadorComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private builder: FormBuilder,
    private sgaMidService: SgaMidService,
    private parametrosService: ParametrosService,
    private fb: FormBuilder,
  ) {
    this.crearForm();
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
    this.cargarPeriodo();
    this.direccionForm = this.fb.group({
      tipoVia: ['']
    });
    this.naturalezas = [
      { value: 'N', nombre: 'Natural' },
      { value: 'J', nombre: 'Jurídica' }
    ];
    this.mostrarDigitoVerificacion = false;
  }

  ngOnInit() {
    this.revisionForm.get('naturaleza').valueChanges.subscribe((valor) => {
      if (valor === 'Juridica') {
        this.revisionForm.get('digitoChequeo').setValidators([Validators.required]);
        this.revisionForm.get('digitoChequeo').updateValueAndValidity();
      } else {
        this.revisionForm.get('digitoChequeo').clearValidators();
        this.revisionForm.get('digitoChequeo').updateValueAndValidity();
      }
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
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      tipoVia: ['', Validators.required],
      numeroVia: ['', Validators.required],
      numeroSecundario: ['', Validators.required],
      complementoDireccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      digito_verificacion: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    });
    
    this.revisionForm.get('naturaleza')!.valueChanges.subscribe(value => {
      this.mostrarDigitoVerificacion = value === 'J';
    
      if (this.mostrarDigitoVerificacion) {
        this.revisionForm.get('digito_verificacion')!.setValidators([Validators.required]);
        this.revisionForm.get('digito_verificacion')!.updateValueAndValidity();
      } else {
        this.revisionForm.get('digito_verificacion')!.clearValidators();
        this.revisionForm.get('digito_verificacion')!.updateValueAndValidity();
      }
    });
  }

  guardarRevision() {
        this.popUpManager.showConfirmAlert(this.translate.instant('admision.seguro_pagador')).then(
          ok => {
            if (ok.value) {
              this.dialogRef.close()
              this.descargarReciboPago();
            } else {
              this.revisionForm.patchValue({
                aprobado: false,
              });
            }
          }
        )
  }
}
