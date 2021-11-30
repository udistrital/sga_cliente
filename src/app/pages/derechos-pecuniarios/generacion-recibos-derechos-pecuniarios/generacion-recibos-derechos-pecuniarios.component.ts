import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { LocalDataSource } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { Concepto } from '../../../@core/data/models/derechos-pecuniarios/concepto';
import { InfoPersona } from '../../../@core/data/models/informacion/info_persona';
import { ReciboPago } from '../../../@core/data/models/derechos-pecuniarios/recibo_pago';
import { Periodo } from '../../../@core/data/models/periodo/periodo';
import { InstitucionEnfasis } from '../../../@core/data/models/proyecto_academico/institucion_enfasis';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { ButtonPaymentComponent } from '../../../@theme/components/button-payment/button-payment.component';
import { LinkDownloadComponent } from '../../../@theme/components/link-download/link-download.component';
import { PopUpManager } from '../../../managers/popUpManager';
import { DownloadFileNuxeo } from '../../../@theme/components/download-file-nuxeo/download-file-nuxeo.component';
import { LinkDownloadNuxeoComponent } from '../../../@theme/components/link-download-nuxeo/link-download-nuxeo.component';
import { CustomizeButtonComponent } from '../../../@theme/components';

@Component({
  selector: 'generacion-recibos-derechos-pecuniarios',
  templateUrl: './generacion-recibos-derechos-pecuniarios.component.html',
  styleUrls: ['./generacion-recibos-derechos-pecuniarios.component.scss'],
})
export class GeneracionRecibosDerechosPecuniarios {
  info_persona_id: number;
  persona_id: number;
  recibo_id: number;
  dataSource: LocalDataSource;
  data: any[] = [];
  settings: any;
  vigencias: any = [];
  vigenciaActual: any;
  datosCargados: any[];


  new_pecuniario = false;
  info_info_persona: InfoPersona;
  recibo_pago: ReciboPago;
  clean: boolean;
  loading: boolean;
  programa: number;
  estudiante: number;
  periodo: Periodo;
  periodos = [];
  selectedProject: any;
  tipo_derecho_selected: any;
  calendarioId: string = '0';
  projectId: number = 0;
  parametro: string;
  recibo_generado: any;
  recibos_pendientes: number;
  parametros_pago: any;
  userData: any = null;

  arr_proyecto: InstitucionEnfasis[] = [];
  source_emphasys: LocalDataSource = new LocalDataSource();
  proyectos = [];

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  gen_recibo: boolean;
  generacion_recibo = null;
  constructor(
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private userService: UserService,
    private parametrosService: ParametrosService) {
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
    this.generacion_recibo = {
      code: '*Códígo seleccionado',
      documentId: 'Documento de identificacion',
      username: 'Nombre de estudiante',
      curricularProgram: 'Programa curricular',
      concept: 'Concepto pecuiario elegido',
      value: '* value'
    }

    this.info_persona_id = this.userService.getPersonaId();
    this.userService.tercero$.subscribe((user) => {
      console.log(user);
      this.userData = user;
    })
    this.loadInfoPersona();
    this.createTable();
  }

  return() {
    sessionStorage.setItem('EstadoRecibo', 'false');
  }

  public async loadInfoPersona(): Promise<void> {
    this.loading = true;
    this.info_persona_id = this.userService.getPersonaId();
    if (this.info_persona_id !== undefined && this.info_persona_id !== 0 &&
      this.info_persona_id.toString() !== '' && this.info_persona_id.toString() !== '0') {
      this.sgaMidService.get('persona/consultar_persona/' + this.info_persona_id).subscribe(async (res: any) => {
        if (res !== null) {
          const temp = <InfoPersona>res;
          this.info_info_persona = temp;
          const files = []
        }
        await this.cargarPeriodo()
        this.loadInfoRecibos();
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.info_persona'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    } else {
      this.info_info_persona = undefined
      this.clean = !this.clean;
      this.loading = false;
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  createTable() {
    this.settings = {
      actions: false,
      columns: {
        Periodo: {
          title: this.translate.instant('derechos_pecuniarios.periodo'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Id: {
          title: this.translate.instant('derechos_pecuniarios.id'),
          editable: false,
          width: '5%',
          filter: false,
        },
        FechaCreacion: {
          title: this.translate.instant('derechos_pecuniarios.fecha_generacion'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Valor: {
          title: this.translate.instant('derechos_pecuniarios.valor'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Concepto: {
          title: this.translate.instant('derechos_pecuniarios.concepto'),
          width: '15%',
          editable: false,
          filter: false,
        },
        FechaOrdinaria: {
          title: this.translate.instant('derechos_pecuniarios.fecha_ordinaria'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Pago: {
          title: this.translate.instant('derechos_pecuniarios.pago'),
          width: '10%',
          editable: false,
          filter: false,
        },
        ValorPagado: {
          title: this.translate.instant('derechos_pecuniarios.valor_pagado'),
          width: '15%',
          editable: false,
          filter: false,
        },
        FechaPago: {
          title: this.translate.instant('derechos_pecuniarios.fecha_pago'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Estado: {
          title: this.translate.instant('derechos_pecuniarios.estado'),
          width: '10%',
          editable: false,
          filter: false,
          position: 'center',
        },
        VerRecibo: {
          title: this.translate.instant('derechos_pecuniarios.ver_recibo'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: LinkDownloadNuxeoComponent,
          type: 'custom',
          // onComponentInitFunction: (instance) => {
          //   instance.save.subscribe((data) => this.descargarReciboPago(data))
          // },
        },
        Pagar: {
          title: this.translate.instant('derechos_pecuniarios.pagar'),
          width: '5%',
          editable: false,
          filter: false,
          type: 'custom',
          renderComponent: CustomizeButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.save.subscribe(data => {
              console.log(data);
            });
          },
        },
        AdjuntarPago: {
          title: this.translate.instant('derechos_pecuniarios.adjuntar_pago'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe(async (data) => {
              const { value: file } = await Swal.fire({
                title: 'Adjunte recibo',
                input: 'file',
                inputAttributes: {
                  'accept': 'pdf/*',
                  'aria-label': 'Upload your profile picture'
                }
              })
              if (file) {
                console.log(file);
              }
            })
          },
        },
        Solicitar: {
          title: this.translate.instant('derechos_pecuniarios.solicitar'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => console.log(data))
          },
        },
      },
      mode: 'external',
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.parametros_pago = {
      recibo: '',
      REFERENCIA: '',
      NUM_DOC_IDEN: '',
      TIPO_DOC_IDEN: '',
    };

    this.selectedProject = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10)
  }

  async loadInfoRecibos() {
    this.dataSource.load([{
      Periodo: 10,
      Id: 12,
      FechaCreacion: '12-01-01',
      Valor: "$ 1.500",
      Concepto: 'Certificado de notas',
      FechaOrdinaria: '12-10-01',
      Pago: '18',
      ValorPagado: "$1.500",
      FechaPago: '12-09-01',
      Estado: 'Pendiente pago',
      //VerRecibo: 23
      VerRecibo: 140837,
      Pagar: {
        icon: 'fa fa-credit-card fa-2x',
        label: 'Pago en línea',
        class: "btn btn-primary"
      },
      AdjuntarPago: {
        icon: 'fa fa-upload fa-2x',
        label: 'Adjuntar',
        class: "btn btn-primary"
      },
      Solicitar: {
        icon: 'fa fa-paper-plane fa-2x',
        label: 'Solicitar',
        class: "btn btn-primary"
      }
    }]);
    this.loading = true;
    // Función del MID que retorna el estado del recibo
    const PeriodoActual = localStorage.getItem('IdPeriodo')
    if (this.info_persona_id != null && PeriodoActual != null) {
      await this.sgaMidService.get('derechos_pecuniarios/estado_recibos/' + this.info_persona_id + '/' + PeriodoActual).subscribe(
        (response: any) => {
          if (response !== null && response.Status === '400') {
            this.popUpManager.showErrorToast(this.translate.instant('derechos_pecuniarios.error'));
            // this.dataSource.load([]);
          } else if (response != null && response.Status === '404' || response.Data[0] === null) {
            this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('derechos_pecuniarios.no_recibo'));
            // this.dataSource.load([]);
          } else {
            const data = <Array<any>>response.Data;
            const dataInfo = <Array<any>>[];
            this.recibos_pendientes = 0;
            data.forEach(element => {

              const auxRecibo = element.ReciboInscripcion;
              const NumRecibo = auxRecibo.split('/', 1);
              element.Recibo = NumRecibo;
              element.FechaCreacion = momentTimezone.tz(element.FechaCreacion, 'America/Bogota').format('DD-MM-YYYY hh:mm:ss');
              sessionStorage.setItem('ProgramaAcademicoId', element.ProgramaAcademicoId);

              if (element.Estado === 'Pendiente pago') {
                this.recibos_pendientes++;
              }
              dataInfo.push(element);
              this.loading = false;
              this.dataSource.load(dataInfo);
              this.dataSource.setSort([{ field: 'Id', direction: 'desc' }]);

              this.loading = false;

            })
          }
        }, error => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
    this.loading = false;
  }


  generar_recibo() {
  }

  generar_solicitud_derecho() {
  }

  descargarReciboPago(data) {

  }

  abrirPago(data) {
    this.parametros_pago.NUM_DOC_IDEN = this.info_info_persona.NumeroIdentificacion;
    this.parametros_pago.REFERENCIA = data.Id;
    this.parametros_pago.TIPO_DOC_IDEN = this.info_info_persona.TipoIdentificacion.CodigoAbreviacion;
    const url = new URLSearchParams(this.parametros_pago).toString();
    const ventanaPSE = window.open(environment.PSE_SERVICE + url, 'PagosPSE', 'width=600,height=800,resizable,scrollbars,status');
    ventanaPSE.focus();
    const timer = window.setInterval(() => {
      if (ventanaPSE.closed) {
        window.clearInterval(timer);
        this.loadInfoRecibos();
      }
    }, 5000);
  }

  cargarPeriodo() {
    this.loading = true;

    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo?query=CodigoAbreviacion:VG&sortby=Id&order=desc&limit=0')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              if (element['Activo'] === true && window.localStorage.getItem('IdPeriodo') != null) {
                this.periodo = element;
                window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
                this.cargarDatos({ 'value': this.periodo });
                resolve(this.periodo);
              }

              // BORRAR CUANDO EL PERIODO ESTE ACTUALIZADO
              else if (element['Year'] === 2020) {
                this.periodo = element;
                window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
                resolve(this.periodo);
              }
              // BORRAR CUANDO EL PERIODO ESTE ACTUALIZADO

              this.vigencias.push(element);
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

  loadConcepto(event) {
    this.tipo_derecho_selected = event.value;
    this.gen_recibo = true;
  }

  cargarDatos(event) {
    window.localStorage.setItem('IdPeriodo', event.value.Id);
    this.vigenciaActual = event.value.Id;
    this.datosCargados = [];
    this.loadInfoRecibos();
    this.sgaMidService.get('derechos_pecuniarios/' + this.vigenciaActual).subscribe(
      response => {
        const data: any[] = response['Data'];
        if (Object.keys(data).length > 0 && Object.keys(data[0]).length > 0) {
          data.forEach(obj => {
            const concepto = new Concepto();
            concepto.Id = obj.ParametroId.Id;
            concepto.Codigo = obj.ParametroId.CodigoAbreviacion;
            concepto.Nombre = obj.ParametroId.Nombre;
            concepto.FactorId = obj.Id
            concepto.Factor = JSON.parse(obj.Valor).NumFactor;
            if (JSON.parse(obj.Valor).Costo !== undefined) {
              concepto.Costo = JSON.parse(obj.Valor).Costo;
            }
            this.datosCargados.push(concepto);
          });
        } else {
          this.popUpManager.showAlert('info', this.translate.instant('derechos_pecuniarios.no_conceptos'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );

  }


}
