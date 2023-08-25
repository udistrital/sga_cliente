import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FORM_PLAN_ESTUDIO_EDICION } from '../form-plan_estudio';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { LocalDataSource } from 'ng2-smart-table';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { animate, style, transition, trigger } from '@angular/animations';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PlanEstudiosService } from '../../../@core/data/plan_estudios.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { PlanEstudio } from '../../../@core/data/models/plan_estudios/plan_estudio';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { STD } from '../../../@core/data/models/plan_estudios/estado_aprobacion';
import { PlanEstudioBaseComponent } from '../plan-estudio-base/plan-estudio-base.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';

@Component({
  selector: 'edicion-plan-estudios',
  templateUrl: './edicion-plan-estudios.component.html',
  styleUrls: ['./edicion-plan-estudios.component.scss'],
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
export class EdicionPlanEstudiosComponent extends PlanEstudioBaseComponent implements OnInit {

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
      });
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
    tableColumns['editar'] = {
      title: this.translate.instant('GLOBAL.editar'),
      editable: false,
      width: '5%',
      filter: false,
      type: 'custom',
      renderComponent: Ng2StButtonComponent,
      onComponentInitFunction: (instance) => {
        instance.valueChanged.subscribe((out) => {
          this.prepareFormUpdateStudyPlan(out.rowData);
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

  // * ----------
  // * Cargar datos plan de estudio tabla
  //#region
  async loadStudyPlanTable() {
    this.loading = true;
    try {
      await this.autenticationService.getRole().then(
        async (rol: Array<String>) => {
          
          let rolAdmin = rol.find(role => (role == ROLES.ADMIN_SGA || role == ROLES.VICERRECTOR || role == ROLES.ASESOR_VICE));
          let rolCoordinador = rol.find(role => (role == ROLES.COORDINADOR || role == ROLES.COORDINADOR_PREGADO || role == ROLES.COORDINADOR_POSGRADO));
          
          // Datos de la tabla planes de estudio
          if (rolAdmin) {
            console.log("Rol admin");
            
            this.planesEstudio = await this.loadPlanesEstudio();
          } else if (rolCoordinador) {
            console.log("Rol admin");
            this.planesEstudio = await this.loadPlanesEstudio("EstadoAprobacionId:4");
          } else {
            this.planesEstudio = [];
          }
        }
      );
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
    plan["planPorCiclos"] = estado["EsPlanEstudioPadre"] ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');

    plan["ver"] = { value: ACTIONS.VIEW, type: 'ver', disabled: false };
    plan["editar"] = { value: ACTIONS.EDIT, type: 'editar', disabled: false };
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
              this.prepareUpdate(stepper);
            }    
          });
    }
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
        stepper.next();
      }
    });
  }

  prepareFormUpdateStudyPlan(planEstudioBody: PlanEstudio) {
    const idPlan = planEstudioBody.Id;
    this.mainAction = ACTIONS.EDIT;
    this.enEdicionPlanEstudio = true;

    this.consultarPlanEstudio(idPlan).then((res) => {
      this.enEdicionSemestreNuevo = false;
      this.enEdicionSemestreViejo = true;
      this.planEstudioBody = res;      
      this.esPlanEstudioPadre = this.planEstudioBody.EsPlanEstudioPadre ? true: false;
      this.proyecto_id = this.planEstudioBody.ProyectoAcademicoId;
      this.crearFormulario(FORM_PLAN_ESTUDIO_EDICION);
      this.createTableEspaciosAcademicos(false);
      this.createTableSemestreTotal();
      this.totalTotal();
      if (this.esPlanEstudioPadre) {
        this.vista = VIEWS.SECONDARY_FORM;
      } else {
        this.vista = VIEWS.FORM;
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
}
