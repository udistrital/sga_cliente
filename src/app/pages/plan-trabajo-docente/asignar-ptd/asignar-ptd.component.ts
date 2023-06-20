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

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private sgaMidService: SgaMidService,
    private parametrosService: ParametrosService,
    private autenticationService: ImplicitAutenticationService
  ) {
    this.dataDocentes = new LocalDataSource();
    this.cargarPeriodo();
  }

  ngOnInit() {
    this.popUpManager.showAlert(this.translate.instant('ptd.seleccion_periodo'), "");
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
      this.buildFormDocente();
    })
    this.autenticationService.getRole().then(
      (rol: Array<String>) => {
        rol.includes
        let r = rol.find(role => (role == ROLES.DOCENTE || role == ROLES.ADMIN_DOCENCIA || role == ROLES.COORDINADOR));
        this.coordinador = rol.find(role => (role == 'COORDINADOR' || role == 'ADMIN_DOCENCIA')) ? true : false
        if (r) {
          this.rolIs = r;
          this.canEdit = ACTIONS.EDIT;
        }
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
                this.vista = VIEWS.FORM;
                if (this.rolIs == ROLES.DOCENTE) {
                  this.popUpManager.showPopUpGeneric(this.translate.instant('notas.docente'), this.translate.instant('ptd.aviso_informativo_docente_p1') + '.<br><br>' +
                    this.translate.instant('ptd.aviso_informativo_docente_p2') + '.', MODALS.INFO, false)
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
          title: this.translate.instant('GLOBAL.enviar'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              console.log("enviar:", out);
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
            console.log("copiar actividades")
          } else {
            console.log("cancelar")
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
            this.detalleAsignacion = undefined;
            this.sgaMidService.get(`plan_trabajo_docente/copiar_plan/${this.dataDocente.docente_id}/${this.periodoCopia.Id}/${this.dataDocente.periodo_id}/${this.dataDocente.tipo_vinculacion_id}/${this.tipo.carga_lectiva}`).subscribe(resp => {
                  this.loading = false;
                  this.detalleAsignacionRespaldo.carga = [resp.Data.carga];
                  this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
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
                      const espacio = this.detalleAsignacion.espacios_academicos[0].find(espacio => espacio.id == preasignEsp.espacio_academico_id);
                      nombreEspacios += "<b>" + espacio.nombre + "</b><br>";
                    })
                    textPopUp.push(this.translate.instant('ptd.espacios_sin_asignar') + "<br>" + nombreEspacios);
                  }
                  this.popUpManager.showManyPopUp(this.translate.instant('ptd.copy_ptd'), textPopUp, MODALS.INFO)
                }, err => {
                  this.loading = false;
                  this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
                  console.warn(err)
                })
          } else {
            console.log("cancelar")
          }
        });
    }
  }

  loadAsignaciones() {
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
    this.cargarPeriodosAnteriores(this.periodo);
    this.loading = true;
    if (this.periodo) {
      this.loadAsignaciones();
    } else {
      this.dataDocentes.load([]);
      this.loading = false;
    }
  }
}
