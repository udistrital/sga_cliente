import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import * as moment from 'moment';
import { Proceso } from '../../../@core/data/models/calendario-academico/proceso';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActividadCalendarioAcademicoComponent } from '../actividad-calendario-academico/actividad-calendario-academico.component';
import { Calendario } from '../../../@core/data/models/calendario-academico/calendario';
import { Actividad } from '../../../@core/data/models/calendario-academico/actividad';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActividadHija } from '../../../@core/data/models/calendario-academico/actividadHija';
import { LocalDataSource } from 'ng2-smart-table';
import { EventoService } from '../../../@core/data/evento.service';
import { Documento } from '../../../@core/data/models/documento/documento';
import { FormGroup } from '@angular/forms';
import { CalendarioEvento } from '../../../@core/data/models/calendario-academico/calendarioEvento';

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
  idProject: any
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
    private matIconRegistry: MatIconRegistry,
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
        const options: any = {
          title: this.translate.instant('GLOBAL.atencion'),
          text: this.translate.instant('calendario.sin_procesos'),
          icon: 'warning',
          buttons: true,
          dangerMode: true,
          showCancelButton: true,
        };
        Swal(options).then((ok) => {
          this.router.navigate(['../list-calendario-academico'], { relativeTo: this.route });
        });
      }
      this.loading = false;
    });
  }

  ngOnInit() {
    this.createCalendar();
    this.createActivitiesTable();
  }

  createCalendar() {
    this.loading = true;
    this.idDetalle = this.calendarForProject
    if (this.calendarForEditId !== 0) {
      this.idDetalle = this.calendarForEditId;
    }
    this.eventoService.get('calendario/' + this.idDetalle).subscribe(
      calendar => {
        this.calendar = new Calendario();
        this.calendar.calendarioId = calendar['Id'];
        this.calendar.DocumentoId = calendar['DocumentoId'];
        this.calendar.Nivel = calendar['Nivel'];
        this.calendar.Activo = calendar['Activo'];
        this.calendar.PeriodoId = calendar['PeriodoId'];

        this.documentoService.get('documento/' + this.calendar.DocumentoId).subscribe(
          (documento: Documento) => {
            this.fileResolucion = documento;
            this.calendar.resolucion = JSON.parse(documento.Metadatos)['resolucion'];
            this.calendar.anno = JSON.parse(documento.Metadatos)['anno'];
            this.calendarForm.setValue({
              resolucion: this.calendar.resolucion,
              anno: this.calendar.anno,
              PeriodoId: this.calendar.PeriodoId,
              Nivel: this.calendar.Nivel,
              fileResolucion: documento.Nombre,
            });
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
    this.eventoService.get('tipo_evento?query=CalendarioID__Id:' + this.calendarForEditId).subscribe(
      processes => {
        console.log(processes)
        processes.forEach(element => {
          if (Object.keys(element).length !== 0) {
            let loadedProcess: Proceso = new Proceso();
            loadedProcess.procesoId = element['Id'];
            loadedProcess.CalendarioId = { Id: this.calendarForEditId };
            loadedProcess.Nombre = element['Nombre'];
            loadedProcess.Descripcion = element['Descripcion'];
            loadedProcess.TipoRecurrenciaId = { Id: element['TipoRecurrenciaId']['Id'] };
            loadedProcess.actividades = [];
            this.processes.push(loadedProcess);
          }
        });

        this.processes.forEach(process => {
          this.eventoService.get('calendario_evento?query=TipoEventoId__Id:' + process.procesoId).subscribe(
            activities => {
              activities.forEach(element => {
                if (Object.keys(element).length !== 0) {
                  if (element['EventoPadreId'] == null) {
                    let loadedActivity: Actividad = new Actividad();
                    loadedActivity.actividadId = element['Id'];
                    loadedActivity.TipoEventoId = { Id: element['TipoEventoId']['Id'] };
                    loadedActivity.Nombre = element['Nombre'];
                    loadedActivity.Descripcion = element['Descripcion'];
                    loadedActivity.Activo = element['Activo'];
                    loadedActivity.FechaInicio = moment(element['FechaInicio']).format('DD-MM-YYYY');
                    loadedActivity.FechaFin = moment(element['FechaFin']).format('DD-MM-YYYY');
                    if (element['EventoPadreId'] != null) {
                      loadedActivity.EventoPadreId = { Id: element['EventoPadreId']['Id'], FechaInicio: element['EventoPadreId']['FechaInicio'], FechaFin: element['EventoPadreId']['FechaFin'] };
                    } else {
                      loadedActivity.EventoPadreId = null;
                    }

                    this.eventoService.get('calendario_evento_tipo_publico?query=CalendarioEventoId__Id:' + loadedActivity.actividadId).subscribe(
                      (response: any[]) => {
                        loadedActivity.responsables = response.map(
                          result => {
                            return { IdPublico: result["TipoPublicoId"]["Id"] }
                          }
                        );
                        process.actividades.push(loadedActivity);
                        this.createActivitiesTable();
                      },
                      error => {
                        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
                      },
                    );

                    process.actividades.push(loadedActivity);
                    this.createActivitiesTable();
                  }
                }
              });
              this.processTable.load(this.processes);
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            },
          );
        });
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );


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
          valuePrepareFunction: (value) => { return value = moment(value).format('YYYY-MM-DD') },
        },
        FechaFin: {
          title: this.translate.instant('calendario.fecha_fin'),
          witdh: '20%',
          editable: false,
          filter: false,
          valuePrepareFunction: (value) => { return value = moment(value).format('YYYY-MM-DD') },
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
    console.log(event)
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
    console.log(event.data)
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '800px';
    activityConfig.height = '700px';
    activityConfig.data = { process: process, calendar: this.calendar, editActivity: event.data };
    const editedActivity = this.dialog.open(ActividadCalendarioAcademicoComponent, activityConfig);
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
    this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService)
      .subscribe(response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          filesToGet.forEach((file: any) => {
            const url = filesResponse[file.Id];
            window.open(url);
          });
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  activateTab() {
    this.router.navigate(['../list-calendario-academico'], { relativeTo: this.route });
  }

}
