import { TipoEvento } from './../../../@core/data/models/evento/tipo_evento';
import { RolEncargadoEvento } from './../../../@core/data/models/evento/rol_encargado_evento';
import { UserService } from '../../../@core/data/users.service';
import { PersonaService } from '../../../@core/data/persona.service';
import { CalendarioEventoPost, CalendarioEventoPut, CalendarioEvento } from './../../../@core/data/models/evento/calendario_evento';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EventoService } from '../../../@core/data/evento.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { TercerosService} from '../../../@core/data/terceros.service';
import { OikosService } from '../../../@core/data/oikos.service';
import { CoreService } from '../../../@core/data/core.service';
// import { FORM_evento } from './form-evento';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';
import { Persona } from '../../../@core/data/models/persona';
// import { p } from '@angular/core/src/render3';
import * as moment from 'moment';
import { LocalDataSource } from 'ng2-smart-table';
import * as momentTimezone from 'moment-timezone';

@Component({
  selector: 'ngx-crud-evento',
  templateUrl: './crud-evento.component.html',
  styleUrls: ['./crud-evento.component.scss'],
})
export class CrudEventoComponent implements OnInit {

  calendario_evento_selected: any;
  info_calendario_evento: CalendarioEventoPost;

  config: ToasterConfig;
  source: LocalDataSource = new LocalDataSource();
  persona_seleccionada: Persona;
  agregando_encargado: boolean = false;
  tipo_dependencias: any[];
  dependencias: any[];
  dependencias_filtered: any[];
  tipo_eventos: any[];
  info_inscripcion: any;
  usuariowso2: any;
  tipo_eventos_filtered: any[];
  eventos: CalendarioEvento[];
  periodos: any[];
  settings_publico: any;
  settings_encargados: any;
  personas: Persona[];
  roles: RolEncargadoEvento[];
  editando: boolean;
  encargados_borrados: any[];
  publicos_borrados: any[];

  dpDayPickerConfigInicio: any = {
    locale: 'es',
    format: 'YYYY-MM-DD HH:mm',
    showTwentyFourHours: false,
    showSeconds: false,
    returnedValueType: 'String',
  }

  dpDayPickerConfigFin: any = {
    locale: 'es',
    format: 'YYYY-MM-DD HH:mm',
    showTwentyFourHours: false,
    showSeconds: false,
    returnedValueType: 'String',
  }

  @Input('calendario_evento_selected')
  set name(calendario_evento_selected: CalendarioEventoPost) {
    this.calendario_evento_selected = calendario_evento_selected;
    this.loadEvento();
  }

  @Output() eventChange = new EventEmitter();

  constructor(private translate: TranslateService,
    private coreService: CoreService,
    private eventoService: EventoService,
    private terceroService: TercerosService,
    private oikosService: OikosService,
    private user: UserService,
    private personaService: PersonaService,
    private toasterService: ToasterService,
    private campusMidService: CampusMidService,
    ) {
    this.info_calendario_evento = {
      Evento: new CalendarioEvento(),
      EncargadosEvento: [],
      TiposPublico: [],
      Dependencia: undefined,
      TipoDependencia: undefined,
      TipoEvento: undefined,
      EventoPadre: undefined,
    }
    this.editando = false;
    this.loadOptions();
    this.settings_publico = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      actions: {
        position: 'right',
      },
      columns: {
        Nombre: {
          title: this.translate.instant('evento.nombre_publico'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '90%',
        },
      },
    };
    this.settings_encargados = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      actions: {
        edit: false,
        position: 'right',
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('evento.nombre_encargado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '60%',
        },
        RolEncargadoEventoId: {
          title: this.translate.instant('evento.rol_encargado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          width: '30%',
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public loadEvento(): void {
    if (this.calendario_evento_selected !== undefined ) {
      this.editando = true;
      // this.info_calendario_evento = JSON.parse(JSON.stringify(this.calendario_evento_selected));
      this.calendario_evento_selected = JSON.parse(JSON.stringify(this.calendario_evento_selected));
      /*
      if (!this.calendario_evento_selected.CalendarioEvento.EventoPadreId) {
        this.calendario_evento_selected.CalendarioEvento.EventoPadreId = 0;
      }
      */
      this.info_calendario_evento = {
        Evento: this.calendario_evento_selected.CalendarioEvento,
        EncargadosEvento: this.calendario_evento_selected.EncargadosEvento,
        TiposPublico: this.calendario_evento_selected.TiposPublico,
        Dependencia: this.calendario_evento_selected.CalendarioEvento.DependenciaId.Id,
        TipoDependencia: this.calendario_evento_selected.CalendarioEvento.TipoDependenciaId.Id,
        TipoEvento: this.calendario_evento_selected.CalendarioEvento.TipoEventoId.Id,
        EventoPadre: (this.calendario_evento_selected.CalendarioEvento.EventoPadreId) ?
          this.calendario_evento_selected.CalendarioEvento.EventoPadreId.Id : undefined,
      }
      this.info_calendario_evento.Evento.FechaFin = momentTimezone.tz(this.info_calendario_evento.Evento.FechaFin, 'America/Bogota')
        .format('YYYY-MM-DD HH:mm');
      this.info_calendario_evento.Evento.FechaInicio = momentTimezone.tz(this.info_calendario_evento.Evento.FechaInicio, 'America/Bogota')
        .format('YYYY-MM-DD HH:mm');
      this.source.load(this.info_calendario_evento.EncargadosEvento);
      this.encargados_borrados = [];
      this.publicos_borrados = [];
    } else  {
      this.editando = false;
      this.calendario_evento_selected = undefined;
      this.info_calendario_evento = {
        Evento: new CalendarioEvento(),
        EncargadosEvento: [],
        TiposPublico: [],
        Dependencia: undefined,
        TipoDependencia: undefined,
        TipoEvento: undefined,
        EventoPadre: undefined,
      }
      // this.info_calendario_evento.Evento.EventoPadreId = new CalendarioEvento();
      // this.info_calendario_evento.Evento.EventoPadreId.Id = undefined;
      this.loadUserData();
    }
  }

  initInfo() {
    this.info_calendario_evento = {
      Evento: new CalendarioEvento(),
      EncargadosEvento: [],
      TiposPublico: [],
      Dependencia: undefined,
      TipoDependencia: undefined,
      TipoEvento: undefined,
      EventoPadre: undefined,
    }
  }

  ngOnInit() {
    // this.loadEvento();
  }

  loadOptions(): void {
    console.info('Entro a options'),
    this.loadRoles()
    .then(() => {
      Promise.all([
        this.loadUserData(),
        this.loadTipoDependencias(),
        this.loadDependencias(),
        this.loadTipoEventos(),
        this.loadPeriodos(),
        this.loadEventos(),
        this.loadPersonas(),
        this.loadRoles(),
      ]).
        then(() => {

        })
        .catch(error => {
          if (!error.status) {
            error.status = 409;
          }
          Swal({
             type: 'error',
             title: error.status + '',
             text: this.translate.instant('ERROR.' + error.status),
             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
           });
        });
    })
    .catch(error => {
      if (!error.status) {
        error.status = 409;
      }
      Swal({
         type: 'error',
         title: error.status + '',
         text: this.translate.instant('ERROR.' + error.status),
         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
       });
    });
  }

  loadUserData(): Promise<any> {
    this.usuariowso2 = JSON.parse(atob((localStorage.getItem('id_token').split('.'))[1])).sub,
    this.info_calendario_evento.EncargadosEvento = [];
    this.source.load(this.info_calendario_evento.EncargadosEvento);
    console.info('Persona')
    console.info(this.usuariowso2)

    return new Promise((resolve, reject) => {

    this.terceroService.get('tercero/?query=UsuarioWSO2:' + String(this.usuariowso2))
    .subscribe(res => {
      console.info('Datos terceros')
      console.info(res)
      this.info_inscripcion = <any>res[0];
      // if (res !== null  && this.info_inscripcion.Type !== 'error') {
          if (Object.keys(res[0]).length > 0) {
            const userData = <Persona>res[0];
            userData['PuedeBorrar'] = false;
            userData['Nombre'] = this.info_inscripcion.NombreCompleto;
            this.persona_seleccionada = JSON.parse(JSON.stringify(userData));
            this.agregarEncargado(false, 1);
            this.persona_seleccionada = undefined;
            resolve(true);
          } else {
            reject({status: 404});
          }
    },
    (error: HttpErrorResponse) => {
        reject(error);
      });
    });
  }

  getPersonFullName(p: Persona): string {
    return p.PrimerNombre + ' ' + p.SegundoNombre + ' ' + p.PrimerApellido + ' ' + p.SegundoApellido;
  }

  agregarEncargado(mostrarError: boolean, rolEncargado: number): void {
    if (this.info_calendario_evento.EncargadosEvento.find( encargado => encargado.EncargadoId === this.persona_seleccionada.Id) ) {
      if (mostrarError) {
        Swal({
          type: 'error',
          title: 'ERROR',
          text: this.translate.instant('evento.error_encargado_ya_existe'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      }
    } else {
      this.info_calendario_evento.EncargadosEvento.push({
        Nombre: this.persona_seleccionada.Nombre,
        EncargadoId: this.persona_seleccionada.Id,
        Id: 0,
        Activo: true,
        CalendarioEventoId: undefined,
        // RolEncargadoEventoId: undefined,
        RolEncargadoEventoId: this.roles.filter(rol => rol.Id === rolEncargado)[0],
      });
      this.persona_seleccionada = undefined;
      this.agregando_encargado = false;
      this.source.load(this.info_calendario_evento.EncargadosEvento);
    }
  }

  onCreateEncargado(event): void {
    this.agregando_encargado = !this.agregando_encargado;
  }

  onDeleteEncargado(event): void {
    if (event.data.Id !== 0 && this.editando) {
      this.encargados_borrados.push(event.data);
    }
    this.info_calendario_evento.EncargadosEvento.splice(this.info_calendario_evento.EncargadosEvento.indexOf(event.data), 1);
    this.source.load(this.info_calendario_evento.EncargadosEvento);
  }

  deleteTiposPublico(event): void {
    if (this.editando) {
      this.publicos_borrados.push(event.data);
    }
    event.confirm.resolve(event.source.data);
  }

  loadPersonas(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.personaService.get('tercero?query=TipoContribuyenteId:1&limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.personas = <Array<Persona>>res;

            resolve(true);
          } else {
            this.personas = [];
            reject({status: 404});
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  loadTipoDependencias(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.oikosService.get('tipo_dependencia/?limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.tipo_dependencias = <Array<any>>res;
            console.info(this.tipo_dependencias)
            resolve(true);
          } else {
            this.tipo_dependencias = [];
            reject({status: 404});
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  loadDependencias(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_tipo_dependencia/?limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.dependencias = (<Array<any>>res).map((dependencia: any) => {
              return {
                Id: dependencia.DependenciaId.Id,
                Nombre: dependencia.DependenciaId.Nombre,
                TipoDependencia: dependencia.TipoDependenciaId.Id,
              };
            });
            this.dependencias_filtered = this.dependencias;
            resolve(true);
          } else {
            this.dependencias = [];
            reject({status: 404});
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  loadTipoEventos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.eventoService.get('tipo_evento/?query=Activo:true&limit=0')
        .subscribe(res => {
          // if (res !== null) {
            console.info(res)
          if (Object.keys(res[0]).length > 0) {
            this.tipo_eventos = <Array<TipoEvento>>res;
            this.tipo_eventos_filtered = <Array<TipoEvento>>res;
            resolve(true);
          } else {
            this.tipo_eventos = [];
            reject({status: 404});
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  filterDependencias(tipoDependencia: number) {
    this.info_calendario_evento.Dependencia = undefined;
    this.info_calendario_evento.TipoEvento = undefined;
    this.dependencias_filtered = this.dependencias.filter(dependencia => dependencia.TipoDependencia === tipoDependencia);
  }

  filterTipoEventos(dependencia: number) {
    this.info_calendario_evento.Evento.TipoEventoId = undefined;
    this.info_calendario_evento.TipoEvento = undefined;
    this.tipo_eventos_filtered = this.tipo_eventos.filter(tipo_evento => tipo_evento.DependenciaId === dependencia);
    console.info('Ojoooo')
    console.info(this.tipo_eventos_filtered)
  }

  loadEventos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.eventoService.get('calendario_evento/?query=Activo:true&limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.eventos = <Array<CalendarioEvento>>res;
            resolve(true);
          } else {
            this.eventos = [];
            resolve(true);
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  loadRoles(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.eventoService.get('rol_encargado_evento/?limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.roles = <Array<RolEncargadoEvento>>res;
            resolve(true);
          } else {
            this.roles = [];
            reject({status: 404});
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  loadPeriodos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.coreService.get('periodo/?limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.periodos = <Array<any>>res;
            resolve(true);
          } else {
            // this.periodos = [{Id: 1, Ano: 2018, Periodo: 1}, {Id: 2, Ano: 2018, Periodo: 2}];
            // resolve(true);
            this.periodos = [];
            reject({status: 404});
          }
        }, (error: HttpErrorResponse) => {
          // this.periodos = [{Id: 1, Ano: 2018, Periodo: 1}, {Id: 2, Ano: 2018, Periodo: 2}];
          // resolve(true);
          // reject(error);
        });
    });
  }

  guardarEvento() {
    if ( this.calendario_evento_selected === undefined ) {
      this.createEvento(this.info_calendario_evento);
    } else {
      this.updateEvento(this.info_calendario_evento);
    }
  }

  createEvento(calendarioEventoPost: CalendarioEventoPost): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('evento.seguro_continuar_registrar_evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willCreate) => {
      if (willCreate.value) {
        this.info_calendario_evento = <CalendarioEventoPost>calendarioEventoPost;
        this.info_calendario_evento.Evento.TipoEventoId = new TipoEvento();
        this.info_calendario_evento.Evento.TipoEventoId.Id =  this.info_calendario_evento.TipoEvento;
        this.info_calendario_evento.Evento.FechaInicio = moment(this.info_calendario_evento.Evento.FechaInicio).toDate();
        this.info_calendario_evento.Evento.FechaFin = moment(this.info_calendario_evento.Evento.FechaFin).toDate();
        // Evento padre
        if (this.info_calendario_evento.EventoPadre) {
          this.info_calendario_evento.Evento.EventoPadreId = new CalendarioEvento();
          this.info_calendario_evento.Evento.EventoPadreId.Id = this.info_calendario_evento.EventoPadre;
        }
        /*
        if (this.info_calendario_evento.Evento.EventoPadreId.Id === undefined || this.info_calendario_evento.Evento.EventoPadreId.Id === 0) {
          this.info_calendario_evento.Evento.EventoPadreId = undefined;
        }
        */
        this.campusMidService.post('evento', this.info_calendario_evento)
        .subscribe((res: any) => {
          if (res.Type === 'error') {
            Swal({
              type: 'error',
              title: res.Code,
              text: this.translate.instant('ERROR.' + res.Code),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
            this.showToast('error', 'error', this.translate.instant('evento.evento_no_creado'));
          } else {
            // this.info_calendario_evento = <CalendarioEventoPost>res.Body[1];
            this.initInfo();
            this.loadEventos();
            this.eventChange.emit(true);
            this.showToast('success', this.translate.instant('GLOBAL.crear'), this.translate.instant('evento.evento_creado'));
          }
        });
      }
    });
  }

  updateEvento(calendarioEventoPost: CalendarioEventoPost): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('evento.seguro_continuar_actualizar_evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_calendario_evento = <CalendarioEventoPost>calendarioEventoPost;
        this.info_calendario_evento.Evento.FechaInicio = moment(this.info_calendario_evento.Evento.FechaInicio).toDate();
        this.info_calendario_evento.Evento.FechaFin = moment(this.info_calendario_evento.Evento.FechaFin).toDate();
        /*
        if (this.info_calendario_evento.Evento.EventoPadreId.Id === undefined || this.info_calendario_evento.Evento.EventoPadreId.Id === 0) {
          this.info_calendario_evento.Evento.EventoPadreId = undefined;
        }
        */
        const info_calendario_evento_put: CalendarioEventoPut = {
          Evento: this.info_calendario_evento.Evento,
          EncargadosEvento: this.info_calendario_evento.EncargadosEvento,
          TiposPublico: this.info_calendario_evento.TiposPublico,
          EncargadosEventoBorrados: this.encargados_borrados,
          TiposPublicoBorrados: this.publicos_borrados,
        }
        this.campusMidService.put('evento/' + this.info_calendario_evento.Evento.Id, info_calendario_evento_put)
        .subscribe((res: any) => {
          if (res.Type === 'error') {
            Swal({
              type: 'error',
              title: res.Code,
              text: this.translate.instant('ERROR.' + res.Code),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
            this.showToast('error', 'Error', this.translate.instant('evento.evento_no_actualizado'));
          } else {
            // this.info_calendario_evento = <CalendarioEventoPost>res.Body[1];
            this.initInfo();
            this.eventChange.emit(true);
            this.showToast('success', this.translate.instant('GLOBAL.actualizar'), this.translate.instant('evento.evento_actualizado'));
          }
        });
      }
    });
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
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
