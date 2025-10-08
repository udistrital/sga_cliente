import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { LocalDataSource } from 'ng2-smart-table';
import { CustomizeButtonComponent } from '../../../@theme/components/customize-button/customize-button.component';
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
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoDocumentosTransferenciasComponent } from '../dialogo-documentos-transferencias/dialogo-documentos-transferencias.component';
import { LinkDownloadComponent } from '../../../@theme/components/link-download/link-download.component';
import { DialogoFormularioPagadorComponent } from '../../admision/dialogo-formulario-pagador/dialogo-formulario-pagador.component';

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
  recibos_pendientes: { [key: string]: number };

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
    private nuxeo: NewNuxeoService,
    private dialog: MatDialog,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private router: Router,
    private _Activatedroute: ActivatedRoute
  ) {
    this.formTransferencia = FORM_TRANSFERENCIA_INTERNA;
    this.dataSource = new LocalDataSource();
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
    this.loadInfoPersona();

    this.recibos_pendientes = this.recibos_pendientes || {};
    this.dataSource.load([]);
    this.sub = this._Activatedroute.paramMap.subscribe(async (params: any) => {
      const { process } = params.params;
      this.process = atob(process);
      this.actions = (this.process === 'my');

      this.createTable(this.process);
      if (this.process === 'my') {
        this.loading = true;
        await this.loadDataTercero(this.process).then(e => {
          Swal.fire({
            icon: 'warning',
            text: this.translate.instant('inscripcion.alerta_transferencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
      } else {
        this.loading = true;
        await this.loadDataAll(this.process);
      }
    });
  }

  public loadInfoPersona(): void {
    this.uid = this.userService.getPersonaId();
    if (this.uid !== undefined && this.uid !== 0 &&
      this.uid.toString() !== '' && this.uid.toString() !== '0') {
      this.sgaMidService.get('persona/consultar_persona/' + this.uid).subscribe((res: any) => {
        if (res !== null) {
          const temp = <InfoPersona>res;
          this.info_info_persona = temp;
          const files = [];
        }
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
        EstadoSolicitud: {
          title: this.translate.instant('inscripcion.estado_solicitud'),
          width: '15%',
          editable: false,
          filter: false,
        },
        ...process === 'my' ? {
          Descargar: {
            title: this.translate.instant('inscripcion.descargar'),
            width: '5%',
            editable: false,
            filter: false,
            renderComponent: LinkDownloadComponent,
            type: 'custom',
            onComponentInitFunction: (instance) => {
              instance.save.subscribe((data) => {
                // se añade ID de programa a 'localStorage' del programa del que se quiere ver el recibo
                sessionStorage.removeItem('ProgramaAcademicoId');
                sessionStorage.setItem('ProgramaAcademicoId', data.IdPrograma)
                this.mostrarFormularioYDescargar(data);
              })
            },
          }
        } : {},
        Opcion: {
          title: this.translate.instant('derechos_pecuniarios.solicitar'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => {
              if (data.Estado == 'Pendiente pago') {
                this.abrirPago(data)
              } else {
                const idInscripcion = data['Id'];

                sessionStorage.setItem('IdInscripcion', data.Id)
                sessionStorage.setItem('ProgramaAcademico', data.Programa)
                sessionStorage.setItem('IdPeriodo', data.Periodo)
                sessionStorage.setItem('IdTipoInscripcion', data.IdTipoInscripcion)
                sessionStorage.setItem('ProgramaAcademicoId', data.IdPrograma)
                sessionStorage.setItem('NivelId', data.Nivel)

                this.abrirDialogoSolicitudTransferencia(idInscripcion, process);
              }
            })
          },
        },
      },
      mode: 'external',
    }
  }

  async loadDataAll(process) {
    await this.cargarPeriodo();
    this.loading = true;

    this.sgaMidService.get('transferencia/solicitudes')
      .subscribe(response => {
        if (response !== null && response.Response.Code === '400') {
          this.popUpManager.showErrorToast(this.translate.instant('inscripcion.error'));
        } else if (response != null && response.Response.Code === '404') {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('inscripcion.no_inscripcion'));
        } else {
          let inscripciones = <Array<any>>response.Response.Body;
          inscripciones = inscripciones.filter(inscripcion => inscripcion.Estado != "Radicada");
          const dataInfo = <Array<any>>[];
          inscripciones.forEach(element => {
            this.projectService.get('proyecto_academico_institucion/' + element.Programa).subscribe(
              res => {
                const auxRecibo = element.Recibo;
                const NumRecibo = auxRecibo.split('/', 1);
                element.Recibo = NumRecibo[0];
                element.ReciboInscripcion = NumRecibo;
                element.ReciboAnio = auxRecibo.split('/', 2)[1];
                element.FechaGeneracion = momentTimezone.tz(element.FechaGeneracion, 'America/Bogota').format('DD-MM-YYYY hh:mm:ss');
                element.IdPrograma = element.Programa;
                element.Programa = res.Nombre;
                element.Periodo = this.periodo.Id;
                element.ProgramaAcademicoId = res.Nombre;
                let level = res['NivelFormacionId'].NivelFormacionPadreId;
                if (level == null || level == undefined) {
                  level = res['NivelFormacionId'].Id;
                } else {
                  level = res['NivelFormacionId'].NivelFormacionPadreId.Id;
                }
                element.NivelPP = level;
                element.tipo = "REINGRESO POSTGRADOS";

                if (this.recibos_pendientes[String(element.IdPrograma)] == undefined || this.recibos_pendientes[String(element.IdPrograma)] == null) {
                  this.recibos_pendientes[String(element.IdPrograma)] = 1;
                } else {
                  this.recibos_pendientes[String(element.IdPrograma)]++;
                }


                element.Opcion = {
                  icon: 'fa fa-search fa-2x',
                  label: 'Detalle',
                  class: "btn btn-primary"
                }

                this.loading = true;

                dataInfo.push(element);

                this.dataSource.load(dataInfo);

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
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
        });
  }

  async loadDataTercero(process) {
    await this.cargarPeriodo();
    this.loading = true;

    this.sgaMidService.get('transferencia/estado_recibos/' + this.uid)
      .subscribe(response => {
        if (response !== null && response.Response.Code === '400') {
          this.popUpManager.showErrorToast(this.translate.instant('inscripcion.error'));
          this.loading = false;
        } else if ((response != null && response.Response.Code === '404') || response.Response.Body.length == 0) {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('inscripcion.no_inscripcion'));
          this.loading = false;
        } else {
          const inscripciones = <Array<any>>response.Response.Body;
          const dataInfo = <Array<any>>[];
          this.loading = true;
          inscripciones.forEach(element => {
            this.projectService.get('proyecto_academico_institucion/' + element.Programa).subscribe(
              res => {
                const auxRecibo = element.Recibo;
                const NumRecibo = auxRecibo.split('/', 1);
                element.Recibo = NumRecibo[0];
                element.ReciboInscripcion = NumRecibo;
                element.ReciboAnio = auxRecibo.split('/', 2)[1];
                element.FechaGeneracion = moment(element.FechaGeneracion, 'YYYY-MM-DD').format('DD/MM/YYYY');
                element.IdPrograma = element.Programa;
                element.Programa = res.Nombre;
                element.Periodo = this.periodo.Id;
                element.ProgramaAcademicoId = res.Nombre;
                const estadoSolicitudCodigo = element.EstadoSolicitud.CodigoAbreviacion;
                element.EstadoSolicitud = element.EstadoSolicitud.Nombre;
                let level = res['NivelFormacionId'].NivelFormacionPadreId;
                if (level == null || level == undefined) {
                  level = res['NivelFormacionId'].Id;
                } else {
                  level = res['NivelFormacionId'].NivelFormacionPadreId.Id;
                }
                element.NivelPP = level;
                element.tipo = "REINGRESO POSTGRADOS";

                if (this.recibos_pendientes[String(element.IdPrograma)] == undefined || this.recibos_pendientes[String(element.IdPrograma)] == null) {
                  this.recibos_pendientes[String(element.IdPrograma)] = 1;
                } else {
                  this.recibos_pendientes[String(element.IdPrograma)]++;
                }

                if (element.Estado === 'Pendiente pago') {
                  element.Opcion = {
                    icon: 'fa fa-arrow-circle-right fa-2x',
                    label: 'Pagar',
                    class: "btn btn-primary"
                  }
                } else {
                  element.Opcion = {
                    icon: 'fa fa-pencil fa-2x',
                    label: 'Inscribirme',
                    class: "btn btn-primary"
                  }
                }

                if (estadoSolicitudCodigo === 'INSCREAL') {
                  element.Opcion.disabled = true;
                }

                dataInfo.push(element);

                this.dataSource.load(dataInfo);

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
    window.open('https://www.udistrital.edu.co/admisiones-pregrado', '_blank');
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
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
            resolve(this.periodo);
          }
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
          } else {

            Swal.fire({
              icon: 'warning',
              title: this.translate.instant('GLOBAL.info'),
              text: this.translate.instant('admision.error_calendario') + '. ' + this.translate.instant('admision.error_nueva_transferencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });

            this.clean();
            this.listadoSolicitudes = true;
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

      if (parametros == false) {
        this.formTransferencia.campos.forEach(campo => {
          if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
            campo.opciones = null;
            campo.ocultar = true;
          }

        });
      } else {
        this.codigosEstudiante = parametros["Data"]["CodigoEstudiante"];
        this.proyectosCurriculares = parametros["Data"]["ProyectoCurricular"];

        this.formTransferencia.campos.forEach(campo => {

          if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
            campo.opciones = parametros["Data"][campo.nombre];
            campo.ocultar = false;
          }

        });
      }
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
            if (response.Message == 'No se encuentran proyectos') {
              this.popUpManager.showErrorAlert(this.translate.instant('admision.error_no_proyecto'));
            } else {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            }
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
    if (this.recibos_pendientes[String(this.dataTransferencia.ProyectoCurricular.Id)] >= 1) {
      this.popUpManager.showErrorAlert(this.translate.instant('recibo_pago.maximo_recibos'));
      return
    }
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
        ProgramaAcademicoCodigo: this.dataTransferencia.ProyectoCurricular.Id,
        TipoInscripcionId: this.dataTransferencia.TipoInscripcion.Id,
        Year: this.dataTransferencia.Periodo.Year,
        Periodo: parseInt(this.dataTransferencia.Periodo.Ciclo, 10),
        FechaPago: '',
      };

      this.loading = true;
      let periodo = localStorage.getItem('IdPeriodo');
      this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + this.dataTransferencia.TipoInscripcion.NivelId + '/periodo/' + periodo).subscribe(
        (response: any[]) => {
          if (response !== null && response.length !== 0) {
            this.inscripcionProjects = response;
            this.inscripcionProjects.forEach(proyecto => {
              let evento_reingreso_pago;
              // if (proyecto.ProyectoId === this.dataTransferencia.ProyectoCurricular.Id && proyecto.Evento != null) {
              if (proyecto.ProyectoId === this.dataTransferencia.ProyectoCurricular.Id) {
                proyecto.Evento.forEach(evento =>{
                  if (evento.Pago === true && evento.CodigoAbreviacion === "REIN"){
                    evento_reingreso_pago = evento;
                  }
                });
                inscripcion.FechaPago = moment(evento_reingreso_pago.FechaFinEvento, 'YYYY-MM-DD').format('DD/MM/YYYY');
                this.sgaMidService.post('inscripciones/generar_inscripcion', inscripcion).subscribe(
                  (response: any) => {
                    if (response.Code === '200') {
                      this.listadoSolicitudes = true;

                      this.clean();

                      this.loadDataTercero(this.process);
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
        this.loadDataTercero(this.process);
      }
    }, 5000);
  }

  mostrarFormularioYDescargar(data) {
    const assignConfig = new MatDialogConfig();
    assignConfig.width = '1300px';
    assignConfig.maxHeight = '80vh';
    assignConfig.autoFocus = false;
    assignConfig.data = { 
      info_recibo: data,
      info_info_persona: this.info_info_persona,
      accion: 'descargar'
    };
    const dialogo = this.dialog.open(DialogoFormularioPagadorComponent, assignConfig);
  }

  abrirDialogoSolicitudTransferencia(idInscripcion: string, process: string) {
    const assignConfig = new MatDialogConfig();
    assignConfig.width = '95vw';
    assignConfig.maxWidth = '95vw';
    assignConfig.height = '90vh';
    assignConfig.maxHeight = '90vh';
    assignConfig.autoFocus = false;
    assignConfig.data = {
      idInscripcion: idInscripcion,
      process: process
    };

    import('../solicitud-transferencia/solicitud-transferencia.component').then(m => {
      const dialogo = this.dialog.open(m.SolicitudTransferenciaComponent, assignConfig);

      dialogo.afterClosed().subscribe(result => {
        if (this.process === 'my') {
          this.loadDataTercero(this.process);
        } else {
          this.loadDataAll(this.process);
        }
      });
    }).catch(error => {
      console.error('Error loading solicitud-transferencia component:', error);
      this.router.navigate([`/pages/inscripcion/solicitud-transferencia/${idInscripcion}/${btoa(process)}`]);
    });
  }
}
