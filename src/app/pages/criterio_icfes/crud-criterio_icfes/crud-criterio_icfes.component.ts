import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { Inscripcion } from './../../../@core/data/models/inscripcion/inscripcion';
import { InfoPersona } from './../../../@core/data/models/informacion/info_persona';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocumentoService } from '../../../@core/data/documento.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { CoreService } from '../../../@core/data/core.service';
import { FORM_CRITERIO_ICFES } from './form-criterio_icfes';
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

@Component({
  selector: 'ngx-crud-criterio-icfes',
  templateUrl: './crud-criterio_icfes.component.html',
  styleUrls: ['./crud-criterio_icfes.component.scss'],
})
export class CrudCriterioIcfesComponent implements OnInit {
  filesUp: any;
  Foto: any;
  SoporteDocumento: any;
  config: ToasterConfig;
  info_persona_id: number;
  inscripcion_id: number;

  @Input('info_persona_id')
  set persona(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
    console.info('InfoPersonaIdPersona: ' + info_persona_id);
  }


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

  info_criterio_icfes: any;
  formCriterioIcfes: any;
  regInfoPersona: any;
  info_inscripcion: any;
  clean: boolean;
  loading: boolean;
  percentage: number;
  aceptaTerminos: boolean;
  programa: number;
  aspirante: number;
  periodo: any;
  porcentaje_subcriterio_total: number;

  constructor(
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private store: Store<IAppState>,
    private listService: ListService,
    private inscripcionService: InscripcionService,
    private coreService: CoreService,
    private userService: UserService,
    private toasterService: ToasterService) {
      this.formCriterioIcfes = FORM_CRITERIO_ICFES;
      this.construirForm();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirForm();
      });
      this.loading = false;
  }

  construirForm() {
    // this.formInfoPersona.titulo = this.translate.instant('GLOBAL.info_persona');
    this.formCriterioIcfes.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formCriterioIcfes.campos.length; i++) {
      this.formCriterioIcfes.campos[i].label = this.translate.instant('GLOBAL.' + this.formCriterioIcfes.campos[i].label_i18n);
      this.formCriterioIcfes.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formCriterioIcfes.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formCriterioIcfes.campos.length; index++) {
      const element = this.formCriterioIcfes.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  createInfoPersona(infoPersona: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('GLOBAL.crear') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          const files = []
          this.info_criterio_icfes = <any>infoPersona;
          if (this.info_criterio_icfes.Foto.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub,
              name: this.autenticationService.getPayload().sub,
              key: 'Foto',
              file: this.info_criterio_icfes.Foto.file, IdDocumento: 1,
            });
          }
          if (this.info_criterio_icfes.SoporteDocumento.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub,
              name: this.autenticationService.getPayload().sub,
              key: 'SoporteDocumento',
              file: this.info_criterio_icfes.SoporteDocumento.file, IdDocumento: 2,
            });
          }
          // this.nuxeoService.getDocumentos$(files, this.documentoService)
          //   .subscribe(response => {
              // if (Object.keys(response).length === files.length) {
              //   this.filesUp = <any>response;

                // if (this.filesUp['Foto'] !== undefined) {
                //   this.info_info_persona.Foto = this.filesUp['Foto'].Id;
                // }
                // if (this.filesUp['SoporteDocumento'] !== undefined) {
                //   this.info_info_persona.SoporteDocumento = this.filesUp['SoporteDocumento'].Id;
                // }
                this.info_criterio_icfes.Usuario = this.autenticationService.getPayload().sub;
                console.info(JSON.stringify(this.info_criterio_icfes));
                this.sgamidService.post('persona/guardar_persona', this.info_criterio_icfes)
                  .subscribe(res => {
                    const r = <any>res
                    console.info(JSON.stringify(res));
                    if (r !== null && r.Type !== 'error') {
                      window.localStorage.setItem('ente', r.Id);
                      this.info_persona_id = r.Id;
                      sessionStorage.setItem('IdTercero', String(this.info_persona_id));
                      // this.loadInfoPersona();
                      this.loading = false;
                      this.showToast('info', this.translate.instant('GLOBAL.crear'),
                        this.translate.instant('GLOBAL.info_persona') + ' ' +
                        this.translate.instant('GLOBAL.confirmarCrear'));
                        this.eventChange.emit(true);
                    } else {
                      this.showToast('error', this.translate.instant('GLOBAL.error'),
                        this.translate.instant('GLOBAL.error'));
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.crear') + '-' +
                          this.translate.instant('GLOBAL.info_persona'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
              // }
        //     },
        //       (error: HttpErrorResponse) => {
        //         Swal({
        //           type: 'error',
        //           title: error.status + '',
        //           text: this.translate.instant('ERROR.' + error.status),
        //           footer: this.translate.instant('GLOBAL.crear') + '-' +
        //             this.translate.instant('GLOBAL.info_persona') + '|' +
        //             this.translate.instant('GLOBAL.soporte_documento'),
        //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        //         });
        //       // });
        }
      });
  }



  ngOnInit() {
    // this.loadInfoPersona()
    // this.info_admision()
  }

  validarForm(event) {
    if (event.valid) {
      this.calculoporcentaje(event.data.InfoCriterioIcfes)
    }
  }

  calculoporcentaje(InfoCriterioIcfes: any): void {
    this.info_criterio_icfes = <any>InfoCriterioIcfes;
    console.info('datos')
    console.info(this.info_criterio_icfes)
    this.porcentaje_subcriterio_total = this.info_criterio_icfes.Area1 + this.info_criterio_icfes.Area2 + this.info_criterio_icfes.Area3 +
    this.info_criterio_icfes.Area4 + this.info_criterio_icfes.Area5
    console.info(this.porcentaje_subcriterio_total)
    if (this.porcentaje_subcriterio_total >= 101) {
      Swal({
        type: 'error',
        text: this.translate.instant('GLOBAL.error_porcentaje_total'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    } else  {
      console.info(window.localStorage.getItem('ProyectoSelect'))
      console.info(window.localStorage.getItem('CriteriosSelect'))
      console.info('bien porcentaje')
    }
  }
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
