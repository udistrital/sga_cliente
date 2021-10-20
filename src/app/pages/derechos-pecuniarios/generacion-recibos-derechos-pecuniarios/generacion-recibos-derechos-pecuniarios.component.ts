import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
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

  arr_proyecto: InstitucionEnfasis[] = [];
  source_emphasys: LocalDataSource = new LocalDataSource();
  proyectos = [];

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  gen_recibo: boolean;

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

    this.info_persona_id = this.userService.getPersonaId();
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
        Recibo: {
          title: this.translate.instant('derechos_pecuniarios.numero_recibo'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Valor: {
          title: this.translate.instant('derechos_pecuniarios.valor'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Codigo: {
          title: this.translate.instant('derechos_pecuniarios.codigo'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Nombre: {
          title: this.translate.instant('derechos_pecuniarios.derecho_pecuniario'),
          width: '25%',
          editable: false,
          filter: false,
        },
        FechaCreacion: {
          title: this.translate.instant('derechos_pecuniarios.fecha_generacion'),
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
        Descarga: {
          title: this.translate.instant('derechos_pecuniarios.descargar'),
          width: '12%',
          editable: false,
          filter: false,
          renderComponent: LinkDownloadComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => this.descargarReciboPago(data))
          },
        },
        Opcion: {
          title: this.translate.instant('derechos_pecuniarios.opcion'),
          width: '13%',
          editable: false,
          filter: false,
          type: 'custom',
          renderComponent: ButtonPaymentComponent,
          onComponentInitFunction: (instance) => {
            instance.save.subscribe(data => {
              sessionStorage.setItem('EstadoRecibo', data.estado);
              // Solamente se usa esta linea para pruebas saltaldo el pago de recibo
              if (data.estado === false || data.estado === 'false') {
                this.abrirPago(data.data);
              } else if (data.estado === true || data.estado === 'true') {
                // this.itemSelect({ data: data.data });
              }
            });
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
    this.loading = true;
    // Función del MID que retorna el estado del recibo
    const PeriodoActual = localStorage.getItem('IdPeriodo')
    if (this.info_persona_id != null && PeriodoActual != null) {
      await this.sgaMidService.get('derechos_pecuniarios/estado_recibos/' + this.info_persona_id + '/' + PeriodoActual).subscribe(
        (response: any) => {
          if (response !== null && response.Status === '400') {
            this.popUpManager.showErrorToast(this.translate.instant('derechos_pecuniarios.error'));
            this.dataSource.load([]);
          } else if (response != null && response.Status === '404' || response.Data[0] === null) {
            this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('derechos_pecuniarios.no_recibo'));
            this.dataSource.load([]);
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
    if (this.recibos_pendientes >= 3) {
      this.popUpManager.showErrorAlert(this.translate.instant('recibo_pago.maximo_recibos'));
    } else {
      this.popUpManager.showConfirmAlert(this.translate.instant('derechos_pecuniarios.seguro_nuevo_recibo')).then(
        async ok => {
          if (ok.value) {
            this.loading = true;
            if (this.info_info_persona === undefined) {
              this.info_persona_id = this.userService.getPersonaId();
              this.sgaMidService.get('persona/consultar_persona/' + this.info_persona_id)
                .subscribe(async res => {
                  if (res !== null) {
                    const temp = <InfoPersona>res;
                    this.info_info_persona = temp;
                    const files = [];
                    await this.generar_solicitud_derecho();
                  }
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
              await this.generar_solicitud_derecho();
              this.loading = false;
            }
          }
        },
      );
    }
  }

  generar_solicitud_derecho() {
    return new Promise((resolve, reject) => {
      const recibo = {
        Id: this.info_info_persona.Id,
        Nombre: `${this.info_info_persona.PrimerNombre} ${this.info_info_persona.SegundoNombre}`,
        Apellido: `${this.info_info_persona.PrimerApellido} ${this.info_info_persona.SegundoApellido}`,
        Correo: JSON.parse(atob(localStorage.getItem('id_token').split('.')[1])).email,
        ProgramaAcademicoId: parseInt(this.selectedProject, 10),
        DerechoPecuniarioId: parseInt(this.tipo_derecho_selected, 10),
        Year: this.periodo['Year'],
        Periodo: this.periodo['Id'],
        FechaPago: '',
      };
      this.loading = true;
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + 90);
      recibo.FechaPago = moment(`${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`, 'YYYY-MM-DD').format('DD/MM/YYYY');
      this.sgaMidService.post('derechos_pecuniarios/generar_derecho', recibo).subscribe(
        (response: any) => {
          if (response.Code === '200') {
            this.loadInfoRecibos();
            resolve(response);
            this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.generado'));
          } else if (response.Code === '204') {
            reject([]);
            this.popUpManager.showErrorAlert(this.translate.instant('recibo_pago.recibo_duplicado'));
          } else if (response.Code === '400') {
            reject([]);
            this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
          }
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
        },
      );
      this.loading = false;
    });
  }

  descargarReciboPago(data) {
    if (this.info_info_persona != null) {
      this.selectedProject = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10);
      this.recibo_pago = new ReciboPago();
      this.recibo_pago.NombreDelEstudiante = this.info_info_persona.PrimerNombre + ' ' +
        this.info_info_persona.SegundoNombre + ' ' + this.info_info_persona.PrimerApellido + ' ' + this.info_info_persona.SegundoApellido;
      this.recibo_pago.DocumentoDelEstudiante = this.info_info_persona.NumeroIdentificacion;
      this.recibo_pago.Periodo = this.periodo.Nombre;

      this.recibo_pago.Comprobante = data['Recibo'][0];

      this.projectService.get('proyecto_academico_institucion/' + data['ProgramaAcademicoId']).subscribe(
        res => {
          this.recibo_pago.ProyectoEstudiante = res.Nombre;
          this.loading = true;

          this.loading = false;
          this.recibo_pago.Descripcion = data.Nombre;
          const valor: any = parseInt(data.Valor, 10);
          this.recibo_pago.Codigo = data.Codigo;
          this.recibo_pago.CodigoDelEstudiante = data.Codigo_estudiante;
          this.recibo_pago.ValorDerecho = valor;
          this.recibo_pago.Fecha_pago = moment(data.Fecha_pago, 'YYYY-MM-DD').format('DD/MM/YYYY');

          this.sgaMidService.post('generar_recibo/recibo_estudiante/', this.recibo_pago).subscribe(
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
  }

  abrirPago(data) {
    this.parametros_pago.NUM_DOC_IDEN = this.info_info_persona.NumeroIdentificacion;
    this.parametros_pago.REFERENCIA = data['ReciboInscripcion'][0];
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
