import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoPrograma } from './../../../@core/data/models/documento/documento_programa';
import { SoporteDocumentoPrograma } from './../../../@core/data/models/documento/soporte_documento_programa';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocumentoProgramaService } from '../../../@core/data/documento_programa.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { FORM_DOCUMENTO_PROGRAMA } from './form-documento_programa';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'ngx-crud-documento-programa',
  templateUrl: './crud-documento_programa.component.html',
  styleUrls: ['./crud-documento_programa.component.scss'],
})
export class CrudDocumentoProgramaComponent implements OnInit {
  config: ToasterConfig;
  documento_programa_id: number;
  filesUp: any;
  Documento: any;
  persona: number;
  programa: number;
  periodo: number;
  inscripcion: number;

  @Input('documento_programa_id')
  set name(documento_programa_id: number) {
    this.documento_programa_id = documento_programa_id;
    this.loadDocumentoPrograma();
  }

  @Input('persona_id')
  set info(persona_id: number) {
    this.persona = persona_id;
  }

  @Input('inscripcion_id')
  set info2(inscripcion_id: number) {
    this.inscripcion = inscripcion_id;
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
        this.loadOptionsTipodocumentoprograma();
    }
  }

  @Output() eventChange = new EventEmitter();
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_documento_programa: any;
  documentoTemp: any;
  formDocumentoPrograma: any;
  regDocumentoPrograma: any;
  temp: any;
  programaDocumento: any;
  tipoProgramaDocumento: any;
  clean: boolean;
  loading: boolean;
  valido: boolean;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private inscripcionService: InscripcionService,
    private documentoProgramaService: DocumentoProgramaService,
    private nuxeoService: NuxeoService,
    private toasterService: ToasterService) {
    this.formDocumentoPrograma = FORM_DOCUMENTO_PROGRAMA;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loading = false;
  }

  construirForm() {
    // this.formDocumentoPrograma.titulo = this.translate.instant('GLOBAL.documento_programa');
    this.formDocumentoPrograma.btn = this.translate.instant('GLOBAL.guardar');
    this.formDocumentoPrograma.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formDocumentoPrograma.campos.length; i++) {
      this.formDocumentoPrograma.campos[i].label = this.translate.instant('GLOBAL.' + this.formDocumentoPrograma.campos[i].label_i18n);
      this.formDocumentoPrograma.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formDocumentoPrograma.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formDocumentoPrograma.campos.length; index++) {
      const element = this.formDocumentoPrograma.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  loadOptionsTipodocumentoprograma(): void {
    this.inscripcionService.get('inscripcion/' + this.inscripcion)
      .subscribe(dato_inscripcion => {
        const inscripciondata = <any>dato_inscripcion;
        this.programa = inscripciondata.ProgramaAcademicoId;
        this.periodo = inscripciondata.PeriodoId;
        let tipodocumentoprograma: Array<any> = [];
        let tipo: any = {};
        this.documentoProgramaService.get('documento_programa/?query=ProgramaId:' + this.programa +
          ',PeriodoId:' + this.periodo + '&limit=0')
          .subscribe(res => {
            if (res !== null) {
              tipodocumentoprograma = <Array<DocumentoPrograma>>res;
              tipodocumentoprograma.forEach(element => {
                this.documentoProgramaService.get('tipo_documento_programa/' + element.TipoDocumentoProgramaId.Id)
                  .subscribe(res2 => {
                    if (res2 !== null) {
                      tipo = res2;
                      element.TipoDocumentoPrograma = tipo;
                      element.Nombre = tipo.Nombre;
                    }
                    this.formDocumentoPrograma.campos[this.getIndexForm('DocumentoPrograma')].opciones = tipodocumentoprograma;
                  },
                    (error: HttpErrorResponse) => {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.documento_programa') + '|' +
                          this.translate.instant('GLOBAL.tipo_documento_programa'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
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
                  this.translate.instant('GLOBAL.documento_programa') + '|' +
                  this.translate.instant('GLOBAL.tipo_documento_programa'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
      },
      (error: HttpErrorResponse) => {
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.documento_programa') + '|' +
            this.translate.instant('GLOBAL.admision'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  public loadDocumentoPrograma(): void {
    this.loading = true;
    this.temp = {};
    this.Documento = [];
    this.info_documento_programa = {};
    this.filesUp = <any>{};
    if (this.documento_programa_id !== undefined &&
      this.documento_programa_id !== 0 &&
      this.documento_programa_id.toString() !== '') {
        this.documentoProgramaService.get('soporte_documento_programa/' + this.documento_programa_id)
          .subscribe(res => {
            if (res !== null) {
              this.temp = <SoporteDocumentoPrograma>res;
              const files = [];
              this.documentoProgramaService.get('documento_programa/' + this.temp.DocumentoProgramaId.Id)
                .subscribe(documentoPrograma => {
                  if (documentoPrograma !== null) {
                    this.programaDocumento =  <Array<any>>documentoPrograma;
                    this.temp.DocumentoPrograma = this.programaDocumento;
                    this.documentoProgramaService.get('tipo_documento_programa/' +
                      this.programaDocumento.TipoDocumentoProgramaId.Id)
                      .subscribe(tipoDocumentoPrograma => {
                        if (tipoDocumentoPrograma !== null) {
                          this.tipoProgramaDocumento =  <Array<any>>tipoDocumentoPrograma;
                          this.temp.DocumentoPrograma.TipoDocumentoPrograma = this.tipoProgramaDocumento;
                          this.temp.DocumentoPrograma.Nombre = this.tipoProgramaDocumento.Nombre;
                        }
                        if (this.temp.DocumentoId + '' !== '0') {
                          files.push({ Id: this.temp.DocumentoId, key: 'SoporteDocumentoPrograma' });
                        }
                        this.nuxeoService.getDocumentoById$(files, this.documentoService)
                          .subscribe(response => {
                            const filesResponse = <any>response;
                            if (Object.keys(filesResponse).length === files.length) {
                              this.Documento = this.temp.DocumentoId;
                              this.temp.Documento = filesResponse['SoporteDocumentoPrograma'] + '';
                              this.info_documento_programa = this.temp;
                              this.info_documento_programa.Documento = filesResponse['SoporteDocumentoPrograma'] + '';
                              this.loading = false;
                            }
                          },
                            (error: HttpErrorResponse) => {
                              Swal({
                                type: 'error',
                                title: error.status + '',
                                text: this.translate.instant('ERROR.' + error.status),
                                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                  this.translate.instant('GLOBAL.documento_programa') + '|' +
                                  this.translate.instant('GLOBAL.soporte_documento'),
                                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                              });
                            });
                      },
                        (error: HttpErrorResponse) => {
                          Swal({
                            type: 'error',
                            title: error.status + '',
                            text: this.translate.instant('ERROR.' + error.status),
                            footer: this.translate.instant('GLOBAL.cargar') + '-' +
                              this.translate.instant('GLOBAL.tipo_documento_programa'),
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
                        this.translate.instant('GLOBAL.documento_programa'),
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
                  this.translate.instant('GLOBAL.documento_programa'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
    } else {
      this.temp = {};
      this.Documento = [];
      this.filesUp = <any>{};
      this.info_documento_programa = undefined;
      this.clean = !this.clean;
      this.loading = false;
    }
  }

  updateDocumentoPrograma(soporteDocumentoPrograma: any): void {
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
          this.info_documento_programa = <any>soporteDocumentoPrograma;
          const files = [];
          if (this.info_documento_programa.Documento.file !== undefined) {
            files.push({ file: this.info_documento_programa.Documento.file, documento: this.Documento, key: 'SoporteDocumentoPrograma' });
          }
          if (files.length !== 0) {
            this.nuxeoService.updateDocument$(files, this.documentoService)
              .subscribe(response => {
                if (Object.keys(response).length === files.length) {
                  const documentos_actualizados = <any>response;
                  this.info_documento_programa.DocumentoId = this.Documento;
                  this.info_documento_programa.Id = this.documento_programa_id;
                  this.info_documento_programa.DocumentoProgramaId = this.info_documento_programa.DocumentoProgramaId;
                  this.documentoProgramaService.put('soporte_documento_programa', this.info_documento_programa)
                    .subscribe(res => {
                      if (documentos_actualizados['SoporteDocumentoPrograma'] !== undefined) {
                        this.info_documento_programa.Documento = documentos_actualizados['SoporteDocumentoPrograma'].url + '';
                      }
                      this.loading = false;
                      this.eventChange.emit(true);
                      this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                        this.translate.instant('GLOBAL.documento_programa') + ' ' +
                        this.translate.instant('GLOBAL.confirmarActualizar'));
                      this.clean = !this.clean;
                      this.info_documento_programa = undefined;
                      this.documento_programa_id = 0;
                      this.loadDocumentoPrograma();
                    },
                      (error: HttpErrorResponse) => {
                        Swal({
                          type: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                            this.translate.instant('GLOBAL.documento_programa'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                }
              },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.documento_programa') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            console.info(JSON.stringify(this.Documento));
            this.info_documento_programa.DocumentoId = this.Documento;
            this.info_documento_programa.Id = this.documento_programa_id;
            this.info_documento_programa.DocumentoProgramaId = this.info_documento_programa.DocumentoProgramaId;
            this.documentoProgramaService.put('soporte_documento_programa', this.info_documento_programa)
              .subscribe(res => {
                this.loading = false;
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                  this.translate.instant('GLOBAL.documento_programa') + ' ' +
                  this.translate.instant('GLOBAL.confirmarActualizar'));
                this.clean = !this.clean;
                this.info_documento_programa = undefined;
                this.documento_programa_id = 0;
                this.loadDocumentoPrograma();
              },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.documento_programa'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          }
        }
      });
  }

  crearNuevoDocumentoPrograma(documentoPrograma: any): void {
    this.info_documento_programa = <SoporteDocumentoPrograma>documentoPrograma;
    const documentoProgramaDocumento = this.info_documento_programa.DocumentoProgramaId.Id;
    this.documentoProgramaService.get('soporte_documento_programa/?query=PersonaId:' + this.persona +
      '&limit=0')
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          if (Object.keys(res).length !== 0) {
            this.valido = true;
            this.documentoTemp = <SoporteDocumentoPrograma>res;
            this.documentoTemp.forEach(element => {
              if (element.DocumentoProgramaId.Id === documentoProgramaDocumento) {
                this.valido = false;
              }
            });
            if (this.valido) {
              this.createDocumentoPrograma(documentoPrograma);
            } else {
              Swal({
                type: 'error',
                title: this.translate.instant('GLOBAL.documento_programa') + '',
                text: this.translate.instant('ERROR.repetir_documentos'),
                footer: this.translate.instant('GLOBAL.crear') + '-' +
                  this.translate.instant('GLOBAL.documento_programa'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
              this.eventChange.emit(true);
            }
          }
        } else {
          this.createDocumentoPrograma(documentoPrograma);
        }
        this.eventChange.emit(true);
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.documento_programa') + '|' +
              this.translate.instant('GLOBAL.soporte_documento'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  createDocumentoPrograma(documentoPrograma: any): void {
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
          const files = [];
          this.info_documento_programa = <SoporteDocumentoPrograma>documentoPrograma;
          this.info_documento_programa.PersonaId = 1 * this.persona;
          this.info_documento_programa.DocumentoProgramaId = this.info_documento_programa.DocumentoProgramaId;
          if (this.info_documento_programa.Documento.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub, key: 'SoporteDocumentoPrograma',
              file: this.info_documento_programa.Documento.file, IdDocumento: 6,
            });
          }
          this.nuxeoService.getDocumentos$(files, this.documentoService)
            .subscribe(response => {
              if (Object.keys(response).length === files.length) {
                this.filesUp = <any>response;
                if (this.filesUp['SoporteDocumentoPrograma'] !== undefined) {
                  this.info_documento_programa.DocumentoId = this.filesUp['SoporteDocumentoPrograma'].Id;
                }
                this.documentoProgramaService.post('soporte_documento_programa', this.info_documento_programa)
                  .subscribe(res => {
                    const r = <any>res;
                    if (r !== null && r.Type !== 'error') {
                      this.loading = false;
                      this.eventChange.emit(true);
                      this.showToast('info', this.translate.instant('GLOBAL.crear'),
                        this.translate.instant('GLOBAL.documento_programa') + ' ' +
                        this.translate.instant('GLOBAL.confirmarCrear'));
                      this.documento_programa_id = 0;
                      this.info_documento_programa = undefined;
                      this.clean = !this.clean;
                    } else {
                      this.showToast('error', this.translate.instant('GLOBAL.error'),
                        this.translate.instant('GLOBAL.error'));
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.crear') + '-' +
                          this.translate.instant('GLOBAL.documento_programa'),
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
                    this.translate.instant('GLOBAL.documento_programa') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_documento_programa === undefined) {
        this.crearNuevoDocumentoPrograma(event.data.DocumentoPrograma);
      } else {
        this.updateDocumentoPrograma(event.data.DocumentoPrograma);
      }
      this.result.emit(event);
    }
  }

  ngOnInit() {
    this.loadDocumentoPrograma();
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
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
