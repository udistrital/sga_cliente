import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToasterService, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';
import { LocalDataSource } from 'ng2-smart-table';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProcesoCalendarioAcademicoComponent } from '../proceso-calendario-academico/proceso-calendario-academico.component';
import { ActividadCalendarioAcademicoComponent } from '../actividad-calendario-academico/actividad-calendario-academico.component';
import { CrudPeriodoComponent } from '../../periodo/crud-periodo/crud-periodo.component';
import { Proceso } from '../../../@core/data/models/calendario-academico/proceso';
import { Actividad } from '../../../@core/data/models/calendario-academico/actividad';
import { Calendario } from '../../../@core/data/models/calendario-academico/calendario';

import { CoreService } from '../../../@core/data/core.service';

@Component({
  selector: 'ngx-def-calendario-academico',
  templateUrl: './def-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss']
})
export class DefCalendarioAcademicoComponent {

  fileResolucion: any;
  processSettings: any;
  activitiesSettings: any;
  processes: Proceso[];
  calendar: Calendario;
  activetabs: boolean = false;
  calendarForm: any;
  createdCalendar: boolean = false;
  periodos: any;
  nivel_load = [{nombre: 'Pregrado', id: 14}, { nombre: 'Posgrado', id: 15}];


  constructor(
    private sanitization: DomSanitizer,
    private toasterService: ToasterService,
    private translate: TranslateService,
    private builder: FormBuilder,
    private dialog: MatDialog, 
    private coreService: CoreService
  ) {
    this.loadSelects()
    this.createCalendarForm();
    this.createProcessTable();
    this.createActivitiesTable();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createProcessTable();
      this.createActivitiesTable();
    });

    this.processes = [];
  }

  createCalendarForm() {
    this.calendarForm = this.builder.group({
      resolucion: ['', Validators.required],
      anno: ['', Validators.minLength(4)],
      periodo: '',
      calendario_para: '',
      fileResolucion: ''
    })
  }

  loadSelects() {
    this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1').subscribe(res => {
      console.log(res)
      this.periodos = res;
    });
  }

  createProcessTable() {
    this.processSettings = {
      columns: {
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          width: '20%'
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          width: '80%',
        }
      },
      mode: 'external',
      actions: {
        position: 'right',
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
      noDataMessage: this.translate.instant('calendario.sin_procesos')
    }
  }

  createActivitiesTable() {
    this.activitiesSettings = {
      columns: {
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          witdh: '20%',
          editable: false
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          witdh: '20%',
          editable: false
        },
        Fecha_inicio: {
          title: this.translate.instant('calendario.fecha_inicio'),
          witdh: '20%',
          editable: false
        },
        Fecha_fin: {
          title: this.translate.instant('calendario.fecha_fin'),
          witdh: '20%',
          editable: false
        },
        Estado: {
          title: this.translate.instant('calendario.estado'),
          witdh: '20%',
          editable: false
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
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
      noDataMessage: this.translate.instant('calendario.sin_actividades')
    }
  }

  createCalendar() {
    //crea el calendario
    this.calendar = this.calendarForm.value;
    this.createdCalendar = true;
  }

  addPeriod() {
    this.dialog.open(CrudPeriodoComponent, {width: '800px', height: '600px'})
  }

  addProcess(event) {
    const newProcess = this.dialog.open(ProcesoCalendarioAcademicoComponent, {width: '800px', height: '400px'});
    newProcess.afterClosed().subscribe((process: Proceso) => {
      this.processes.push(process);
    });
    
  }
  

  editProcess(event) {

  }

  deleteProcess(event) {

  }

  addActivity(event) {
    const newActivity = this.dialog.open(ActividadCalendarioAcademicoComponent, {width: '800px', height: '600px'});
    newActivity.afterClosed().subscribe((activity: Actividad) => {
      console.log(activity);
    })
  }

  openTabs() {
    this.activetabs = true;
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  onInputFileResolucion(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
        file.url = this.cleanURL(file.urlTemp);
        file.IdDocumento = 9;
        file.file = event.target.files[0];
        this.fileResolucion = file;
      } else {
        this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.formato_documento_pdf'));
      }
    }
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
