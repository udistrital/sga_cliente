import { Aplicacion } from './../../../@core/data/models/aplicacion';

import { Perfil } from './../../../@core/data/models/perfil';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { FORM_PERFIL } from './form-perfil';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-perfil',
  templateUrl: './crud-perfil.component.html',
  styleUrls: ['./crud-perfil.component.scss'],
})
export class CrudPerfilComponent implements OnInit {
  config: ToasterConfig;
  perfil_id: number;

  @Input('perfil_id')
  set name(perfil_id: number) {
    this.perfil_id = perfil_id;
    // this.loadPerfil();
  }

  @Output() eventChange = new EventEmitter();

  info_perfil: Perfil;
  formPerfil: any;
  regPerfil: any;
  clean: boolean;

  constructor(private translate: TranslateService, private configuracionService: ConfiguracionService, private toasterService: ToasterService) {
    this.formPerfil = FORM_PERFIL;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    // this.loadOptionsAplicacion();
   }

  construirForm() {
    this.formPerfil.titulo = this.translate.instant('GLOBAL.perfil');
    this.formPerfil.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formPerfil.campos.length; i++) {
      this.formPerfil.campos[i].label = this.translate.instant('GLOBAL.' + this.formPerfil.campos[i].label_i18n);
      this.formPerfil.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formPerfil.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }
/*
  loadOptionsAplicacion(): void {
    let aplicacion: Array<any> = [];
      this.configuracionService.get('aplicacion/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            aplicacion = <Array<Aplicacion>>res;
          }
          this.formPerfil.campos[ this.getIndexForm('Aplicacion') ].opciones = aplicacion;
        });
  }
*/
  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formPerfil.campos.length; index++) {
      const element = this.formPerfil.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

/*
  public loadPerfil(): void {
    if (this.perfil_id !== undefined && this.perfil_id !== 0) {
      this.configuracionService.get('perfil/?query=id:' + this.perfil_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_perfil = <Perfil>res[0];
          }
        });
    } else  {
      this.info_perfil = undefined;
      this.clean = !this.clean;
    }
  }

  updatePerfil(perfil: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update Perfil!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_perfil = <Perfil>perfil;
        this.configuracionService.put('perfil', this.info_perfil)
          .subscribe(res => {
            this.loadPerfil();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'Perfil updated');
          });
      }
    });
  }

  createPerfil(perfil: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create Perfil!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_perfil = <Perfil>perfil;
        this.configuracionService.post('perfil', this.info_perfil)
          .subscribe(res => {
            this.info_perfil = <Perfil><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'Perfil created');
          });
      }
    });
  }
*/
  ngOnInit() {
    // this.loadPerfil();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_perfil === undefined) {
        // this.createPerfil(event.data.Perfil);
      } else {
        // this.updatePerfil(event.data.Perfil);
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
