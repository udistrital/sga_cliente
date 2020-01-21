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

  @Input() info_proyectos: any;
  @Input() info_periodo: any;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_info_persona: any;
  info_criterio_icfes: any;
  info_criterio_icfes_post: any;
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
    private store: Store<IAppState>,
    private listService: ListService,
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

  createInfoCriterio(infoCriterio: any): void {

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
          this.info_criterio_icfes = <any>infoCriterio;
                this.info_criterio_icfes.Proyectos = this.info_proyectos;
                this.info_criterio_icfes.Periodo = this.info_periodo;
                this.info_criterio_icfes.General = this.info_criterio_icfes.PorcentajeTotal
                this.info_criterio_icfes.Especifico = {
                  Area1: this.info_criterio_icfes.Area1,
                  Area2: this.info_criterio_icfes.Area2,
                  Area3: this.info_criterio_icfes.Area3,
                  Area4: this.info_criterio_icfes.Area4,
                  Area5: this.info_criterio_icfes.Area5,
                }
                console.info(JSON.stringify(this.info_criterio_icfes));
                // this.sgamidService.post('persona/guardar_persona', this.info_criterio_icfes)
                //   .subscribe(res => {
                //     const r = <any>res
                //     console.info(JSON.stringify(res));
                //     if (r !== null && r.Type !== 'error') {
                //       window.localStorage.setItem('ente', r.Id);
                //       // this.loadInfoPersona();
                //       this.loading = false;
                //       this.showToast('info', this.translate.instant('GLOBAL.crear'),
                //         this.translate.instant('GLOBAL.info_persona') + ' ' +
                //         this.translate.instant('GLOBAL.confirmarCrear'));
                //         this.eventChange.emit(true);
                //     } else {
                //       this.showToast('error', this.translate.instant('GLOBAL.error'),
                //         this.translate.instant('GLOBAL.error'));
                //     }
                //   },
                //     (error: HttpErrorResponse) => {
                //       Swal({
                //         type: 'error',
                //         title: error.status + '',
                //         text: this.translate.instant('ERROR.' + error.status),
                //         footer: this.translate.instant('GLOBAL.crear') + '-' +
                //           this.translate.instant('GLOBAL.info_persona'),
                //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                //       });
                //     });
        }
      });
  }



  ngOnInit() {

  }

  validarForm(event) {
    if (event.valid) {
      this.calculoporcentaje(event.data.InfoCriterioIcfes)
    }
  }

  calculoporcentaje(InfoCriterioIcfes: any): void {
    this.info_criterio_icfes = <any>InfoCriterioIcfes;
    this.porcentaje_subcriterio_total = this.info_criterio_icfes.Area1 + this.info_criterio_icfes.Area2 + this.info_criterio_icfes.Area3 +
    this.info_criterio_icfes.Area4 + this.info_criterio_icfes.Area5
    console.info(this.porcentaje_subcriterio_total)
    if (this.porcentaje_subcriterio_total >= 101 || this.porcentaje_subcriterio_total < 100) {
      Swal({
        type: 'error',
        text: this.translate.instant('GLOBAL.error_porcentaje_total'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    } else  {
      console.info('Bien porcentaje')
      console.info('Datos Proyecto')
      console.info(this.info_proyectos)
      console.info(this.info_periodo)
      console.info('datos')
      console.info(this.info_criterio_icfes)
      this.createInfoCriterio(this.info_criterio_icfes);
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
