import { Component, Input, OnChanges, Output, EventEmitter  } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProcesoCalendarioAcademicoComponent } from '../proceso-calendario-academico/proceso-calendario-academico.component';
import { ActividadCalendarioAcademicoComponent } from '../actividad-calendario-academico/actividad-calendario-academico.component';
import { CrudPeriodoComponent } from '../../periodo/crud-periodo/crud-periodo.component';
import { Proceso } from '../../../@core/data/models/calendario-academico/proceso';
import { Actividad } from '../../../@core/data/models/calendario-academico/actividad';
import { Calendario } from '../../../@core/data/models/calendario-academico/calendario';
import { CalendarioClone } from '../../../@core/data/models/calendario-academico/calendarioClone';
import { Documento } from '../../../@core/data/models/documento/documento';
import * as moment from 'moment';

import { CoreService } from '../../../@core/data/core.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { EventoService } from '../../../@core/data/evento.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';


@Component({
  selector: 'ngx-def-calendario-academico',
  templateUrl: './def-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss'],
})
export class DefCalendarioAcademicoComponent implements OnChanges {

  fileResolucion: any;
  processSettings: any;
  activitiesSettings: any;
  processes: Proceso[];
  processTable: LocalDataSource;
  activities: Actividad[];
  calendar: Calendario;
  calendarClone: CalendarioClone;
  activetabs: boolean = false;
  activebutton: boolean = false
  activetabsClone: boolean = false;
  calendarForm: FormGroup;
  calendarFormClone: FormGroup;
  createdCalendar: boolean = false;
  periodos: any;
  periodosClone: any;
  nivel_load = [{ nombre: 'Pregrado', id: 14 }, { nombre: 'Posgrado', id: 15 }];
  loading: boolean = false;
  editMode: boolean = false;

  @Input()
  calendarForEditId: number = 0;
  @Output()
  calendarCloneOut = new EventEmitter<number>();

  constructor(
    private sanitization: DomSanitizer,
    private translate: TranslateService,
    private builder: FormBuilder,
    private dialog: MatDialog,
    private coreService: CoreService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private eventoService: EventoService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
  ) {
    // this.calendarCloneOut = new EventEmitter<string>();
    this.processTable = new LocalDataSource();
    this.processes = [];
    this.loadSelects()
    this.createCalendarForm();
    this.createCalendarFormClone();
    this.createProcessTable();
    this.createActivitiesTable();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createProcessTable();
      this.createActivitiesTable();
    });
  }
  clonarCalendario() {
    this.calendarClone = new CalendarioClone();
    this.calendarClone = this.calendarFormClone.value;
    this.calendarClone.Id = this.calendar.calendarioId

    this.sgaMidService.post('clonar_calendario/', this.calendarClone).subscribe(
      response => {
        if (JSON.stringify(response) === JSON.stringify({})) {
          this.activebutton = true;
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.calendario_clon_error'));
        }else{
          this.activebutton = false;
          this.activetabsClone = false;
          this.activetabs = true;
          this.calendarCloneOut.emit(this.calendarClone.Id);
          this.popUpManager.showSuccessAlert(this.translate.instant('calendario.calendario_exito'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
      },
    );
  }

  ngOnChanges() {
    this.processes = [];
    this.processTable.load(this.processes);
    if (this.calendarForEditId === 0) {
      this.activetabs = false;
      this.activetabsClone = false
      this.createdCalendar = false;
      this.editMode = false;
      this.calendarForm.reset()
    } else {
      this.createdCalendar = true;
      this.editMode = true;
      this.openTabs();
      this.eventoService.get('calendario/' + this.calendarForEditId).subscribe(
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
                    let loadedActivity: Actividad = new Actividad();
                    loadedActivity.actividadId = element['Id'];
                    loadedActivity.TipoEventoId = { Id: element['TipoEventoId']['Id'] };
                    loadedActivity.Nombre = element['Nombre'];
                    loadedActivity.Descripcion = element['Descripcion'];
                    loadedActivity.Activo = element['Activo'];
                    loadedActivity.FechaInicio = moment(element['FechaInicio']).format('DD-MM-YYYY');
                    loadedActivity.FechaFin = moment(element['FechaFin']).format('DD-MM-YYYY');
                    this.eventoService.get('calendario_evento_tipo_publico?query=CalendarioEventoId__Id:'+loadedActivity.actividadId).subscribe(
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
                  }
                });
                this.processTable.load(this.processes);
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              },
            );
          });
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );

    }

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

  createCalendarFormClone() {
    this.calendarFormClone = this.builder.group({
      PeriodoIdClone: '',
      NivelClone: '',
    })
  }

  loadSelects() {
    this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1').subscribe(
      res => {
        this.periodos = res;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.periodos = [{ Id: 15, Nombre: '2019-3' }]
      });
  }

  loadSelectsClone() {
    this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc').subscribe(
      res => {
        this.periodosClone = res;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.periodosClone = [{ Id: 15, Nombre: '2019-3' }]
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
      },
      noDataMessage: this.translate.instant('calendario.sin_actividades'),
    }
  }

  createCalendar(event) {
    this.activebutton = true
    event.preventDefault();
    this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_registrar_calendario'))
    .then(ok => {
      if (ok.value) {
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
                  this.popUpManager.showSuccessAlert(this.translate.instant('calendario.calendario_exito'));
                },
                error => {
                  this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
                },
              );
              this.loading = false;
            }).catch(error => {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
            });
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.no_documento'));
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
    this.dialog.open(CrudPeriodoComponent, { width: '800px', height: '600px' })
  }

  addProcess(event) {
    const processConfig = new MatDialogConfig();
    processConfig.width = '800px';
    processConfig.height = '400px';
    processConfig.data = { calendar: this.calendar };
    const newProcess = this.dialog.open(ProcesoCalendarioAcademicoComponent, processConfig);
    newProcess.afterClosed().subscribe((process: Proceso) => {
      if (process !== undefined) {
        this.eventoService.post('tipo_evento', process).subscribe(
          response => {
            process.procesoId = response['Id'];
            process.actividades = [];
            this.processes.push(process);
            this.processTable.load(this.processes);
            this.popUpManager.showSuccessAlert(this.translate.instant('calendario.proceso_exito'));
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_proceso'));
          },
        );
      }
    });
  }

  editProcess(event) {
    console.log(event.data);
    const processConfig = new MatDialogConfig();
    processConfig.width = '800px';
    processConfig.height = '400px';
    processConfig.data = { calendar: this.calendar, editProcess: event.data };
    const editedProcess = this.dialog.open(ProcesoCalendarioAcademicoComponent, processConfig);
    //PUT
  }

  deleteProcess(event) {

  }

  addActivity(event, process: Proceso) {
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '800px';
    activityConfig.height = '700px';
    activityConfig.data = { process: process, calendar: this.calendar };
    const newActivity = this.dialog.open(ActividadCalendarioAcademicoComponent, activityConfig);
    newActivity.afterClosed().subscribe((activity: any) => {
      if (activity !== undefined) {
        this.sgaMidService.post('crear_actividad_calendario', activity).subscribe(
          response => {
            var actividad: Actividad = new Actividad();
            actividad = activity.Actividad;
            actividad.responsables = activity.responsable;
            actividad.FechaInicio = moment(actividad.FechaInicio).format('DD-MM-YYYY');
            actividad.FechaFin = moment(actividad.FechaFin).format('DD-MM-YYYY');
            this.processes.filter((proc: Proceso) => proc.procesoId === process.procesoId)[0].actividades.push(actividad);
            event.source.load(process.actividades);
            this.popUpManager.showSuccessAlert(this.translate.instant('calendario.actividad_exito'));
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_actividad'));
          },
        );
      }
    });
    this.processTable.load(this.processes);
  }

  editActivity(event, process: Proceso) {
    console.log(event.data)
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '800px';
    activityConfig.height = '700px';
    activityConfig.data = { process: process, calendar: this.calendar, editActivity: event.data };
    const editedActivity = this.dialog.open(ActividadCalendarioAcademicoComponent, activityConfig);
    //PUT
  }

  deleteActivity(event, process: Proceso) {

  }

  openTabs() {
    this.activebutton = false;
    this.activetabs = true;
    this.activetabsClone = false;
  }

  openTabsClone() {
    this.loadSelectsClone()
    this.activetabsClone = true;
    this.activetabs = false;
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
          file.Metadatos = JSON.stringify({ resolucion: this.calendarForm.value.resolucion, anno: this.calendarForm.value.anno });
          this.fileResolucion = file;
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.formato_documento_pdf'));
        }
      }
    } else {
      this.popUpManager.showErrorToast(this.translate.instant('calendario.error_pre_file'));
    }
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

}
