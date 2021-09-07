import { Aplicacion } from '../../../@core/data/models/aplicacion';

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { FORM_DESCUENTO_PROYECTO } from './form-descuento-proyecto'
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { TipoDescuento } from '../../../@core/data/models/descuento/tipo_descuento'
import { DescuentoAcademicoService } from '../../../@core/data/descuento_academico.service';

@Component({
  selector: 'ngx-crud-descuento-proyecto',
  templateUrl: './crud-descuento-proyecto.component.html',
  styleUrls: ['./crud-descuento-proyecto.component.scss'],
})
export class CrudDescuentoProyectoComponent implements OnInit {
  config: ToasterConfig;
  descuento_id: number;

  @Input('descuento_id')
  set name(desceunto_id: number) {
    this.descuento_id = desceunto_id;
    this.loadDescuentoProyecto();
  }

  @Output() eventChange = new EventEmitter();

  info_desc_programa: TipoDescuento;
  formDescuentoProyecto: any;
  regDescuentoProyecto: any;
  clean: boolean;

  constructor(private translate: TranslateService,
    private descuentoService: DescuentoAcademicoService,
    private toasterService: ToasterService) {
    this.formDescuentoProyecto = FORM_DESCUENTO_PROYECTO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  construirForm() {
    this.formDescuentoProyecto.titulo = this.translate.instant('documento_proyecto.documento');
    this.formDescuentoProyecto.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formDescuentoProyecto.campos.length; i++) {
      this.formDescuentoProyecto.campos[i].label = this.translate.instant('GLOBAL.' + this.formDescuentoProyecto.campos[i].label_i18n);
      this.formDescuentoProyecto.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formDescuentoProyecto.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formDescuentoProyecto.campos.length; index++) {
      const element = this.formDescuentoProyecto.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadDescuentoProyecto(): void {
    if (this.descuento_id !== undefined && this.descuento_id !== 0) {
      this.descuentoService.get('tipo_descuento/' + this.descuento_id)
        .subscribe((res: any) => {
          if (res.Type !== 'error') {
            this.info_desc_programa = <TipoDescuento>res;
          } else {
            this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.general'));
          }
        }, () => {
          this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.general'));
        });
    } else {
      this.info_desc_programa = undefined;
      this.clean = !this.clean;
    }
  }

  updateDocumentoProyecto(documentoProyecto: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('documento_proyecto.seguro_continuar_actualizar_documento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_desc_programa = <TipoDescuento>documentoProyecto;
          // this.proyectoAcademicoService.put('enfasis', this.info_doc_programa)
          //   .subscribe((res: any) => {
          //     if (res.Type !== 'error') {
          //       this.loadDocumentoProyecto();
          //       this.eventChange.emit(true);
          //       this.showToast('info', this.translate.instant('GLOBAL.actualizar'), this.translate.instant('documento_proyecto.documento_actualizado'));
          //     } else {
          //       this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_actualizado'));
          //     }
          //   }, () => {
          //     this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_actualizado'));
          //   });
        }
      });
  }

  createDocumentoProyecto(documentoProyecto: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('documento_proyecto.seguro_continuar_registrar_documento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_desc_programa = <TipoDescuento>documentoProyecto;
          // this.proyectoAcademicoService.post('enfasis', this.info_doc_programa)
          //   .subscribe((res: any) => {
          //     if (res.Type !== 'error') {
          //       this.info_doc_programa = <DocumentoPrograma><unknown>res;
          //       this.eventChange.emit(true);
          //       this.showToast('info', this.translate.instant('GLOBAL.registrar'), this.translate.instant('documento_proyecto.documento_creado'));
          //     } else {
          //       this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_creado'));
          //     }
          //   }, () => {
          //     this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_creado'));
          //   });
        }
      });
  }

  ngOnInit() {
    this.loadDescuentoProyecto();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_desc_programa === undefined) {
        this.createDocumentoProyecto(event.data.documentoProyecto);
      } else {
        this.updateDocumentoProyecto(event.data.documentoProyecto);
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
