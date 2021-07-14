import { Aplicacion } from './../../../@core/data/models/aplicacion';

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { FORM_ENFASIS } from './form-enfasis';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { Enfasis } from '../../../@core/data/models/proyecto_academico/enfasis';

@Component({
  selector: 'ngx-crud-enfasis',
  templateUrl: './crud-enfasis.component.html',
  styleUrls: ['./crud-enfasis.component.scss'],
})
export class CrudEnfasisComponent implements OnInit {
  config: ToasterConfig;
  enfasis_id: number;

  @Input('enfasis_id')
  set name(enfasis_id: number) {
    this.enfasis_id = enfasis_id;
    this.loadEnfasis();
  }

  @Output() eventChange = new EventEmitter();

  info_enfasis: Enfasis;
  formEnfasis: any;
  regEnfasis: any;
  clean: boolean;

  constructor(private translate: TranslateService, private proyectoAcademicoService: ProyectoAcademicoService, private toasterService: ToasterService) {
    this.formEnfasis = FORM_ENFASIS;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
   }

  construirForm() {
    this.formEnfasis.titulo = this.translate.instant('enfasis.enfasis');
    this.formEnfasis.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formEnfasis.campos.length; i++) {
      this.formEnfasis.campos[i].label = this.translate.instant('GLOBAL.' + this.formEnfasis.campos[i].label_i18n);
      this.formEnfasis.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formEnfasis.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formEnfasis.campos.length; index++) {
      const element = this.formEnfasis.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadEnfasis(): void {
    if (this.enfasis_id !== undefined && this.enfasis_id !== 0) {
      this.proyectoAcademicoService.get('enfasis/?query=id:' + this.enfasis_id)
        .subscribe((res: any) => {
          if (res.Type !== 'error') {
            this.info_enfasis = <Enfasis>res[0];
          } else {
            this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.general'));
          }
        }, () => {
          this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.general'));
        });
    } else  {
      this.info_enfasis = undefined;
      this.clean = !this.clean;
    }
  }

  updateEnfasis(enfasis: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('enfasis.seguro_continuar_actualizar_enfasis'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_enfasis = <Enfasis>enfasis;
        this.proyectoAcademicoService.put('enfasis', this.info_enfasis)
          .subscribe((res: any) => {
            if (res.Type !== 'error') {
              this.loadEnfasis();
              this.eventChange.emit(true);
              this.showToast('info', this.translate.instant('GLOBAL.actualizar'), this.translate.instant('enfasis.enfasis_actualizado'));
            } else {
              this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('enfasis.enfasis_no_actualizado'));
            }
          }, () => {
            this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('enfasis.enfasis_no_actualizado'));
          });
      }
    });
  }

  createEnfasis(enfasis: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('enfasis.seguro_continuar_registrar_enfasis'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_enfasis = <Enfasis>enfasis;
        this.proyectoAcademicoService.post('enfasis', this.info_enfasis)
          .subscribe((res: any) => {
            if (res.Type !== 'error') {
              this.info_enfasis = <Enfasis><unknown>res;
              this.eventChange.emit(true);
              this.showToast('info', this.translate.instant('GLOBAL.registrar'), this.translate.instant('enfasis.enfasis_creado'));
            } else {
              this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('enfasis.enfasis_no_creado'));
            }
          }, () => {
            this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('enfasis.enfasis_no_creado'));
          });
      }
    });
  }

  ngOnInit() {
    this.loadEnfasis();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_enfasis === undefined) {
        this.createEnfasis(event.data.Enfasis);
      } else {
        this.updateEnfasis(event.data.Enfasis);
      }
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
