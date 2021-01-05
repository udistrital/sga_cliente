import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
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
import { ActividadHija } from '../../../@core/data/models/calendario-academico/actividadHija';
import { CalendarioClone } from '../../../@core/data/models/calendario-academico/calendarioClone';
import { CalendarioEvento } from '../../../@core/data/models/calendario-academico/calendarioEvento';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';

import { ParametrosService } from '../../../@core/data/parametros.service';
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
  calendarActivity: ActividadHija;
  calendarClone: CalendarioClone;
  calendarioEvento: CalendarioEvento;
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
  uploadMode: boolean = false;

  @Input()
  calendarForEditId: number = 0;
  @Input()
  calendarForNew: boolean = false;
  @Output()
  calendarCloneOut = new EventEmitter<number>();
  @Output()
  newCalendar = new EventEmitter<void>();

  constructor(
    private sanitization: DomSanitizer,
    private translate: TranslateService,
    private builder: FormBuilder,
    private dialog: MatDialog,
    private parametrosService: ParametrosService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private eventoService: EventoService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
  ) {
    this.calendarActivity = new ActividadHija();
    this.calendarioEvento = new CalendarioEvento();
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
    this.loading = true;
    this.calendarClone = new CalendarioClone();
      this.calendarClone = this.calendarFormClone.value;
      this.calendarClone.Id = this.calendar.calendarioId
      this.sgaMidService.post('clonar_calendario/', this.calendarClone).subscribe(
        response => {
          if (JSON.stringify(response) === JSON.stringify({})) {
            this.activebutton = true;
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('calendario.calendario_clon_error'));
          } else {
            this.activebutton = false;
            this.activetabsClone = false;
            this.activetabs = true;
            this.calendarCloneOut.emit(this.calendarClone.Id);
            this.loading = false;
            this.popUpManager.showSuccessAlert(this.translate.instant('calendario.calendario_exito'));
          }
        },
        error => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
        },
      );
  }

  ngOnChanges() {
    this.processes = [];
    this.processTable.load(this.processes);
    if (this.calendarForNew === true){
      this.activetabs = false;
      this.createdCalendar = false;
      this.editMode = false;
      this.uploadMode = true;
      
      this.eventoService.get('calendario/' + this.calendarForEditId).subscribe(
        calendar => {
          this.calendar = new Calendario();
          this.calendar.calendarioId = calendar['Id'];
          this.calendar.DocumentoId = calendar['DocumentoId'];
          this.calendar.Nivel = calendar['Nivel'];
          this.calendar.Activo = calendar['Activo'];
          this.calendar.PeriodoId = calendar['PeriodoId'];

          this.calendarForm.setValue({
            resolucion: null,
            anno: null,
            PeriodoId: this.calendar.PeriodoId,
            Nivel: this.calendar.Nivel,
            fileResolucion: null,
          });
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );     
    } else if (this.calendarForEditId === 0) {
      this.activetabs = false;
      this.activetabsClone = false;
      this.createdCalendar = false;
      this.editMode = false;
      this.uploadMode = true;
      this.calendarForm.reset()
    } else {
      this.createdCalendar = true;
      this.editMode = true;
      this.uploadMode = false;
      this.openTabs();
      this.loading = true;
      this.sgaMidService.get('consulta_calendario_academico/' + this.calendarForEditId).subscribe(
        (response: any[]) => {
          const calendar = response[0];
          this.calendar = new Calendario();
          this.calendar.calendarioId = parseInt(calendar['Id']);
          this.calendar.DocumentoId = calendar['resolucion']['Id'];
          this.calendar.resolucion = calendar['resolucion']['Resolucion'];
          this.calendar.anno = calendar['resolucion']['Anno'];
          this.calendar.Nivel = calendar['Nivel'];
          this.calendar.Activo = calendar['Activo'];
          this.calendar.PeriodoId = calendar['PeriodoId'];
          this.fileResolucion = calendar['resolucion']['Nombre'];
          const processes: any[] = calendar['proceso'];
          if (processes !== null) {
            processes.forEach(element => {
              if (Object.keys(element).length !== 0) {
                const loadedProcess: Proceso = new Proceso();
                loadedProcess.Nombre = element['Proceso'];
                loadedProcess.CalendarioId = { Id: this.calendar.calendarioId};
                loadedProcess.actividades = [];
                const activities: any[] = element['Actividades']
                if (activities !== null) {
                  activities.forEach(element => {
                    if (Object.keys(element).length !== 0 && element['EventoPadreId'] == null) {
                      let loadedActivity: Actividad = new Actividad();
                      loadedActivity.actividadId = element['actividadId'];
                      loadedActivity.TipoEventoId = { Id: element['TipoEventoId']['Id'] };
                      loadedActivity.Nombre = element['Nombre'];
                      loadedActivity.Descripcion = element['Descripcion'];
                      loadedActivity.Activo = element['Activo'];
                      loadedActivity.FechaInicio = moment(element['FechaInicio']).format('DD-MM-YYYY');
                      loadedActivity.FechaFin = moment(element['FechaFin']).format('DD-MM-YYYY');
                      loadedActivity.responsables = element['Responsable'];
                      loadedProcess.procesoId = element['TipoEventoId']['Id'];
                      loadedProcess.Descripcion = element['TipoEventoId']['Descripcion'];
                      loadedProcess.TipoRecurrenciaId = { Id: element['TipoEventoId']['TipoRecurrenciaId']['Id'] };
                      loadedProcess.actividades.push(loadedActivity);
                    }
                  });
                  this.processes.push(loadedProcess);
                }
              }
            });
            this.processTable.load(this.processes);
          } else {
            this.loading = false;
          }
          this.loading = false;
          this.calendarForm.setValue({
            resolucion: this.calendar.resolucion,
            anno: this.calendar.anno,
            PeriodoId: this.calendar.PeriodoId,
            Nivel: this.calendar.Nivel,
            fileResolucion: this.fileResolucion,
          });
          this.loading = false;
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        }
      );
    }
  }

  createCalendarForm() {
    this.calendarForm = this.builder.group({
      resolucion: ['', Validators.required],
      anno: new FormControl('', {validators: [Validators.required, Validators.maxLength(4), Validators.pattern('^[0-9]*$')]}),
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
    this.parametrosService.get('periodo?query=CodigoAbreviacion:PA&query=Activo:true&sortby=Id&order=desc&limit=0').subscribe(
      res => {
        this.periodos = res['Data'];
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.periodos = [{ Id: 15, Nombre: '2019-3' }]
      });
  }

  loadSelectsClone() {
    this.parametrosService.get('periodo?query=CodigoAbreviacion:PA&query=Activo:true&sortby=Id&order=desc&limit=0').subscribe(
      res => {
        this.periodosClone = res['Data'];
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
        Activo: {
          title: this.translate.instant('calendario.estado'),
          witdh: '20%',
          editable: false,
          valuePrepareFunction: (value: boolean) => value ? this.translate.instant('GLOBAL.activo') : this.translate.instant('GLOBAL.inactivo'),
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
    event.preventDefault();
    console.log(this.calendarForNew)
    if (this.calendarForNew === false){
      this.activebutton = true;
      this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_registrar_calendario'))
      .then(ok => {
        if (ok.value) {
          this.loading = true;
          if (this.fileResolucion) {
            this.calendar = this.calendarForm.value;
            this.eventoService.get('calendario?query=Activo:true').subscribe(
              (response: Calendario[]) => {
                let calendarExists = false;
                response.forEach(calendar => {
                  calendarExists = calendarExists || (this.calendar.Nivel === calendar.Nivel && this.calendar.PeriodoId === calendar.PeriodoId);
                });
                if (calendarExists) {
                  this.loading = false;
                  this.popUpManager.showErrorAlert(this.translate.instant('calendario.calendario_existe'));
                } else {
                  console.info("file")
                  console.info(this.fileResolucion)
                  this.uploadResolutionFile(this.fileResolucion).then(
                    fileID => {
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
                        this.newCalendar.emit();
                      },
                      error => {
                        this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
                      },
                    );
                    this.loading = false;
                    }).catch(error => {
                      this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
                  });
                }
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              }
            );
          } else {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.no_documento'));
          }
        }
      }); 

    } else {
      console.info("Calendario clone entra")
      this.activebutton = false;
      this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_registrar_calendario'))
      .then(ok => {
        if (ok.value) {
          this.loading = true;
          console.info("punto de control 1")
          if (this.fileResolucion) {
            console.info(this.fileResolucion)
            this.calendar = this.calendarForm.value;
            this.uploadResolutionFile(this.fileResolucion)
              .then(fileID => {
                console.info("Punto de control 2")
                this.calendar.Nombre = this.translate.instant('calendario.calendario_academico') + ' ';
                this.calendar.Nombre += this.periodos.filter(periodo => periodo.Id === this.calendar.PeriodoId)[0].Nombre;
                this.calendar.Nombre += ' ' + this.nivel_load.filter(nivel => nivel.id === this.calendar.Nivel)[0].nombre;
                this.calendar.DependenciaId = '{}';
                this.calendar.DocumentoId = fileID;
                this.calendar.AplicacionId = 0;
                this.calendar.Activo = true;
                this.calendar.FechaCreacion = momentTimezone.tz(this.calendar.FechaCreacion, 'America/Bogota').format('YYYY-MM-DD HH:mm');
                this.calendar.FechaModificacion = momentTimezone.tz(this.calendar.FechaModificacion, 'America/Bogota').format('YYYY-MM-DD HH:mm');
                this.calendar.CalendarioPadreId = {Id: this.calendarForEditId};
                //console.log(this.calendar);
                console.info("Antes del post")
                this.sgaMidService.post('consulta_calendario_academico/calendario_padre', this.calendar).subscribe(
                  response => {
                    console.info("Se crea el calendario hijo")
                    this.calendar.calendarioId = response['Id'];
                    console.log(this.calendar.calendarioId)
                    this.createdCalendar = true;
                    console.log(this.calendar.calendarioId);
          
                    // Funcion clonar nueva
          
                    console.log(this.calendarForEditId);          
                    this.calendarClone = new CalendarioClone();          
                    this.calendarClone.Id = this.calendar.calendarioId;
                    this.calendarClone.Nivel = this.calendar.Nivel;          
                    this.calendarClone.PeriodoId = this.calendar.PeriodoId;          
                    this.calendarClone.IdPadre = {Id: this.calendarForEditId};          
                    //console.log(this.calendarClone)   
                    console.info("Antes de clonar procesos")
                    this.sgaMidService.post('clonar_calendario/calendario_padre', this.calendarClone).subscribe(          
                      response => {   
                        console.info("se clona el calendario")
                        console.info(response)
                        if (JSON.stringify(response) === JSON.stringify({})) {          
                          this.activebutton = true;          
                          this.popUpManager.showErrorAlert(this.translate.instant('calendario.calendario_clon_error'));          
                        } else {          
                          console.info(response);
                          this.calendarClone.Id = response["Id"];
                          this.createdCalendar = true;      
                          this.openTabs();
                          console.info(this.calendarClone.Id)
                          this.activebutton = false;          
                          this.activetabsClone = false;          
                          this.activetabs = true;          
                          this.calendarCloneOut.emit(this.calendarClone.Id);          
                          this.calendarForNew = false; 
                          //this.ngOnChanges();         
                          this.popUpManager.showSuccessAlert(this.translate.instant('calendario.calendario_exito'));          
                          this.popUpManager.showInfoToast(this.translate.instant('calendario.clonar_calendario_fechas'));          
                        }          
                      },          
                      error => {          
                        this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));          
                      },          
                    );
                    this.popUpManager.showSuccessAlert(this.translate.instant('calendario.calendario_exito'));
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
                  },
                )                
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
  }

  uploadResolutionFile(file) {
    console.info(file);
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
    const periodConfig = new MatDialogConfig();
    periodConfig.width = '800px';
    periodConfig.height = '400px';
    const newPeriod = this.dialog.open(CrudPeriodoComponent, periodConfig);
    newPeriod.afterClosed().subscribe(() => {
        this.loadSelects()
    });
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
    const processConfig = new MatDialogConfig();
    processConfig.width = '800px';
    processConfig.height = '400px';
    processConfig.data = { calendar: this.calendar, editProcess: event.data };
    const editedProcess = this.dialog.open(ProcesoCalendarioAcademicoComponent, processConfig);
    editedProcess.afterClosed().subscribe((process: Proceso) => {
      if(process != undefined) {
        this.eventoService.get('tipo_evento/' + event.data.procesoId).subscribe(
          response => {
            const processPut = response;
            processPut["Nombre"] = process.Nombre;
            processPut["Descripcion"] = process.Descripcion;
            processPut["TipoRecurrenciaId"] = process.TipoRecurrenciaId;
            this.eventoService.put('tipo_evento', processPut).subscribe(
            response => {
                this.processTable.update(event.data, process)
                this.popUpManager.showSuccessAlert(this.translate.instant('calendario.proceso_actualizado'));
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_proceso'));
              },
            );
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_proceso'));
          },
        )
      }
    });
  }

  deleteProcess(event) {
    this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_inactivar_proceso')).then(
      willDelete => {
        if (willDelete.value) {
          this.eventoService.get('tipo_evento/' + event.data.procesoId).subscribe(
            response => {
              const processInative = response;
              processInative['Activo'] = false;
              this.eventoService.put('tipo_evento', processInative).subscribe(
                response => {
                  this.processTable.update(event.data, process)
                  this.popUpManager.showSuccessAlert(this.translate.instant('calendario.proceso_desactivado'));
                },
                error => {
                  this.popUpManager.showErrorToast(this.translate.instant('calendario.error_inactivar_proceso'));
                }
              )
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('calendario.error_inactivar_proceso'));
            }
          )
        }
      }
    )
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
            actividad.actividadId = response['Id'];
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
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '800px';
    activityConfig.height = '700px';
    activityConfig.data = { process: process, calendar: this.calendar, editActivity: event.data };
    const editedActivity = this.dialog.open(ActividadCalendarioAcademicoComponent, activityConfig);
    editedActivity.afterClosed().subscribe((activity: any) => {
      if (activity !== undefined) {
        this.eventoService.get('calendario_evento/' + event.data.actividadId).subscribe(
          response => {
            const activityPut = response;
            activityPut['Nombre'] = activity.Actividad.Nombre;
            activityPut['Descripcion'] = activity.Actividad.Descripcion;
            // activityPut['FechaInicio'] = activity.Actividad.FechaInicio;
            // activityPut['FechaFin'] = activity.Actividad.FechaFin;
            activityPut['FechaInicio'] = "2020-01-03T00:00:00Z";
            activityPut['FechaFin'] =  moment(activity.Actividad.FechaFin).format('YYYY-MM-DDTHH:mm') + ':00Z';
            this.eventoService.put('calendario_evento', activityPut).subscribe(
              response => {
                this.sgaMidService.put('crear_actividad_calendario/update', {Id: event.data.actividadId, resp: activity.responsable}).subscribe(
                  response => {
                    this.popUpManager.showSuccessAlert(this.translate.instant('calendario.actividad_actualizada'));
                    this.ngOnChanges();
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
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_actividad'));
          },
        );
      }
    });
  }

  deleteActivity(event, process: Proceso) {
    this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_inactivar_actividad')).then(
      willDelete => {
        if (willDelete.value) {
          this.eventoService.get('calendario_evento/' + event.data.actividadId).subscribe(
            response => {
              const activityInactive = response
              activityInactive['Activo'] = false;
              this.eventoService.put('calendario_evento', activityInactive).subscribe(
                response => {
                  this.popUpManager.showSuccessAlert(this.translate.instant('calendario.actividad_desactivada'));
                  this.ngOnChanges();
                },
                error => {
                  this.popUpManager.showErrorToast(this.translate.instant('calendario.error_inactivar_actividad'));
                },
              );
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('calendario.error_inactivar_actividad'));
            },
          );
        }
      }
    );
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
        console.info("prueba")
        console.info(file)
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
      error => {
        this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
      },
    );
  }

}
