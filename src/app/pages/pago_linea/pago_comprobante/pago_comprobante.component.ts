import { Component, OnInit } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { ReciboService } from '../../../@core/data/recibo.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FORM_COMPROBANTE } from './form-comprobante';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-pago-comprobante',
  templateUrl: './pago_comprobante.component.html',
  styleUrls: ['./pago_comprobante.component.scss'],
})
export class PagoComprobanteComponent implements OnInit {

  @Input('recibo_id')
  set name(recibo_id: number) {
    this.recibo_id = recibo_id;
    if (this.recibo_id !== 0 && this.recibo_id !== undefined && this.recibo_id.toString() !== '') {
      this.loadPago();
    }
  }

  @Input('inscripcion_id')
  set name2(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
  }

  @Output() eventChange = new EventEmitter();

  filesUp: any;
  SoporteDocumento: any;
  config: ToasterConfig;
  recibo_id: number;
  inscripcion_id: number;
  loading: boolean;
  formComprobante: any;
  info_comprobante: any;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private inscripcion: InscripcionService,
    private recibos: ReciboService,
    private toasterService: ToasterService) {
      this.formComprobante = FORM_COMPROBANTE;
      this.construirForm();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirForm();
      });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  construirForm() {
    this.formComprobante.titulo = this.translate.instant('GLOBAL.info_comprobante');
    this.formComprobante.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formComprobante.campos.length; i++) {
      this.formComprobante.campos[i].label = this.translate.instant('GLOBAL.' + this.formComprobante.campos[i].label_i18n);
      this.formComprobante.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formComprobante.campos[i].label_i18n);
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formComprobante.campos.length; index++) {
      const element = this.formComprobante.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadPago(): void {
    this.loading = true;
    this.recibos.get('pago_recibo/?query=ReciboId:' + this.recibo_id)
      .subscribe(res_pago => {
        if (res_pago !== null && JSON.stringify(res_pago[0]).toString() !== '{}') {
          const pago = <any>res_pago[0];
          if (res_pago !== null && pago.Type !== 'error') {
            if (pago.Aprobado) {
              pago.EstadoPagoRecibo = 'Aprobado';
            } else {
              pago.EstadoPagoRecibo = 'Pendiente de aprobación';
            }
            const files = []
            if (pago.Comprobante + '' !== '0') {
              files.push({ Id: pago.Comprobante, key: 'SoportePago' });
            }
            this.nuxeoService.getDocumentoById$(files, this.documentoService)
              .subscribe(response => {
                const filesResponse = <any>response;
                if (Object.keys(filesResponse).length === files.length) {
                  this.SoporteDocumento = pago.Comprobante;
                  pago.Comprobante = filesResponse['SoportePago'] + '';
                  this.info_comprobante = <any>pago;
                  this.loading = false;
                }
              },
                (error: HttpErrorResponse) => {
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                      this.translate.instant('GLOBAL.recibo') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          }
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.recibo'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  createPago(infoPago: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('GLOBAL.crear') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          const files = []
          this.info_comprobante = <any>infoPago;
          if (this.info_comprobante.Comprobante.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub,
              name: this.autenticationService.getPayload().sub,
              key: 'SoportePago',
              file: this.info_comprobante.Comprobante.file, IdDocumento: 8,
            });
          }
          this.nuxeoService.getDocumentos$(files, this.documentoService)
            .subscribe(response => {
              if (Object.keys(response).length === files.length) {
                this.filesUp = <any>response;
                if (this.filesUp['SoportePago'] !== undefined) {
                  this.info_comprobante.Comprobante = this.filesUp['SoportePago'].Id;
                }
                this.inscripcion.get('inscripcion/' + this.inscripcion_id)
                  .subscribe(res_inscripcion => {
                    const info_inscripcion = <any>res_inscripcion;
                    if (res_inscripcion !== null  && info_inscripcion.Type !== 'error' && info_inscripcion.ReciboInscripcionId === 0) {
                      const recibo = <any>{
                        Referencia: 0,
                        ValorOrdinario: 1000,
                        FechaOrdinaria: new Date(),
                        TipoReciboId: {Id: 15},
                        EstadoReciboId: {Id: 2},
                      };
                      this.recibos.post('recibo', recibo).subscribe(res_recibo => {
                        const res_rec = <any>res_recibo;
                        if (res_recibo !== null && res_rec.Type !== 'error') {
                          info_inscripcion.ReciboInscripcionId = res_rec.Id;
                          this.recibo_id = res_rec.Id;
                          this.inscripcion.put('inscripcion', info_inscripcion)
                            .subscribe(res => {
                              if (res !== null) {
                                this.info_comprobante.ReciboId = {Id: 1 * this.recibo_id};
                                this.info_comprobante.TipoPagoId = {Id: 2};
                                this.info_comprobante.Aprobado = false;
                                this.info_comprobante.FechaPago = new Date();
                                this.recibos.post('pago_recibo', this.info_comprobante)
                                  .subscribe(res_recibo_pago => {
                                    const res_pag = <any>res_recibo_pago;
                                    if (res_recibo_pago !== null && res_pag.Type !== 'error') {
                                      this.loading = false;
                                      this.eventChange.emit(true);
                                      this.showToast('info', this.translate.instant('GLOBAL.crear'),
                                        this.translate.instant('GLOBAL.recibo') + ' ' +
                                        this.translate.instant('GLOBAL.confirmarCrear'));
                                    }
                                  },
                                    (error: HttpErrorResponse) => {
                                      Swal({
                                        type: 'error',
                                        title: error.status + '',
                                        text: this.translate.instant('ERROR.' + error.status),
                                        footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                          this.translate.instant('GLOBAL.recibo'),
                                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                      });
                                    });
                              }
                            },
                              (error: HttpErrorResponse) => {
                                Swal({
                                  type: 'error',
                                  title: error.status + '',
                                  text: this.translate.instant('ERROR.' + error.status),
                                  footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                    this.translate.instant('GLOBAL.admision'),
                                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                });
                              });
                        }
                      },
                        (error: HttpErrorResponse) => {
                          Swal({
                            type: 'error',
                            title: error.status + '',
                            text: this.translate.instant('ERROR.' + error.status),
                            footer: this.translate.instant('GLOBAL.crear') + '-' +
                              this.translate.instant('GLOBAL.recibo'),
                            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                          });
                        });
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.admision'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
              }
            },
              (error: HttpErrorResponse) => {
                Swal({
                  type: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.crear') + '-' +
                    this.translate.instant('GLOBAL.recibo') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  updatePago(infoPago: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('GLOBAL.actualizar') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.loading = true;
          this.info_comprobante = <any>infoPago;
          const files = [];
          if (this.info_comprobante.Comprobante.file !== undefined) {
            files.push({ file: this.info_comprobante.Comprobante.file, documento: this.SoporteDocumento, key: 'SoportePago' });
          }
          if (files.length !== 0) {
            this.nuxeoService.updateDocument$(files, this.documentoService)
              .subscribe(response => {
                if (Object.keys(response).length === files.length) {
                  const documentos_actualizados = <any>response;
                  this.info_comprobante.Comprobante = this.SoporteDocumento;
                  this.info_comprobante.FechaPago = new Date();
                  this.recibos.put('pago_recibo', this.info_comprobante)
                    .subscribe(res => {
                      if (documentos_actualizados['SoportePago'] !== undefined) {
                        this.info_comprobante.Comprobante = documentos_actualizados['SoportePago'].url + '';
                      }
                      this.loading = false;
                      this.eventChange.emit(true);
                      this.loadPago();
                      this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                        this.translate.instant('GLOBAL.recibo') + ' ' +
                        this.translate.instant('GLOBAL.confirmarActualizar'));
                    },
                      (error: HttpErrorResponse) => {
                        Swal({
                          type: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                            this.translate.instant('GLOBAL.recibo'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                }
              },
                (error: HttpErrorResponse) => {
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.recibo') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            this.info_comprobante.Comprobante = this.SoporteDocumento;
            this.info_comprobante.FechaPago = new Date();
            this.recibos.put('pago_recibo', this.info_comprobante)
              .subscribe(res => {
                this.eventChange.emit(true);
                this.loadPago();
                this.loading = false;
                this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                  this.translate.instant('GLOBAL.recibo') + ' ' +
                  this.translate.instant('GLOBAL.confirmarActualizar'));
              },
                (error: HttpErrorResponse) => {
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.recibo'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          }
        }
      });
  }

  ngOnInit() {
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_comprobante === undefined) {
        this.createPago(event.data.PagoComprobante);
      } else {
        this.updatePago(event.data.PagoComprobante);
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
