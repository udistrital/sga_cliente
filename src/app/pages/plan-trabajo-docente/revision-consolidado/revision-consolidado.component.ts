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
  isDecano: String = undefined;

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

  async ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formRevConsolidado = {...FORM_REVISION_CONSOLIDADO};
    this.dataRevConsolidados.load([]);
    await this.autenticationService.getRole().then(
      (rol: Array<String>) => {
        this.isSecDecanatura = rol.find(role => (role == ROLES.SEC_DECANATURA));
        this.isDecano = rol.find(role => (role == ROLES.DECANO));
      }
    );
    this.buildFormRevConsolidado();
    this.createTable();
    this.loadSelects();
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
    if (this.isDecano) {
      this.formRevConsolidado.campos.splice(this.getIndexFormRevConsolidado("infoParaSecDec"),1);
      this.formRevConsolidado.campos.splice(this.getIndexFormRevConsolidado("ArchivoSoporte"),1);
    }
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
        let estadosCodAbrev: string[] = [];
        if (this.isSecDecanatura) {
          estadosCodAbrev = ["AVA","N_APR"];
        }
        if (this.isDecano) {
          estadosCodAbrev = ["APR"];
        }
        const ops = this.estadosConsolidado.opciones.filter(estado => estadosCodAbrev.includes(estado.codigo_abreviacion));
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
        const idEstadosFiltro = this.idEstadosSegunRol();
        let rawlistarConsolidados = <any[]>resp.Data;
        rawlistarConsolidados = rawlistarConsolidados.filter(consolidado => idEstadosFiltro.includes(consolidado.estado_consolidado_id));
        const formatedData = this.estilizarDatosSegunRol(rawlistarConsolidados);
        this.dataRevConsolidados.load(formatedData);
      }, (err) => {
        this.loading = false;
        console.warn(err);
      });
    }
  }

  idEstadosSegunRol(): string[] {
    let estadosCodAbrev: string[] = [];
    if (this.isSecDecanatura) {
      estadosCodAbrev = ["ENV","AVA","ENV_AVA","N_APR"];
    }
    if (this.isDecano) {
      estadosCodAbrev = ["ENV_AVA","APR"];
    }
    return this.estadosConsolidado.opciones
      .filter(estado => estadosCodAbrev.includes(estado.codigo_abreviacion))
      .map(estado => estado._id);
  }

  estilizarDatosSegunRol(consolidados: any[]): any[] {
    let formatedData = [];
    consolidados.forEach(consolidado => {
      const proyecto = this.proyectos.opciones.find(proyecto => proyecto.Id == consolidado.proyecto_academico_id);
      const periodo = this.periodos.opciones.find(periodo => periodo.Id == consolidado.periodo_id);
      const estadoConsolidado = this.estadosConsolidado.opciones.find(estado => estado._id == consolidado.estado_consolidado_id);
      let opcionGestion = "ver";
      if ((estadoConsolidado && estadoConsolidado.codigo_abreviacion == "ENV") && (this.isSecDecanatura)) {
        opcionGestion = "editar";
      }
      if ((estadoConsolidado && estadoConsolidado.codigo_abreviacion == "ENV_AVA") && (this.isDecano)) {
        opcionGestion = "editar";
      }
      formatedData.push({
        "proyecto_curricular": proyecto ? proyecto.Nombre : "",
        "codigo": proyecto ? proyecto.Codigo : "",
        "fecha_radicado": this.formatoFecha(consolidado.fecha_creacion),
        "periodo_academico": periodo ? periodo.Nombre : "",
        "gestion": { value: undefined, type: opcionGestion, disabled: (!this.isSecDecanatura && !this.isDecano) },
        "estado": estadoConsolidado ? estadoConsolidado.nombre : consolidado.estado_consolidado_id,
        "enviar": { value: undefined, type: 'enviar', disabled: (!this.isSecDecanatura) || (estadoConsolidado.codigo_abreviacion != "AVA") },
        "ConsolidadoJson": consolidado
      })
    })
    return formatedData;
  }

  formatoFecha(fechaHora: string): string {
    return new Date(fechaHora).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  }

  revisarConsolidado(consolidado: any, readonly?: boolean) {
    this.revConsolidadoInfo = consolidado;
    this.vista = VIEWS.FORM;
    this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('Rol')].valor = this.isSecDecanatura || this.isDecano;
    this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('CumpleNorma')].valor = consolidado.cumple_normativa;
    this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('CumpleNorma')].deshabilitar = !this.isSecDecanatura;

    const estadoApr = this.estadosConsolidado.opciones.find(estado => estado._id == consolidado.estado_consolidado_id);
    if (estadoApr.codigo_abreviacion === "AVA" || estadoApr.codigo_abreviacion === "N_APR" || estadoApr.codigo_abreviacion === "APR") {
      this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('EnviarAprovacionDec')].valor = estadoApr;
    }

    if (this.isSecDecanatura) {
      const consolidado_coordinacion = JSON.parse(consolidado.consolidado_coordinacion);
      this.loading = true;
      this.GestorDocumental.get([{Id: consolidado_coordinacion.documento_id, ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}]).subscribe(
        (resp: any[])  => {
          this.loading = false;
          this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporteCoordinacion")].urlTemp = resp[0].url;
          this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporteCoordinacion")].valor = resp[0].url;
        }
      );
    }
    
    let terceroId = 0;
    const respuesta_decanatura = JSON.parse(consolidado.respuesta_decanatura);
    if (Object.keys(respuesta_decanatura.sec).length > 0) {
      if (respuesta_decanatura.sec.documento_id && respuesta_decanatura.sec.documento_id > 0) {
        this.loading = true;
        this.GestorDocumental.get([{Id: respuesta_decanatura.sec.documento_id, ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}]).subscribe(
          (resp: any[])  => {
            this.loading = false;
            if (this.isDecano) {
              this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporteCoordinacion")].urlTemp = resp[0].url;
              this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporteCoordinacion")].valor = resp[0].url;
            } else {
              this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporte")].urlTemp = resp[0].url;
              this.formRevConsolidado.campos[this.getIndexFormRevConsolidado("ArchivoSoporte")].valor = resp[0].url;
            }
          }
        );
      }
      if (this.isSecDecanatura) {
        terceroId = respuesta_decanatura.sec.responsable_id;
        this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('Observaciones')].valor = respuesta_decanatura.sec.observacion;
      }
    }
    if ((Object.keys(respuesta_decanatura.dec).length > 0) && this.isDecano) {
      terceroId = respuesta_decanatura.dec.responsable_id;
      this.formRevConsolidado.campos[this.getIndexFormRevConsolidado('Observaciones')].valor = respuesta_decanatura.dec.observacion;
    }
    if (terceroId == 0) {
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
      if (this.isSecDecanatura) {
        const verifyNewDoc = new Promise(resolve => {
          if (event.data.RevisionConsolidado.ArchivoSoporte.file != undefined) {
            this.GestorDocumental.uploadFiles([event.data.RevisionConsolidado.ArchivoSoporte]).subscribe(
              (resp: any[]) => {
                resolve(resp[0].res.Id)
              });
          } else {
            resolve(respuesta_decanatura.sec.documento_id)
          }
        });
        respuesta_decanatura.sec.documento_id = await verifyNewDoc;
        respuesta_decanatura.sec.responsable_id = this.userService.getPersonaId();
        respuesta_decanatura.sec.observacion = event.data.RevisionConsolidado.Observaciones;
        this.revConsolidadoInfo.cumple_normativa = event.data.RevisionConsolidado.CumpleNorma;
      }
      if (this.isDecano) {
        respuesta_decanatura.dec.responsable_id = this.userService.getPersonaId();
        respuesta_decanatura.dec.observacion = event.data.RevisionConsolidado.Observaciones;
      }
      this.revConsolidadoInfo.estado_consolidado_id = event.data.RevisionConsolidado.EnviarAprovacionDec._id;
      this.revConsolidadoInfo.respuesta_decanatura = JSON.stringify(respuesta_decanatura);
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
