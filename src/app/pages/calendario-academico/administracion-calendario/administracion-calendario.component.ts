import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Actividad } from '../../../@core/data/models/calendario-academico/actividad';
import { Proceso } from '../../../@core/data/models/calendario-academico/proceso';
import { ProyectoAcademicoInstitucion } from '../../../@core/data/models/proyecto_academico/proyecto_academico_institucion';
import { Vinculacion } from '../../../@core/data/models/terceros/vinculacion';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { UserService } from '../../../@core/data/users.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { EdicionActividadesProgramasComponent } from '../edicion-actividades-programas/edicion-actividades-programas.component';
import * as moment from 'moment';
import { EventoService } from '../../../@core/data/evento.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'administracion-calendario',
  templateUrl: './administracion-calendario.component.html',
  styleUrls: ['./administracion-calendario.component.scss']
})
export class AdministracionCalendarioComponent implements OnInit {

  loading: boolean = false;
  processSettings: any;
  activitiesSettings: any;
  processTable: LocalDataSource;
  processes: Proceso[] = [];

userId: number = 0;

Proyecto_nombre: string = "";
Calendario_academico: string = "";
periodicidad: any[];
periodo_calendario: string = "";
idCalendario: number = 0;

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private terceroService: TercerosService,
    private projectService: ProyectoAcademicoService,
    private sgaMidService: SgaMidService,
    private eventoService: EventoService,
    private parametrosService: ParametrosService,
    private router: Router,
    private route: ActivatedRoute,
    ) {
      this.processTable = new LocalDataSource();
      this.createProcessTable();
      this.createActivitiesTable();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createProcessTable();
        this.createActivitiesTable();
      });
    }

  ngOnInit() {
    this.getInfoPrograma();
  }

  createProcessTable() {
    this.processSettings = {
      columns: {
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          width: '20%',
          editable: false,
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          width: '80%',
          editable: false,
        },
      },
      mode: 'external',
      actions: {
        edit: false,
        delete: false,
        add: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'view',
            title: '<i class="nb-search" title="' +
                this.translate.instant('calendario.tooltip_detalle_proceso') +
                '"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant('calendario.sin_procesos'),
    }
  }

  createActivitiesTable() {
    this.activitiesSettings = {
      columns: {
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          witdh: '20%',
          editable: false,
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          witdh: '20%',
          editable: false,
        },
        FechaInicio: {
          title: this.translate.instant('calendario.fecha_inicio'),
          witdh: '20%',
          editable: false,
        },
        FechaFin: {
          title: this.translate.instant('calendario.fecha_fin'),
          witdh: '20%',
          editable: false,
        },
        Activo: {
          title: this.translate.instant('calendario.estado'),
          witdh: '20%',
          editable: false,
          valuePrepareFunction: (value: boolean) =>
            value
              ? this.translate.instant('GLOBAL.activo')
              : this.translate.instant('GLOBAL.inactivo'),
        },
      },
      mode: 'external',
      actions: {
        edit: false,
        delete: false,
        add: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'edit',
            title: '<i class="nb-edit" title="' +
                this.translate.instant('calendario.tooltip_editar_actividad') +
                '"></i>',
          },
          {
            name: 'disable',
            title: '<i class="nb-fold" title="' +
                this.translate.instant('calendario.tooltip_estado_actividad') +
                '" ></i>',
          }
        ],
      },
      noDataMessage: this.translate.instant('calendario.sin_actividades'),
    };
  }

  verCalendario(){
    this.router.navigate(['../detalle-calendario', { Id: this.idCalendario }], { relativeTo: this.route });
  }

  onAction(event, process) {
    switch (event.action) {
      case 'view':
        this.viewProcess(event, process)
        break;
      case 'edit':
        this.editActivity(event, process);
        break;
      case 'disable':
        this.disableActivity(event, process);
        break;
    }
  }

  viewProcess(event, process){
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '600px';
    activityConfig.height = '370px';
    activityConfig.data = { process: event, vista: "process" };
    const newActivity = this.dialog.open(EdicionActividadesProgramasComponent, activityConfig);
    newActivity.afterClosed().subscribe((activity: any) => {

    });
  }

  editActivity(event, process){
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '800px';
    activityConfig.height = '600px';
    activityConfig.data = { process: process, event: event, periodo: this.periodo_calendario ,vista: "edit_act" };
    const newActivity = this.dialog.open(EdicionActividadesProgramasComponent, activityConfig);
    newActivity.afterClosed().subscribe((activity: any) => {

    });
  }

  disableActivity(event, process){
    this.popUpManager.showConfirmAlert(this.translate.instant('calendario.mensaje_estado_actividad'),this.translate.instant('calendario.procesos_actividades')).then(accion => {
      if(accion.value){
        // cambiar estado
      }
    })
  }

  getInfoPrograma() {
    this.loading = true;
    this.userId = this.userService.getPersonaId();//9855
    console.log("user id: ", this.userId)
    console.log("vinculacion?query=Activo:true,tercero_principal_id:" + this.userId)
    this.terceroService.get("vinculacion?query=Activo:true,tercero_principal_id:" + this.userId).subscribe(
      (res_tercero: Vinculacion[]) => {
        this.projectService.get('proyecto_academico_institucion/' + res_tercero[0].DependenciaId).subscribe(
          (res_proyecto: ProyectoAcademicoInstitucion) => {
            this.Proyecto_nombre = res_proyecto.Nombre;
            this.eventoService.get('tipo_recurrencia?limit=0').subscribe(
              res_recurrencia => {
                console.log("recurrencia: ", res_recurrencia)
                this.periodicidad = res_recurrencia;
                this.idCalendario = res_tercero[0].PeriodoId;
                this.sgaMidService.get('calendario_academico/' + res_tercero[0].PeriodoId).subscribe(
                  response => {
                    this.parametrosService.get('periodo/' + response.Data[0].PeriodoId).subscribe(
                      resp => {
                        console.log("periodo", resp.Data.Nombre)
                        this.periodo_calendario = resp.Data.Nombre;
                        this.Calendario_academico = response.Data[0].Nombre
                        const processes: any[] = response.Data[0].proceso;
                        if (processes !== null) {
                          processes.forEach(element => {
                            if (Object.keys(element).length !== 0) {
                              const loadedProcess: Proceso = new Proceso();
                              loadedProcess.Nombre = element['Proceso'];
                              loadedProcess.CalendarioId = { Id: res_tercero[0].PeriodoId };
                              loadedProcess.actividades = [];
                              const activities: any[] = element['Actividades']
                              if (activities !== null) {
                                activities.forEach(element => {
                                  if (Object.keys(element).length !== 0 && element['EventoPadreId'] == null) {
                                    const loadedActivity: Actividad = new Actividad();
                                    loadedActivity.actividadId = element['actividadId'];
                                    loadedActivity.TipoEventoId = { Id: element['TipoEventoId']['Id'] };
                                    loadedActivity.Nombre = element['Nombre'];
                                    loadedActivity.Descripcion = element['Descripcion'];
                                    loadedActivity.Activo = element['Activo'];
                                    loadedActivity.FechaInicio = moment(element['FechaInicio'], 'YYYY-MM-DD').format('DD-MM-YYYY');
                                    loadedActivity.FechaFin = moment(element['FechaFin'], 'YYYY-MM-DD').format('DD-MM-YYYY');
                                    loadedActivity.responsables = element['Responsable'];
                                    loadedProcess.procesoId = element['TipoEventoId']['Id'];
                                    loadedProcess.Descripcion = element['TipoEventoId']['Descripcion'];
                                    let id_rec = element['TipoEventoId']['TipoRecurrenciaId']['Id']
                                    loadedProcess.TipoRecurrenciaId = { Id: id_rec, Nombre: this.periodicidad.find(rec => rec.Id == id_rec).Nombre };
                                    loadedProcess.actividades.push(loadedActivity);
                                  }
                                });
                                this.processes.push(loadedProcess);
                              }
                            }
                          });
                          this.processTable.load(this.processes);
                          this.loading = false;
                        }
                      },
                      error => {
                        console.log("error_periodo:", error)
                        this.loading = false;
                      }
                    );
                  },
                  error => {
                    console.log("error calend: ", error)
                    this.loading = false;
                  }
                )
              },
              error => {
                console.log("error_recurrencia: ", error)
              }
            );
          },
          error => {
            console.log("error proyec:", error)
            this.loading = false;
          }
        )
      },
      error => {
        console.log("error info prog:", error)
        this.loading = false;
      }
    )
  }

}


 