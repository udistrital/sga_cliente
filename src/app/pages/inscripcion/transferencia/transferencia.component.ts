import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { LocalDataSource } from 'ng2-smart-table';
import { CustomizeButtonComponent } from '../../../@theme/components/customize-button/customize-button.component';
import { LinkDownloadNuxeoComponent } from '../../../@theme/components/link-download-nuxeo/link-download-nuxeo.component';
import { FORM_TRANSFERENCIA_INTERNA } from '../forms-transferencia';
import { ActivatedRoute, Router } from "@angular/router";
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { TransferenciaInterna } from '../../../@core/data/models/inscripcion/transferencia_interna';
import { InfoPersona } from '../../../@core/data/models/informacion/info_persona';
import { HttpErrorResponse } from '@angular/common/http';
import * as momentTimezone from 'moment-timezone';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../@core/data/users.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { Periodo } from '../../../@core/data/models/periodo/periodo';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';

@Component({
  selector: 'transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.scss']
})
export class TransferenciaComponent implements OnInit {

  formTransferencia: any = null;
  listadoSolicitudes: boolean = true;
  actions: boolean = true;
  recibo: boolean = false;
  settings: any = null;
  uid = null;
  dataSource: LocalDataSource;
  sub: any;
  process: string = '';
  loading: boolean;
  info_info_persona: InfoPersona;
  inscripcionProjects: any[];
  proyectosCurriculares: any[];
  codigosEstudiante: any[];
  parametros_pago: any;
  periodo: Periodo;
  periodos = [];

  dataTransferencia: TransferenciaInterna = {
    Periodo: null,
    CalendarioAcademico: null,
    TipoInscripcion: null,
    CodigoEstudiante: null,
    ProyectoCurricular: null,
  };

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private router: Router,
    private _Activatedroute: ActivatedRoute
  ) {
    this.formTransferencia = FORM_TRANSFERENCIA_INTERNA;
    this.dataSource = new LocalDataSource();
    this.loadInfoPersona();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.');
  }

  construirForm() {
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.');
    this.formTransferencia.campos.forEach(campo => {
      if (campo.nombre === 'Periodo') {
        campo.valor = campo.opciones[0];
      }
    });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTransferencia.campos.length; index++) {
      const element = this.formTransferencia.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  ngOnInit() {
    this.parametros_pago = {
      recibo: '',
      REFERENCIA: '',
      NUM_DOC_IDEN: '',
      TIPO_DOC_IDEN: '',
    };


    this.sub = this._Activatedroute.paramMap.subscribe(async (params: any) => {
      const { process } = params.params;
      this.process = atob(process);
      this.actions = (this.process === 'my');
      this.loading = true;
      this.createTable(this.process);
      await this.loadData(this.process).then(e => {

        this.loading = false;

        Swal.fire({
          icon: 'warning',
          text: this.translate.instant('inscripcion.alerta_transferencia'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        })
      })
    });


  }

  public loadInfoPersona(): void {
    this.loading = true;
    this.uid = this.userService.getPersonaId();
    if (this.uid !== undefined && this.uid !== 0 &&
      this.uid.toString() !== '' && this.uid.toString() !== '0') {
      this.sgaMidService.get('persona/consultar_persona/' + this.uid).subscribe((res: any) => {
        if (res !== null) {
          const temp = <InfoPersona>res;
          this.info_info_persona = temp;
          const files = []
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
      this.info_info_persona = undefined
      this.loading = false;
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  createTable(process) {
    this.settings = {
      actions: false,
      columns: {
        Recibo: {
          title: this.translate.instant('inscripcion.recibo'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Concepto: {
          title: this.translate.instant('inscripcion.concepto'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Programa: {
          title: this.translate.instant('inscripcion.programa'),
          width: '30%',
          editable: false,
          filter: false,
        },
        FechaGeneracion: {
          title: this.translate.instant('inscripcion.fecha_generacion'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Estado: {
          title: this.translate.instant('inscripcion.estado'),
          width: '15%',
          editable: false,
          filter: false,
        },
        ...process === 'my' ? {
          Descargar: {
            title: this.translate.instant('derechos_pecuniarios.ver_respuesta'),
            width: '5%',
            editable: false,
            filter: false,
            renderComponent: LinkDownloadNuxeoComponent,
            type: 'custom',
            // onComponentInitFunction: (instance) => {
            //   instance.save.subscribe((data) => this.descargarReciboPago(data))
            // },
          }
        } : {},
        Opcion: {
          title: this.translate.instant('derechos_pecuniarios.solicitar'),
          width: '5%',
          editable: false,
          filter: false,
          type: 'custom',
          // renderComponent: ButtonPaymentComponent,
          renderComponent: CustomizeButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => {
              if (data.Estado == 'Pago') {
                const idInscripcion = btoa(data['Id']);
                this.router.navigate([`pages/inscripcion/solicitud-transferencia/${idInscripcion}/${btoa(process)}`])
              } else if (data.Estado == 'Pendiente pago') {
                this.abrirPago(data)
              }
            })
          },
        },
      },
      mode: 'external',
    }
  }

  async loadData(process) {
    await this.cargarPeriodo();
    this.loading = true;

    /*{
          Recibo: 99998,
          Concepto: "Transferencia2",
          Programa: "Maestría en Ciencias de la información y las comunicaciones",
          FechaGeneracion: '12-01-01',
          Estado: "Pagado",
          Descargar: 140837,
          Opcion: {
            icon: 'fa fa-pencil fa-2x',
            label: 'Inscribirme',
            class: "btn btn-primary"
          },
          tipoTransferencia: 'externa',
          nivel: 'Pregrado'
        }
    */

    this.sgaMidService.get('transferencia/estado_recibos/' + this.uid + '/' + this.periodo.Id)
      .subscribe(response => {
        if (response !== null && response.Response.Code === '400') {
          this.popUpManager.showErrorToast(this.translate.instant('inscripcion.error'));
        } else if (response != null && response.Response.Code === '404') {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('inscripcion.no_inscripcion'));
        } else {
          const inscripciones = <Array<any>>response.Response.Body;
          const dataInfo = <Array<any>>[];
          inscripciones.forEach(element => {
            this.projectService.get('proyecto_academico_institucion/' + element.Programa).subscribe(
              res => {
                const auxRecibo = element.Recibo;
                const NumRecibo = auxRecibo.split('/', 1);
                element.Recibo = NumRecibo[0];
                element.FechaGeneracion = momentTimezone.tz(element.FechaGeneracion, 'America/Bogota').format('DD-MM-YYYY hh:mm:ss');
                element.IdPrograma = element.Programa;
                element.Programa = res.Nombre;

                dataInfo.push(element);

                this.dataSource.load(dataInfo.map((e) => {
                  if (e.Estado === 'Pendiente pago') {
                    return {
                      ...e,
                      ...process === 'my' ? {
                        Opcion: {
                          icon: 'fa fa-arrow-circle-right fa-2x',
                          label: 'Pagar',
                          class: "btn btn-primary"
                        }
                      } :
                        {
                          Opcion: {
                            icon: 'fa fa-search fa-2x',
                            label: 'Detalle',
                            class: "btn btn-primary"
                          }
                        }
                    }
                  } else {
                    return {
                      ...e,
                      ...process === 'my' ? {
                        Opcion: {
                          icon: 'fa fa-pencil fa-2x',
                          label: 'Inscribirme',
                          class: "btn btn-primary"
                        }
                      } :
                        {
                          Opcion: {
                            icon: 'fa fa-search fa-2x',
                            label: 'Detalle',
                            class: "btn btn-primary"
                          }
                        }
                    }
                  }
                }));

                this.dataSource.setSort([{ field: 'Id', direction: 'desc' }]);

                this.loading = false;
              },
              error => {
                this.loading = false;
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              },
            );
          });
        }
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
        });
  }

  descargarNormativa() {
    console.log('Descargar normativa! ');
  }

  async nuevaSolicitud() {
    this.listadoSolicitudes = false;
    await this.loadPeriodo().catch(e => this.loading = false);
    this.construirForm();
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

  loadPeriodo() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.sgaMidService.get('transferencia/consultar_periodo').subscribe(
        (response: any) => {
          if (response.Success) {

            this.formTransferencia.campos.forEach(campo => {
              if (campo.etiqueta === 'select') {
                campo.opciones = response.Data[campo.nombre];
                if (campo.nombre === 'Periodo') {
                  campo.valor = campo.opciones[0];
                }
              }
            });
            this.loading = false;
            resolve(response.Data)
          }
          reject();
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error);
        },
      );
    });
  }

  async seleccion(event) {
    this.recibo = false;
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');

    this.formTransferencia.campos.forEach(campo => {
      this.dataTransferencia[campo.nombre] = campo.valor;
    });

    if (event.nombre === 'CalendarioAcademico' && !this.recibo && event.valor != null) {

      let parametros = await this.loadParams(this.dataTransferencia.CalendarioAcademico.Id).catch(e => this.loading = false);

      this.codigosEstudiante = parametros["Data"]["CodigoEstudiante"];
      this.proyectosCurriculares = parametros["Data"]["ProyectoCurricular"];

      this.formTransferencia.campos.forEach(campo => {

        if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
          campo.opciones = parametros["Data"][campo.nombre];
          campo.ocultar = false;
        }

      });
    }

    if (event.nombre === 'TipoInscripcion' && !this.recibo && event.valor != null) {
      this.formTransferencia.campos.forEach(campo => {

        if (event.valor.Nombre === 'Transferencia interna' || event.valor.Nombre === 'Reingreso') {
          Swal.fire({
            icon: 'warning',
            html: this.translate.instant('inscripcion.alerta_recibo_transferencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          })
        }

        if (campo.nombre === 'ProyectoCurricular') {
          if (event.valor.Nombre === 'Reingreso') {
            let aux: any[] = [];

            this.codigosEstudiante.forEach(codigo => {
              this.proyectosCurriculares.forEach(opcion => {
                if (opcion.Id == codigo.IdProyecto) {
                  aux.push(opcion)
                }

              });
            });
            campo.valor = null;
            campo.opciones = aux;
          } else {
            campo.opciones = this.proyectosCurriculares;
          }
        }
      });
    }

    this.loading = false
  }

  loadParams(calendarioId) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.sgaMidService.get('transferencia/consultar_parametros/' + calendarioId + '/' + this.uid).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.Success) {
            resolve(response);
          } else {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            reject();
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          this.loading = false;
          reject(error);
        },
      );
    });
  }

  validarForm(event) {
    if (event.valid) {
      this.recibo = true;
      this.formTransferencia.btn = '';
    }

  }

  generarRecibo() {
    this.popUpManager.showConfirmAlert(this.translate.instant('inscripcion.seguro_inscribirse')).then(
      async ok => {
        if (ok.value) {
          this.loading = true;
          if (this.info_info_persona === undefined) {
            this.sgaMidService.get('persona/consultar_persona/' + this.uid)
              .subscribe(async res => {
                if (res !== null) {
                  const temp = <InfoPersona>res;
                  this.info_info_persona = temp;
                  const files = [];
                  await this.generar_inscripcion();
                }
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
            await this.generar_inscripcion();
            this.loading = false;
          }
        }
      },
    );
  }

  generar_inscripcion() {
    return new Promise((resolve, reject) => {
      const inscripcion = {
        Id: parseInt(this.info_info_persona.NumeroIdentificacion, 10),
        Nombre: `${this.info_info_persona.PrimerNombre} ${this.info_info_persona.SegundoNombre}`,
        Apellido: `${this.info_info_persona.PrimerApellido} ${this.info_info_persona.SegundoApellido}`,
        Correo: JSON.parse(atob(localStorage.getItem('id_token').split('.')[1])).email,
        PersonaId: Number(this.uid),
        PeriodoId: this.dataTransferencia.Periodo.Id,
        Nivel: this.dataTransferencia.TipoInscripcion.NivelId,
        ProgramaAcademicoId: this.dataTransferencia.ProyectoCurricular.Id,
        TipoInscripcionId: this.dataTransferencia.TipoInscripcion.Id,
        Year: this.dataTransferencia.Periodo.Year,
        Periodo: parseInt(this.dataTransferencia.Periodo.Ciclo, 10),
        FechaPago: '',
      };

      this.loading = true;
      this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + this.dataTransferencia.TipoInscripcion.NivelId).subscribe(
        (response: any[]) => {
          if (response !== null && response.length !== 0) {
            this.inscripcionProjects = response;
            this.inscripcionProjects.forEach(proyecto => {
              if (proyecto.ProyectoId === this.dataTransferencia.ProyectoCurricular.Id && proyecto.Evento != null) {
                inscripcion.FechaPago = moment(proyecto.Evento[0].FechaFinEvento, 'YYYY-MM-DD').format('DD/MM/YYYY');

                this.sgaMidService.post('inscripciones/generar_inscripcion', inscripcion).subscribe(
                  (response: any) => {
                    if (response.Code === '200') {
                      this.listadoSolicitudes = true;

                      this.clean();

                      this.loadData(this.process);
                      this.loading = false;

                      resolve(response);
                      this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.generado'));
                    } else if (response.Code === '204') {
                      this.loading = false;
                      reject([]);
                      this.popUpManager.showErrorAlert(this.translate.instant('recibo_pago.recibo_duplicado'));
                    } else if (response.Code === '400') {
                      this.loading = false;
                      reject([]);
                      this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
                    }
                  },
                  (error: HttpErrorResponse) => {
                    this.loading = false;
                    this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
                    reject([]);
                  },
                );
              }
            });
            this.loading = false;
          }
        },
        error => {
          this.loading = false;
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('calendario.sin_proyecto_curricular'));
          reject([]);
        },
      );
    });
  }

  clean() {
    this.dataTransferencia = {
      Periodo: null,
      CalendarioAcademico: null,
      TipoInscripcion: null,
      CodigoEstudiante: null,
      ProyectoCurricular: null,
    };
    this.formTransferencia.campos.forEach(campo => {
      if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
        campo.ocultar = true;
      }
      if (campo.nombre === 'CalendarioAcademico') {
        campo.valor = null;
      }
    });
  }

  abrirPago(data) {
    this.parametros_pago.NUM_DOC_IDEN = this.info_info_persona.NumeroIdentificacion;
    this.parametros_pago.REFERENCIA = data['Recibo'];
    this.parametros_pago.TIPO_DOC_IDEN = this.info_info_persona.TipoIdentificacion.CodigoAbreviacion;
    const url = new URLSearchParams(this.parametros_pago).toString();
    const ventanaPSE = window.open(environment.PSE_SERVICE + url, 'PagosPSE', 'width=600,height=800,resizable,scrollbars,status');
    ventanaPSE.focus();
    const timer = window.setInterval(() => {
      if (ventanaPSE.closed) {
        window.clearInterval(timer);
        this.loadData(this.process);
      }
    }, 5000);
  }
}
