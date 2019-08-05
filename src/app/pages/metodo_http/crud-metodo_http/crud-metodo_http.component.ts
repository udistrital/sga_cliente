
import { MetodoHttp } from './../../../@core/data/models/metodo_http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { FORM_METODO_HTTP } from './form-metodo_http';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-metodo-http',
  templateUrl: './crud-metodo_http.component.html',
  styleUrls: ['./crud-metodo_http.component.scss'],
})
export class CrudMetodoHttpComponent implements OnInit {
  config: ToasterConfig;
  metodo_http_id: number;

  @Input('metodo_http_id')
  set name(metodo_http_id: number) {
    this.metodo_http_id = metodo_http_id;
    this.loadMetodoHttp();
  }

  @Output() eventChange = new EventEmitter();

  info_metodo_http: MetodoHttp;
  formMetodoHttp: any;
  regMetodoHttp: any;
  clean: boolean;

  constructor(private translate: TranslateService, private configuracionService: ConfiguracionService, private toasterService: ToasterService) {
    this.formMetodoHttp = FORM_METODO_HTTP;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
   }

  construirForm() {
    this.formMetodoHttp.titulo = this.translate.instant('GLOBAL.metodo_http');
    this.formMetodoHttp.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formMetodoHttp.campos.length; i++) {
      this.formMetodoHttp.campos[i].label = this.translate.instant('GLOBAL.' + this.formMetodoHttp.campos[i].label_i18n);
      this.formMetodoHttp.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formMetodoHttp.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formMetodoHttp.campos.length; index++) {
      const element = this.formMetodoHttp.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadMetodoHttp(): void {
    if (this.metodo_http_id !== undefined && this.metodo_http_id !== 0) {
      this.configuracionService.get('metodo_http/?query=id:' + this.metodo_http_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_metodo_http = <MetodoHttp>res[0];
          }
        });
    } else  {
      this.info_metodo_http = undefined;
      this.clean = !this.clean;
    }
  }

  updateMetodoHttp(metodoHttp: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update MetodoHttp!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_metodo_http = <MetodoHttp>metodoHttp;
        this.configuracionService.put('metodo_http', this.info_metodo_http)
          .subscribe(res => {
            this.loadMetodoHttp();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'MetodoHttp updated');
          });
      }
    });
  }

  createMetodoHttp(metodoHttp: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create MetodoHttp!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_metodo_http = <MetodoHttp>metodoHttp;
        this.configuracionService.post('metodo_http', this.info_metodo_http)
          .subscribe(res => {
            this.info_metodo_http = <MetodoHttp><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'MetodoHttp created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadMetodoHttp();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_metodo_http === undefined) {
        this.createMetodoHttp(event.data.MetodoHttp);
      } else {
        this.updateMetodoHttp(event.data.MetodoHttp);
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
