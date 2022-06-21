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
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
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
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { EdicionActividadesProgramasComponent } from '../edicion-actividades-programas/edicion-actividades-programas.component';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

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
  niveles: NivelFormacion[];
  loading: boolean = false;
  editMode: boolean = false;
  uploadMode: boolean = false;

  activetab: boolean = true;
  proyectos: any[];
  projects: any[];
  Extension: boolean = false;
  calendarFormExtend: FormGroup;
  fileResolucionExt: any;
  ExtensionList: any[];
  showList: boolean = false;
  selCalendar: number;
  CalendarIdasfather: number;
  fileExtId: number;
  proyectosParticulares: any;
  processesExt: Proceso[];
  activitiesExt: Actividad[];
  processTableExt: LocalDataSource;
  Ext_Extension: boolean = false;

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
    private proyectoService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,
  ) {
    this.calendarActivity = new ActividadHija();
    this.calendarioEvento = new CalendarioEvento();
    this.processTable = new LocalDataSource();
    this.processes = [];
    this.processTableExt = new LocalDataSource();
    this.processesExt = [];
    this.loadSelects()
    this.createCalendarForm();
    this.createCalendarFormClone();
    this.createCalendarFormExtend();
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
      (response: any) => {
        const r = <any>response;
        if (response !== null && r.Data.Code == '404') {
          this.activebutton = true;
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.calendario_clon_error'));
        } else if (response !== null && r.Data.Code == '400') {
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
    this.loadCalendar();
    //this.activetab = true;
  }

  loadCalendar() {
    this.processes = [];
    this.processTable.load(this.processes);
    if (this.calendarForNew === true) {
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
      this.calendarForm.reset();
      this.fileResolucion = null;
    } else {
      this.createdCalendar = true;
      this.editMode = true;
      this.uploadMode = false;
      this.openTabs();
      this.loading = true;
      this.CalendarIdasfather = this.calendarForEditId;
      this.sgaMidService.get('calendario_academico/v2/' + this.calendarForEditId).subscribe(
        (response: any) => {
          if (response != null && response.Success) {
            const calendar = response.Data[0];
            this.calendar = new Calendario();
            this.calendar.calendarioId = parseInt(calendar['Id']);
            this.calendar.DocumentoId = calendar['resolucion']['Id'];
            this.calendar.resolucion = calendar['resolucion']['Resolucion'];
            this.calendar.anno = calendar['resolucion']['Anno'];
            this.calendar.Nivel = calendar['Nivel'];
            this.calendar.Activo = calendar['Activo'];
            this.calendar.PeriodoId = calendar['PeriodoId'];
            this.fileResolucion = calendar['resolucion']['Nombre'];
            this.projects = this.proyectos.filter(proyecto => this.filterProject(JSON.parse(calendar['DependenciaId']).proyectos,proyecto.Id));
            this.Extension = calendar['ExistenExtensiones'];
            if(this.Extension){
              this.ExtensionList = calendar['ListaExtension'];
              if (this.ExtensionList.length > 1 ) {
                this.showList = true;
              }
            }
            const processes: any[] = calendar['proceso'];
            if (processes !== null) {
              processes.forEach(element => {
                if (Object.keys(element).length !== 0) {
                  const loadedProcess: Proceso = new Proceso();
                  loadedProcess.Nombre = element['Proceso'];
                  loadedProcess.CalendarioId = { Id: this.calendar.calendarioId };
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
                        loadedActivity['DependenciaId'] = this.validJSONdeps(element['DependenciaId']);
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
              fileResolucion: '',
            });
            if(!this.Extension){
              this.calendarFormExtend.patchValue({
                Nivel: this.calendarForm.controls.Nivel.value,
                PeriodoId: this.calendarForm.controls.PeriodoId.value,
              })
              this.activetab = true;
            } else {
              this.popUpManager.showAlert(this.translate.instant('calendario.formulario_extension'),this.translate.instant('calendario.calendario_tiene_extension'))
              this.activetab = false;
              console.log(this.ExtensionList)
              this.ExtensionList.sort((a,b) => (a.Id < b.Id) ? 1 : -1 )
              this.selCalendar = this.ExtensionList[0].Id;
              this.loadExtension(this.ExtensionList[0].Id);
            }
          } else {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            this.loading = false;
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        },
      );
    }
  }

  loadExtension(IdExt: number) {
    this.loading = true;
    this.sgaMidService.get('calendario_academico/v2/' + IdExt).subscribe(
      (response: any) => {
        if (response != null && response.Success) {
          console.log("calendario extension:", response.Data)
          this.proyectosParticulares = JSON.parse(response.Data[0].DependenciaParticularId);
          this.projects = this.proyectos.filter(proyecto => this.filterProject(this.proyectosParticulares.proyectos,proyecto.Id));
          this.calendarFormExtend.patchValue({
            Nivel: response.Data[0].Nivel,
            PeriodoId: response.Data[0].PeriodoId,
            resolucion: response.Data[0].resolucionExt.Resolucion,
            anno: response.Data[0].resolucionExt.Anno,
            fileResolucion: "",
            selProyectos: this.proyectosParticulares.proyectos,
          })
          this.fileExtId = response.Data[0].resolucionExt.Id;

          this.processesExt = [];
          this.activitiesExt = [];
          const calendarExt = response.Data[0];
          const processes: any[] = calendarExt['proceso'];
          if (processes !== null) {
            processes.forEach(element => {
              if (Object.keys(element).length !== 0) {
                const loadedProcess: Proceso = new Proceso();
                loadedProcess.Nombre = element['Proceso'];
                loadedProcess.CalendarioId = { Id: parseInt(calendarExt['Id']) };
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
                      loadedActivity['DependenciaId'] = this.validJSONdeps(element['DependenciaId']);
                      loadedProcess.procesoId = element['TipoEventoId']['Id'];
                      loadedProcess.Descripcion = element['TipoEventoId']['Descripcion'];
                      loadedProcess.TipoRecurrenciaId = { Id: element['TipoEventoId']['TipoRecurrenciaId']['Id'] };
                      loadedProcess.actividades.push(loadedActivity);
                    }
                  });
                  this.processesExt.push(loadedProcess);
                }
              }
            });
            this.processTableExt.load(this.processesExt);
            if (!<boolean>response.Data[0].Activo) {
              this.popUpManager.showAlert(this.translate.instant('calendario.formulario_extension'),this.translate.instant('calendario.extension_inactiva'))
            }
          } else {
            this.loading = false;
          }
          this.loading = false;
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }

  createCalendarForm() {
    this.calendarForm = this.builder.group({
      resolucion: ['', Validators.required],
      anno: new FormControl('', { validators: [Validators.required, Validators.maxLength(4), Validators.pattern('^[0-9]*$')] }),
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

  createCalendarFormExtend() {
    this.calendarFormExtend = this.builder.group({
      resolucion: ['', Validators.required],
      anno: new FormControl('', { validators: [Validators.required, Validators.maxLength(4), Validators.pattern('^[0-9]*$')] }),
      PeriodoId: ['', Validators.required],
      Nivel: ['', Validators.required],
      fileResolucion: ['', Validators.required],
      selProyectos: ['', Validators.required],
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

    this.proyectoService.get('nivel_formacion?limit=0').subscribe(
      (response: NivelFormacion[]) => {
        this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null)
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );

    this.proyectoService.get('proyecto_academico_institucion?fields=Id,Nombre&limit=0').subscribe(
      res => {
        this.proyectos = <any[]>res;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
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
        addButtonContent:
          '<i class="nb-plus" title="' +
          this.translate.instant('calendario.tooltip_crear_proceso') +
          '"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('calendario.tooltip_editar_proceso') + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('calendario.tooltip_eliminar_proceso') + '"></i>',
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
            name: 'delete',
            title: '<i class="nb-trash" title="' +
                this.translate.instant('calendario.tooltip_eliminar_actividad') +
                '" ></i>',
          },
          {
            name: 'select',
            title: '<i class="nb-checkmark" title="' +
                this.translate.instant('calendario.tooltip_seleccionar_proyectos') +
                '"></i>',
          },
          {
            name: 'view',
            title: '<i class="nb-search" title="' +
                this.translate.instant('calendario.tooltip_detalle_actividad') +
                '"></i>',
          },
        ],
      },
      add: {
        addButtonContent:
          '<i class="nb-plus" title="' +
          this.translate.instant('calendario.tooltip_crear_actividad') +
          '"></i>',
      },
      /* edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('calendario.tooltip_editar_actividad') + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('calendario.tooltip_eliminar_actividad') + '"></i>',
      }, */
      noDataMessage: this.translate.instant('calendario.sin_actividades'),
    };
  }

  onAction(event, process) {
    switch (event.action) {
      case 'edit':
        this.editActivity(event, process);
        break;
      case 'delete':
        this.deleteActivity(event, process);
        break;
      case 'select':
        this.selectDependencias(event, process);
        break;
      case 'view':
        this.viewActivities(event, process)
        break;
    }
  }

  selectDependencias(event, process){
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '600px';
    activityConfig.height = '370px';
    activityConfig.data = { calendar: this.calendar, activity: event.data, dependencias: this.projects, vista: "select" };
    console.log(activityConfig)
    const newActivity = this.dialog.open(EdicionActividadesProgramasComponent, activityConfig);
    newActivity.afterClosed().subscribe((DepsEdit: any) => {
      console.log(DepsEdit)
      if (DepsEdit != undefined) {
        this.eventoService.get('calendario_evento/' + event.data.actividadId).subscribe(
          respGet => {
            respGet.DependenciaId = JSON.stringify(DepsEdit.UpdateDependencias)
            this.eventoService.put('calendario_evento', respGet).subscribe(
              respPut => {
                console.log(respPut)
                this.popUpManager.showSuccessAlert(this.translate.instant('calendario.actividad_actualizada'));
                this.loadCalendar();
              }, error => {
                this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_actividad'));
              }
            )
          }, error => {
            this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_actividad'));
          }
        )
      }
    });
  }

  viewActivities(event, process){
    const activityConfig = new MatDialogConfig();
    activityConfig.width = '800px';
    activityConfig.height = '500px';
    activityConfig.data = { activity: event.data, projects: this.projects, vista: "view" };
    const newActivity = this.dialog.open(EdicionActividadesProgramasComponent, activityConfig);
    newActivity.afterClosed().subscribe((activity: any) => {

    });
  }

  createCalendar(event) {
    event.preventDefault();
    if (this.calendarForNew === false) {
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
                    this.uploadResolutionFile(this.fileResolucion).then(
                      fileID => {
                        this.calendar.DocumentoId = fileID;
                        this.calendar.DependenciaId = '{}';
                        this.calendar.Activo = true;
                        this.calendar.Nombre = this.translate.instant('calendario.calendario_academico') + ' ';
                        this.calendar.Nombre += this.periodos.filter(periodo => periodo.Id === this.calendar.PeriodoId)[0].Nombre;
                        this.calendar.Nombre += ' ' + this.niveles.filter(nivel => nivel.Id === this.calendar.Nivel)[0].Nombre;
                        this.calendar['DependenciaParticularId'] = '{}';
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
                },
              );
            } else {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.no_documento'));
            }
          }
        });

    } else {
      this.activebutton = true;
      this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_registrar_calendario'))
        .then(ok => {
          if (ok.value) {
            this.loading = true;
            if (this.fileResolucion) {
              this.calendar = this.calendarForm.value;
              this.uploadResolutionFile(this.fileResolucion).then(
                fileID => {
                  this.calendar.DocumentoId = fileID;
                  this.calendar.DependenciaId = '{}';
                  this.calendar.Activo = true;
                  this.calendar.Nombre = this.translate.instant('calendario.calendario_academico') + ' ';
                  this.calendar.Nombre += this.periodos.filter(periodo => periodo.Id === this.calendar.PeriodoId)[0].Nombre;
                  this.calendar.Nombre += ' ' + this.niveles.filter(nivel => nivel.Id === this.calendar.Nivel)[0].Nombre;
                  this.calendar.AplicacionId = 0;
                  this.calendar.FechaCreacion = momentTimezone.tz(this.calendar.FechaCreacion, 'America/Bogota').format('YYYY-MM-DD HH:mm');
                  this.calendar.FechaModificacion = momentTimezone.tz(this.calendar.FechaModificacion, 'America/Bogota').format('YYYY-MM-DD HH:mm');
                  this.calendar.CalendarioPadreId = { Id: this.calendarForEditId };
                  this.sgaMidService.post('calendario_academico/calendario_padre', this.calendar).subscribe(
                    response => {
                      this.calendar.calendarioId = response['Id'];
                      this.clonarPadre()
                      this.loading = false;
                    },
                    error => {
                      this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
                    },
                  )
                  this.loading = false;
                },
              ).catch(error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
              });

            } else {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.no_documento'));
            }
          }
        });
    }
  }

  clonarPadre() {
    this.loading = true;
    this.calendarClone = new CalendarioClone();
    this.calendarClone.Id = this.calendar.calendarioId;
    this.calendarClone.Nivel = this.calendar.Nivel;
    this.calendarClone.PeriodoId = this.calendar.PeriodoId;
    this.calendarClone.IdPadre = { Id: this.calendarForEditId };

    this.sgaMidService.post('clonar_calendario/calendario_padre', this.calendarClone).subscribe(
      (response: any) => {
        if (response != null && response.Response.Code == '404') {
          this.activebutton = true;
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.calendario_clon_error'));
        } else if (response != null && response.Response.Code == '400') {
          this.activebutton = true;
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.calendario_clon_error'));
        } else {
          this.calendarClone.Id = response.Response.Body[1].Id;
          this.activebutton = false;
          this.activetabsClone = false;
          this.activetabs = true;
          this.calendarForNew = false;
          this.calendarCloneOut.emit(this.calendarClone.Id);
          this.popUpManager.showSuccessAlert(this.translate.instant('calendario.calendario_exito'));
          this.popUpManager.showInfoToast(this.translate.instant('calendario.clonar_calendario_fechas'));
        }
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
      },
    );
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
          async (response) => {
            process.procesoId = response['Id'];
            process.actividades = [];
            this.processes.push(process);
            this.addActivity(null, process);
            this.processTable.load(this.processes);
            await this.popUpManager.showSuccessAlert(this.translate.instant('calendario.proceso_exito'))
            await this.popUpManager.showAlert(this.translate.instant('calendario.tooltip_crear_actividad'),
              this.translate.instant('calendario.crear_actividad_proceso'))
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
      if (process != undefined) {
        this.eventoService.get('tipo_evento/' + event.data.procesoId).subscribe(
          response => {
            const processPut = response;
            processPut['Nombre'] = process.Nombre;
            processPut['Descripcion'] = process.Descripcion;
            processPut['TipoRecurrenciaId'] = process.TipoRecurrenciaId;
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
                },
              )
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('calendario.error_inactivar_proceso'));
            },
          )
        }
      },
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
            let actividad: Actividad = new Actividad();
            actividad = activity.Actividad;
            actividad.actividadId = response['Id'];
            actividad.responsables = activity.responsable;
            actividad.FechaInicio = moment(actividad.FechaInicio, 'YYYY-MM-DD').format('DD-MM-YYYY');
            actividad.FechaFin = moment(actividad.FechaFin, 'YYYY-MM-DD').format('DD-MM-YYYY');
            this.processes.filter((proc: Proceso) => proc.procesoId === process.procesoId)[0].actividades.push(actividad);
            if (event) {
              event.source.load(process.actividades);
            } else {
              console.log('Esperemos haber cómo lo resolvemos ! ');
              this.loadCalendar();
            }
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
            activityPut['FechaInicio'] = activity.Actividad.FechaInicio;
            activityPut['FechaFin'] = activity.Actividad.FechaFin;
            this.eventoService.put('calendario_evento', activityPut).subscribe(
              response => {
                this.sgaMidService.put('crear_actividad_calendario/update', { Id: event.data.actividadId, resp: activity.responsable }).subscribe(
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
      },
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
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_cargar_documento'));
        },
      );
  }

  changeTab(event){
    if(event.tabTitle == "Extensión Calendario"){
      this.activetab = false;
    } else {
      this.activetab = true;
    }
  }

  filterProject(DepIds: any, DepInfo: any){
    let found = false;
    if (DepIds != undefined){
    for (let i = 0; i < DepIds.length; i++){
        if(DepIds[i] == DepInfo){
            found = true
        }
    }
  }
    return found
  }

  extendCalendar(event){
    event.preventDefault();
    console.log("extend calendar")
    console.log(this.calendarFormExtend)
    var files = [];
    files.push({
      nombre: "Extension_Calendario", 
      key: 'Documento', 
      resolucion: this.calendarFormExtend.value.resolucion, 
      anno: this.calendarFormExtend.value.anno,
      file: this.fileResolucionExt,
      IdDocumento: 14,
    });
    console.log(files)
    this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_extension'),
    this.translate.instant('calendario.formulario_extension')).then(accion => {
      if(accion.value){
        this.loading = true;
        console.log("ok enviar...")
        this.newNuxeoService.uploadFiles(files).subscribe(
          (responseNux: any[]) => {
            console.log("nuxeo resp:", responseNux)
            if(responseNux[0].Status == "200"){
              this.popUpManager.showInfoToast(this.translate.instant('calendario.archivo_extension_saved'));
              var bodyPost = {
                CalendarioPadre: this.CalendarIdasfather,
                DocumentoExtensionId: responseNux[0].res.Id,
                Dependencias: JSON.stringify({proyectos: this.calendarFormExtend.controls.selProyectos.value})
              };
              this.sgaMidService.post('clonar_calendario/calendario_extension',bodyPost).subscribe(
                (resp) => {
                  console.log(resp)
                  if (resp.Status == "200"){
                    if(this.Ext_Extension){
                      console.log("deshabilit ext org..")
                    this.sgaMidService.put('calendario_academico/inhabilitar_calendario/' + this.selCalendar, JSON.stringify({ 'id': this.selCalendar })).subscribe(
                      (response: any) => {
                        if (JSON.stringify(response) != '200') {
                          this.popUpManager.showErrorToast(this.translate.instant('calendario.calendario_no_inhabilitado'));
                        } else {
                          this.popUpManager.showInfoToast(this.translate.instant('calendario.calendario_inhabilitado'));
                        }
                      },
                      error => {
                        this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
                      },
                    );
                    }
                    this.loading = false;
                    this.popUpManager.showSuccessAlert(this.translate.instant('calendario.Extension_calendario_ok'));
                    this.Extension = true;
                    this.loadCalendar();
                    /////////////
                  } else {
                    this.loading = false;
                    this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
                  }

                }, (error) => {
                  console.log("error clone extend: ", error)
                  this.loading = false;
                  this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
                }
              );
            } else {
              console.log("eeror nuxeo")
              this.loading = false;
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            }
          }, (errorNux) => {
            console.log("new nuxeo error:", errorNux)
            this.loading = false;
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          }
        );
      }
    });
  }

  prepareNewExtension(){
    console.log("this new extension")
    this.calendarFormExtend.patchValue({
      resolucion: '',
      anno: '',
      fileResolucion: '',
      selProyectos: [],
    });
    this.Extension = false;
    this.Ext_Extension = true;
  }

  async onInputFileResolucionExt(event) {
    if (this.calendarFormExtend.get('resolucion').valid && this.calendarFormExtend.get('anno').valid) {
      if (event.target.files.length > 0 && event.target.files[0].type === 'application/pdf') {
            this.fileResolucionExt = event.target.files[0];
      } else {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.formato_documento_pdf'));
        this.calendarFormExtend.patchValue({
          fileResolucion: '',
        })
      }
    } else {
      this.popUpManager.showErrorToast(this.translate.instant('calendario.error_pre_file'));
      this.calendarFormExtend.patchValue({
        fileResolucion: '',
      })
    }
  }

  downloadFileExt(id_documento: any) {

    console.log(id_documento)
    this.newNuxeoService.get([{Id: id_documento}]).subscribe(
      response => {
        const filesResponse = <any>response;
        const url = filesResponse[0].url;
        window.open(url);
    }
    )
  }

  validJSONdeps(DepIds: string) {
    if (DepIds == "") {
      DepIds = "{\"proyectos\":[],\"fechas\":[]}"
    }
    let jsoncheck = JSON.parse(DepIds);
    if(!jsoncheck.hasOwnProperty("proyectos")){
      jsoncheck['proyectos'] = [];
    }
    if(!jsoncheck.hasOwnProperty("fechas")){
      jsoncheck['fechas'] = [];
    } else {
      jsoncheck.fechas.forEach(f=>{
        if(!f.hasOwnProperty("Activo")){
            f['Activo'] = true;
        }
        if(!f.hasOwnProperty("Modificacion")){
            f['Modificacion'] = "";
        }
        if(!f.hasOwnProperty("Fin")){
            f['Fin'] = "";
        }
        if(!f.hasOwnProperty("Inicio")){
            f['Inicio'] = "";
        }
        if(!f.hasOwnProperty("Id")){
          f['Id'] = "";
        }
    });
    }
    return jsoncheck;
  }
}
