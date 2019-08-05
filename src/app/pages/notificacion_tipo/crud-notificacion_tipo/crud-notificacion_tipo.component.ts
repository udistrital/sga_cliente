
import { NotificacionTipo } from './../../../@core/data/models/notificacion_tipo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { FORM_NOTIFICACION_TIPO } from './form-notificacion_tipo';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-notificacion-tipo',
  templateUrl: './crud-notificacion_tipo.component.html',
  styleUrls: ['./crud-notificacion_tipo.component.scss'],
})
export class CrudNotificacionTipoComponent implements OnInit {
  config: ToasterConfig;
  notificacion_tipo_id: number;

  @Input('notificacion_tipo_id')
  set name(notificacion_tipo_id: number) {
    this.notificacion_tipo_id = notificacion_tipo_id;
    this.loadNotificacionTipo();
  }

  @Output() eventChange = new EventEmitter();

  info_notificacion_tipo: NotificacionTipo;
  formNotificacionTipo: any;
  regNotificacionTipo: any;
  clean: boolean;

  constructor(private translate: TranslateService, private configuracionService: ConfiguracionService, private toasterService: ToasterService) {
    this.formNotificacionTipo = FORM_NOTIFICACION_TIPO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
   }

  construirForm() {
    this.formNotificacionTipo.titulo = this.translate.instant('GLOBAL.notificacion_tipo');
    this.formNotificacionTipo.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formNotificacionTipo.campos.length; i++) {
      this.formNotificacionTipo.campos[i].label = this.translate.instant('GLOBAL.' + this.formNotificacionTipo.campos[i].label_i18n);
      this.formNotificacionTipo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formNotificacionTipo.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formNotificacionTipo.campos.length; index++) {
      const element = this.formNotificacionTipo.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadNotificacionTipo(): void {
    if (this.notificacion_tipo_id !== undefined && this.notificacion_tipo_id !== 0) {
      this.configuracionService.get('notificacion_tipo/?query=id:' + this.notificacion_tipo_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_notificacion_tipo = <NotificacionTipo>res[0];
          }
        });
    } else  {
      this.info_notificacion_tipo = undefined;
      this.clean = !this.clean;
    }
  }

  updateNotificacionTipo(notificacionTipo: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update NotificacionTipo!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_notificacion_tipo = <NotificacionTipo>notificacionTipo;
        this.configuracionService.put('notificacion_tipo', this.info_notificacion_tipo)
          .subscribe(res => {
            this.loadNotificacionTipo();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'NotificacionTipo updated');
          });
      }
    });
  }

  createNotificacionTipo(notificacionTipo: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create NotificacionTipo!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_notificacion_tipo = <NotificacionTipo>notificacionTipo;
        this.configuracionService.post('notificacion_tipo', this.info_notificacion_tipo)
          .subscribe(res => {
            this.info_notificacion_tipo = <NotificacionTipo><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'NotificacionTipo created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadNotificacionTipo();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_notificacion_tipo === undefined) {
        this.createNotificacionTipo(event.data.NotificacionTipo);
      } else {
        this.updateNotificacionTipo(event.data.NotificacionTipo);
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
