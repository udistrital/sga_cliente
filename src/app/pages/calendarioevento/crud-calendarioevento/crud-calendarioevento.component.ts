import { Tipoevento } from './../../../@core/data/models/oferta_academica/tipoevento';
import { Calendarioevento } from './../../../@core/data/models/oferta_academica/calendarioevento';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ClienteHabilitarPeriodoService } from '../../../@core/data/cliente_habilitar_periodo.service';
import { FORM_CALENDARIOEVENTO } from './form-calendarioevento';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { OfertaAcademicaService } from '../../../@core/data/oferta_academica.service';

@Component({
  selector: 'ngx-crud-calendarioevento',
  templateUrl: './crud-calendarioevento.component.html',
  styleUrls: ['./crud-calendarioevento.component.scss'],
})
export class CrudCalendarioeventoComponent implements OnInit {
  config: ToasterConfig;
  calendarioevento_id: number;

  @Input('calendarioevento_id')
  set name(calendarioevento_id: number) {
    this.calendarioevento_id = calendarioevento_id;
    this.loadCalendarioevento();
  }

  @Output() eventChange = new EventEmitter();

  info_calendarioevento: Calendarioevento;
  formCalendarioevento: any;
  regCalendarioevento: any;
  clean: boolean;

  constructor(private translate: TranslateService, private ofertaAcademicaService: OfertaAcademicaService,
    private clienteHabilitarPeriodoService: ClienteHabilitarPeriodoService, private toasterService: ToasterService) {
    this.formCalendarioevento = FORM_CALENDARIOEVENTO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsTipoevento();
   }

  construirForm() {
    this.formCalendarioevento.titulo = this.translate.instant('GLOBAL.calendarioevento');
    this.formCalendarioevento.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formCalendarioevento.campos.length; i++) {
      this.formCalendarioevento.campos[i].label = this.translate.instant('GLOBAL.' + this.formCalendarioevento.campos[i].label_i18n);
      this.formCalendarioevento.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formCalendarioevento.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsTipoevento(): void {
    let tipoevento: Array<any> = [];
      this.clienteHabilitarPeriodoService.get('tipoevento/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            tipoevento = <Array<Tipoevento>>res;
          }
          this.formCalendarioevento.campos[ this.getIndexForm('Tipoevento') ].opciones = tipoevento;
        });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formCalendarioevento.campos.length; index++) {
      const element = this.formCalendarioevento.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadCalendarioevento(): void {
    if (this.calendarioevento_id !== undefined && this.calendarioevento_id !== 0) {
      this.clienteHabilitarPeriodoService.get('calendarioevento/?query=id:' + this.calendarioevento_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_calendarioevento = <Calendarioevento><unknown>res[0];
          }
        });
    } else  {
      this.info_calendarioevento = undefined;
      this.clean = !this.clean;
    }
  }

  updateCalendarioevento(calendarioevento: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('oferta.seguro_actualizar_oferta'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_calendarioevento = <Calendarioevento>calendarioevento;
        this.clienteHabilitarPeriodoService.put('calendarioevento', this.info_calendarioevento)
          .subscribe(res => {
            this.loadCalendarioevento();
            this.eventChange.emit(true);
            this.showToast('info', this.translate.instant('GLOBAL.actualizar'), this.translate.instant('oferta.oferta_actualizado'));
          });
      }
    });
  }

  createCalendarioevento(calendarioevento: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('oferta.seguro_continuar_registrar_oferta'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_calendarioevento = <Calendarioevento>calendarioevento;
        this.clienteHabilitarPeriodoService.post('calendarioevento', this.info_calendarioevento)
          .subscribe(res => {
            this.info_calendarioevento = <Calendarioevento><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', this.translate.instant('GLOBAL.crear'), this.translate.instant('oferta.oferta_creado'));
          });
      }
    });
  }

  ngOnInit() {
    this.loadCalendarioevento();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_calendarioevento === undefined) {
        this.createCalendarioevento(event.data.Calendarioevento);
      } else {
        this.updateCalendarioevento(event.data.Calendarioevento);
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
