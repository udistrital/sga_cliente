import { Notificacion } from './../../../@core/data/models/notificacion';
import { NotificacionEstado } from './../../../@core/data/models/notificacion_estado';

import { NotificacionEstadoUsuario } from './../../../@core/data/models/notificacion_estado_usuario';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { FORM_NOTIFICACION_ESTADO_USUARIO } from './form-notificacion_estado_usuario';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-notificacion-estado-usuario',
  templateUrl: './crud-notificacion_estado_usuario.component.html',
  styleUrls: ['./crud-notificacion_estado_usuario.component.scss'],
})
export class CrudNotificacionEstadoUsuarioComponent implements OnInit {
  config: ToasterConfig;
  notificacion_estado_usuario_id: number;

  @Input('notificacion_estado_usuario_id')
  set name(notificacion_estado_usuario_id: number) {
    this.notificacion_estado_usuario_id = notificacion_estado_usuario_id;
    this.loadNotificacionEstadoUsuario();
  }

  @Output() eventChange = new EventEmitter();

  info_notificacion_estado_usuario: NotificacionEstadoUsuario;
  formNotificacionEstadoUsuario: any;
  regNotificacionEstadoUsuario: any;
  clean: boolean;

  constructor(private translate: TranslateService, private configuracionService: ConfiguracionService, private toasterService: ToasterService) {
    this.formNotificacionEstadoUsuario = FORM_NOTIFICACION_ESTADO_USUARIO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsNotificacion();
    this.loadOptionsNotificacionEstado();
   }

  construirForm() {
    this.formNotificacionEstadoUsuario.titulo = this.translate.instant('GLOBAL.notificacion_estado_usuario');
    this.formNotificacionEstadoUsuario.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formNotificacionEstadoUsuario.campos.length; i++) {
      this.formNotificacionEstadoUsuario.campos[i].label = this.translate.instant('GLOBAL.' + this.formNotificacionEstadoUsuario.campos[i].label_i18n);
      this.formNotificacionEstadoUsuario.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formNotificacionEstadoUsuario.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsNotificacion(): void {
    let notificacion: Array<any> = [];
      this.configuracionService.get('notificacion/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            notificacion = <Array<Notificacion>>res;
          }
          this.formNotificacionEstadoUsuario.campos[ this.getIndexForm('Notificacion') ].opciones = notificacion;
        });
  }
  loadOptionsNotificacionEstado(): void {
    let notificacionEstado: Array<any> = [];
      this.configuracionService.get('notificacion_estado/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            notificacionEstado = <Array<NotificacionEstado>>res;
          }
          this.formNotificacionEstadoUsuario.campos[ this.getIndexForm('NotificacionEstado') ].opciones = notificacionEstado;
        });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formNotificacionEstadoUsuario.campos.length; index++) {
      const element = this.formNotificacionEstadoUsuario.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadNotificacionEstadoUsuario(): void {
    if (this.notificacion_estado_usuario_id !== undefined && this.notificacion_estado_usuario_id !== 0) {
      this.configuracionService.get('notificacion_estado_usuario/?query=id:' + this.notificacion_estado_usuario_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_notificacion_estado_usuario = <NotificacionEstadoUsuario>res[0];
          }
        });
    } else  {
      this.info_notificacion_estado_usuario = undefined;
      this.clean = !this.clean;
    }
  }

  updateNotificacionEstadoUsuario(notificacionEstadoUsuario: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update NotificacionEstadoUsuario!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_notificacion_estado_usuario = <NotificacionEstadoUsuario>notificacionEstadoUsuario;
        this.configuracionService.put('notificacion_estado_usuario', this.info_notificacion_estado_usuario)
          .subscribe(res => {
            this.loadNotificacionEstadoUsuario();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'NotificacionEstadoUsuario updated');
          });
      }
    });
  }

  createNotificacionEstadoUsuario(notificacionEstadoUsuario: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create NotificacionEstadoUsuario!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_notificacion_estado_usuario = <NotificacionEstadoUsuario>notificacionEstadoUsuario;
        this.configuracionService.post('notificacion_estado_usuario', this.info_notificacion_estado_usuario)
          .subscribe(res => {
            this.info_notificacion_estado_usuario = <NotificacionEstadoUsuario><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'NotificacionEstadoUsuario created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadNotificacionEstadoUsuario();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_notificacion_estado_usuario === undefined) {
        this.createNotificacionEstadoUsuario(event.data.NotificacionEstadoUsuario);
      } else {
        this.updateNotificacionEstadoUsuario(event.data.NotificacionEstadoUsuario);
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
