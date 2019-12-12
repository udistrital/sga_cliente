import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Idioma } from './../../../@core/data/models/idioma/idioma';
import { ClasificacionNivelIdioma } from './../../../@core/data/models/idioma/clasificacion_idioma';
import { NivelIdioma } from './../../../@core/data/models/idioma/nivel_idioma';
import { InfoIdioma } from './../../../@core/data/models/idioma/info_idioma';
import { FORM_IDIOMAS } from './form-idiomas';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { IdiomaService } from '../../../@core/data/idioma.service';
import { UserService } from '../../../@core/data/users.service';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'ngx-crud-idiomas',
  templateUrl: './crud-idiomas.component.html',
})
export class CrudIdiomasComponent implements OnInit {
  config: ToasterConfig;
  info_idioma_id: number;
  inscripcion_id: number;
  ente: number;

  @Input('info_idioma_id')
  set name(info_idioma_id: number) {
    this.info_idioma_id = info_idioma_id;
    // this.loadInfoIdioma();
  }

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    if (inscripcion_id !== undefined && inscripcion_id !== 0 && inscripcion_id.toString() !== '') {
      // this.inscripcion_id = inscripcion_id;
      // console.info('Idioma inscripcion: ' + this.inscripcion_id);
      // this.cargarIdiomaExamen();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_idioma: InfoIdioma;
  formInfoIdioma: any;
  clean: boolean;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private users: UserService,
    private idiomaService: IdiomaService,
    private toasterService: ToasterService) {
    this.formInfoIdioma = FORM_IDIOMAS;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });

  }

  construirForm() {
    // this.formInfoIdioma.titulo = this.translate.instant('GLOBAL.idiomas');
    this.formInfoIdioma.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInfoIdioma.campos.length; i++) {
      this.formInfoIdioma.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoIdioma.campos[i].label_i18n);
      this.formInfoIdioma.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInfoIdioma.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  // loadOptionsIdiomas(): void {
  //   let idioma: Array<any> = [];
  //   this.idiomaService.get('idioma/?query=Activo:true&limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         idioma = <Array<Idioma>>res;
  //       }
  //       this.formInfoIdioma.campos[this.getIndexForm('Idioma')].opciones = idioma;
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.idiomas') + '|' +
  //             this.translate.instant('GLOBAL.idioma'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  // loadOptionsNiveles(): void {
  //   let nivel: Array<any> = [];
  //   this.idiomaService.get('valor_nivel_idioma/?query=Activo:true&limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         nivel = <Array<NivelIdioma>>res;
  //       }
  //       this.formInfoIdioma.campos[this.getIndexForm('NivelEscribe')].opciones = nivel;
  //       this.formInfoIdioma.campos[this.getIndexForm('NivelEscucha')].opciones = nivel;
  //       this.formInfoIdioma.campos[this.getIndexForm('NivelHabla')].opciones = nivel;
  //       this.formInfoIdioma.campos[this.getIndexForm('NivelLee')].opciones = nivel;
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.idiomas') + '|' +
  //             this.translate.instant('GLOBAL.nivel'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  // loadOptionsClasificacion(): void {
  //   let clasificacion: Array<any> = [];
  //   this.idiomaService.get('clasificacion_nivel_idioma/?query=Activo:true&limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         clasificacion = <Array<ClasificacionNivelIdioma>>res;
  //       }
  //       this.formInfoIdioma.campos[this.getIndexForm('ClasificacionNivelIdioma')].opciones = clasificacion;
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.idiomas') + '|' +
  //             this.translate.instant('GLOBAL.clasificacion_nivel_idioma'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoIdioma.campos.length; index++) {
      const element = this.formInfoIdioma.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  ngOnInit() {
    // this.loadInfoIdioma();
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  validarForm(event) {
    if (event.valid) {
      this.result.emit(event);
    }
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
