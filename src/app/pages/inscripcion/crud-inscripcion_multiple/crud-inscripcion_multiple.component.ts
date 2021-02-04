import { Inscripcion } from './../../../@core/data/models/inscripcion/inscripcion';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { InstitucionEnfasis } from '../../../@core/data/models/proyecto_academico/institucion_enfasis';
import { InfoPersona } from '../../../@core/data/models/informacion/info_persona';
import { ReciboPago } from '../../../@core/data/models/inscripcion/recibo_pago';
import { MatSelect } from '@angular/material';
import { LocalDataSource } from 'ng2-smart-table';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { EventoService } from '../../../@core/data/evento.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { ButtonPaymentComponent } from '../../../@theme/components/button-payment/button-payment.component';
import { LinkDownloadComponent } from '../../../@theme/components/link-download/link-download.component';
import { from } from 'rxjs';
import moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { load } from '@angular/core/src/render3';

@Component({
  selector: 'ngx-crud-inscripcion-multiple',
  templateUrl: './crud-inscripcion_multiple.component.html',
  styleUrls: ['./crud-inscripcion_multiple.component.scss'],
  providers: [EventoService],
})
export class CrudInscripcionMultipleComponent implements OnInit {

  info_persona_id: number;
  persona_id: number;
  inscripcion_id: number;
  dataSource: LocalDataSource;
  data: any[] = [];
  settings: any;

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
    }
  }

  @Input('info_persona_id')
  set persona(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
    this.loadInfoPersona();
  }

  @Output() eventChange = new EventEmitter();
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_info_persona: InfoPersona;
  recibo_pago: ReciboPago;
  regInfoPersona: any;
  info_inscripcion: any;
  clean: boolean;
  loading: boolean;
  percentage: number;
  aceptaTerminos: boolean;
  showProyectoCurricular: boolean;
  showTipoInscripcion: boolean;
  showInfo: boolean;
  showNew: boolean;
  showInscription: boolean;
  programa: number;
  aspirante: number;
  periodo: any;
  periodos = [];
  selectednivel: any;
  tipo_inscripciones = [];
  proyectos_preinscripcion: any[];
  proyectos_preinscripcion_post: any;
  nivel_load = [{ nombre: 'Pregrado', id: 14 }, { nombre: 'Posgrado', id: 15 }];
  selectedLevel: any;
  selectedProject: any;
  tipo_inscripcion_selected: any;
  projects: any[];
  countInscripcion: number = 0;
  cont: number = 0;
  inscripcionProjects: any[];
  calendarioId: string = '0';
  projectId: number = 0;
  parametro: string;
  recibo_generado: any;
  recibos_pendientes: number;

  arr_proyecto: InstitucionEnfasis[] = [];
  source_emphasys: LocalDataSource = new LocalDataSource();
  proyectos = [];

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);

  constructor(
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private eventoService: EventoService) {
    // this.cargaproyectosacademicos();
    this.showProyectoCurricular = false;
    this.showTipoInscripcion = false;
    this.showInfo = false;
    this.showNew = false;
    this.showInscription = true;
    this.cargarPeriodo();
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
    sessionStorage.setItem('EstadoInscripcion', 'false'); 
    this.persona_id = this.userService.getPersonaId();
    this.loadInfoInscripcion();
    this.createTable();
    
  }

  return(){
    this.showInscription = true;
    sessionStorage.setItem('EstadoInscripcion', 'false');
    this.loadInfoInscripcion();
    this.createTable();
  }

  public loadInfoPersona(): void {
    this.loading = true;
    if (this.info_persona_id !== undefined && this.info_persona_id !== 0 &&
      this.info_persona_id.toString() !== '' && this.info_persona_id.toString() !== '0') {
      this.sgaMidService.get('persona/consultar_persona/' + this.info_persona_id)
        .subscribe(res => {
          if (res !== null) {
            const temp = <InfoPersona>res;
            this.info_info_persona = temp;
            const files = []
          }
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_persona'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.info_info_persona = undefined
      this.clean = !this.clean;
      this.loading = false;
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  createTable() {
    this.settings = {
      actions: false, 
      columns: {
        ReciboInscripcion: {
          title: this.translate.instant('inscripcion.numero_recibo'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Id: {
          title: this.translate.instant('inscripcion.inscripcion'),
          editable: false,
          width: '10%',
          filter: false,
        },
        ProgramaAcademicoId: {
          title: this.translate.instant('inscripcion.programa'),
          width: '30%',
          editable: false,
          filter: false,
        },
        FechaCreacion: {
          title: this.translate.instant('inscripcion.fecha_generacion'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Estado: {
          title: this.translate.instant('inscripcion.estado'),
          width: '10%',
          editable: false,
          filter: false,
          position: 'center',
        },
        Descarga: {
          title: this.translate.instant('inscripcion.descargar'),
          width: '12%',
          editable: false,
          filter: false,
          renderComponent: LinkDownloadComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => this.descargarReciboPago(data))
          }
        },
        Opcion: {
          title: this.translate.instant('inscripcion.opcion'),
          width: '13%',
          editable: false,
          filter: false,
          type: 'custom',
          renderComponent: ButtonPaymentComponent,
          onComponentInitFunction: (instance) => {
            instance.save.subscribe(data => {
              sessionStorage.setItem('EstadoInscripcion', data);     
            });
          }       
        },
      },
      mode: 'external',
    }
    //console.info(this.settings.columns)  
  }

  loadInscriptionModule(){
    this.showInscription = false;
  }

  itemSelect(event): void {
    sessionStorage.setItem('IdInscripcion', event.data.Id);
    sessionStorage.setItem('ProgramaAcademico', event.data.ProgramaAcademicoId);
    this.inscripcionService.get('inscripcion/'+event.data.Id).subscribe(
      (response: any) => {
        sessionStorage.setItem('IdPeriodo', response.PeriodoId);
        sessionStorage.setItem('IdTipoInscripcion', response.TipoInscripcionId.Id);
        sessionStorage.setItem('ProgramaAcademicoId', response.ProgramaAcademicoId);
        const EstadoIns = sessionStorage.getItem('EstadoInscripcion');
        if (EstadoIns === 'true'){
          this.loadInscriptionModule();
        }
      },
      error => {
        //this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      }      
    );
  }


  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
  }

  loadInfoInscripcion() {
    //Función del MID que retorna el estado del recibo
    var PeriodoActual = localStorage.getItem('IdPeriodo')
    if (this.persona_id != null && PeriodoActual != null){
      //if (this.persona_id != null){
        this.sgaMidService.get('inscripciones/estado_recibos/'+this.persona_id+'/'+PeriodoActual).subscribe(
          (response: any) => {
            if (response !== null && response.Response.Code === '400'){
              this.popUpManager.showErrorToast(this.translate.instant('inscripcion.error'));    
            } else if (response != null && response.Response.Code === '404'){
              this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('inscripcion.no_inscripcion')); 
            } else {
              const data = <Array<any>>response.Response.Body[1].Inscripciones;
              const dataInfo = <Array<any>>[];
              this.recibos_pendientes = 0;
              data.forEach(element => {
                this.projectService.get('proyecto_academico_institucion/'+element.ProgramaAcademicoId).subscribe(
                  res => {
                    var auxRecibo = element.ReciboInscripcion;
                    var NumRecibo =  auxRecibo.split("/",1);
                    element.ReciboInscripcion = NumRecibo;
                    element.FechaCreacion = momentTimezone.tz(element.FechaCreacion, 'America/Bogota').format('DD-MM-YYYY hh:mm:ss');
                    element.ProgramaAcademicoId = res.Nombre;
                    if (element.Estado === 'Pendiente pago') {
                      this.recibos_pendientes++;
                    }
                    this.result.emit(1);
                    dataInfo.push(element);
                    this.loading = false;
                    this.dataSource.load(dataInfo);
                    this.dataSource.setSort([{field: 'FechaCreacion', direction: 'asc'}]);
                    //this.selectedLevel = res.NivelFormacionId.Id
                    this.projectService.get('nivel_formacion/'+res.NivelFormacionId.Id).subscribe(
                      response => {
                        this.selectedLevel = this.nivel_load.filter((nv) => nv.nombre === response['Descripcion'])[0].id;
                        sessionStorage.setItem('nivel', this.selectedLevel.toString())
                      }
                    )
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
                    this.loading = false;
                  },
                );
            })
            }
          }, error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            this.loading = false;
          },
        );
      //}
    }
  }

  onSelectLevel() {
    this.loading = true;
    this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
      response => {
        this.projects = (<any[]>response).filter(
          project => this.nivel_load.filter((val) => Number(this.selectedLevel) === val.id)[0].nombre === project['NivelFormacionId']['Descripcion'],
        );
        this.loading = false;
        this.validateProject();
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }

  nuevaPreinscripcion(){
    this.showNew = true;
  }

  onSelectProyecto() {
    this.loadTipoInscripcion();
  }

  onSelectTipoInscripcion(tipo) {
    if (this.inscripcionProjects != null) {
      this.showInfo = true;
    }
  }

  validateProject() {
    this.inscripcionProjects = new Array;
    this.showProyectoCurricular = false;
    this.showTipoInscripcion = false;
    this.showInfo = false;
    this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + this.selectedLevel).subscribe(
      response => {

        const r = <any>response;
        if (response !== null && response !== "{}" && r.Type !== 'error' && r.length != 0) {
          const inscripcionP = <Array<any>>response;
          this.inscripcionProjects = inscripcionP;
          this.showProyectoCurricular = true;
          // this.loadTipoInscripcion();
        } else {
          this.popUpManager.showAlert('', this.translate.instant('calendario.sin_proyecto_curricular'));
          this.showProyectoCurricular = false;
          this.showTipoInscripcion = false;
          this.showInfo = false;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );

  }

  generar_recibo() {
    if (this.info_info_persona != null) {
      // this.inscripcionService.get('inscripcion/?query=PersonaId:' + this.recibo_pago.DocumentoDelAspirante + '&limit=0')
      this.inscripcionService.get('inscripcion/?query=PersonaId:' + this.info_persona_id + '&limit=0')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            const tiposInscripciones = <Array<any>>res;
            if (this.recibos_pendientes >= 3) {
              this.popUpManager.showErrorAlert(this.translate.instant('recibo_pago.maximo_recibos'));
            } else {
              const inscripcion = {
                Id: 0,
                // PersonaId: +this.recibo_pago.DocumentoDelAspirante,
                PersonaId: +this.info_persona_id,
                ProgramaAcademicoId: +this.selectedProject,
                ReciboInscripcion: Math.floor((Math.random() * 1000) + 1),
                PeriodoId: this.periodo.Id,
                AceptaTerminos: true,
                FechaAceptaTerminos: new Date(),
                Activo: true,
                EstadoInscripcionId: { Id: 1 },
                TipoInscripcionId: { Id: Number(this.tipo_inscripcion_selected) },
              };
              this.info_inscripcion = <Inscripcion>inscripcion;
              this.inscripcionService.post('inscripcion/', inscripcion)
                .subscribe((response) => {
                  this.info_inscripcion = <Inscripcion><unknown>response;
                  if (response !== null && response !== undefined) {
                    const rex = <any>response;
                    if (rex !== null && rex.Type !== 'error') {
                      this.eventChange.emit(true);
                      this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.generado'));
                    } else {
                      this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
                    }
                  }
                },
                  (error: any) => {
                    if (error.System.Message.includes('duplicate')) {
                      Swal({
                        type: 'info',
                        // title: error.status + '',
                        // text: this.translate.instant('ERROR.' + error.status),
                        text: this.translate.instant('recibo_pago.recibo_duplicado'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

                      });
                    } else {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('recibo_pago.no_generado'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

                      });
                    }
                  });
            }
          }
        },
          (error: any) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('recibo_pago.no_generado'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

            });
          });
      // this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.generado'));
    } else {
      this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
    }
  }

  descargarReciboPago(data) {
    this.itemSelect({data: data})
    if (this.selectedLevel === undefined) {
      this.selectedLevel = parseInt(sessionStorage.getItem('nivel'));
    }
    if (this.info_info_persona != null) {
      this.selectedProject = parseInt(sessionStorage.getItem('ProgramaAcademicoId'))
      this.recibo_pago = new ReciboPago();
      this.recibo_pago.NombreDelAspirante = this.info_info_persona.PrimerNombre + " " + this.info_info_persona.SegundoNombre + " " + this.info_info_persona.PrimerApellido + " " + this.info_info_persona.SegundoApellido;
      this.recibo_pago.DocumentoDelAspirante = this.info_info_persona.NumeroIdentificacion;
      this.recibo_pago.Periodo = this.periodo.Nombre;
      this.recibo_pago.ProyectoAspirante = data['ProgramaAcademicoId']
      this.recibo_pago.Comprobante = data['ReciboInscripcion'][0];
      if (this.selectedLevel === 14) {
        this.parametro = '13';
      } else if (this.selectedLevel === 15) {
        this.parametro = '12';
      }
      
      this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + this.selectedLevel).subscribe(
        (response: any[]) => {
          if (response !== null && response.length !== 0) {
            this.inscripcionProjects = response;
            this.inscripcionProjects.forEach(proyecto => {
              if (proyecto.ProyectoId === this.selectedProject && proyecto.Evento != null) {
                this.recibo_pago.Fecha_pago = moment(proyecto.Evento[0].FechaFinEvento, 'YYYY-MM-DD').format('DD/MM/YYYY');
              }
            });
            this.parametrosService.get('parametro_periodo?query=ParametroId.TipoParametroId.Id:2,ParametroId.CodigoAbreviacion:'+ this.parametro +',PeriodoId.Id:3').subscribe(
              response => {
                const parametro = <any>response['Data'][0];
                this.recibo_pago.Descripcion = parametro['ParametroId']['Nombre'];
                var valor = JSON.parse(parametro['Valor']);
                this.recibo_pago.ValorDerecho = valor['Costo']
                this.sgaMidService.post('generar_recibo', this.recibo_pago).subscribe(
                  response => {
                    const reciboData = new Uint8Array(atob(response['Data']).split('').map(char => char.charCodeAt(0)));
                    this.recibo_generado = window.URL.createObjectURL(new Blob([reciboData], {type: 'application/pdf'}));
                    window.open(this.recibo_generado);
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
                  }
                );
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              },
            );
          }
        },
        error => {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('calendario.sin_proyecto_curricular'));
        }
      );
    }
  }

  loadTipoInscripcion() {
    this.tipo_inscripciones = new Array;
    window.localStorage.setItem('IdNivel', String(this.selectedLevel));
    this.inscripcionService.get('tipo_inscripcion/?query=NivelId:' + Number(this.selectedLevel) + ',Activo:true&sortby=NumeroOrden&order=asc')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          const tiposInscripciones = <Array<any>>res;
          this.tipo_inscripciones = tiposInscripciones;
          // this.cargaproyectosacademicos();
          if (this.tipo_inscripciones.length == 0) {
            this.popUpManager.showAlert('', this.translate.instant('calendario.sin_tipo_inscripcion'));
            this.showTipoInscripcion = false;
            this.showProyectoCurricular = false;
            this.showInfo = false;
          } else {
            this.showTipoInscripcion = true;
          }
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.programa_academico'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = <any>res['Data'][0];
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  public loadInscripcion(): void {
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      this.inscripcionService.get('inscripcion/' + this.inscripcion_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_inscripcion = <Inscripcion>res;
            this.aceptaTerminos = true;
          }
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_persona') + '|' +
                this.translate.instant('GLOBAL.admision'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  createInscripcion(tercero_id): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.preinscripcion'),
      text: this.translate.instant('GLOBAL.preinscripcion_2') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    }; Swal(opt)
      .then((willDelete) => {
        this.sgaMidService.post('inscripciones/post_preinscripcion', this.proyectos_preinscripcion_post)
          .subscribe(res => {
            this.info_inscripcion = <Inscripcion><unknown>res;
            this.inscripcion_id = this.info_inscripcion.Id;
            this.eventChange.emit(true);
            Swal({
              type: 'info',
              title: this.translate.instant('GLOBAL.crear'),
              text: this.translate.instant('GLOBAL.inscrito') + ' ' + this.periodo.Nombre,
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
            this.eventChange.emit(true);
          },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.crear') + '-' +
                  this.translate.instant('GLOBAL.info_persona') + '|' +
                  this.translate.instant('GLOBAL.admision'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
      });
  }

  // empieza nuevo
  onCreateEmphasys(event: any) {
    const projetc = event.value;
    if (!this.arr_proyecto.find((proyectos: any) => projetc.Id === proyectos.Id) && projetc.Id) {
      this.arr_proyecto.push(projetc);
      this.source_emphasys.load(this.arr_proyecto);
      const matSelect: MatSelect = event.source;
      matSelect.writeValue(null);
    } else {
      Swal({
        type: 'error',
        title: 'ERROR',
        text: this.translate.instant('inscripcion.error_proyecto_ya_existe'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }
  onDeleteEmphasys(event: any) {
    const findInArray = (value, array, attr) => {
      for (let i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return i;
        }
      }
      return -1;
    }
    this.arr_proyecto.splice(findInArray(event.data.Id, this.arr_proyecto, 'Id'), 1);
    this.source_emphasys.load(this.arr_proyecto);
  }

  preinscripcion() {
    this.proyectos_preinscripcion = [];
    this.arr_proyecto.forEach(proyecto => {
      Number(localStorage.getItem('IdNivel'))
      this.proyectos_preinscripcion.push({
        PersonaId: Number(localStorage.getItem('persona_id')),
        ProgramaAcademicoId: proyecto['Id'],
        PeriodoId: Number(localStorage.getItem('IdPeriodo')),
        EstadoInscripcionId: { Id: 1 },
        TipoInscripcionId: { Id: Number(localStorage.getItem('IdTipoInscripcion')) },
        AceptaTerminos: true,
        FechaAceptaTerminos: new Date(),
        Activo: true,
      });
    });
    if (this.proyectos_preinscripcion[0] != null) {
      this.info_inscripcion = <Inscripcion><unknown>this.proyectos_preinscripcion;
      this.proyectos_preinscripcion_post = {
        DatosPreinscripcion: this.info_inscripcion,
      }
      // console.info(JSON.stringify(this.proyectos_preinscripcion_post));
      this.createInscripcion(5);
    } else {
      Swal({
        type: 'error',
        title: 'ERROR',
        text: this.translate.instant('inscripcion.erro_selec'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }
  // termina


  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }
}
