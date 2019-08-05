
import { NotificacionEstado } from './../../../@core/data/models/notificacion_estado';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { FORM_NOTIFICACION_ESTADO } from './form-notificacion_estado';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-notificacion-estado',
  templateUrl: './crud-notificacion_estado.component.html',
  styleUrls: ['./crud-notificacion_estado.component.scss'],
})
export class CrudNotificacionEstadoComponent implements OnInit {
  config: ToasterConfig;
  notificacion_estado_id: number;

  @Input('notificacion_estado_id')
  set name(notificacion_estado_id: number) {
    this.notificacion_estado_id = notificacion_estado_id;
    this.loadNotificacionEstado();
  }

  @Output() eventChange = new EventEmitter();

  info_notificacion_estado: NotificacionEstado;
  formNotificacionEstado: any;
  regNotificacionEstado: any;
  clean: boolean;

  constructor(private translate: TranslateService, private configuracionService: ConfiguracionService, private toasterService: ToasterService) {
    this.formNotificacionEstado = FORM_NOTIFICACION_ESTADO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
   }

  construirForm() {
    this.formNotificacionEstado.titulo = this.translate.instant('GLOBAL.notificacion_estado');
    this.formNotificacionEstado.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formNotificacionEstado.campos.length; i++) {
      this.formNotificacionEstado.campos[i].label = this.translate.instant('GLOBAL.' + this.formNotificacionEstado.campos[i].label_i18n);
      this.formNotificacionEstado.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formNotificacionEstado.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formNotificacionEstado.campos.length; index++) {
      const element = this.formNotificacionEstado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadNotificacionEstado(): void {
    if (this.notificacion_estado_id !== undefined && this.notificacion_estado_id !== 0) {
      this.configuracionService.get('notificacion_estado/?query=id:' + this.notificacion_estado_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_notificacion_estado = <NotificacionEstado>res[0];
          }
        });
    } else  {
      this.info_notificacion_estado = undefined;
      this.clean = !this.clean;
    }
  }

  updateNotificacionEstado(notificacionEstado: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update NotificacionEstado!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_notificacion_estado = <NotificacionEstado>notificacionEstado;
        this.configuracionService.put('notificacion_estado', this.info_notificacion_estado)
          .subscribe(res => {
            this.loadNotificacionEstado();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'NotificacionEstado updated');
          });
      }
    });
  }

  createNotificacionEstado(notificacionEstado: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create NotificacionEstado!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_notificacion_estado = <NotificacionEstado>notificacionEstado;
        this.configuracionService.post('notificacion_estado', this.info_notificacion_estado)
          .subscribe(res => {
            this.info_notificacion_estado = <NotificacionEstado><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'NotificacionEstado created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadNotificacionEstado();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_notificacion_estado === undefined) {
        this.createNotificacionEstado(event.data.NotificacionEstado);
      } else {
        this.updateNotificacionEstado(event.data.NotificacionEstado);
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
