import { TipoPeriodo } from './../../../@core/data/models/periodo/tipo_periodo';
import { Periodo } from './../../../@core/data/models/periodo/periodo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ClienteHabilitarPeriodoService } from '../../../@core/data/cliente_habilitar_periodo.service';
import { FORM_PERIODO } from './form-periodo';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-periodo',
  templateUrl: './crud-periodo.component.html',
  styleUrls: ['./crud-periodo.component.scss'],
})
export class CrudPeriodoComponent implements OnInit {
  config: ToasterConfig;
  periodo_id: number;

  @Input('periodo_id')
  set name(periodo_id: number) {
    this.periodo_id = periodo_id;
    this.loadPeriodo();
  }

  @Output() eventChange = new EventEmitter();

  info_periodo: Periodo;
  formPeriodo: any;
  regPeriodo: any;
  clean: boolean;

  constructor(private translate: TranslateService, private clienteHabilitarPeriodoService: ClienteHabilitarPeriodoService,
    private toasterService: ToasterService) {
    this.formPeriodo = FORM_PERIODO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsTipoPeriodo();
   }

  construirForm() {
    this.formPeriodo.titulo = this.translate.instant('GLOBAL.periodo');
    this.formPeriodo.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formPeriodo.campos.length; i++) {
      this.formPeriodo.campos[i].label = this.translate.instant('GLOBAL.' + this.formPeriodo.campos[i].label_i18n);
      this.formPeriodo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formPeriodo.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsTipoPeriodo(): void {
    let tipoPeriodo: Array<any> = [];
      this.clienteHabilitarPeriodoService.get('tipo_periodo/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            tipoPeriodo = <Array<TipoPeriodo>>res;
          }
          this.formPeriodo.campos[ this.getIndexForm('TipoPeriodo') ].opciones = tipoPeriodo;
        });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formPeriodo.campos.length; index++) {
      const element = this.formPeriodo.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadPeriodo(): void {
    if (this.periodo_id !== undefined && this.periodo_id !== 0) {
      this.clienteHabilitarPeriodoService.get('periodo/?query=id:' + this.periodo_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_periodo = <Periodo>res[0];
          }
        });
    } else  {
      this.info_periodo = undefined;
      this.clean = !this.clean;
    }
  }

  updatePeriodo(periodo: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('periodo.seguro_actualizar_periodo'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_periodo = <Periodo>periodo;
        this.clienteHabilitarPeriodoService.put('periodo', this.info_periodo)
          .subscribe(res => {
            this.loadPeriodo();
            this.eventChange.emit(true);
            this.showToast('info', this.translate.instant('GLOBAL.actualizar'), this.translate.instant('periodo.periodo_actualizado'));
          });
      }
    });
  }

  createPeriodo(periodo: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('periodo.seguro_continuar_registrar_periodo'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_periodo = <Periodo>periodo;
        this.clienteHabilitarPeriodoService.post('periodo', this.info_periodo)
          .subscribe(res => {
            this.info_periodo = <Periodo><unknown>res;
            this.eventChange.emit(true);
            this.showToast('success', this.translate.instant('GLOBAL.crear'), this.translate.instant('periodo.periodo_creado'));
          });
      }
    });
  }

  ngOnInit() {
    this.loadPeriodo();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_periodo === undefined) {
        this.createPeriodo(event.data.Periodo);
      } else {
        this.updatePeriodo(event.data.Periodo);
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
