import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToasterService, Toast, BodyOutputType, ToasterConfig } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';
import { LocalDataSource } from 'ng2-smart-table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProcesoCalendarioAcademicoComponent } from '../proceso-calendario-academico/proceso-calendario-academico.component';
import { ActividadCalendarioAcademicoComponent } from '../actividad-calendario-academico/actividad-calendario-academico.component';
import { CrudPeriodoComponent } from '../../periodo/crud-periodo/crud-periodo.component';
import { Proceso } from '../../../@core/data/models/calendario-academico/proceso';
import { Actividad } from '../../../@core/data/models/calendario-academico/actividad';
import { Calendario } from '../../../@core/data/models/calendario-academico/calendario';
import Swal from 'sweetalert2';
import * as moment from 'moment';

import { CoreService } from '../../../@core/data/core.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { EventoService } from '../../../@core/data/evento.service';

@Component({
  selector: 'ngx-def-calendario-academico',
  templateUrl: './def-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss'],
})
export class DefCalendarioAcademicoComponent {

  toasterConfig: ToasterConfig;
  fileResolucion: any;
  processSettings: any;
  activitiesSettings: any;
  processes: Proceso[];
  processTable: LocalDataSource;
  activities: Actividad[];
  calendar: Calendario;
  activetabs: boolean = false;
  calendarForm: FormGroup;
  createdCalendar: boolean = false;
  periodos: any;
  nivel_load = [{nombre: 'Pregrado', id: 14}, { nombre: 'Posgrado', id: 15}];
  loading: boolean = false;


  constructor(
    private sanitization: DomSanitizer,
    private toasterService: ToasterService,
    private translate: TranslateService,
    private builder: FormBuilder,
    private dialog: MatDialog,
    private coreService: CoreService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private eventoService: EventoService,
  ) {
    this.processTable = new LocalDataSource();
    this.processes = [];
    this.configToast()
    this.loadSelects()
    this.createCalendarForm();
    this.createProcessTable();
    this.createActivitiesTable();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createProcessTable();
      this.createActivitiesTable();
    });
  }

  createCalendarForm() {
    this.calendarForm = this.builder.group({
      resolucion: ['', Validators.required],
      anno: ['', [Validators.required, Validators.minLength(4)]],
      PeriodoId: '',
      Nivel: '',
      fileResolucion: ['', Validators.required],
    })
  }

  loadSelects() {
    this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1').subscribe(res => {
      this.periodos = res;
    });
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
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
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
        Estado: {
          title: this.translate.instant('calendario.estado'),
          witdh: '20%',
          editable: false,
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      noDataMessage: this.translate.instant('calendario.sin_actividades'),
    }
  }

  createCalendar(event) {
    event.preventDefault();
    const options: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('calendario.seguro_registrar_calendario'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(options).then((ok) => {
      if (ok) {
        this.loading = true;
        if (this.fileResolucion) {
          this.calendar = this.calendarForm.value;
          this.uploadResolutionFile(this.fileResolucion)
            .then(fileID => {
              this.calendar.DocumentoId = fileID;
              this.calendar.DependenciaId = '{}';
              this.calendar.Activo = true;
              this.calendar.Nombre = this.translate.instant('calendario.calendario_academico') + ' ';
              this.calendar.Nombre += this.periodos.filter(periodo => periodo.Id === this.calendar.PeriodoId)[0].Nombre;
              this.calendar.Nombre += ' ' + this.nivel_load.filter(nivel => nivel.id === this.calendar.Nivel)[0].nombre;
              this.eventoService.post('calendario', this.calendar).subscribe(
                response => {
                  this.calendar.calendarioId = response['Id'];
                  this.createdCalendar = true;
                  Swal('', this.translate.instant('calendario.calendario_exito'), 'success');
                },
                error => {
                  console.error('Error calendario', error);
                  this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('calendario.error_registro_calendario'));
                },
              );
              this.loading = false;
            }).catch(error => {
              console.error('Error subida archivo', error);
              this.showToast('error', this.translate.instant('GLOBAL.archivo_seleccionado'), this.translate.instant('ERROR.error_subir_documento'));
            });
        } else {
          this.showToast('error', this.translate.instant('GLOBAL.archivo_seleccionado'), this.translate.instant('ERROR.no_documento'));
        }
      }
    });
  }

  uploadResolutionFile(file) {
    return new Promise((resolve, reject) => {
      this.nuxeoService.getDocumentos$([file], this.documentoService)
        .subscribe(response => {
          resolve(response['undefined'].Id); // desempacar el response, puede dejar de llamarse 'undefined'
        }, error => {
          reject(error);
        });
    });
  }

  addPeriod() {
    this.dialog.open(CrudPeriodoComponent, {width: '800px', height: '600px'})
  }

  addProcess(event) {
    const processConfig = new MatDialogConfig();
    processConfig.width = '800px';
    processConfig.height = '400px';
    processConfig.data = this.calendar;
    const newProcess = this.dialog.open(ProcesoCalendarioAcademicoComponent, processConfig);
    newProcess.afterClosed().subscribe((process: Proceso) => {
      if (process !== undefined) {
        this.eventoService.post('tipo_evento', process).subscribe(
          response => {
            process.procesoId = response['Id'];
            process.actividades = [];
            this.processes.push(process);
            this.processTable.load(this.processes);
            Swal('', this.translate.instant('calendario.proceso_exito'), 'success');
          },
          error => {
            this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('calendario.error_registro_proceso'));
          },
        );
      }
    });
  }

  editProcess(event) {

  }

  deleteProcess(event) {

  }

  addActivity(event, process: Proceso) {
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '800px';
    activityConfig.height = '600px';
    activityConfig.data = {process: process, calendar: this.calendar};
    const newActivity = this.dialog.open(ActividadCalendarioAcademicoComponent, activityConfig);
    newActivity.afterClosed().subscribe((activity: Actividad) => {
      if (activity !== undefined) {
        this.eventoService.post('calendario_evento', activity).subscribe(
          response => {
            activity.FechaInicio = moment(activity.FechaInicio).format('DD-MM-YYYY');
            activity.FechaFin = moment(activity.FechaFin).format('DD-MM-YYYY');
            this.processes.filter((proc: Proceso) => proc.procesoId === process.procesoId)[0].actividades.push(activity);
            event.source.load(process.actividades);
            Swal('', this.translate.instant('calendario.actividad_exito'), 'success');
          },
          error => {
            this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('calendario.error_registro_actividad'));
          },
        );
      }
    });
    this.processTable.load(this.processes);
  }

  editActivity(event, process: Proceso) {

  }

  deleteActivity(event, process: Proceso) {

  }

  openTabs() {
    this.activetabs = true;
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  onInputFileResolucion(event) {
    if (this.calendarForm.get('resolucion').valid && this.calendarForm.get('anno').valid) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        if (file.type === 'application/pdf') {
          file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
          file.url = this.cleanURL(file.urlTemp);
          file.IdDocumento = 14;
          file.file = event.target.files[0];
          file.Metadatos = JSON.stringify({resolucion: this.calendarForm.value.resolucion, anno: this.calendarForm.value.anno});
          this.fileResolucion = file;
        } else {
          this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.formato_documento_pdf'));
        }
      }
    } else {
      this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('calendario.error_pre_file'));
    }
  }

  private configToast() {
    this.toasterConfig = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
  }

  private showToast(type: string, title: string, body: string) {
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }

}
