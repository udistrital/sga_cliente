import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FORM_PLAN_ESTUDIO, FORM_PLAN_ESTUDIO_EDICION } from "../form-plan_estudio";
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
import { EstadoAprobacion, STD } from '../../../@core/data/models/plan_estudios/estado_aprobacion';
import { PlanEstudioBaseComponent } from '../plan-estudio-base/plan-estudio-base.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';


@Component({
  selector: 'creacion-plan-estudios',
  templateUrl: './creacion-plan-estudios.component.html',
  styleUrls: ['./creacion-plan-estudios.component.scss'],
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
      useValue: {displayDefaultIndicatorType: false},
    },
  ]
})
export class CreacionPlanEstudiosComponent extends PlanEstudioBaseComponent implements OnInit {

  constructor(
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

  async ngOnInit() {
    this.personaId = await Number(window.localStorage.getItem('persona_id'));
    await this.setRoles();
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.loadSelects().then(() => {
      this.loadStudyPlanTable();
    });
    this.createTablePlanesEstudio();
    this.gestorDocumentalService.clearLocalFiles();
    this.habilitarGenerarPlan();
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
    tableColumns['enviar'] = {
      title: this.translate.instant('GLOBAL.enviar'),
      editable: false,
      width: '5%',
      filter: false,
      type: 'custom',
      renderComponent: Ng2StButtonComponent,
      onComponentInitFunction: (instance) => {
        instance.valueChanged.subscribe((out) => {
          this.send2ReviewStudyPlan(out.rowData);
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
  loadStudyPlanTable() {
    this.loading = true;
    try {
      console.log("Roles encontrados, ", this.personaRoles)
      let rolAdmin = this.personaRoles.find(role => (role == ROLES.ADMIN_SGA || role == ROLES.VICERRECTOR || role == ROLES.ASESOR_VICE));
      let rolCoordinador = this.personaRoles.find(role => (role == ROLES.COORDINADOR || role == ROLES.COORDINADOR_PREGADO || role == ROLES.COORDINADOR_POSGRADO || role == ROLES.ADMIN_DOCENCIA));
      
      // Datos de la tabla planes de estudio
      if (rolAdmin) {
        console.log("Rol admin");
        
        this.loading = true;
        this.loadPlanesEstudio().then(planes => {
          console.log("Plan de estudios consultados:");
          console.log(planes);
          this.planesEstudio = planes;
          this.planesEstudio.forEach(plan => {
            this.organizarDatosTablaPlanEstudio(plan);
          });
          this.dataPlanesEstudio.load(this.planesEstudio);
          this.loading = false;
        }).catch(err => {
          console.log("Error al cargar planes de estudios");
          console.log(err);
          this.loading = false;
          this.popUpManager.showPopUpGeneric(
            this.translate.instant('plan_estudios.plan_estudios'),
            this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + this.translate.instant('plan_estudios.plan_estudios') + '</b>.',
            MODALS.WARNING, false);
        });
      } else if (rolCoordinador) {
        console.log("Rol coordinador filtrando tercero");
        this.loadPlanesEstudioPorTerceroVinculacion(this.personaId).then((planes) => {
          if (planes.length > 0) {
            this.planesEstudio = planes;
            this.planesEstudio.forEach(plan => {
              this.organizarDatosTablaPlanEstudio(plan);
            });
            this.dataPlanesEstudio.load(this.planesEstudio);
      
            this.loading = false;
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('plan_estudios.plan_estudios_sin_vinculacion_error'));
            this.loading = false;
          }
        }).catch((error) => {
          this.popUpManager.showErrorAlert(this.translate.instant('plan_estudios.plan_estudios_sin_vinculacion_error'));
          this.loading = false;
        });
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant('plan_estudios.plan_estudios_sin_vinculacion_error'));
        this.loading = false;
      }
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
    console.log("Plan: ", plan);
    const proyecto = this.proyectos.find(proyecto => proyecto.Id == plan.ProyectoAcademicoId);
    console.log("Proyecto: ", proyecto);
    plan["proyectoCurricular"] = proyecto["Nombre"];

    plan["plan_estudio"] = plan["Nombre"];
    plan["resolucion"] = plan["NumeroResolucion"];
    plan["totalCreditos"] = plan["TotalCreditos"];

    const estado = plan["EstadoAprobacionId"];
    plan["estado"] = estado["Nombre"];
    plan["planPorCiclos"] = plan["EsPlanEstudioPadre"] ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');
    
    plan["ver"] = { value: ACTIONS.VIEW, type: 'ver', disabled: false };
    plan["enviar"] = { value: ACTIONS.SEND, type: 'enviar', disabled: false };
    console.log("Plan organizado");
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

  nuevoPlanEstudio() {
    this.mainAction = ACTIONS.CREATE;
    this.enEdicionPlanEstudio = true;
    this.modoCreacion = true;
    this.esPlanEstudioPadre = false;
    this.crearFormulario(FORM_PLAN_ESTUDIO);
    this.createTableEspaciosAcademicos();
    this.createTableSemestreTotal();
    this.totalTotal();
    this.vista = VIEWS.FORM;
    this.dataEspaciosAcademicos.load([]);
  }

  guardar(stepper: MatStepper) {
    this.formGroupPlanEstudio.markAllAsTouched();
    if (this.formGroupPlanEstudio.valid) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('plan_estudios.plan_estudios'), 
        this.translate.instant('plan_estudios.seguro_crear'), 
        MODALS.INFO, 
        true).then(
          (action) => {
            if (action.value) {
              this.prepareCreate(stepper);
            }    
          });
    }
  }

  limpiar() {
    this.popUpManager.showPopUpGeneric(this.translate.instant('plan_estudios.plan_estudios'),
      this.translate.instant('plan_estudios.seguro_limpiar'), MODALS.QUESTION, true).then(
        (action) => {
          if (action.value) {
            this.formGroupPlanEstudio.reset();
            let valorEsPlanPadre = this.esPlanEstudioPadre ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');
            this.formGroupPlanEstudio.patchValue({ planPorCiclos: valorEsPlanPadre });
          }
        }
      );
  }
  //#endregion
  // * ----------

  // * ----------
  // * Crear plan de estudios datos básicos 
  //#region

  async prepareCreate(stepper: MatStepper) {
    this.loading = true;
    let newPlanEstudio = new PlanEstudio();
    newPlanEstudio.Nombre = this.formGroupPlanEstudio.get('nombrePlanEstudio').value;
    newPlanEstudio.NumeroResolucion = Number(this.formGroupPlanEstudio.get('numeroResolucion').value);
    newPlanEstudio.NumeroSemestres = Number(this.formGroupPlanEstudio.get('numeroSemestres').value);
    newPlanEstudio.ProyectoAcademicoId = Number(this.formGroupPlanEstudio.get('proyectoCurricular').value["Id"]);
    newPlanEstudio.TotalCreditos = Number(this.formGroupPlanEstudio.get('totalCreditosPrograma').value);
    newPlanEstudio.AnoResolucion = Number(this.formGroupPlanEstudio.get('anioResolucion').value);
    newPlanEstudio.Codigo = this.formGroupPlanEstudio.get('codigoPlanEstudio').value;
    newPlanEstudio.EsPlanEstudioPadre = this.esPlanEstudioPadre;

    const archivos = this.prepararArchivos();
    let idsArchivos = [];
    if (Array.isArray(archivos) && archivos.length) {
      idsArchivos = await this.cargarArchivos(archivos);
    }
    newPlanEstudio.SoporteDocumental = this.prepareIds2Stringify(idsArchivos, "SoporteDocumental");
    this.loading = false;

    this.createStudyPlan(newPlanEstudio).then((res: any) => {
      this.planEstudioBody = res;
      if (this.esPlanEstudioPadre) {
        this.modoCreacion = false;
        this.planEstudioPadreAsignado2Form = false;
        this.dataOrganizedStudyPlans = new LocalDataSource();
        stepper.next();
      } else {
        this.modoCreacion = false;
        this.consultarEspaciosAcademicos(this.proyecto_id).then((result) => {
          this.ListEspacios = result;
          this.dataEspaciosAcademicos.load(this.ListEspacios);
          this.planEstudioPadreAsignado2Form = false;
          stepper.next();
        }, (error) => {
          this.ListEspacios = [];
          const falloEn = Object.keys(error)[0];
          this.popUpManager.showPopUpGeneric(
            this.translate.instant('ERROR.titulo_generico'),
            this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
            this.translate.instant('ERROR.persiste_error_comunique_OAS'),
            MODALS.ERROR, false);
        });
      }
    });
  }

  createStudyPlan(planEstudioBody: PlanEstudio) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.sgaMidService.post('plan_estudios/base', planEstudioBody)
        .subscribe(res => {
          this.loading = false;
          this.popUpManager.showSuccessAlert(
            this.translate.instant('plan_estudios.plan_estudios_creacion_ok')
          ).then((action) => {
            resolve(res.Data);
          });
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(
              this.translate.instant('plan_estudios.plan_estudios_creacion_error')
            );
          });
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Enviar plan de estudios a revision
  //#region
  send2ReviewStudyPlan(planEstudioBody: PlanEstudio) {
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('plan_estudios.plan_estudios'),
      this.translate.instant('plan_estudios.enviar_revision_pregunta'), MODALS.INFO, true).
      then(
        action => {
          if (action.value) {
            this.loading = true;
            planEstudioBody.EstadoAprobacionId = this.estadosAprobacion.find(
              estado => estado.CodigoAbreviacion == STD.IN_REV);
            this.planEstudiosService.put('plan_estudio/', planEstudioBody).
              subscribe(
                resp => {
                  if (resp.Status == "200") {
                    this.loading = false;
                    this.popUpManager.showSuccessAlert(
                      this.translate.instant('plan_estudios.enviar_revision_ok'));
                    this.loadStudyPlanTable();
                    this.vista = VIEWS.LIST;
                  } else {
                    this.loading = false;
                    this.popUpManager.showErrorAlert(this.translate.instant('plan_estudios.enviar_revision_fallo'));
                  }
                },
                err => {
                  this.loading = false;
                  this.popUpManager.showErrorAlert(this.translate.instant('plan_estudios.enviar_revision_fallo'));
                });
          }
        });
  }
  //#endregion
  // * ----------
}
