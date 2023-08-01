import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { FORM_INFO_DOCENTE } from '../forms/form-info_docente';
import { PopUpManager } from '../../../managers/popUpManager';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../@core/data/users.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { PlanTrabajoDocenteService } from '../../../@core/data/plan_trabajo_docente.service';

@Component({
  selector: 'asignar-ptd',
  templateUrl: './asignar-ptd.component.html',
  styleUrls: ['./asignar-ptd.component.scss']
})
export class AsignarPtdComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  readonly MODALS = MODALS;
  readonly ACTIONS = ACTIONS;
  vista: Symbol;

  tbDocente: Object;
  dataDocentes: LocalDataSource;
  coordinador = false;
  formDocente: any;
  dataDocente: any;
  periodos: any[] = [];
  periodo: any;
  rolIs: String = undefined;
  canEdit: Symbol = ACTIONS.VIEW;
  asignaturaAdd: any = undefined;
  detalleAsignacion: any = undefined;

  periodosAnteriores: any[] = [];
  periodoCopia: any;
  readonly tipo = { carga_lectiva: 1, actividades: 2 };

  detalleAsignacionRespaldo: any = undefined;
  detalleAsignacionDescartar: any[] = [];
  estadosPlan: any[] = [];
  estadosAprobar: any[] = [];

  verReportes: boolean = false;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private sgaMidService: SgaMidService,
    private parametrosService: ParametrosService,
    private autenticationService: ImplicitAutenticationService,
    private planTrabajoDocenteService: PlanTrabajoDocenteService,
  ) {
    this.dataDocentes = new LocalDataSource();
    this.cargarPeriodo();
    this.cargarEstadosPlan().then(estados => {
      this.estadosPlan = <any[]>estados;
      this.estadosAprobar = this.estadosPlan.filter(estado => (estado.codigo_abreviacion == "PAPR") || (estado.codigo_abreviacion == "N_APR"));
    })
  }

  ngOnInit() {
    this.popUpManager.showAlert(this.translate.instant('ptd.seleccion_periodo'), "");
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
      this.buildFormDocente();
    })
    this.autenticationService.getRole().then(
      (rol: Array<String>) => {
        let r = rol.find(role => (role == ROLES.DOCENTE || role == ROLES.ADMIN_DOCENCIA || role == ROLES.COORDINADOR));
        this.coordinador = rol.find(role => (role == 'COORDINADOR' || role == 'ADMIN_DOCENCIA')) ? true : false
        if (r) {
          this.rolIs = r;
          this.canEdit = ACTIONS.EDIT;
        }
        this.createTable(); // update names by rol
      }
    );
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formDocente = { ...FORM_INFO_DOCENTE };
    this.createTable();
    this.buildFormDocente();
    this.dataDocentes.load([]);
  }

  createTable() {
    this.tbDocente = {
      columns: {
        index: {
          title: '#',
          filter: false,
          valuePrepareFunction: (value, row, cell) => {
            return cell.row.index + 1;
          },
          width: '2%',
        },
        docente: {
          title: this.translate.instant('GLOBAL.nombre'),
          editable: false,
          width: '25%',
          filter: true,
        },
        identificacion: {
          title: this.translate.instant('GLOBAL.Documento'),
          editable: false,
          width: '15%',
          filter: true,
        },
        tipo_vinculacion: {
          title: this.translate.instant('GLOBAL.tipo_vinculacion'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        periodo_academico: {
          title: this.translate.instant('calendario.periodo'),
          editable: false,
          width: '10%',
          filter: true,
        },
        soporte_documental: {
          title: this.translate.instant('GLOBAL.soporte_documental'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              console.log("ver soporte:", out);
            })
          }
        },
        gestion: {
          title: this.translate.instant('ptd.gest'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              if (out.rowData.gestion.type == "editar") {
                this.canEdit = ACTIONS.EDIT;
              } else {
                this.canEdit = ACTIONS.VIEW;
              }
              this.loading = true;
              this.sgaMidService.get(`plan_trabajo_docente/plan/${out.rowData.docente_id}/${out.rowData.periodo_id}/${out.rowData.tipo_vinculacion_id}`).subscribe((res: any) => {
                this.loading = false;
                this.detalleAsignacion = res.Data;
                this.dataDocente = {
                  Nombre: out.rowData.docente,
                  Documento: out.rowData.identificacion,
                  Periodo: out.rowData.periodo_academico,
                  TipoVinculacion: out.rowData.tipo_vinculacion,
                  docente_id: out.rowData.docente_id,
                  periodo_id: out.rowData.periodo_id,
                  tipo_vinculacion_id: out.rowData.tipo_vinculacion_id
                };
                if (this.coordinador && (out.rowData.estado === "Enviado a coordinación")) {
                  this.detalleAsignacion.aprobacion = this.estadosAprobar;
                  this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.aprobacion_plan_coordinacion'), 
                                                      this.translate.instant('ptd.recordar_aprobar_plan'), MODALS.INFO, false);
                }
                this.verReportes = out.rowData.estado === "Enviado a coordinación" || out.rowData.estado === "Aprobado"
                this.vista = VIEWS.FORM;
                this.periodoCopia = undefined;
                this.detalleAsignacionRespaldo = undefined;
                this.detalleAsignacionDescartar = [];
                if (this.rolIs == ROLES.DOCENTE) {
                  const modales = [];
                  if (this.canEdit == ACTIONS.VIEW) {
                    modales.push(this.translate.instant('ptd.info_modo_solo_ver'))
                  }
                  modales.push(this.translate.instant('ptd.aviso_informativo_docente_p1') + '.<br><br>' +
                  this.translate.instant('ptd.aviso_informativo_docente_p2') + '.');
                  this.popUpManager.showManyPopUp(this.translate.instant('notas.docente'), modales, MODALS.INFO)
                }
              }, (error: HttpErrorResponse) => {
                this.loading = false;
                console.log("error:", error);
              });
            })
          }
        },
        estado: {
          title: this.translate.instant('GLOBAL.estado'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        enviar: {
          title: this.coordinador ? this.translate.instant('ptd.enviar_a_docente') : this.translate.instant('ptd.enviar_a_coordinacion'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              const title = this.coordinador ? this.translate.instant('ptd.enviar_a_docente') : this.translate.instant('ptd.enviar_a_coordinacion');
              this.popUpManager.showPopUpGeneric(title, this.translate.instant('ptd.pregunta_enviar'), MODALS.WARNING, false).then(
                action => {
                  if (action.value) {
                    this.enviarSegunRol(this.coordinador, out.rowData.plan_docente_id);
                  }
              })
            })
          }
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  buildFormDocente() {
    this.formDocente.titulo = this.translate.instant(this.formDocente.titulo_i18n);
    this.formDocente.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  copy_ptd() {
    const NombrePeriodo = this.periodoCopia.Nombre;
    if (this.rolIs == ROLES.DOCENTE) {
      this.popUpManager.showPopUpGeneric('', this.translate.instant('ptd.copiar_plan_ver_coordinador_p1') + NombrePeriodo + '.<br>' +
        this.translate.instant('ptd.copiar_plan_ver_docente_p1') + '<br><br>' +
        this.translate.instant('ptd.copiar_plan_ver_docente_p2') + '.<br>' +
        this.translate.instant('ptd.copiar_plan_ver_docente_p3') + '.<br>' +
        this.translate.instant('ptd.copiar_plan_ver_docente_p4') + '.', MODALS.QUESTION, true)
        .then(action => {
          if (action.value) {
            this.loading = true;
            this.detalleAsignacionRespaldo = UtilidadesService.hardCopy(this.detalleAsignacion);
            const justCargaLectiva = this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].filter(item => !(item.actividad_id));
            this.detalleAsignacionDescartar = this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].filter(item => (item.actividad_id));
            this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion] = justCargaLectiva;
            this.detalleAsignacion = undefined;
            this.sgaMidService.get(`plan_trabajo_docente/copiar_plan/${this.dataDocente.docente_id}/${this.periodoCopia.Id}/${this.dataDocente.periodo_id}/${this.dataDocente.tipo_vinculacion_id}/${this.tipo.actividades}`).subscribe(resp => {
              this.loading = false;
              this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].push(...resp.Data.carga)
              this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
              this.detalleAsignacion.descartar = this.detalleAsignacionDescartar;
              this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.copy_ptd'), this.translate.instant('ptd.revisar_solapamiento_carga'), MODALS.WARNING, false)
            }, err => {
              this.loading = false;
              this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].push(...this.detalleAsignacionDescartar)
              this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
              this.detalleAsignacion.descartar = [];
              this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.copy_ptd'), this.translate.instant('ptd.no_info_copia_actividades'), MODALS.ERROR, false)
              console.warn(err)
            })
          }
        });
    }
    if (this.rolIs == ROLES.ADMIN_DOCENCIA || this.rolIs == ROLES.COORDINADOR) {
      this.popUpManager.showPopUpGeneric('', this.translate.instant('ptd.copiar_plan_ver_coordinador_p1') + NombrePeriodo + '.<br>' +
        this.translate.instant('ptd.copiar_plan_ver_coordinador_p2') + '.', MODALS.QUESTION, true)
        .then(action => {
          if (action.value) {
            this.loading = true;
            this.detalleAsignacionRespaldo = UtilidadesService.hardCopy(this.detalleAsignacion);
            const justActividades = this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].filter(item => !(item.espacio_academico_id));
            this.detalleAsignacionDescartar = this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].filter(item => (item.espacio_academico_id));
            this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion] = justActividades;
            this.detalleAsignacion = undefined;
            this.sgaMidService.get(`plan_trabajo_docente/copiar_plan/${this.dataDocente.docente_id}/${this.periodoCopia.Id}/${this.dataDocente.periodo_id}/${this.dataDocente.tipo_vinculacion_id}/${this.tipo.carga_lectiva}`).subscribe(resp => {
                  this.loading = false;
                  this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].push(...resp.Data.carga)
                  this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
                  this.detalleAsignacion.descartar = this.detalleAsignacionDescartar;
                  let textPopUp = []
                  let no_requeridos = <any[]>resp.Data.espacios_academicos.no_requeridos;
                  if (no_requeridos.length > 0) {
                    let nombreEspacios = "";
                    no_requeridos.forEach(espacioAcad => {
                      nombreEspacios += "<b>" + espacioAcad.nombre + "</b><br>";
                    })
                    textPopUp.push(this.translate.instant('ptd.espacios_no_requeridos') + "<br>" + nombreEspacios);
                  }
                  let sin_carga = <any[]>resp.Data.espacios_academicos.sin_carga;
                  if (sin_carga.length > 0) {
                    let nombreEspacios = "";
                    sin_carga.forEach(preasignEsp => {
                      nombreEspacios += "<b>" + preasignEsp.nombre + "</b><br>";
                    })
                    textPopUp.push(this.translate.instant('ptd.espacios_sin_asignar') + "<br>" + nombreEspacios);
                  }
                  this.popUpManager.showManyPopUp(this.translate.instant('ptd.copy_ptd'), textPopUp, MODALS.INFO)
                }, err => {
                  this.loading = false;
                  this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].push(...this.detalleAsignacionDescartar)
                  this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
                  this.detalleAsignacion.descartar = [];
                  this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.copy_ptd'), this.translate.instant('ptd.no_info_copia_carga_lectiva'), MODALS.ERROR, false)
                  console.warn(err)
                })
          }
        });
    }
  }

  loadAsignaciones() {
    this.loading = true;
    if (this.coordinador) {
      this.sgaMidService.get('plan_trabajo_docente/asignaciones/' + this.periodo.Id).subscribe(res => {
        if (res !== null) {
          this.dataDocentes.load(res["Data"]);
        }
        this.loading = false;
      }, err => {
        this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_asignaciones'));
        this.loading = false;
      });
    } else {
      const id_tercero = this.userService.getPersonaId();
      this.sgaMidService.get('plan_trabajo_docente/asignaciones_docente/' + id_tercero + '/' + this.periodo.Id).subscribe(res => {
        if (res !== null) {
          this.dataDocentes.load(res["Data"]);
        }
        this.loading = false;
      }, err => {
        this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_asignaciones'));
        this.loading = false;
      });
    }
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
            resolve(this.periodos);
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  cargarPeriodosAnteriores(periodo: any): void {
    this.periodosAnteriores = this.periodos.filter(porPeriodo => {
      if ((porPeriodo.Year <= periodo.Year) && (porPeriodo.Id < periodo.Id) && (porPeriodo.Nombre < periodo.Nombre)) {
        return porPeriodo
      } else {
          return false
      }
    })
  }

  selectPeriodo(periodo) {
    this.periodo = periodo.value;
    this.loading = true;
    if (this.periodo) {
      this.cargarPeriodosAnteriores(this.periodo);
      this.loadAsignaciones();
    } else {
      this.dataDocentes.load([]);
      this.loading = false;
    }
  }

  cargarEstadosPlan() {
    return new Promise((resolve, reject) => {
      this.planTrabajoDocenteService.get('estado_plan?query=activo:true&limit=0').subscribe(res => {
        if (res.Data.length > 0) {
          resolve(res.Data)
        } else {
          reject({estado_plan: "empty"})
        }
      }, err => {
        reject({estado_plan: err})
      })
    });
  }

  enviarSegunRol(coordinador: boolean, id_plan: string) {
    const cod_abrev = coordinador ? "ENV_COO" : "ENV_DOC";
    const estado = this.estadosPlan.find(estado => estado.codigo_abreviacion === cod_abrev);
    if (estado) {
      this.loading = true;
      this.planTrabajoDocenteService.get('plan_docente/' + id_plan).subscribe(res_g => {
        res_g.Data.estado_plan_id = estado._id;
        this.planTrabajoDocenteService.put('plan_docente/' + id_plan, res_g.Data).subscribe(res_p => {
          this.popUpManager.showSuccessAlert(this.translate.instant('ptd.plan_enviado_ok'));
          this.loadAsignaciones();
        }, err_p => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_enviar_plan'));
          console.warn("putfail", err_p);
        })
      }, err_g => {
        this.loading = false;
        this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_enviar_plan'));
        console.warn("getfail", err_g);
      })
    }
  }

  generarReporte(tipoCarga: string) {
    this.loading = true;
    this.sgaMidService.post(`reportes/plan_trabajo_docente/${this.dataDocente.docente_id}/${this.dataDocente.tipo_vinculacion_id}/${this.dataDocente.periodo_id}/${tipoCarga}`, null).subscribe(
      resp => {
        this.loading = false;
        const rawFilePDF = new Uint8Array(atob(resp.Data.pdf).split('').map(char => char.charCodeAt(0)));
        const urlFilePDF = window.URL.createObjectURL(new Blob([rawFilePDF], { type: 'application/pdf' }));
        this.previewFile(urlFilePDF)
        const rawFileExcel = new Uint8Array(atob(resp.Data.excel).split('').map(char => char.charCodeAt(0)));
        const urlFileExcel = window.URL.createObjectURL(new Blob([rawFileExcel], { type: 'application/vnd.ms-excel' }));

        const html = {
          html: [
            `<label class="swal2">${this.translate.instant('ptd.formato_doc')}</label>
            <select id="formato" class="swal2-input">
            <option value="excel" >Excel</option>
            <option value="pdf" >PDF</option>
            </select>`
          ],
          ids: ["formato"],
        }
        this.popUpManager.showPopUpForm(this.translate.instant('ptd.descargar'), html, false).then((action) => {
          if (action.value) {
            if (action.value.formato === "excel") {
              const download = document.createElement("a");
              download.href = urlFileExcel;
              download.download = "Reporte_PTD.xlsx";
              document.body.appendChild(download);
              download.click();
              document.body.removeChild(download);
            }
            if (action.value.formato === "pdf") {
              const download = document.createElement("a");
              download.href = urlFilePDF;
              download.download = "Reporte_PTD.pdf";
              document.body.appendChild(download);
              download.click();
              document.body.removeChild(download);
            }
          }
        })
        
      }, err => {
        this.loading = false;
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
        console.warn(err)
      }
    )
  }

  previewFile(url: string) {
    const h = screen.height * 0.65;
    const w = h * 3/4;
    const left = (screen.width * 3/4) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(url, '', 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }

  regresar() {
    this.loadAsignaciones();
    this.vista = VIEWS.LIST;
  }
}
