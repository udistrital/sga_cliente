import { NotificacionConfiguracion } from './../../../@core/data/models/notificacion_configuracion';
import { Perfil } from './../../../@core/data/models/perfil';

import { NotificacionConfiguracionPerfil } from './../../../@core/data/models/notificacion_configuracion_perfil';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { FORM_NOTIFICACION_CONFIGURACION_PERFIL } from './form-notificacion_configuracion_perfil';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-notificacion-configuracion-perfil',
  templateUrl: './crud-notificacion_configuracion_perfil.component.html',
  styleUrls: ['./crud-notificacion_configuracion_perfil.component.scss'],
})
export class CrudNotificacionConfiguracionPerfilComponent implements OnInit {
  config: ToasterConfig;
  notificacion_configuracion_perfil_id: number;

  @Input('notificacion_configuracion_perfil_id')
  set name(notificacion_configuracion_perfil_id: number) {
    this.notificacion_configuracion_perfil_id = notificacion_configuracion_perfil_id;
    this.loadNotificacionConfiguracionPerfil();
  }

  @Output() eventChange = new EventEmitter();

  info_notificacion_configuracion_perfil: NotificacionConfiguracionPerfil;
  formNotificacionConfiguracionPerfil: any;
  regNotificacionConfiguracionPerfil: any;
  clean: boolean;

  constructor(private translate: TranslateService, private configuracionService: ConfiguracionService, private toasterService: ToasterService) {
    this.formNotificacionConfiguracionPerfil = FORM_NOTIFICACION_CONFIGURACION_PERFIL;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsNotificacionConfiguracion();
    this.loadOptionsPerfil();
   }

  construirForm() {
    this.formNotificacionConfiguracionPerfil.titulo = this.translate.instant('GLOBAL.notificacion_configuracion_perfil');
    this.formNotificacionConfiguracionPerfil.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formNotificacionConfiguracionPerfil.campos.length; i++) {
      this.formNotificacionConfiguracionPerfil.campos[i].label = this.translate.instant('GLOBAL.' + this.formNotificacionConfiguracionPerfil.campos[i].label_i18n);
      this.formNotificacionConfiguracionPerfil.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formNotificacionConfiguracionPerfil.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsNotificacionConfiguracion(): void {
    let notificacionConfiguracion: Array<any> = [];
      this.configuracionService.get('notificacion_configuracion/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            notificacionConfiguracion = <Array<NotificacionConfiguracion>>res;
          }
          this.formNotificacionConfiguracionPerfil.campos[ this.getIndexForm('NotificacionConfiguracion') ].opciones = notificacionConfiguracion;
        });
  }
  loadOptionsPerfil(): void {
    let perfil: Array<any> = [];
      this.configuracionService.get('perfil/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            perfil = <Array<Perfil>>res;
          }
          this.formNotificacionConfiguracionPerfil.campos[ this.getIndexForm('Perfil') ].opciones = perfil;
        });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formNotificacionConfiguracionPerfil.campos.length; index++) {
      const element = this.formNotificacionConfiguracionPerfil.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadNotificacionConfiguracionPerfil(): void {
    if (this.notificacion_configuracion_perfil_id !== undefined && this.notificacion_configuracion_perfil_id !== 0) {
      this.configuracionService.get('notificacion_configuracion_perfil/?query=id:' + this.notificacion_configuracion_perfil_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_notificacion_configuracion_perfil = <NotificacionConfiguracionPerfil>res[0];
          }
        });
    } else  {
      this.info_notificacion_configuracion_perfil = undefined;
      this.clean = !this.clean;
    }
  }

  updateNotificacionConfiguracionPerfil(notificacionConfiguracionPerfil: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update NotificacionConfiguracionPerfil!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_notificacion_configuracion_perfil = <NotificacionConfiguracionPerfil>notificacionConfiguracionPerfil;
        this.configuracionService.put('notificacion_configuracion_perfil', this.info_notificacion_configuracion_perfil)
          .subscribe(res => {
            this.loadNotificacionConfiguracionPerfil();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'NotificacionConfiguracionPerfil updated');
          });
      }
    });
  }

  createNotificacionConfiguracionPerfil(notificacionConfiguracionPerfil: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create NotificacionConfiguracionPerfil!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_notificacion_configuracion_perfil = <NotificacionConfiguracionPerfil>notificacionConfiguracionPerfil;
        this.configuracionService.post('notificacion_configuracion_perfil', this.info_notificacion_configuracion_perfil)
          .subscribe(res => {
            this.info_notificacion_configuracion_perfil = <NotificacionConfiguracionPerfil><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'NotificacionConfiguracionPerfil created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadNotificacionConfiguracionPerfil();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_notificacion_configuracion_perfil === undefined) {
        this.createNotificacionConfiguracionPerfil(event.data.NotificacionConfiguracionPerfil);
      } else {
        this.updateNotificacionConfiguracionPerfil(event.data.NotificacionConfiguracionPerfil);
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
