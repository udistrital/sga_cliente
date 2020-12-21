import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActividadCalendarioAcademicoComponent } from '../actividad-calendario-academico/actividad-calendario-academico.component';
import { Proceso } from '../../../@core/data/models/calendario-academico/proceso';
import { Calendario } from '../../../@core/data/models/calendario-academico/calendario';
import { ActividadHija } from '../../../@core/data/models/calendario-academico/actividadHija';
import { EventoService } from '../../../@core/data/evento.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentoService } from '../../../@core/data/documento.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { CalendarioEvento } from '../../../@core/data/models/calendario-academico/calendarioEvento';
import { PopUpManager } from '../../../managers/popUpManager';
import * as moment from 'moment';

@Component({
  selector: 'ngx-detalle-calendario',
  templateUrl: './detalle-calendario.component.html',
  styleUrls: ['./detalle-calendario.component.scss'],
})
export class DetalleCalendarioComponent implements OnInit, OnChanges {

  activetab: boolean = false;
  calendarForEditId: number = 0;
  dataSource: any;
  data: any;
  periodos: any;
  processSettings: any;
  activitiesSettings: any;
  idDetalle: any
  processes: Proceso[];
  calendar: Calendario;
  calendarActivity: ActividadHija;
  processTable: LocalDataSource;
  fileResolucion: any;
  calendarForm: FormGroup;
  calendarioEvento: CalendarioEvento;
  loading: boolean = false;

  @Input()
  calendarForProject: string = "0";
  @Input()
  projectId: number = 0;

  constructor(
    private sgaMidService: SgaMidService,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private popUpManager: PopUpManager,
    private eventoService: EventoService,
  ) {
    this.createActivitiesTable();
  }

  loadSelects(id: any) {
    this.loading = true;
    this.sgaMidService.get('consulta_calendario_academico/' + id).subscribe(res => {
      this.periodos = res;

      if (JSON.stringify(res[0]) === JSON.stringify({})) {
        this.popUpManager.showConfirmAlert(
          this.translate.instant('calendario.sin_procesos')
        ).then((ok) => {
          this.router.navigate(['../list-calendario-academico'], { relativeTo: this.route });
        });
      }
      this.loading = false;
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.idDetalle = params.get('Id');
        this.loadSelects(this.idDetalle)
      }
    });
    this.createActivitiesTable();
  }

  ngOnChanges() {
    if (this.calendarForProject != "0") {
      this.loadSelects(this.calendarForProject);
    }
  }

  cambiarCalendario(id: any) {
    this.loadSelects(id)
  }

  createActivitiesTable() {
    this.activitiesSettings = {
      columns: {
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          witdh: '20%',
          editable: false,
          filter: false,
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          witdh: '20%',
          editable: false,
          filter: false,
        },
        FechaInicio: {
          title: this.translate.instant('calendario.fecha_inicio'),
          witdh: '20%',
          editable: false,
          filter: false,
          valuePrepareFunction: (value) => value = moment(value).format('YYYY-MM-DD'),
        },
        FechaFin: {
          title: this.translate.instant('calendario.fecha_fin'),
          witdh: '20%',
          editable: false,
          filter: false,
          valuePrepareFunction: (value) => value = moment(value).format('YYYY-MM-DD'),
        },
        Responsable: {
          title: this.translate.instant('calendario.responsable'),
          witdh: '20%',
          editable: false,
          filter: false,
        },
        Activo: {
          title: this.translate.instant('calendario.estado'),
          witdh: '20%',
          editable: false,
          filter: false,
          valuePrepareFunction: (value: boolean) => value ? this.translate.instant('GLOBAL.activo') : this.translate.instant('GLOBAL.inactivo'),
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
            name: 'assign',
            title: '<i class="nb-compose"></i>',
          },
          {
            name: 'edit',
            title: '<i class="nb-edit"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
      noDataMessage: this.translate.instant('calendario.sin_actividades'),
    }
  }

  onActionActivity(event, process: Proceso) {
    switch (event.action) {
      case 'edit':
        this.editActivity(event, process);
        break;
      case 'assign':
        this.assignActivity(event);
        break;
    }
  }

  editActivity(event, process: Proceso) {
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '800px';
    activityConfig.height = '700px';
    activityConfig.data = { process: process, calendar: this.periodos, editActivity: event.data };
    const editedActivity = this.dialog.open(ActividadCalendarioAcademicoComponent, activityConfig);
    editedActivity.afterClosed().subscribe((activity: any) => {
      if (activity !== undefined) {
        this.eventoService.get('calendario_evento/' + event.data.actividadId).subscribe(
          response => {
            const activityPut = response;
            activityPut['Nombre'] = activity.Actividad.Nombre;
            activityPut['Descripcion'] = activity.Actividad.Descripcion;
            activityPut['FechaInicio'] = activity.Actividad.FechaInicio;
            activityPut['FechaFin'] = activity.Actividad.FechaFin;
            this.eventoService.put('calendario_evento', activityPut).subscribe(
              response => {
                const proceso = this.processes.filter(proc => proc.procesoId === process.procesoId)[0];
                const i = proceso.actividades.findIndex(actv => actv.actividadId === activity.Actividad);
                proceso.actividades[i] = activity.Actividad;
                this.processTable.update(process, proceso);
                this.processTable.refresh();
                this.popUpManager.showSuccessAlert(this.translate.instant('calendario.actividad_actualizada'));
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_actividad'));
              },
            );
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_actividad'));
          },
        );
        // update responsables
      }
    });
  }

  assignActivity(event: any) {
    this.loading = true;

    this.calendarioEvento = new CalendarioEvento();
    this.calendarActivity = new ActividadHija();

    this.calendarActivity.Id = this.calendar.calendarioId
    this.calendarActivity.Nombre = event.data.Nombre
    if (this.calendar.Activo) {
      this.calendarActivity.Estado = 'Activo'
    } else {
      this.calendarActivity.Estado = 'Inactivo'
    }
    this.calendarioEvento.Id = 0
    this.calendarioEvento.Nombre = event.data.Nombre;
    this.calendarioEvento.Descripcion = event.data.Descripcion;
    this.calendarioEvento.FechaCreacion = moment().format('YYYY-MM-DDTHH:mm') + ':00Z';
    this.calendarioEvento.FechaModificacion = moment().format('YYYY-MM-DDTHH:mm') + ':00Z';
    this.calendarioEvento.FechaInicio = event.data.FechaInicio;
    this.calendarioEvento.FechaFin = event.data.FechaFin;
    this.calendarioEvento.Activo = event.data.Activo;
    this.calendarioEvento.DependenciaId = JSON.stringify({ proyectos: this.projectId });
    this.calendarioEvento.EventoPadreId = { Id: event.data.actividadId };
    this.calendarioEvento.TipoEventoId = event.data.TipoEventoId;

    this.eventoService.post('calendario_evento', this.calendarioEvento).subscribe(
      response => {
        this.loadSelects(this.calendarForProject);
        this.createActivitiesTable();
        this.popUpManager.showSuccessAlert(this.translate.instant('calendario.actividad_hija_exito'));
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }

  downloadFile(id_documento: any) {
    const filesToGet = [
      {
        Id: id_documento,
        key: id_documento,
      },
    ];
    this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService).subscribe(
      response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          filesToGet.forEach((file: any) => {
            const url = filesResponse[file.Id];
            window.open(url);
          });
        }
      },
      error => {
        this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
      },
    );
  }

  activateTab() {
    this.router.navigate(['../list-calendario-academico'], { relativeTo: this.route });
  }

}
