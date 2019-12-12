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
import { ListService } from '../../../@core/store/services/list.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';

@Component({
  selector: 'ngx-crud-idiomas',
  templateUrl: './crud-idiomas.component.html',
})
export class CrudIdiomasComponent implements OnInit {
  config: ToasterConfig;
  info_idioma_id: number;
  inscripcion_id: number;

  @Input('info_idioma_id')
  set name(info_idioma_id: number) {
    this.info_idioma_id = info_idioma_id;
    // this.loadInfoIdioma();
  }

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    if (inscripcion_id !== undefined && inscripcion_id !== 0 && inscripcion_id.toString() !== '') {
      this.inscripcion_id = inscripcion_id;
      // console.info('Idioma inscripcion: ' + this.inscripcion_id);
      // this.cargarIdiomaExamen();
    }
  }

  @Output() crear_inscripcion: EventEmitter<any> = new EventEmitter();

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_idioma: InfoIdioma;
  formInfoIdioma: any;
  formData: any;
  clean: boolean;
  percentage: number;
  persona_id: number;

  constructor(
    private translate: TranslateService,
    private users: UserService,
    private idiomaService: IdiomaService,
    private store: Store<IAppState>,
    private listService: ListService,
    private sgaMidService: SgaMidService,
    private toasterService: ToasterService) {
    this.formInfoIdioma = FORM_IDIOMAS;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findIdioma();
    this.listService.findNivelIdioma();
    this.listService.findClasificacionNivelIdioma();
    this.loadLists();

    this.persona_id = this.users.getPersonaId();
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

  createInfoIdioma(infoIdioma: any){
      console.log("create info idioma", this.formData, this.inscripcion_id);
  //   const opt: any = {
  //     title: this.translate.instant('GLOBAL.crear'),
  //     text: this.translate.instant('GLOBAL.crear') + '?',
  //     icon: 'warning',
  //     buttons: true,
  //     dangerMode: true,
  //     showCancelButton: true,
  //     confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //     cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
  //   };
  //   Swal(opt)
  //     .then((willDelete) => {
  //       this.loading = true;
  //       if (willDelete.value) {
  //         this.info_idioma = <InfoIdioma>infoIdioma;
  //         this.info_idioma.Persona = this.users.getEnte();
  //         if (this.info_idioma.Nativo === true && this.info_idioma.Nativo === this.info_idioma.SeleccionExamen) {
  //           Swal({
  //             type: 'error',
  //             title: this.translate.instant('GLOBAL.crear'),
  //             text: this.translate.instant('ERROR.nativo_examen'),
  //             footer: this.translate.instant('GLOBAL.crear') + '-' +
  //               this.translate.instant('GLOBAL.idioma'),
  //             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //           });
  //         } else if (this.info_idioma.SeleccionExamen === true && this.idioma_examen !== undefined &&
  //           this.info_idioma.Idioma.Id !== this.idioma_examen) {
  //           Swal({
  //             type: 'error',
  //             title: this.translate.instant('GLOBAL.crear'),
  //             text: this.translate.instant('ERROR.doble_examen'),
  //             footer: this.translate.instant('GLOBAL.crear') + '-' +
  //               this.translate.instant('GLOBAL.idioma'),
  //             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //           });
  //         } else {
  //           this.idiomaService.post('conocimiento_idioma', this.info_idioma)
  //             .subscribe(res => {
  //               const r = <any>res;
  //               if (r !== null && r.Type !== 'error') {
  //                 if (this.info_idioma.SeleccionExamen === true) {
  //                   const examen = {
  //                     Idioma: this.info_idioma.Idioma.Id,
  //                     Activo: true,
  //                     InscripcionId: {Id: (1 * this.inscripcion_id)},
  //                   };
  //                   console.info(JSON.stringify(examen));
  //                   this.inscripcionService.post('inscripcion_posgrado/', examen)
  //                     .subscribe(resexamen => {
  //                       const rex = <any>resexamen;
  //                       if (rex !== null && rex.Type !== 'error') {
  //                         this.idioma_examen = this.info_idioma.Idioma.Id;

  //                         this.loading = false;
  //                         this.eventChange.emit(true);
  //                         this.showToast('info', this.translate.instant('GLOBAL.crear'),
  //                           this.translate.instant('GLOBAL.idioma') + ' ' +
  //                           this.translate.instant('GLOBAL.confirmarCrear'));
  //                         this.info_idioma_id = 0;
  //                         this.info_idioma = undefined;
  //                         this.clean = !this.clean;
  //                       }
  //                     },
  //                       (error: HttpErrorResponse) => {
  //                         Swal({
  //                           type: 'error',
  //                           title: error.status + '',
  //                           text: this.translate.instant('ERROR.' + error.status),
  //                           footer: this.translate.instant('GLOBAL.crear') + '-' +
  //                             this.translate.instant('GLOBAL.idioma_examen'),
  //                           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                         });
  //                       });
  //                 } else {
  //                   this.loading = false;
  //                   this.eventChange.emit(true);
  //                   this.showToast('info', this.translate.instant('GLOBAL.crear'),
  //                     this.translate.instant('GLOBAL.idioma') + ' ' +
  //                     this.translate.instant('GLOBAL.confirmarCrear'));
  //                   this.info_idioma_id = 0;
  //                   this.info_idioma = undefined;
  //                   this.clean = !this.clean;
  //                 }
  //               }
  //             },
  //               (error: HttpErrorResponse) => {
  //                 Swal({
  //                   type: 'error',
  //                   title: error.status + '',
  //                   text: this.translate.instant('ERROR.' + error.status),
  //                   footer: this.translate.instant('GLOBAL.crear') + '-' +
  //                     this.translate.instant('GLOBAL.idioma'),
  //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                 });
  //               });
  //         }
  //       }
  //     });
  }

  callbackCreateInscripcion() {
    console.log("llama calback");
    this.createInfoIdioma(this.formData);
  }

  validarForm(event) {
    if (event.valid) {
      this.formData = event.data.InfoIdioma;
      if (!this.inscripcion_id) {
        this.crear_inscripcion.emit(this);
      }
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

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
       this.formInfoIdioma.campos[this.getIndexForm('Idioma')].opciones = list.listIdioma[0];
       this.formInfoIdioma.campos[this.getIndexForm('NivelEscribe')].opciones = list.listNivelIdioma[0];
       this.formInfoIdioma.campos[this.getIndexForm('NivelEscucha')].opciones = list.listNivelIdioma[0];
       this.formInfoIdioma.campos[this.getIndexForm('NivelHabla')].opciones = list.listNivelIdioma[0];
       this.formInfoIdioma.campos[this.getIndexForm('NivelLee')].opciones = list.listNivelIdioma[0];
       this.formInfoIdioma.campos[this.getIndexForm('ClasificacionNivelIdioma')].opciones = list.listClasificacionNivelIdioma[0];
      },
   );
 }

}
