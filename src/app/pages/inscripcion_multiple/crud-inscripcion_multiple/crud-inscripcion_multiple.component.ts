import { Inscripcion } from './../../../@core/data/models/inscripcion/inscripcion';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
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
import { from } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'ngx-crud-inscripcion-multiple',
  templateUrl: './crud-inscripcion_multiple.component.html',
  styleUrls: ['./crud-inscripcion_multiple.component.scss'],
  providers: [EventoService],
})
export class CrudInscripcionMultipleComponent implements OnInit {

  config: ToasterConfig;
  info_persona_id: number;
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
    console.info('InfoPersonaIdPersona: ' + info_persona_id);
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
  showInfo: boolean
  programa: number;
  aspirante: number;
  periodo: any;
  periodos = [];
  selectednivel: any;
  tipo_inscripciones = [];
  proyectos_preinscripcion: any[];
  proyectos_preinscripcion_post: any;
  nivel_load = [{ nombre: 'Pregrado', id: 14 }, { nombre: 'Posgrado', id: 15 }];
  selectedLevel: FormControl;
  selectedProject: FormControl;
  tipo_inscripcion_selected: FormControl;
  projects: any[];
  countInscripcion: number = 0;
  cont: number = 0;
  inscripcionProjects: any[];
  calendarioId: string = '0';
  projectId: number = 0;

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
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private toasterService: ToasterService,
    private eventoService: EventoService) {
    // this.cargaproyectosacademicos();
    this.showProyectoCurricular = false;
    this.showTipoInscripcion = false;
    this.showInfo = false
    this.cargarPeriodo();
    this.dataSource = new LocalDataSource();
    this.createTable();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
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
    this.data = [
      {
        Recibo: "Recibo 1",
        Programa: "Programa 1",
        Fecha: "2020-12-14",
        Descarga: "",
        Opcion: ""
      },
      {
        Recibo: "Recibo 2",
        Programa: "Programa 2",
        Fecha: "2020-12-14",
        Descarga: "",
        Opcion: ""
      },
      {
        Recibo: "Recibo 3",
        Programa: "Programa 3",
        Fecha: "2020-12-14",
        Descarga: "",
        Opcion: ""
      }
    ]

    this.settings = {
      actions: false,
      columns: {
        Recibo: {
          title: this.translate.instant('inscripcion.numero_recibo'),
          editable: false,
          width: '20%',
        },
        Programa: {
          title: this.translate.instant('inscripcion.programa'),
          width: '20%',
          editable: false,
        },
        Fecha: {
          title: this.translate.instant('inscripcion.fecha_generacion'),
          width: '20%',
          editable: false,
        },
        Descarga: {
          title: this.translate.instant('inscripcion.descargar'),
          width: '20%',
          editable: false,
        },
        Opcion: {
          title: this.translate.instant('inscripcion.opcion'),
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',

    }
    this.dataSource.load(this.data);
  }


  useLanguage(language: string) {
    this.translate.use(language);
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
      this.recibo_pago = new ReciboPago();
      this.recibo_pago.NombreDelAspirante = this.info_info_persona.PrimerNombre + " " + this.info_info_persona.SegundoNombre + " " + this.info_info_persona.PrimerApellido + " " + this.info_info_persona.SegundoApellido;
      this.recibo_pago.DocumentoDelAspirante = this.info_info_persona.NumeroIdentificacion;
      this.recibo_pago.Periodo = this.periodo.Nombre;
      console.info(this.inscripcionProjects)
      for (var i = 0; i < this.inscripcionProjects.length; i++) {
        if (this.inscripcionProjects[i].ProyectoId === this.selectedProject) {
          this.recibo_pago.ProyectoAspirante = this.inscripcionProjects[i].NombreProyecto;
          if (this.inscripcionProjects[i].Evento != null) {
            this.recibo_pago.Fecha_pago = this.inscripcionProjects[i].Evento[0].FechaInicioEvento;
          }
        }
      }
      var nivel = new String(this.selectedLevel)
      if (nivel == '14') {
        this.parametrosService.get('parametro_periodo?query=ParametroId__TipoParametroId__Id:2,ParametroId__CodigoAbreviacion:13,PeriodoId__Id:3').subscribe(
          response => {
            this.recibo_pago.Descripcion = response["Data"][0]["ParametroId"]["Nombre"];
            var valor = JSON.parse(response["Data"][0]["Valor"]);
            this.recibo_pago.ValorDerecho = valor["Costo"]
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      } else {
        this.parametrosService.get('parametro_periodo?query=ParametroId__TipoParametroId__Id:2,ParametroId__CodigoAbreviacion:12,PeriodoId__Id:3').subscribe(
          response => {
            console.info(response)
            this.recibo_pago.Descripcion = response["Data"][0]["ParametroId"]["Nombre"];
            var valor = JSON.parse(response["Data"][0]["Valor"]);
            console.info(valor)
            this.recibo_pago.ValorDerecho = valor["Costo"]
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      }

      this.inscripcionService.get('inscripcion/?query=PersonaId:' + this.recibo_pago.DocumentoDelAspirante + '&limit=0')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            const tiposInscripciones = <Array<any>>res;

            if (tiposInscripciones.length >= 3) {
              Swal({
                type: 'error',
                text: this.translate.instant('recibo_pago.maximo_recibos'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

              });
            } else {
              //LLAMAR FUNCION RECIBO
              const inscripcion = {
                Id: 0,
                PersonaId: +this.recibo_pago.DocumentoDelAspirante,
                ProgramaAcademicoId: +this.selectedProject,
                ReciboInscripcionId: 0,
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




      // console.info(this.recibo_pago)
      // this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.generado'));
    } else {
      this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
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
          // console.info(tiposInscripciones)
          //     console.info ('Bien')
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
            // console.info('Id periodo')
            // console.info(this.periodo)
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

  ngOnInit() {
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
    // console.info(this.proyectos_preinscripcion)
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
