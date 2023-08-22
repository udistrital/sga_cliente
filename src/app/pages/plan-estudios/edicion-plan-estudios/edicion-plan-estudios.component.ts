import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { FORM_PLAN_ESTUDIO } from '../form-plan_estudio';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FormParams } from '../../../@core/data/models/define-form-fields';
import { FormGroup } from '@angular/forms';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { LocalDataSource } from 'ng2-smart-table';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { ACTIONS, MODALS, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { animate, style, transition, trigger } from '@angular/animations';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PlanEstudiosService } from '../../../@core/data/plan_estudios.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { PlanEstudio, EspacioEspaciosSemestreDistribucion } from '../../../@core/data/models/plan_estudios/plan_estudio';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { EstadoAprobacion, STD } from '../../../@core/data/models/plan_estudios/estado_aprobacion';
import { PlanEstudioBaseComponent } from '../plan-estudio-base/plan-estudio-base.component';

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
  ]
})
export class EdicionPlanEstudiosComponent extends PlanEstudioBaseComponent implements OnInit {

  constructor(translate: TranslateService,
    popUpManager: PopUpManager,
    projectService: ProyectoAcademicoService,
    sgaMidService: SgaMidService,
    domSanitizer: DomSanitizer,
    planEstudiosService: PlanEstudiosService,
    gestorDocumentalService: NewNuxeoService
    ) {
      super(translate, popUpManager, projectService, 
      sgaMidService, domSanitizer, planEstudiosService, 
      gestorDocumentalService);
      this.dataPlanesEstudio = new LocalDataSource();
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
          console.log("ver: ", out.value, out.rowData);
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
          console.log("editar: ", out.value, out.rowData);
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
      // Datos de la tabla planes de estudio
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

}
