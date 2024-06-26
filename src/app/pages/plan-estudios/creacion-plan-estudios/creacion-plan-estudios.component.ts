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
import { DialogVerObservacionComponent } from '../dialog-ver-observacion/dialog-ver-observacion.component';
import { decrypt } from '../../../@core/utils/util-encrypt';

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
    autenticationService: ImplicitAutenticationService,
    private dialog: MatDialog
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
    const id = decrypt(window.localStorage.getItem('persona_id'));
    this.personaId = Number(id);
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
      title: this.translate.instant('GLOBAL.ver_editar'),
      editable: false,
      width: '5%',
      filter: false,
      type: 'custom',
      renderComponent: Ng2StButtonComponent,
      onComponentInitFunction: (instance) => {
        instance.valueChanged.subscribe((out) => {
          if (out.rowData.ver.type == "editar") {
            this.prepareFormUpdateStudyPlan(out.rowData);
          } else {
            this.viewStudyPlan(out.rowData);
          }
        })
      }
    };
    tableColumns['ver_ob'] = {
      title: this.translate.instant('GLOBAL.ver_ob'),
      editable: false,
      width: '5%',
      filter: false,
      type: 'custom',
      renderComponent: Ng2StButtonComponent,
      onComponentInitFunction: (instance) => {
        instance.valueChanged.subscribe((out) => {
          this.viewObservation(out.rowData);
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
      let rolAdmin = this.personaRoles.find(role => (role == ROLES.ADMIN_SGA || role == ROLES.VICERRECTOR || role == ROLES.ASESOR_VICE));
      let rolCoordinador = this.personaRoles.find(role => (role == ROLES.COORDINADOR || role == ROLES.COORDINADOR_PREGADO || role == ROLES.COORDINADOR_POSGRADO || role == ROLES.ADMIN_DOCENCIA));
      
      // Datos de la tabla planes de estudio
      if (rolAdmin) {
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
      } else if (rolCoordinador) {
        this.loadPlanesEstudioPorTerceroVinculacion(this.personaId).then((planes) => {
          if (planes.length > 0) {
            this.planesEstudio = planes;
            this.planesEstudio.forEach(plan => {
              this.organizarDatosTablaPlanEstudio(plan);
            });
            this.dataPlanesEstudio.load(this.planesEstudio);
      
            this.loading = false;
          } else {
            this.hideButtons = true;
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('plan_estudios.plan_estudios_sin_vinculacion_error'));
          }
        }).catch((error) => {
          this.hideButtons = true;
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('plan_estudios.plan_estudios_sin_vinculacion_error'));
        });
      } else {
        this.hideButtons = true;
        this.loading = false;
        this.popUpManager.showErrorAlert(this.translate.instant('plan_estudios.plan_estudios_sin_vinculacion_error'));
      }
    } catch (error) {
      this.loading = false;
      this.hideButtons = true;
      const falloEn = Object.keys(error)[0];
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
        this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
        this.translate.instant('ERROR.persiste_error_comunique_OAS'),
        MODALS.ERROR, false);
    }
  }

  organizarDatosTablaPlanEstudio(plan: any) {
    const proyecto = this.proyectos.find(proyecto => proyecto.Id == plan.ProyectoAcademicoId);
    if (proyecto){
      plan["proyectoCurricular"] = proyecto["Nombre"];
    } else {
      plan["proyectoCurricular"] = "";
    }
    

    plan["plan_estudio"] = plan["Nombre"];
    plan["resolucion"] = plan["NumeroResolucion"];
    plan["totalCreditos"] = plan["TotalCreditos"];

    const estado = plan["EstadoAprobacionId"];
    if (estado) {
      plan["estado"] = estado["Nombre"];
    } else {
      plan["estado"] = "";
    }
    
    plan["planPorCiclos"] = plan["EsPlanEstudioPadre"] ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');
    
    this.setButtonByStatePlan(plan);
  }

  setButtonByStatePlan(plan: any) {
    const estado = plan["EstadoAprobacionId"];

    if (estado) {
      if (estado["CodigoAbreviacion"] == STD.IN_EDIT || estado["CodigoAbreviacion"] == STD.WITH_OB) {
        plan["ver"] = { value: ACTIONS.EDIT, type: 'editar', disabled: false };
        plan["enviar"] = { value: ACTIONS.SEND, type: 'enviar', disabled: false };
        if (plan["RevisorId"] == 0 || plan["RevisorId"] == undefined || plan["RevisorId"] == null) {
          plan["ver_ob"] = { value: undefined, type: 'ver', disabled: true, hidden: true };
        } else {
          plan["ver_ob"] = { value: ACTIONS.VIEW, type: 'ver', disabled: false };
        }
      } else {
        plan["ver"] = { value: ACTIONS.VIEW, type: 'ver', disabled: false };
        plan["enviar"] = { value: undefined, type: 'enviar', disabled: true, hidden: true };
        plan["ver_ob"] = { value: undefined, type: 'ver', disabled: true, hidden: true };
      }
    } else {
      plan["ver"] = { value: ACTIONS.VIEW, type: 'ver', disabled: false };
      plan["enviar"] = { value: ACTIONS.SEND, type: 'enviar', disabled: false };
      plan["ver_ob"] = { value: undefined, type: 'ver', disabled: true, hidden: true };
    }
  }
  //#endregion
  // * ----------

  // * ----------
  // * Reaccionar a cambios de formularios 
  //#region
  cambioEn(event: any): void {
    if (this.modoCreacion) {
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
              if (this.modoCreacion) {
                this.prepareCreate(stepper);
              } else {
                this.prepareUpdate(stepper);
              }
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
                async resp => {
                  if (resp.Status == "200") {
                    this.loading = false;
                    const reload = new Promise(resolve => {
                      this.loadStudyPlanTable();
                      this.vista = VIEWS.LIST;
                      resolve(true);
                    });
                    this.popUpManager.showSuccessAlert(
                      this.translate.instant('plan_estudios.enviar_revision_ok'));
                    await reload;
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

  // * ----------
  // * Actualizar plan de estudios datos básicos 
  //#region
  async prepareUpdate(stepper: MatStepper) {
    this.loading = true;
    const archivos = await this.prepararArchivos();
    let idsArchivos = [];
    if (Array.isArray(archivos) && archivos.length) {
      idsArchivos = await this.cargarArchivos(archivos);
    }
    
    let soportesPlan = this.str2JsonValidated(this.planEstudioBody.SoporteDocumental);
    let totalSoportes = [];
    if (soportesPlan) {
      const listaIdsSoporte = soportesPlan["SoporteDocumental"];
      if (Array.isArray(listaIdsSoporte)) {
        totalSoportes.push(...listaIdsSoporte);
      }
    }
    if (Array.isArray(idsArchivos)) {
      totalSoportes.push(...idsArchivos);
    }
    
    this.planEstudioBody.Nombre = this.formGroupPlanEstudio.get('nombrePlanEstudio').value;
    this.planEstudioBody.NumeroResolucion = Number(this.formGroupPlanEstudio.get('numeroResolucion').value);
    this.planEstudioBody.NumeroSemestres = Number(this.formGroupPlanEstudio.get('numeroSemestres').value);
    this.planEstudioBody.TotalCreditos = Number(this.formGroupPlanEstudio.get('totalCreditosPrograma').value);
    this.planEstudioBody.AnoResolucion = Number(this.formGroupPlanEstudio.get('anioResolucion').value);
    this.planEstudioBody.Codigo = this.formGroupPlanEstudio.get('codigoPlanEstudio').value;
    this.planEstudioBody.SoporteDocumental = await this.prepareIds2Stringify(totalSoportes, "SoporteDocumental");
    this.updateStudyPlan(this.planEstudioBody).then((res) => {
      if (res) {
        const semestresMax = Number(this.formGroupPlanEstudio.get('numeroSemestres').value);
        this.numSemestresCompletado = this.dataSemestre.length === semestresMax;
        stepper.next();
      }
    });
  }

  prepareFormUpdateStudyPlan(planEstudioBody: PlanEstudio) {
    const idPlan = planEstudioBody.Id;
    this.mainAction = ACTIONS.EDIT;
    this.enEdicionPlanEstudio = true;

    this.consultarPlanEstudio(idPlan).then((res) => {
      this.planEstudioBody = res;
      this.esPlanEstudioPadre = this.planEstudioBody.EsPlanEstudioPadre ? true: false;
      this.proyecto_id = this.planEstudioBody.ProyectoAcademicoId;
      this.crearFormulario(FORM_PLAN_ESTUDIO_EDICION);
      if (this.esPlanEstudioPadre) {
        this.createSimpleTableStudyPlan();
        this.createTableOrganizedStudyPlan();
        this.dataOrganizedStudyPlans = new LocalDataSource();
        this.vista = VIEWS.SECONDARY_FORM;
      } else {
        this.createTableEspaciosAcademicos();
        this.createTableSemestreTotal();
        this.totalTotal();
        this.vista = VIEWS.FORM;
        this.enEdicionSemestreNuevo = false;
        this.enEdicionSemestreViejo = false;
      }
    }, (error) => {
      this.loading = false;
      this.vista = VIEWS.LIST;
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('ERROR.titulo_generico'),
        this.translate.instant('plan_estudios.error_cargando_datos_formulario') + '</b>.<br><br>' +
        this.translate.instant('ERROR.persiste_error_comunique_OAS'),
        MODALS.ERROR, false);
    }
    );
  }
  //#endregion
  // * ----------

  // * ----------
  // * Visualización de ventana aprobación
  // #region

  viewObservation(planEstudioBody: PlanEstudio) {
    const id = decrypt(localStorage.getItem('persona_id'));
    let persona_id = Number(id);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '80vw';
    dialogConfig.height = '510px';
    dialogConfig.data = {
      "tercero_id": persona_id,
      "estadosAprobacion": this.estadosAprobacion,
      "planEstudioId": planEstudioBody.Id
    };
    this.dialog.open(DialogVerObservacionComponent, dialogConfig);
  }

  //#endregion
  // * ----------
}