import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { PopUpManager } from '../../../managers/popUpManager';
import * as moment from 'moment';

@Component({
  selector: 'edicion-actividades-programas',
  templateUrl: './edicion-actividades-programas.component.html',
  styleUrls: ['./edicion-actividades-programas.component.scss']
})
export class EdicionActividadesProgramasComponent implements OnInit {

  select_proyectos_act: boolean = false;
  actividad_detalle_proyectos: boolean = false;
  vista: string;
  projects: any[];
  actividad: string = "";
  descripcion_actividad: string = "";
  proceso_detalle: boolean = false;
  editar_actividad: boolean = false;
  nombre_proceso: string = "";
  descripcion_proceso: string = "";
  periodicidad_proceso: string = "";
  periodo: string = "";
  fecha_inicio_org: string = "";
  fecha_fin_org: string = "";

  settings: Object;
  dataSource: LocalDataSource;

  settings2: Object;
  dataSource2: LocalDataSource;

  ActivityEditor: FormGroup;

  constructor(
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<EdicionActividadesProgramasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.dataSource = new LocalDataSource();
    this.dataSource2 = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
      this.createTable2();
    })
    this.vista = this.data.vista;
    if(this.vista == "select"){
      this.select_proyectos_act = true;
      this.actividad_detalle_proyectos = false;
      this.proceso_detalle = false;
      this.editar_actividad = false;
    }
    if(this.vista == "view"){
      this.select_proyectos_act = false;
      this.actividad_detalle_proyectos = true;
      this.proceso_detalle = false;
      this.editar_actividad = false;
    }
    if(this.vista == "process"){
      this.select_proyectos_act = false;
      this.actividad_detalle_proyectos = false;
      this.proceso_detalle = true;
      this.editar_actividad = false;
    }
    if(this.vista == "edit_act"){
      this.select_proyectos_act = false;
      this.actividad_detalle_proyectos = false;
      this.proceso_detalle = false;
      this.editar_actividad = true;
    }
    this.dialogRef.backdropClick().subscribe(() => this.closeDialog());
  }

  ngOnInit() {
    if (this.select_proyectos_act) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        response => {
          this.projects = (<any[]>response).filter(
            proyecto => this.filtrarProyecto(proyecto),
          );
          console.log(this.projects)
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
    if(this.actividad_detalle_proyectos){
      this.createTable();
      this.actividad = this.data.event.data.Nombre;
      this.descripcion_actividad = this.data.event.data.Descripcion;
      this.dataSource.load([])
    }
    if(this.proceso_detalle){
      console.log(this.data)
      this.nombre_proceso = this.data.process.data.Nombre;
      this.descripcion_proceso = this.data.process.data.Descripcion;
      this.periodicidad_proceso = this.data.process.data.TipoRecurrenciaId.Nombre;
    }
    if(this.editar_actividad){
      this.ActivityEditor = new FormGroup({
          fecha_inicio_org: new FormControl(''),
          fecha_fin_org: new FormControl(''),
          fecha_ini_new: new FormControl(''),
          fecha_fin_new: new FormControl(''),
      });
      console.log(this.data)
      this.nombre_proceso = this.data.process.Nombre;
      this.periodo = this.data.periodo;
      this.actividad = this.data.event.data.Nombre;
      this.descripcion_actividad = this.data.event.data.Descripcion;
      this.fecha_inicio_org = this.data.event.data.FechaInicio;
      this.fecha_fin_org = this.data.event.data.FechaFin;
      this.createTable2();
      this.dataSource2.load(this.data.event.data.responsables);
      this.ActivityEditor.patchValue({
        fecha_inicio_org: moment(this.fecha_inicio_org,"DD-MM-YYYY").toDate(),
        fecha_fin_org: moment(this.fecha_fin_org,"DD-MM-YYYY").toDate(),
      });
    }
  }

  filtrarProyecto(proyecto) {
    if (this.data.calendar.Nivel === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.data.calendar.Nivel) {
        return true
      }
    } else {
      return false
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  regresar() {
    this.dialogRef.close();
  }

  guardar() {
    this.regresar();
  }

  createTable() {
    this.settings = {
      columns: {
        ProyectoCurricular: {
          title: this.translate.instant('calendario.proyecto_curricular'),
          editable: false,
          width: '40%',
          filter: false,
        },
        FechaInicio: {
          title: this.translate.instant('calendario.fecha_inicio'),
          editable: false,
          width: '20%',
          filter: false,
        },
        FechaFIn: {
          title: this.translate.instant('calendario.fecha_fin'),
          editable: false,
          width: '20%',
          filter: false,
        },
        FechaEdicion: {
          title: this.translate.instant('calendario.fecha_edicion'),
          editable: false,
          width: '20%',
          filter: false,
        },
      },
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('calendario.sin_proyectos_actividades')
    };
  }

  createTable2(){
    this.settings2 ={
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          editable: false,
          width: '40%',
          filter: false,
        },
      },
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('calendario.sin_responsables')
    };
  }

}
