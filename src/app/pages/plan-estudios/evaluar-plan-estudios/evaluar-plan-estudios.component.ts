import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FORM_PLAN_ESTUDIO } from "../form-plan_estudio";
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { LocalDataSource } from 'ng2-smart-table';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { animate, style, transition, trigger } from '@angular/animations';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PlanEstudiosService } from '../../../@core/data/plan_estudios.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig, MatStepper } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { PlanEstudio } from '../../../@core/data/models/plan_estudios/plan_estudio';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { PlanEstudioBaseComponent } from '../plan-estudio-base/plan-estudio-base.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { PlanEstudioSummary } from '../../../@core/data/models/plan_estudios/plan_estudio_summary';
import { DialogoEvaluarComponent } from './dialogo-evaluar/dialogo-evaluar.component';

@Component({
  selector: 'evaluar-plan-estudios',
  templateUrl: './evaluar-plan-estudios.component.html',
  styleUrls: ['./evaluar-plan-estudios.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(150%)' }))
      ])
    ])
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ]
})
export class EvaluarPlanEstudiosComponent extends PlanEstudioBaseComponent implements OnInit {

  dataPlanes: PlanEstudioSummary = undefined;
  role: Array<String>

  constructor(
    public dialog: MatDialog,
    translate: TranslateService,
    popUpManager: PopUpManager,
    projectService: ProyectoAcademicoService,
    sgaMidService: SgaMidService,
    domSanitizer: DomSanitizer,
    planEstudiosService: PlanEstudiosService,
    gestorDocumentalService: NewNuxeoService,
    autenticationService: ImplicitAutenticationService
  ) {
    super(translate, popUpManager, projectService,
      sgaMidService, domSanitizer, planEstudiosService,
      gestorDocumentalService, autenticationService);

    this.dataPlanesEstudio = new LocalDataSource();
    this.dataSimpleStudyPlans = new LocalDataSource();
    this.dataOrganizedStudyPlans = new LocalDataSource();
    this.dataEspaciosAcademicos = new LocalDataSource();
    this.dataSemestre = [];
    this.dataSemestreTotal = [];
    this.dataSemestreTotalTotal = new LocalDataSource();

    this.translate.onLangChange.subscribe(() => {
      this.createTablePlanesEstudio();
      this.createTableEspaciosAcademicos();
      this.createTableSemestre();
      this.createTableSemestreTotal();
    })
   }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.loadSelects().then(() => {
      this.loadStudyPlanTable();
    });
    this.createTablePlanesEstudio();
    this.gestorDocumentalService.clearLocalFiles();
    this.habilitarGenerarPlan();
  }

  async getRole(){
    this.loading = true;
    try {
      await this.autenticationService.getRole().then((rol: Array<String>) => {
        this.role = rol;
        this.loading = false;
      });
    } catch (error) {
      const falloEn = Object.keys(error)[0];
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
        this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
        this.translate.instant('ERROR.persiste_error_comunique_OAS'),
        MODALS.ERROR, false);
      this.loading = false;
    }
  }

  // * ----------
  // * Crear tabla de lista planes estudio
  //#region
  createTablePlanesEstudio() {
    let tableColumns = <any>UtilidadesService.hardCopy(this.studyPlanTableColumns);
    tableColumns['ver'] = {
      title: this.translate.instant('GLOBAL.ver'),
      editable: false,
      width: '5%',
      filter: false,
      type: 'custom',
      renderComponent: Ng2StButtonComponent,
      onComponentInitFunction: (instance) => {
        instance.valueChanged.subscribe((out) => {
          this.viewStudyPlan(out.rowData);
        })
      }
    };
    tableColumns['evaluar'] = {
      title: this.translate.instant('GLOBAL.evaluar'),
      editable: false,
      width: '5%',
      filter: false,
      type: 'custom',
      renderComponent: Ng2StButtonComponent,
      onComponentInitFunction: (instance) => {
        instance.valueChanged.subscribe((out) => {
          this.approve2StudyPlan(out.rowData);
        })
      }
    }
    this.tbPlanesEstudio = {
      columns: tableColumns,
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }
  //#endregion
  // * ----------

  // * ----------
  // * Cargar datos plan de estudio tabla
  //#region
  async loadStudyPlanTable() {
    this.loading = true;
    try {
      this.planesEstudio = await this.loadPlanesEstudio();
      this.planesEstudio.forEach(plan => {
        this.organizarDatosTablaPlanEstudio(plan);
      });
      this.dataPlanesEstudio.load(this.planesEstudio);

      this.loading = false;
    } catch (error) {
      const falloEn = Object.keys(error)[0];
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
        this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
        this.translate.instant('ERROR.persiste_error_comunique_OAS'),
        MODALS.ERROR, false);
      this.loading = false;
    }
  }

  organizarDatosTablaPlanEstudio(plan: any) {
    const proyecto = this.proyectos.find(proyecto => proyecto.Id == plan.ProyectoAcademicoId);
    plan["proyectoCurricular"] = proyecto["Nombre"];

    plan["plan_estudio"] = plan["Nombre"];
    plan["resolucion"] = plan["NumeroResolucion"];
    plan["totalCreditos"] = plan["TotalCreditos"];

    const estado = plan["EstadoAprobacionId"];
    plan["estado"] = estado["Nombre"];
    plan["planPorCiclos"] = plan["EsPlanEstudioPadre"] ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');

    plan["ver"] = { value: ACTIONS.VIEW, type: 'ver', disabled: false };
    plan["evaluar"] = { value: ACTIONS.EVALUATE, type: 'evaluar', disabled: false };
  }

  async recargarPlanEstudios() {
    this.loading = true;
    this.loadPlanesEstudio().then(planes => {
      this.planesEstudio = planes;
      this.planesEstudio.forEach(plan => {
        this.organizarDatosTablaPlanEstudio(plan);
      });
      this.dataPlanesEstudio.load(this.planesEstudio);
      this.loading = false;
    }).catch(err => {
      this.loading = false;
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('plan_estudios.plan_estudios'),
        this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + this.translate.instant('plan_estudios.plan_estudios') + '</b>.',
        MODALS.WARNING, false);
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Reaccionar a cambios de formularios
  //#region
  cambioEn(event: any): void {
    const fieldNombre = Object.keys(event)[0];
    switch (fieldNombre) {
      case 'nivel':
        if (event.nivel) {
          this.formPlanEstudio.subnivel.opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId && (nivel.NivelFormacionPadreId.Id == event.nivel.Id));
        } else {
          this.formPlanEstudio.subnivel.opciones = [];
          this.formGroupPlanEstudio.patchValue({ subnivel: undefined });
        }
        break;

      case 'subnivel':
        if (event.subnivel) {
          this.formPlanEstudio.proyectoCurricular.opciones = this.proyectos.filter(proyecto => proyecto.NivelFormacionId && (proyecto.NivelFormacionId.Id == event.subnivel.Id));
        } else {
          this.formPlanEstudio.proyectoCurricular.opciones = [];
          this.formGroupPlanEstudio.patchValue({ proyectoCurricular: undefined });
        }
        break;

      case 'proyectoCurricular':
        if (event.proyectoCurricular) {
          this.formPlanEstudio.codigoProyecto.valor = event.proyectoCurricular.Codigo;
          this.formGroupPlanEstudio.patchValue({ codigoProyecto: event.proyectoCurricular.Codigo });
          this.proyecto_id = event.proyectoCurricular.Id;
        } else {
          this.formPlanEstudio.codigoProyecto.valor = undefined;
          this.formGroupPlanEstudio.patchValue({ codigoProyecto: undefined });
        }
        break;

      default:
        break;
    }

  }
  //#endregion
  // * ----------

  // * ----------
  // * Acciones botones
  //#region
  async cancelar() {
    await super.cancelar();
    this.loadStudyPlanTable();
  }
  async salirEdicionFormulario() {
    await super.cancelar();
    this.loadStudyPlanTable();
  }
  //#endregion
  // * ----------

  // * ----------
  // * Enviar plan de estudios a aprobación
  //#region

  async approve2StudyPlan(planEstudioBody: PlanEstudio) {
    await this.getRole();
    this.showEvaluationDialog(planEstudioBody);
  }
  //#endregion
  // * ----------

  // * ----------
  // * Visualización de ventana evaluación
  // #region
  showEvaluationDialog(planEstudioBody: PlanEstudio) {
    let persona_id = Number(localStorage.getItem('persona_id'));
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '80vw';
    dialogConfig.height = '580px';
    dialogConfig.data = {
      "tercero_id": persona_id,
      "rol": this.role,
      "estadosAprobacion": this.estadosAprobacion,
      "planEstudioId": planEstudioBody.Id
    };
    const aprobacionDialog = this.dialog.open(DialogoEvaluarComponent, dialogConfig);
    aprobacionDialog.afterClosed().subscribe((response: any) => {
      this.recargarPlanEstudios();
      this.vista = VIEWS.LIST;
    });
  }
  //#endregion
  // * ----------


  // * ----------
  // * Visualizador dinámico planes de estudio
  //#region
  generarPlanEstudio() {
    this.loading = true;
    this.planEstudiosService.get('plan_estudio').subscribe(resp => {
      this.loading = false;
      this.dataPlanes = {
        Nombre: "Ingeniería Eléctrica",
        Facultad: "Facultad de Ingeniería",
        Planes: [{
          Orden: 1,
          Nombre: "Proyecto 1",
          Resolucion: "1020 de 2023",
          Creditos: 60,
          Snies: "123456",
          PlanEstudio: "2102",
          InfoPeriodos: [
            {
              Orden: 1,
              Espacios: [
                {
                  Codigo: "CALCI",
                  Nombre: "Cálculo Diferencial",
                  Creditos: 3,
                  Prerequisitos: [],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "1"
                },
                {
                  Codigo: "INGI",
                  Nombre: "Inglés 1",
                  Creditos: 2,
                  Prerequisitos: [],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "2"
                },
                {
                  Codigo: "ALGI",
                  Nombre: "Algebra Lineal",
                  Creditos: 3,
                  Prerequisitos: [],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "1"
                }
              ]
            },
            {
              Orden: 2,
              Espacios: [
                {
                  Codigo: "CALCII",
                  Nombre: "Cálculo Integral",
                  Creditos: 3,
                  Prerequisitos: ["CALCI"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "1"
                },
                {
                  Codigo: "INGII",
                  Nombre: "Inglés 2",
                  Creditos: 2,
                  Prerequisitos: ["INGI"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "2"
                },
              ]
            },
            {
              Orden: 3,
              Espacios: [
                {
                  Codigo: "CALCIII",
                  Nombre: "Cálculo Multivariado",
                  Creditos: 3,
                  Prerequisitos: ["CALCII"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "1"
                },
                {
                  Codigo: "INGIII",
                  Nombre: "Inglés 3",
                  Creditos: 2,
                  Prerequisitos: ["INGII"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "2"
                },
                {
                  Codigo: "TCAMP",
                  Nombre: "Teoría de Campos Electromagnéticos",
                  Creditos: 4,
                  Prerequisitos: ["CALCI", "CALCII"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "3"
                }
              ]
            },
            {
              Orden: 4,
              Espacios: [
                {
                  Codigo: "CALCIV",
                  Nombre: "Ecuaciones Diferenciales con Yu Takeuchi",
                  Creditos: 4,
                  Prerequisitos: ["CALCIII"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "1"
                },
                {
                  Codigo: "INGIV",
                  Nombre: "Inglés 4",
                  Creditos: 2,
                  Prerequisitos: ["INGIII"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "2"
                },
              ]
            }
          ],
          Resumen: {
            OB: 30,
            OC: 20,
            EI: 3,
            EE: 2
          }
        },
        {
          Orden: 2,
          Nombre: "Proyecto 2",
          Resolucion: "1020 de 2023",
          Creditos: 60,
          Snies: "123456",
          PlanEstudio: "2102",
          InfoPeriodos: [
            {
              Orden: 1,
              Espacios: [
                {
                  Codigo: "CIRCI",
                  Nombre: "Circuitos 1",
                  Creditos: 3,
                  Prerequisitos: [],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "4"
                },
                {
                  Codigo: "GERMI",
                  Nombre: "Alemán 1",
                  Creditos: 2,
                  Prerequisitos: [],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "5"
                }
              ]
            },
            {
              Orden: 2,
              Espacios: [
                {
                  Codigo: "CIRCII",
                  Nombre: "Circuitos 2",
                  Creditos: 3,
                  Prerequisitos: ["CIRCI"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "4"
                },
                {
                  Codigo: "GERMII",
                  Nombre: "Alemán 2",
                  Creditos: 2,
                  Prerequisitos: ["GERMI"],
                  HTD: 2,
                  HTC: 2,
                  HTA: 4,
                  Clasificacion: "OB",
                  Escuela: "5"
                }
              ]
            }
          ],
          Resumen: {
            OB: 30,
            OC: 20,
            EI: 3,
            EE: 2
          }
        },
        ]
      };
      this.vista = VIEWS.SUMMARY;
    }, error => {
      this.loading = false;
      this.dataPlanes = undefined;
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('ERROR.titulo_generico'),
        this.translate.instant('ERROR.persiste_error_comunique_OAS'),
        MODALS.ERROR, false);
    });
  }
  //#endregion
  // * ----------
}
