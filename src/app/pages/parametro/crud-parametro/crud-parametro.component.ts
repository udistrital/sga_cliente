import { Aplicacion } from './../../../@core/data/models/aplicacion';

import { Parametro } from './../../../@core/data/models/parametro';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { FORM_PARAMETRO } from './form-parametro';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-parametro',
  templateUrl: './crud-parametro.component.html',
  styleUrls: ['./crud-parametro.component.scss'],
})
export class CrudParametroComponent implements OnInit {
  config: ToasterConfig;
  parametro_id: number;

  @Input('parametro_id')
  set name(parametro_id: number) {
    this.parametro_id = parametro_id;
    this.loadParametro();
  }

  @Output() eventChange = new EventEmitter();

  info_parametro: Parametro;
  formParametro: any;
  regParametro: any;
  clean: boolean;

  constructor(private translate: TranslateService, private configuracionService: ConfiguracionService, private toasterService: ToasterService) {
    this.formParametro = FORM_PARAMETRO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsAplicacion();
   }

  construirForm() {
    this.formParametro.titulo = this.translate.instant('GLOBAL.parametro');
    this.formParametro.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formParametro.campos.length; i++) {
      this.formParametro.campos[i].label = this.translate.instant('GLOBAL.' + this.formParametro.campos[i].label_i18n);
      this.formParametro.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formParametro.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsAplicacion(): void {
    let aplicacion: Array<any> = [];
      this.configuracionService.get('aplicacion/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            aplicacion = <Array<Aplicacion>>res;
          }
          this.formParametro.campos[ this.getIndexForm('Aplicacion') ].opciones = aplicacion;
        });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formParametro.campos.length; index++) {
      const element = this.formParametro.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadParametro(): void {
    if (this.parametro_id !== undefined && this.parametro_id !== 0) {
      this.configuracionService.get('parametro/?query=id:' + this.parametro_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_parametro = <Parametro>res[0];
          }
        });
    } else  {
      this.info_parametro = undefined;
      this.clean = !this.clean;
    }
  }

  updateParametro(parametro: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update Parametro!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        console.log(parametro);
        this.info_parametro = <Parametro>parametro;
        this.configuracionService.put('parametro', this.info_parametro)
          .subscribe(res => {
            this.loadParametro();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'Parametro updated');
          });
      }
    });
  }

  createParametro(parametro: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create Parametro!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_parametro = <Parametro>parametro;
        this.configuracionService.post('parametro', this.info_parametro)
          .subscribe(res => {
            this.info_parametro = <Parametro><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'Parametro created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadParametro();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_parametro === undefined) {
        this.createParametro(event.data.Parametro);
      } else {
        this.updateParametro(event.data.Parametro);
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
