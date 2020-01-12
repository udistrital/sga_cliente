import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { Inscripcion } from './../../../@core/data/models/inscripcion/inscripcion';
import { InfoPersona } from './../../../@core/data/models/informacion/info_persona';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocumentoService } from '../../../@core/data/documento.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { CoreService } from '../../../@core/data/core.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { ListService } from '../../../@core/store/services/list.service';
import { UserService } from '../../../@core/data/users.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { InstitucionEnfasis } from '../../../@core/data/models/proyecto_academico/institucion_enfasis';
import { MatSelect } from '@angular/material';
import { LocalDataSource } from 'ng2-smart-table';
import { OikosService } from '../../../@core/data/oikos.service';

@Component({
  selector: 'ngx-crud-inscripcion-multiple',
  templateUrl: './crud-inscripcion_multiple.component.html',
  styleUrls: ['./crud-inscripcion_multiple.component.scss'],
})
export class CrudInscripcionMultipleComponent implements OnInit {
  filesUp: any;
  Foto: any;
  SoporteDocumento: any;
  config: ToasterConfig;
  info_persona_id: number;
  inscripcion_id: number;


  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      // this.loadInscripcion();
      console.info('inscripcionId: ' + inscripcion_id);
    }
  }
  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_info_persona: any;
  regInfoPersona: any;
  info_inscripcion: any;
  clean: boolean;
  loading: boolean;
  percentage: number;
  aceptaTerminos: boolean;
  programa: number;
  aspirante: number;
  periodo: any;
  proyectos_preinscripcion: any [];
  proyectos_preinscripcion_post: any;

  arr_proyecto: InstitucionEnfasis[] = [];
  source_emphasys: LocalDataSource = new LocalDataSource();
  proyectos = [];
  settings_emphasys: any;

  Campo2Control = new FormControl('', [Validators.required]);

  constructor(
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    // tslint:disable-next-line: no-shadowed-variable
    private OikosService: OikosService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private inscripcionService: InscripcionService,
    private coreService: CoreService,
    private userService: UserService,
    private toasterService: ToasterService,
    private formBuilder: FormBuilder) {
      this.settings_emphasys = {
        delete: {
          deleteButtonContent: '<i class="nb-trash"></i>',
          confirmDelete: true,
        },
        actions: {
          edit: false,
          add: false,
          position: 'right',
        },
        mode: 'external',
        columns: {
          Nombre: {
            title: this.translate.instant('GLOBAL.nombre'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
            width: '80%',
          },
        },
      };
      this.cargaproyectosacademicos();
      this.cargarPeriodo();
    }


  useLanguage(language: string) {
    this.translate.use(language);
  }
  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.periodo = <any>res[0];
        }
      },
      (error: HttpErrorResponse) => {
        reject(error);
      });
    });
  }

  cargaproyectosacademicos() {
    this.OikosService.get('dependencia?query=DependenciaTipoDependencia.TipoDependenciaId.Id:' + Number(localStorage.getItem('IdNivel')) + '&limit=0')
    .subscribe(res => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.proyectos = <any>res;
        console.info(res);
      }
    },
      (error: HttpErrorResponse) => {
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.periodo_academico'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
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
    };  Swal(opt)
    .then((willDelete) => {
    this.sgamidService.post('inscripciones/post_preinscripcion', this.proyectos_preinscripcion_post)
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

  // updateInscripcion(): void {
  //   this.loadInscripcion();
  //   this.info_inscripcion.AceptaTerminos = true;
  //   this.info_inscripcion.ProgramaAcademicoId = this.userService.getPrograma();
  //   this.inscripcionService.put('inscripcion', this.info_inscripcion)
  //     .subscribe(res => {
  //       this.eventChange.emit(true);
  //       this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
  //         this.translate.instant('GLOBAL.admision') + ' ' +
  //         this.translate.instant('GLOBAL.confirmarActualizar'));
  //       this.loadInscripcion();
  //     },
  //     (error: HttpErrorResponse) => {
  //       Swal({
  //         type: 'error',
  //         title: error.status + '',
  //         text: this.translate.instant('ERROR.' + error.status),
  //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //           this.translate.instant('GLOBAL.info_persona') + '|' +
  //           this.translate.instant('GLOBAL.admision'),
  //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //       });
  //     });
  // }

  ngOnInit() {
    // this.loadInfoPersona()
    // this.info_admision()
  }

  // empieza nuevo
  onCreateEmphasys(event: any) {
    const projetc = event.value;
    if (!this.arr_proyecto.find((proyectos: any) => projetc.Id === proyectos.Id ) && projetc.Id) {
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
    console.info(this.proyectos_preinscripcion)
    this.arr_proyecto.forEach( proyecto => {
      Number(localStorage.getItem('IdNivel'))
        this.proyectos_preinscripcion.push({
          PersonaId:  Number(localStorage.getItem('persona_id')),
          ProgramaAcademicoId: proyecto['Id'],
          PeriodoId: Number(localStorage.getItem('IdPeriodo')),
          EstadoInscripcionId: {Id: 1},
          TipoInscripcionId: {Id:  Number(localStorage.getItem('IdTipoInscripcion'))},
          AceptaTerminos: true,
          FechaAceptaTerminos: new Date(),
          Activo: true,
        });
    });
    if (this.proyectos_preinscripcion[0] != null) {
      this.info_inscripcion =  <Inscripcion><unknown>this.proyectos_preinscripcion;
      this.proyectos_preinscripcion_post = {
        DatosPreinscripcion:  this.info_inscripcion,
      }
      console.info(JSON.stringify(this.proyectos_preinscripcion_post));
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
