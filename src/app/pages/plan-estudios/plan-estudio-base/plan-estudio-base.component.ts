import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { PopUpManager } from "../../../managers/popUpManager";
import { FORM_PLAN_ESTUDIO } from "../form-plan_estudio";
import { UtilidadesService } from "../../../@core/utils/utilidades.service";
import { FormParams } from "../../../@core/data/models/define-form-fields";
import { FormGroup } from "@angular/forms";
import { ProyectoAcademicoService } from "../../../@core/data/proyecto_academico.service";
import { LocalDataSource } from "ng2-smart-table";
import {
  ACTIONS,
  MODALS,
  VIEWS,
} from "../../../@core/data/models/diccionario/diccionario";
import { SgaMidService } from "../../../@core/data/sga_mid.service";
import { PlanEstudiosService } from "../../../@core/data/plan_estudios.service";
import { DomSanitizer } from "@angular/platform-browser";
import { HttpErrorResponse } from "@angular/common/http";
import {
  PlanEstudio,
  EspacioEspaciosSemestreDistribucion,
} from "../../../@core/data/models/plan_estudios/plan_estudio";
import { NewNuxeoService } from "../../../@core/utils/new_nuxeo.service";
import {
  EstadoAprobacion,
} from "../../../@core/data/models/plan_estudios/estado_aprobacion";

@Component({
  selector: "plan-estudio-base",
  template: "",
})
export abstract class PlanEstudioBaseComponent {
  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  planEstudioBody: any;
  formPlanEstudio: FormParams;
  formGroupPlanEstudio: FormGroup;

  tbPlanesEstudio: Object;
  planesEstudio: any[];
  dataPlanesEstudio: LocalDataSource;

  tbEspaciosAcademicos: Object;
  dataEspaciosAcademicos: LocalDataSource;

  tbSemestre: Object;
  dataSemestre: LocalDataSource[];

  tbSemestreTotal: Object;
  dataSemestreTotal: LocalDataSource[];
  dataSemestreTotalTotal: LocalDataSource;

  niveles: any[];
  proyectos: any[];

  enEdicionPlanEstudio: boolean = false;
  enEdicionSemestreNuevo: boolean = false;
  enEdicionSemestreViejo: boolean = false;
  habilitadoGenerarPlan: boolean = false;
  
  punteroSemestrePlan: number = 0;

  estadosAprobacion: EstadoAprobacion[];

  proyecto_id: number;
  ListEspacios: any[] = [];
  readonly formatototal = {
    nombre: "TOTAL",
    creditos: 0,
    htd: 0,
    htc: 0,
    hta: 0,
    OB: 0,
    OC: 0,
    EI: 0,
    EE: 0,
    CP: 0,
    ENFQ_TEO: 0,
    ENFQ_PRAC: 0,
    ENFQ_TEOPRAC: 0,
  };

  readonly studyPlanTableColumns = {
    plan_estudio: {
      title: this.translate.instant("plan_estudios.plan_estudios"),
      editable: false,
      width: "25%",
      filter: true,
    },
    proyectoCurricular: {
      title: this.translate.instant("inscripcion.proyecto_curricular"),
      editable: false,
      width: "15%",
      filter: true,
    },
    resolucion: {
      title: this.translate.instant("plan_estudios.resolucion"),
      editable: false,
      width: "10%",
      filter: true,
    },
    estado: {
      title: this.translate.instant("GLOBAL.estado"),
      editable: false,
      width: "10%",
      filter: true,
    },
    totalCreditos: {
      title: this.translate.instant("plan_estudios.total_creditos"),
      editable: false,
      width: "10%",
      filter: true,
    },
    planPorCiclos: {
      title: this.translate.instant("plan_estudios.plan_estudios_ciclos"),
      editable: false,
      width: "10%",
      filter: true,
    },
  };

  readonly ACTIONS = ACTIONS;

  constructor(
    protected translate: TranslateService,
    protected popUpManager: PopUpManager,
    protected projectService: ProyectoAcademicoService,
    protected sgaMidService: SgaMidService,
    protected domSanitizer: DomSanitizer,
    protected planEstudiosService: PlanEstudiosService,
    protected gestorDocumentalService: NewNuxeoService
  ) {}

  crearFormulario() {
    this.formPlanEstudio = <FormParams>(
      UtilidadesService.hardCopy(FORM_PLAN_ESTUDIO)
    );
    this.formPlanEstudio.nivel.opciones = this.niveles.filter(
      (nivel) => nivel.NivelFormacionPadreId == undefined
    );
  }

  habilitarGenerarPlan() {
    if (this.dataPlanesEstudio.count() > 0) {
      this.habilitadoGenerarPlan = true;
    }
  }

  // * ----------
  // * Crear tabla de lista planes estudio
  //#region
  createTableEspaciosAcademicos() {
    this.tbEspaciosAcademicos = {
      pager: {
        perPage: 5,
      },
      columns: {
        index: {
          title: "#",
          filter: false,
          valuePrepareFunction: (value, row, cell) => {
            const pager = this.dataEspaciosAcademicos.getPaging();
            return (pager.page - 1) * pager.perPage + cell.row.index + 1;
          },
          width: "5%",
        },
        nombre: {
          title: this.translate.instant("ptd.espacio_academico"),
          editable: false,
          width: "25%",
          filter: true,
        },
        prerequisitos_str: {
          title: this.translate.instant(
            "espacios_academicos.espacios_requeridos"
          ),
          editable: false,
          width: "25%",
          filter: true,
        },
        clase: {
          title: this.translate.instant("GLOBAL.clase"),
          editable: false,
          width: "25%",
          filter: true,
        },
        creditos: {
          title: this.translate.instant("proyecto.creditos_proyecto"),
          editable: false,
          width: "15%",
          filter: true,
        },
      },
      hideSubHeader: false,
      mode: "external",
      actions: {
        position: "right",
        columnTitle: this.translate.instant("GLOBAL.acciones"),
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: "add_to_semester",
            title:
              '<i class="nb-plus-circled" title="' +
              this.translate.instant("plan_estudios.agregar_espacio") +
              '"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant("GLOBAL.table_no_data_found"),
    };
  }

  createTableSemestre() {
    const checkmark = this.domSanitizer.bypassSecurityTrustHtml(
      `<div style="font-size: 2rem; text-align: center;"><i class="nb-checkmark-circle"></i></div>`
    );
    this.tbSemestre = {
      columns: {
        nombre: {
          title: this.translate.instant("ptd.espacio_academico"),
          editable: false,
          width: "23%",
          filter: false,
        },
        creditos: {
          title: this.translate.instant("plan_estudios.creditos"),
          editable: false,
          width: "7%",
          filter: false,
        },
        htd: {
          title: this.translate.instant("espacios_academicos.htd"),
          editable: false,
          width: "7%",
          filter: false,
        },
        htc: {
          title: this.translate.instant("espacios_academicos.htc"),
          editable: false,
          width: "7%",
          filter: false,
        },
        hta: {
          title: this.translate.instant("espacios_academicos.hta"),
          editable: false,
          width: "7%",
          filter: false,
        },
        OB: {
          title: this.translate.instant(
            "espacios_academicos.obligatorioBasico"
          ),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
          valuePrepareFunction: (valor: number) =>
            valor === 1 ? checkmark : "",
        },
        OC: {
          title: this.translate.instant(
            "espacios_academicos.obligatorioComplementario"
          ),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
          valuePrepareFunction: (valor: number) =>
            valor === 1 ? checkmark : "",
        },
        EI: {
          title: this.translate.instant(
            "espacios_academicos.electivaIntrinseca"
          ),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
          valuePrepareFunction: (valor: number) =>
            valor === 1 ? checkmark : "",
        },
        EE: {
          title: this.translate.instant(
            "espacios_academicos.electivaExtrinseca"
          ),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
          valuePrepareFunction: (valor: number) =>
            valor === 1 ? checkmark : "",
        },
        CP: {
          title: this.translate.instant(
            "espacios_academicos.componentePropedeutico"
          ),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
          valuePrepareFunction: (valor: number) =>
            valor === 1 ? checkmark : "",
        },
        ENFQ_TEO: {
          title: this.translate.instant("espacios_academicos.teorico"),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
          valuePrepareFunction: (valor: number) =>
            valor === 1 ? checkmark : "",
        },
        ENFQ_PRAC: {
          title: this.translate.instant("espacios_academicos.practico"),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
          valuePrepareFunction: (valor: number) =>
            valor === 1 ? checkmark : "",
        },
        ENFQ_TEOPRAC: {
          title: this.translate.instant("espacios_academicos.teoricoPractico"),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
          valuePrepareFunction: (valor: number) =>
            valor === 1 ? checkmark : "",
        },
      },
      hideSubHeader: true,
      mode: "external",
      actions: {
        position: "right",
        columnTitle: this.translate.instant("GLOBAL.acciones"),
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: "remove_from_semester",
            title:
              '<i class="nb-close-circled" title="' +
              this.translate.instant("plan_estudios.quitar_espacio") +
              '"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant("GLOBAL.table_no_data_found"),
    };
  }

  createTableSemestreTotal() {
    this.tbSemestreTotal = {
      columns: {
        nombre: {
          title: this.translate.instant("ptd.espacio_academico"),
          editable: false,
          width: "23%",
          filter: false,
        },
        creditos: {
          title: this.translate.instant("plan_estudios.creditos"),
          editable: false,
          width: "7%",
          filter: false,
          type: "html",
        },
        htd: {
          title: this.translate.instant("espacios_academicos.htd"),
          editable: false,
          width: "7%",
          filter: false,
        },
        htc: {
          title: this.translate.instant("espacios_academicos.htc"),
          editable: false,
          width: "7%",
          filter: false,
        },
        hta: {
          title: this.translate.instant("espacios_academicos.hta"),
          editable: false,
          width: "7%",
          filter: false,
        },
        OB: {
          title: this.translate.instant(
            "espacios_academicos.obligatorioBasico"
          ),
          editable: false,
          width: "7%",
          filter: false,
        },
        OC: {
          title: this.translate.instant(
            "espacios_academicos.obligatorioComplementario"
          ),
          editable: false,
          width: "7%",
          filter: false,
        },
        EI: {
          title: this.translate.instant(
            "espacios_academicos.electivaIntrinseca"
          ),
          editable: false,
          width: "7%",
          filter: false,
        },
        EE: {
          title: this.translate.instant(
            "espacios_academicos.electivaExtrinseca"
          ),
          editable: false,
          width: "7%",
          filter: false,
        },
        CP: {
          title: this.translate.instant(
            "espacios_academicos.componentePropedeutico"
          ),
          editable: false,
          width: "7%",
          filter: false,
        },
        ENFQ_TEO: {
          title: this.translate.instant("espacios_academicos.teorico"),
          editable: false,
          width: "7%",
          filter: false,
        },
        ENFQ_PRAC: {
          title: this.translate.instant("espacios_academicos.practico"),
          editable: false,
          width: "7%",
          filter: false,
        },
        ENFQ_TEOPRAC: {
          title: this.translate.instant("espacios_academicos.teoricoPractico"),
          editable: false,
          width: "7%",
          filter: false,
        },
      },
      hideSubHeader: true,
      mode: "external",
      actions: {
        position: "right",
        columnTitle: this.translate.instant("GLOBAL.acciones"),
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: "remove_from_semester",
            title: '<i class="nb-info"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant("GLOBAL.table_no_data_found"),
    };
  }

  onAction(event): void {
    switch (event.action) {
      case "add_to_semester":
        // ToDo mostrar mensaje de confirmación cuando no sea el último semestre
        this.runValidations2SpacesAdding(event)
          .then((result) => {
            if (result["valid"]) {
              this.addtoSemester(event);
            } else {
              this.popUpManager.showErrorAlert(result["error"]);
            }
          })
          .catch((result) => {
            this.popUpManager.showErrorAlert(result["error"]);
          });
        break;
      case "remove_from_semester":
        this.removeFromSemester(event);
        break;
    }
  }

  addtoSemester(event) {
    if (this.dataSemestre.length >= 1 && (this.enEdicionSemestreNuevo || this.enEdicionSemestreViejo)) {
      this.dataSemestre[this.punteroSemestrePlan].add(event.data);
      this.dataSemestre[this.punteroSemestrePlan].refresh();
      this.dataEspaciosAcademicos.remove(event.data);
      const totalSemestre = this.filaTotal(this.dataSemestre[this.punteroSemestrePlan]);
      this.dataSemestreTotal[this.punteroSemestrePlan].load(totalSemestre);
      this.dataSemestreTotal[this.punteroSemestrePlan].refresh();
    }
  }

  async removeFromSemester(event) {
    if (this.enEdicionSemestreNuevo || this.enEdicionSemestreViejo) {
      await this.dataSemestre[this.punteroSemestrePlan].remove(event.data);
      await this.prepareUpdateBySemester().then((res) => {
        if (res) {
          this.dataEspaciosAcademicos.add(event.data);
          this.dataEspaciosAcademicos.refresh();
          const totalSemestre = this.filaTotal(this.dataSemestre[this.punteroSemestrePlan]);
          this.dataSemestreTotal[this.punteroSemestrePlan].load(totalSemestre);
          this.dataSemestreTotal[this.punteroSemestrePlan].refresh();
        } else {
          this.addtoSemester(event);
        }
      });
      
    }
  }

  limpiarSemestre(semestre: LocalDataSource, index: number) {
    this.popUpManager
      .showPopUpGeneric(
        this.translate.instant("plan_estudios.plan_estudios"),
        this.translate.instant("plan_estudios.seguro_limpiar"),
        MODALS.QUESTION,
        true
      )
      .then((action) => {
        if (action.value) {
          semestre.getAll().then(async (data) => {
            await data.forEach((dataind) => {
              this.dataEspaciosAcademicos.add(dataind);
            });
            await this.dataEspaciosAcademicos.refresh();
            await semestre.load([]);
            const totalSemestre = await this.filaTotal(this.dataSemestre[this.punteroSemestrePlan]);
            await this.dataSemestreTotal[this.punteroSemestrePlan].load(totalSemestre);
            await this.dataSemestreTotal[this.punteroSemestrePlan].refresh();
            this.prepareUpdateBySemester();
          });
        }
      });
  }

  filaTotal(semestre: LocalDataSource): any {
    let total = <any>UtilidadesService.hardCopy(this.formatototal);
    semestre.getAll().then((data) => {
      if (data.length > 0) {
        data.forEach((dataind) => {
          total.creditos += dataind.creditos;
          total.htd += dataind.htd;
          total.htc += dataind.htc;
          total.hta += dataind.hta;
          total.OB += dataind.OB;
          total.OC += dataind.OC;
          total.EI += dataind.EI;
          total.EE += dataind.EE;
          total.CP += dataind.CP;
          total.ENFQ_TEO += dataind.ENFQ_TEO;
          total.ENFQ_PRAC += dataind.ENFQ_PRAC;
          total.ENFQ_TEOPRAC += dataind.ENFQ_TEOPRAC;
        });
      }
    });
    this.totalTotal();
    return [total];
  }

  totalTotal() {
    let total = <any>UtilidadesService.hardCopy(this.formatototal);
    this.dataSemestre.forEach((semestre) => {
      semestre.getAll().then((data) => {
        if (data.length > 0) {
          data.forEach((dataind) => {
            total.creditos += dataind.creditos;
            total.htd += dataind.htd;
            total.htc += dataind.htc;
            total.hta += dataind.hta;
            total.OB += dataind.OB;
            total.OC += dataind.OC;
            total.EI += dataind.EI;
            total.EE += dataind.EE;
            total.CP += dataind.CP;
            total.ENFQ_TEO += dataind.ENFQ_TEO;
            total.ENFQ_PRAC += dataind.ENFQ_PRAC;
            total.ENFQ_TEOPRAC += dataind.ENFQ_TEOPRAC;
          });
        }
      });
    });
    this.dataSemestreTotalTotal.load([total]);
    this.dataSemestreTotalTotal.refresh();
  }
  //#endregion
  // * ----------

  // * ----------
  // * Reaccionar a cambios de formularios
  //#region
  actualizarForm(event) {
    this.formGroupPlanEstudio = event;
  }
  //#endregion
  // * ----------

  // * ----------
  // * Acciones botones
  //#region
  cancelar() {
    this.popUpManager.showPopUpGeneric(this.translate.instant('plan_estudios.plan_estudios'),
      this.translate.instant('plan_estudios.seguro_cancelar'), MODALS.WARNING, true).then(
        (action) => {
          if (action.value) {
            this.formGroupPlanEstudio.reset();
            this.dataSemestre = [];
            this.vista = VIEWS.LIST;
            this.loadSelects();
          }
        }
      );
  }

  agregarSemestre() {
    const semestresMax = Number(this.formGroupPlanEstudio.get('numeroSemestres').value);
    if (semestresMax && this.dataSemestre.length < semestresMax) {
      this.enEdicionSemestreNuevo = true;
      this.enEdicionSemestreViejo = false;
      this.dataSemestre.push(new LocalDataSource());
      this.punteroSemestrePlan = this.dataSemestre.length - 1;
      let total = <any>UtilidadesService.hardCopy(this.formatototal);
      this.dataSemestreTotal.push(new LocalDataSource([total]));
      this.createTableSemestre();
      this.createTableSemestreTotal();
    }
  }

  editarSemestre(index: number){
    this.punteroSemestrePlan = index;
    if (index == (this.dataSemestre.length - 1)) {
      this.enEdicionSemestreNuevo = true;
    } else {
      this.enEdicionSemestreViejo = true;
    }
  }

  finalizarSemestre() {
    this.popUpManager.showPopUpGeneric(this.translate.instant('plan_estudios.plan_estudios'),
      this.translate.instant('plan_estudios.seguro_finalizar'), MODALS.INFO, true).then(
        (action) => {
          if (action.value) {
            this.prepareUpdateBySemester().then((res) => {
              if (res) {
                this.enEdicionSemestreNuevo = false;
                this.enEdicionSemestreViejo = false;
              }
            });
          }
        }
      );
  }
  //#endregion
  // * ----------

  // * ----------
  // * Carga información paramétrica (selects)
  //#region
  loadNivel(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({ "nivel": null });
          }
        }, (err) => {
          reject({ "nivel": err });
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
            reject({ "proyecto": null });
          }
        }, (err) => {
          reject({ "proyecto": err });
        }
      );
    });
  }

  loadEstadosAprobacion(): Promise<EstadoAprobacion[]> {
    return new Promise<any>((resolve, reject) => {
      this.planEstudiosService.get("estado_aprobacion?query=activo:true&limit=0").
        subscribe(
          (resp) => {
            if (Object.keys(resp.Data[0]).length > 0) {
              resolve(resp.Data);
            } else {
              reject({ "estado_aprobacion": null });
            }
          }, (err) => {
            reject({ "estado_aprobacion": err });
          }
        )
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Carga planes de estudio existentes
  //#region
  loadPlanesEstudio(): Promise<PlanEstudio[]> {
    return new Promise<any>((resolve, reject) => {
      this.planEstudiosService.get("plan_estudio?query=activo:true&limit=0").subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            resolve([]);
          }
        }, (err) => {
          reject({ "plan_estudio": err })
        }
      );
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Cargar informacion particular 
  //#region
  consultarEspaciosAcademicos(id_proyecto: number): Promise<any> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('espacios_academicos/byProject/' + id_proyecto).subscribe((resp) => {
        this.loading = false;
        resolve(resp.Data);
      }, (err) => {
        this.loading = false;
        reject({ "espacios": err });
      })
    })
  }
  //#endregion
  // * ----------

  // * ----------
  // * Cargar datos del plan de estudio actual
  //#region
  consultarPlanEstudio(idPlan: number): Promise<any> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.planEstudiosService.get('plan_estudio/' + idPlan).subscribe((resp) => {
        this.loading = false;
        resolve(resp.Data);
      }, (err) => {
        this.loading = false;
        reject({ "plan_estudios": err });
      })
    });
  }

  //#endregion
  // * ----------

  // * ----------
  // * Insertar info parametrica en formulario 
  //#region
  async loadSelects() {
    this.loading = true;
    try {
      // ? carga paralela de parametricas
      let promesas = [];
      promesas.push(this.loadNivel().then(niveles => {
        this.niveles = niveles;
      }));
      promesas.push(this.loadProyectos().then(proyectos => {
        this.proyectos = proyectos;
      }));
      await Promise.all(promesas);

      this.estadosAprobacion = await this.loadEstadosAprobacion();

      this.loading = false;
    } catch (error) {
      this.loading = false;
      const falloEn = Object.keys(error)[0];
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
        this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
        this.translate.instant('ERROR.persiste_error_comunique_OAS'),
        MODALS.ERROR, false);
    }
  }
  //#endregion
  // * ----------

  // * ----------
  // * Funciones para carga y descarga de archivos
  //#region
  prepararArchivos(): any[] {
    const idTipoDocument = 72; // carpeta Nuxeo
    const archivos = <any[]>this.formPlanEstudio.soportes.archivosLocal;
    return archivos.map(archivo => {
      return {
        IdDocumento: idTipoDocument,
        nombre: (archivo.file.name).split('.')[0],
        descripcion: "Soporte Plan de Estudios",
        file: archivo.file
      }
    })
  }

  cargarArchivos(archivos): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.gestorDocumentalService.uploadFiles(archivos).subscribe(
        (respuesta: any[]) => {
          const listaIds = respuesta.map(f => {
            return f.res.Id;
          });
          resolve(listaIds);
        }
      );
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Estructuracion plan de estudio
  //#region
  prepareIds2Stringify(idsArchivos: number[], nameField: string): string {
    let result = {}
    result[nameField] = []
    if (idsArchivos) {
      result[nameField] = idsArchivos;
    }
    return JSON.stringify(result);
  }

  //#endregion
  // * ----------

  // * ----------
  // * Actualizar plan de estudios datos básicos 
  //#region
  async prepareUpdateBySemester(): Promise<boolean> {
    this.loading = true;
    // Remover
    if (this.planEstudioBody == undefined) {
      await this.consultarPlanEstudio(13).then((res) => {
        this.planEstudioBody = res;
      });
    }
    // End remover

    await this.formatearResumenTotal();
    return new Promise<any>((resolve) => {
      this.formatearEspaciosPlanEstudio().then((res) => {
        if (res) {
          this.loading = true;
          this.updateStudyPlan(this.planEstudioBody).then((updatedPlan) => {
            this.loading = false;
            this.planEstudioBody = updatedPlan;
            resolve(true);
          });
        } else {
          this.loading = false;
          this.popUpManager.showErrorAlert(
            this.translate.instant('plan_estudios.plan_estudios_actualizacion_error')
          );
          resolve(false);
        }
      }).catch((error) => {
        this.loading = false;
        this.popUpManager.showErrorAlert(
          this.translate.instant('plan_estudios.plan_estudios_actualizacion_error')
        );
        resolve(false);
      });
    });
  }

  updateStudyPlan(planEstudioBody: PlanEstudio) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.planEstudiosService.put('plan_estudio/', planEstudioBody)
        .subscribe(res => {
          this.loading = false;
          if (Object.keys(res.Data).length > 0) {
            this.popUpManager.showSuccessAlert(
              this.translate.instant('plan_estudios.plan_estudios_actualizacion_ok')
            ).then((action) => {
              resolve(res.Data);
            });
          } else {
            this.popUpManager.showErrorAlert(
              this.translate.instant('plan_estudios.plan_estudios_actualizacion_error')
            );
          }
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(
              this.translate.instant('plan_estudios.plan_estudios_actualizacion_error')
            );
          });
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Validaciones espacios académicos por semestre
  //#region
  runValidations2SpacesAdding(event): Promise<object> {
    let result = {
      valid: true,
      error: null,
      showPopUp: false,
      messagePopUp: ""
    }
    return new Promise<object>((resolve, reject) => {
      this.validarPrerequisitosAgregar(event).then((valid) => {
        if (valid) {
          resolve(result);
        } else {
          result["valid"] = false;
          result["error"] = this.translate.instant(
            'plan_estudios.error_validacion_prerrequisitos_espacios');
          reject(result);
        }
      });
    });
  }

  validarPrerrequisitoSinAsignar(prerrequisito): Promise<any> {
    return new Promise((resolve) => {
      // Validar que no se encuentre en la lista de espacios por asignar
      this.dataEspaciosAcademicos.getAll().then((data) => {
        console.log("Primer validación");
        let index = 0;

        if (data.length > 0) {
          for (const element of data) {
            console.log("Buscando en la lista de espacios");

            if (element._id === prerrequisito._id) {
              console.log("Tiene prerrequisito sin asignar");
              resolve(false);
              console.log("Pasando a romper el for");
              break;
            }

            console.log("Fin iteración ", index, " sin asignar");
            if (index >= data.length - 1) {
              console.log("Total espacios barrido !!!!!!!!!!!!");
              resolve(true);
            }
            index++;
          }
        } else {
          resolve(true);
        }
      });
    });
  }

  validarPrerrequisitoSemestreActual(prerrequisito): Promise<any> {
    return new Promise((resolve) => {
      // Validar que no se encuentre en el semestre actual
      this.dataSemestre[this.dataSemestre.length - 1].getAll().then((data) => {
        console.log("Segunda validación");
        let index = 0;

        if (data.length > 0) {
          for (const element of data) {
            console.log("Buscando en la lista de espacios del semestre");
            if (element._id === prerrequisito._id) {
              console.log("Tiene prerrequisitos en el mismo semestre");
              resolve(false);
              break;
            }

            if (index >= data.length - 1) {
              resolve(true);
            }
            console.log("Fin iteración ", index, " mismo semestre");
            index++;
          }
        } else {
          resolve(true);
        }
      });
    });
  }

  async validarPrerequisitosAgregar(event): Promise<boolean> {
    let currentSpace = event.data;
    let prerrequisitos = currentSpace["prerequisitos"];
    let index = 0;
    let validPrerequisite = true;
    let stopIt = false;

    if (prerrequisitos != undefined) {
      for (const prerrequisito of prerrequisitos) {
        await this.validarPrerrequisitoSinAsignar(prerrequisito).then((res) => {
          if (!res) {
            validPrerequisite = res;
            stopIt = true;
          }
        });
        if (stopIt) {
          break;
        } else {
          await this.validarPrerrequisitoSemestreActual(prerrequisito).then((resSemestre) => {
            if (!resSemestre) {
              validPrerequisite = resSemestre;
              stopIt = true;
            }
          });
        }

        if (stopIt) {
          break;
        }
        index++;
      }
      return validPrerequisite;
    } else {
      return validPrerequisite;
    }
  }
  //#endregion
  // * ----------

  // * ----------
  // * Procesamiento almacenamiento de semestre con espacios académicos 
  //#region
  async organizarEspaciosSemestreActual(): Promise<any> {
    let numSemestre = this.punteroSemestrePlan + 1;
    let etiquetaSemestre = "semestre_".concat(numSemestre.toString());
    let semestre = {};
    let espaciosAcademicosOrdenados = [];

    await this.dataSemestre[this.punteroSemestrePlan].getAll().then((espacios) => {
      if (espacios.length == 0) {
        semestre[etiquetaSemestre]= {
          espacios_academicos: []
        }
      } else {
        espacios.forEach((espacio, index) => {
          let etiquetaEspacio = "espacio_".concat((index + 1).toString());
          let newEspacio = new EspacioEspaciosSemestreDistribucion();
          let espaciosRequeridosId = espacio["prerequisitos"] ? espacio["prerequisitos"].map((e) => e._id) : "NA";
          newEspacio.Id = espacio["_id"];
          newEspacio.OrdenTabla = index + 1;
          newEspacio.EspaciosRequeridos = {
            Id: espaciosRequeridosId,
          };
          espaciosAcademicosOrdenados.push({
            [etiquetaEspacio]: newEspacio
          });
  
          if (index >= (espacios.length - 1)) {
            semestre[etiquetaSemestre] = {
              espacios_academicos: espaciosAcademicosOrdenados
            };
          }
        });
      }
    });
    return semestre;
  }

  obtenerEspaciosSemestre(): any {
    const espaciosSemestreStr = this.planEstudioBody.EspaciosSemestreDistribucion;
    if (espaciosSemestreStr === "" || espaciosSemestreStr === "{}" || espaciosSemestreStr === undefined) {
      return {};
    } else {
      return JSON.parse(espaciosSemestreStr);
    }
  }

  async formatearEspaciosPlanEstudio(): Promise<any> {
    try {
      let espaciosSemestre = await this.obtenerEspaciosSemestre();

      return new Promise((resolve, reject) => {
        this.organizarEspaciosSemestreActual().then((semestreRes) => {
          if (Object.keys(semestreRes).length > 0) {
            const semestreEt = Object.keys(semestreRes)[0];
            if (Object.keys(espaciosSemestre).length > 0) {
              espaciosSemestre[semestreEt] = semestreRes[semestreEt];
            } else {
              espaciosSemestre = semestreRes;
            }
            this.planEstudioBody.EspaciosSemestreDistribucion = JSON.stringify(espaciosSemestre);
            resolve(true);
          } else {
            reject(false);
          }
        });
      });
    } catch (error) {
      this.loading = false;
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
        this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + this.translate.instant('plan_estudios.organizar') +
        '</b>.<br><br>' + this.translate.instant('ERROR.persiste_error_comunique_OAS'),
        MODALS.ERROR, false);
    }
  }

  //#endregion
  // * ----------

  // * ----------
  // * Procesamiento almacenamiento de semestre con espacios académicos 
  //#region
  formatearResumenTotal() {
    let resumenTotal = {}
    this.dataSemestreTotalTotal.getAll().then((data) => {
      resumenTotal = data[0];
      resumenTotal["numero_semestres"] = this.dataSemestre.length;
      this.planEstudioBody.ResumenPlanEstudios = JSON.stringify(resumenTotal);
    })
  }
  //#endregion
  // * ----------
}
