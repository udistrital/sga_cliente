import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NUEVO_TERCERO } from './form_new_tercero';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import * as momentTimezone from 'moment-timezone';
import { Lugar } from "../../../@core/data/models/lugar/lugar"

@Component({
  selector: 'ngx-new-tercero',
  templateUrl: './new-tercero.component.html',
  styleUrls: ['./new-tercero.component.scss'],
})
export class NewTercero implements OnInit {
  config: ToasterConfig;
  nuevoTercero: boolean = false;
  listaPaises: Lugar[];

  @Output() eventChange = new EventEmitter();
  @Output('result')
  result: EventEmitter<any> = new EventEmitter();

  @Input('nit')
  set name(nit: number) {
    this.info_tercero = {
      Nit: nit,
    }
    console.log(this.info_tercero);
    this.formInfoNuevoTercero.campos[this.getIndexFormNew('Nit')].valor = nit;
  }
  terceroData = null;
  info_tercero: any;
  formInfoNuevoTercero: any;
  regInfoFormacionAcademica: any;
  temp_info_academica: any;
  clean: boolean;
  percentage: number;
  paisSelecccionado: any;
  infoComplementariaUniversidadId: number = 1;
  universidadConsultada: any;

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private store: Store<IAppState>,
    private toasterService: ToasterService) {
    this.formInfoNuevoTercero = NUEVO_TERCERO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadLists();
  }

  construirForm() {
    // this.formInfoFormacionAcademica.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formInfoNuevoTercero.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoNuevoTercero.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoNuevoTercero.campos.length; i++) {
      this.formInfoNuevoTercero.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoNuevoTercero.campos[i].label_i18n);
      this.formInfoNuevoTercero.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoNuevoTercero.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getPais(event) { }

  getIndexFormNew(nombre: String): number {
    for (let index = 0; index < this.formInfoNuevoTercero.campos.length; index++) {
      const element = this.formInfoNuevoTercero.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  searchDoc(data) {
  }

  createInfoTercero(infoTercero: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('informacion_academica.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willMake) => {
        if (willMake.value) {
          this.sgaMidService.post('formacion_academica/post_tercero', infoTercero)
            .subscribe((data) => {
              this.result.emit({
                infoPost: infoTercero,
                infoReturn: data
              });
              console.log(data)
            });
        }
      });
  }

  ngOnInit() {
  }

  setPercentage(event) {
    setTimeout(() => {
      this.percentage = event;
      // this.result.emit(this.percentage);
    });
  }

  validarFormNuevoTercero(event) {
    if (event.valid) {
      console.log(event.data.Tercero);
      const formData = event.data.Tercero;
      this.createInfoTercero(formData)
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

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.listaPaises = list.listPais;
        this.formInfoNuevoTercero.campos[this.getIndexFormNew('Pais')].opciones = list.listPais[0];
      },
    );
  }
}
