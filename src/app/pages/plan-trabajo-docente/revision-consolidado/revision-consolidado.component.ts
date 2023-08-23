import { Component, OnInit } from '@angular/core';
import { MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { FORM_REVISION_CONSOLIDADO } from '../forms/form-consolidado';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { PlanTrabajoDocenteService } from '../../../@core/data/plan_trabajo_docente.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';

@Component({
  selector: 'revision-consolidado',
  templateUrl: './revision-consolidado.component.html',
  styleUrls: ['./revision-consolidado.component.scss']
})
export class RevisionConsolidadoComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbRevConsolidados: Object;
  dataRevConsolidados: LocalDataSource;

  formRevConsolidado: any;
  dataRevConsolidado: any;

  periodos: {select: any, opciones?: any[]} = {select: null};
  proyectos: {select: any, opciones?: any[]} = {select: null};
  estadosConsolidado: {select: any, opciones?: any[]} = {select: null};

  isSecDecanatura: String = undefined;

  revConsolidadoInfo: any = undefined;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private planTrabajoDocenteService: PlanTrabajoDocenteService,
    private userService: UserService,
    private tercerosService: TercerosService,
    private autenticationService: ImplicitAutenticationService,
    private sgaMidService: SgaMidService,
    private GestorDocumental: NewNuxeoService,
    ) {
      this.dataRevConsolidados = new LocalDataSource();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
        this.buildFormRevConsolidado();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formRevConsolidado = {...FORM_REVISION_CONSOLIDADO};
    this.buildFormRevConsolidado();
    this.createTable();
    this.loadSelects();
    this.dataRevConsolidados.load([]);
    this.autenticationService.getRole().then(
      (rol: Array<String>) => {
        this.isSecDecanatura = rol.find(role => (role == ROLES.SEC_DECANATURA));
      }
    );
  }

  createTable() {
    this.tbRevConsolidados = {
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '2%',
        },
        proyecto_curricular: {
          title: this.translate.instant('GLOBAL.proyecto_academico'),
          editable: false,
          width: '25%',
          filter: true,
        },
        codigo: {
          title: this.translate.instant('GLOBAL.codigo'),
          editable: false,
          width: '15%',
          filter: true,
        },
        fecha_radicado: {
          title: this.translate.instant('ptd.fecha_radicado'),
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
        gestion: {
          title: this.translate.instant('ptd.gest'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              const readonly = out.rowData.gestion.type === 'ver';
              this.revisarConsolidado(out.rowData.ConsolidadoJson, readonly);
            })}
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
              let putPlan = <any>UtilidadesService.hardCopy(out.rowData.ConsolidadoJson);
              const estado = this.estadosConsolidado.opciones.find(estado => estado.codigo_abreviacion === "ENV_AVA");
              putPlan.estado_consolidado_id = estado._id;
              this.loading = true;
              this.planTrabajoDocenteService.put('consolidado_docente/'+putPlan._id, putPlan).subscribe(
                resp => {
                  this.loading = false;
                  this.popUpManager.showSuccessAlert(this.translate.instant('ptd.actualizar_consolidado_ok'))
                  this.listarConsolidados();
                }, err => {
                  this.loading = false;
                  console.warn(err);
                  this.popUpManager.showErrorAlert(this.translate.instant('ptd.fallo_actualizar_consolidado'))
                }
              );
            })}
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  buildFormRevConsolidado() {
    this.formRevConsolidado.btn = this.translate.instant('GLOBAL.guardar');
    this.formRevConsolidado.titulo = this.translate.instant(this.formRevConsolidado.titulo_i18n);
    this.formRevConsolidado.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  getIndexFormRevConsolidado(nombre: String): number {
    for (let index = 0; index < this.formRevConsolidado.campos.length; index++) {
      const element = this.formRevConsolidado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return -1;
  }

  // * ----------
  // * Carga información paramétrica (selects)
  //#region
  loadPeriodo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            reject({"periodo": null});
          }
        }, (err) => {
          reject({"periodo": err});
        }
      );
    });
  }

  loadProyectos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"proyecto": null});
          }
        }, (err) => {
          reject({"proyecto": err});
        }
      );
    });
  }

  cargarEstadosConsolidado(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.planTrabajoDocenteService.get('estado_consolidado?query=activo:true&limit=0').subscribe(res => {
        if (res.Data.length > 0) {
          resolve(res.Data)
        } else {
          reject({"estado_consolidado": null})
        }
      }, err => {
        reject({"estado_consolidado": err})
      })
    });
  }
  //#endregion
  // * ----------

  async loadSelects() {
    this.loading = true;
    try {
      // ? carga paralela de parametricas
      let promesas = [];
      promesas.push(this.loadPeriodo().then(periodos => {this.periodos.opciones = periodos}));
      promesas.push(this.loadProyectos().then(proyectos => {this.proyectos.opciones = proyectos;}));
      promesas.push(this.cargarEstadosConsolidado().then(estadosConsolidado => {
        this.estadosConsolidado.opciones = estadosConsolidado;
        const ops = this.estadosConsolidado.opciones.filter(estado => (estado.codigo_abreviacion === "AVA" || estado.codigo_abreviacion === "N_APR"));
        this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('EnviarAprovacionDec')].opciones = ops;
      }));
      this.loading = false
    } catch (error) {
      console.warn(error);
      this.loading = false;
      const falloEn = Object.keys(error)[0];
      if (error[falloEn] == null) {
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                                           this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
                                           this.translate.instant('ERROR.persiste_error_comunique_OAS'),
                                           MODALS.ERROR, false);
      } else {
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                                           this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
                                           this.translate.instant('ERROR.persiste_error_comunique_OAS'),
                                           MODALS.ERROR, false);
      }
    }
  }

  listarConsolidados() {
    if (this.periodos.select) {
      let proyecto = ""
      if (this.proyectos.select) {
        proyecto = ",proyecto_academico_id:"+this.proyectos.select.Id;
      }
      this.loading = true;
      this.planTrabajoDocenteService.get(`consolidado_docente?query=activo:true,periodo_id:${this.periodos.select.Id}${proyecto}&limit=0`).subscribe((resp) => {
        this.loading = false;
        let rawlistarConsolidados = <any[]>resp.Data;
        let formatedData = [];
        rawlistarConsolidados.forEach(consolidado => {
          const proyecto = this.proyectos.opciones.find(proyecto => proyecto.Id == consolidado.proyecto_academico_id);
          const periodo = this.periodos.opciones.find(periodo => periodo.Id == consolidado.periodo_id);
          const estadoConsolidado = this.estadosConsolidado.opciones.find(estado => estado._id == consolidado.estado_consolidado_id);
          let opcionGestion = "ver"
          if ((estadoConsolidado && estadoConsolidado.codigo_abreviacion == "ENV") && (this.isSecDecanatura)) {
            opcionGestion = "editar"
          }
          formatedData.push({
            "proyecto_curricular": proyecto ? proyecto.Nombre : "",
            "codigo": proyecto ? proyecto.Codigo : "",
            "fecha_radicado": this.formatoFecha(consolidado.fecha_creacion),
            "periodo_academico": periodo ? periodo.Nombre : "",
            "gestion": {value: undefined, type: opcionGestion, disabled: !this.isSecDecanatura},
            "estado": estadoConsolidado ? estadoConsolidado.nombre : consolidado.estado_consolidado_id,
            "enviar": {value: undefined, type: 'enviar', disabled: (!this.isSecDecanatura) || (estadoConsolidado.codigo_abreviacion != "AVA")},
            "ConsolidadoJson": consolidado
          })
        })
        this.dataRevConsolidados.load(formatedData);

      }, (err) => {
        this.loading = false;
        console.warn(err);
      });
    }
  }

  formatoFecha(fechaHora: string): string {
    const fecha_hora = fechaHora.split('T');
    const fechaPartes = fecha_hora[0].split('-');
    return fechaPartes[2]+'/'+fechaPartes[1]+'/'+fechaPartes[0]+' - '+fecha_hora[1].split('.')[0]
  }

  revisarConsolidado(consolidado: any, readonly?: boolean) {
    this.revConsolidadoInfo = consolidado;
    this.vista = VIEWS.FORM;
    this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('Rol')].valor = this.isSecDecanatura;
    this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('CumpleNorma')].valor = consolidado.cumple_normativa;
    const estadoApr = this.estadosConsolidado.opciones.find(estado => estado._id == consolidado.estado_consolidado_id);
    if (estadoApr.codigo_abreviacion === "AVA" || estadoApr.codigo_abreviacion === "N_APR")
    this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('EnviarAprovacionDec')].valor = estadoApr;
    const consolidado_coordinacion = JSON.parse(consolidado.consolidado_coordinacion);
    this.loading = true;
      this.GestorDocumental.get([{Id: consolidado_coordinacion.documento_id, ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}]).subscribe(
        (resp: any[])  => {
          this.loading = false;
          this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporteCoordinacion")].urlTemp = resp[0].url;
          this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporteCoordinacion")].valor = resp[0].url;
        }
      );
    let terceroId = 0;
    if (consolidado.respuesta_decanatura !== "{}") {
      const respuesta_decanatura = JSON.parse(consolidado.respuesta_decanatura);
      if (respuesta_decanatura.documento_id && respuesta_decanatura.documento_id > 0) {
        this.loading = true;
        this.GestorDocumental.get([{Id: respuesta_decanatura.documento_id, ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}]).subscribe(
          (resp: any[])  => {
            this.loading = false;
            this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporte")].urlTemp = resp[0].url;
            this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporte")].valor = resp[0].url;
          }
        );
      }
      terceroId = respuesta_decanatura.responsable_id;
      this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('Observaciones')].valor = respuesta_decanatura.observacion;
    } else {
      terceroId = this.userService.getPersonaId();
    }
    this.tercerosService.get('tercero/'+terceroId).subscribe(resTerc => {
      this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("QuienResponde")].valor = resTerc.NombreCompleto;
    }, err => {
      console.warn(err);
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
    });
    if (readonly ? readonly : false) {
      this.formRevConsolidado.btn = "";
    } else {
      this.formRevConsolidado.btn = this.translate.instant('GLOBAL.guardar');
    }
  }

  async validarFormRevConsolidado(event) {
    if (event.valid) {
      let respuesta_decanatura = JSON.parse(this.revConsolidadoInfo.respuesta_decanatura);
      const verifyNewDoc = new Promise(resolve => {
        if (event.data.RevisionConsolidado.ArchivoSoporte.file != undefined) {
          this.GestorDocumental.uploadFiles([event.data.RevisionConsolidado.ArchivoSoporte]).subscribe(
            (resp: any[]) => {
              resolve(resp[0].res.Id)
            });
        } else {
          resolve(respuesta_decanatura.documento_id)
        }
      });

      respuesta_decanatura.documento_id = await verifyNewDoc;
      respuesta_decanatura.responsable_id = this.userService.getPersonaId();
      respuesta_decanatura.observacion = event.data.RevisionConsolidado.Observaciones;
      
      this.revConsolidadoInfo.cumple_normativa = event.data.RevisionConsolidado.CumpleNorma;
      this.revConsolidadoInfo.respuesta_decanatura = JSON.stringify(respuesta_decanatura);
      this.revConsolidadoInfo.estado_consolidado_id = event.data.RevisionConsolidado.EnviarAprovacionDec._id;

      this.loading = true;
          this.planTrabajoDocenteService.put('consolidado_docente/'+this.revConsolidadoInfo._id, this.revConsolidadoInfo).subscribe((resp) => {
            this.loading = false;
            this.popUpManager.showSuccessAlert(this.translate.instant('ptd.actualizar_consolidado_ok'));
          }, (err) => {
            this.loading = false;
            console.warn(err);
            this.popUpManager.showErrorAlert(this.translate.instant('ptd.fallo_actualizar_consolidado'));
          });
    }
  }

  regresar() {
    this.vista = VIEWS.LIST;
    this.listarConsolidados();
  }

}
