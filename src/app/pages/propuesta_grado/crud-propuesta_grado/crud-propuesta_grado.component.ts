import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { PropuestaGrado } from './../../../@core/data/models/propuesta_grado';
import { Inscripcion } from './../../../@core/data/models/inscripcion';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CoreService } from '../../../@core/data/core.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { FORM_PROPUESTA_GRADO } from './form-propuesta_grado';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { ListService } from '../../../@core/store/services/list.service';

@Component({
  selector: 'ngx-crud-propuesta-grado',
  templateUrl: './crud-propuesta_grado.component.html',
  styleUrls: ['./crud-propuesta_grado.component.scss'],
})
export class CrudPropuestaGradoComponent implements OnInit {
  config: ToasterConfig;
  propuesta_grado_id: number;
  prop_id: number;
  inscripcion_id: number;
  persona_id: number;
  filesUp9: any;
  FormatoProyecto: any;

  @Input('propuesta_grado_id')
  set name(propuesta_grado_id: number) {
    this.propuesta_grado_id = propuesta_grado_id;
    if (this.propuesta_grado_id !== undefined && this.propuesta_grado_id !== null && this.propuesta_grado_id !== 0 &&
      this.propuesta_grado_id.toString() !== '') {
      this.buscarID_prop();
    }
  }

  @Input('persona_id')
  set info(persona_id: number) {
    this.persona_id = persona_id;
  }

  @Input('inscripcion_id')
  set info2(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== null && this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '') {
      console.info('InscripcionPro: ' + this.inscripcion_id);
      this.loadPropuestaGrado();
    }
  }

  @Output() eventChange = new EventEmitter();
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_propuesta_grado: any;
  formPropuestaGrado: any;
  regPropuestaGrado: any;
  clean: boolean;
  loading: boolean;
  percentage: number;
  grupoSeleccionado: any;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private inscripcionService: InscripcionService,
    private coreService: CoreService,
    private store: Store<IAppState>,
    private listService: ListService,
    private toasterService: ToasterService) {
    this.formPropuestaGrado = FORM_PROPUESTA_GRADO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findGrupoInvestigacion();
    this.listService.findTipoProyecto();
    this.loadLists();
  }

  construirForm() {
    // this.formPropuestaGrado.titulo = this.translate.instant('GLOBAL.propuesta_grado');
    this.formPropuestaGrado.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formPropuestaGrado.campos.length; i++) {
      this.formPropuestaGrado.campos[i].label = this.translate.instant('GLOBAL.' + this.formPropuestaGrado.campos[i].label_i18n);
      this.formPropuestaGrado.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formPropuestaGrado.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formPropuestaGrado.campos.length; index++) {
      const element = this.formPropuestaGrado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  getSeleccion(event) {
    if (event.nombre === 'GrupoInvestigacion') {
      this.grupoSeleccionado = event.valor;
      this.loadOptionsLineaInvestigacion();
    }
  }

  loadOptionsLineaInvestigacion(): void {
    let consultaLineas: Array<any> = [];
    const lineas: Array<any> = [];
    this.coreService.get('linea_investigacion_grupo_investigacion/?query=GrupoInvestigacionId:' +
      this.grupoSeleccionado.Id + '&limit=0')
      .subscribe(linea_grupo => {
        if (linea_grupo !== null) {
          consultaLineas = <Array<any>>linea_grupo;
          consultaLineas.forEach(element => {
            this.coreService.get('linea_investigacion/' + element.LineaInvestigacionId)
              .subscribe(linea => {
                if (linea !== null) {
                  element.LineaInvestigacion = <any>linea;
                  element.Nombre = element.LineaInvestigacion.Nombre;
                  lineas.push(element);
                }
                this.formPropuestaGrado.campos[this.getIndexForm('LineaInvestigacion')].opciones = lineas;
              },
                (error: HttpErrorResponse) => {
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                      this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                      this.translate.instant('GLOBAL.linea_investigacion'),
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
              this.translate.instant('GLOBAL.propuesta_grado') + '|' +
              this.translate.instant('GLOBAL.grupo_investigacion') + '-' +
              this.translate.instant('GLOBAL.linea_investigacion'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  public buscarID_prop(): void {
    this.loading = true;
    if (this.propuesta_grado_id !== undefined && this.propuesta_grado_id !== 0 &&
      this.propuesta_grado_id.toString() !== '') {
      this.inscripcionService.get('propuesta/' + this.propuesta_grado_id)
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            const temp = <PropuestaGrado>res[0];
            const files9 = []
            if (temp.DocumentoId + '' !== '0') {
              files9.push({ Id: temp.DocumentoId, key: 'FormatoProyecto' });
            }
            this.nuxeoService.getDocumentoById$(files9, this.documentoService)
              .subscribe(response_2 => {
                const filesResponse_2 = <any>response_2;
                if ((Object.keys(filesResponse_2).length !== 0) && (filesResponse_2['FormatoProyecto'] !== undefined)) {
                  temp.FormatoProyecto = filesResponse_2['FormatoProyecto'] + '';
                  this.FormatoProyecto = temp.DocumentoId;
                  this.coreService.get('linea_investigacion_grupo_investigacion/' + temp.GrupoInvestigacionLineaInvestigacionId)
                    .subscribe(linea_grupo => {
                      if (linea_grupo !== null) {
                        temp.LineaInvestigacion = <any>linea_grupo;
                        this.coreService.get('grupo_investigacion/' + temp.LineaInvestigacion.GrupoInvestigacionId)
                        .subscribe(grupo => {
                          if (grupo !== null) {
                            temp.GrupoInvestigacion = <any>grupo;
                            this.coreService.get('linea_investigacion/' + temp.LineaInvestigacion.LineaInvestigacionId)
                              .subscribe(linea => {
                                if (linea !== null) {
                                  temp.LineaInvestigacion.LineaInvestigacion = <any>linea;
                                  temp.LineaInvestigacion.Nombre = temp.LineaInvestigacion.LineaInvestigacion.Nombre;
                                  this.formPropuestaGrado.campos[this.getIndexForm('LineaInvestigacion')].opciones.push(temp.LineaInvestigacion);
                                  temp.TipoProyecto = temp.TipoProyectoId;
                                  this.info_propuesta_grado = temp;
                                  this.loading = false;
                                }
                              },
                                (error: HttpErrorResponse) => {
                                  Swal({
                                    type: 'error',
                                    title: error.status + '',
                                    text: this.translate.instant('ERROR.' + error.status),
                                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                      this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                                      this.translate.instant('GLOBAL.linea_investigacion'),
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
                                this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                                this.translate.instant('GLOBAL.grupo_investigacion'),
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
                            this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                            this.translate.instant('GLOBAL.grupo_investigacion') + '-' +
                            this.translate.instant('GLOBAL.linea_investigacion'),
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
                      this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            this.loading = false;
          }
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.propuesta_grado'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.info_propuesta_grado = undefined;
      this.clean = !this.clean;
      this.loading = false;
    }
  }

  public loadPropuestaGrado(): void {
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '') {
      this.loading = true;
      this.inscripcionService.get('propuesta/?query=InscripcionId:' + this.inscripcion_id)
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            const temp = <PropuestaGrado>res[0];
            const files9 = []
            if (temp.DocumentoId + '' !== '0') {
              files9.push({ Id: temp.DocumentoId, key: 'FormatoProyecto' });
            }
            this.nuxeoService.getDocumentoById$(files9, this.documentoService)
              .subscribe(response_2 => {
                const filesResponse_2 = <any>response_2;
                if ((Object.keys(filesResponse_2).length !== 0) && (filesResponse_2['FormatoProyecto'] !== undefined)) {
                  temp.FormatoProyecto = filesResponse_2['FormatoProyecto'] + '';
                  this.FormatoProyecto = temp.DocumentoId;
                  this.coreService.get('linea_investigacion_grupo_investigacion/' + temp.GrupoInvestigacionLineaInvestigacionId)
                    .subscribe(linea_grupo => {
                      if (linea_grupo !== null) {
                        temp.LineaInvestigacion = <any>linea_grupo;
                        this.coreService.get('grupo_investigacion/' + temp.LineaInvestigacion.GrupoInvestigacionId)
                        .subscribe(grupo => {
                          if (grupo !== null) {
                            temp.GrupoInvestigacion = <any>grupo;
                            this.coreService.get('linea_investigacion/' + temp.LineaInvestigacion.LineaInvestigacionId)
                              .subscribe(linea => {
                                if (linea !== null) {
                                  temp.LineaInvestigacion.LineaInvestigacion = <any>linea;
                                  temp.LineaInvestigacion.Nombre = temp.LineaInvestigacion.LineaInvestigacion.Nombre;
                                  this.formPropuestaGrado.campos[this.getIndexForm('LineaInvestigacion')].opciones.push(temp.LineaInvestigacion);
                                  temp.TipoProyecto = temp.TipoProyectoId;
                                  this.info_propuesta_grado = temp;
                                  this.loading = false;
                                }
                              },
                                (error: HttpErrorResponse) => {
                                  Swal({
                                    type: 'error',
                                    title: error.status + '',
                                    text: this.translate.instant('ERROR.' + error.status),
                                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                      this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                                      this.translate.instant('GLOBAL.linea_investigacion'),
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
                                this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                                this.translate.instant('GLOBAL.grupo_investigacion'),
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
                            this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                            this.translate.instant('GLOBAL.grupo_investigacion') + '-' +
                            this.translate.instant('GLOBAL.linea_investigacion'),
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
                      this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            this.loading = false;
          }
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.propuesta_grado'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.info_propuesta_grado = undefined;
      this.clean = !this.clean;
      this.loading = false;
    }
  }

  updatePropuestaGrado(propuestaGrado: any): void {
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
          this.info_propuesta_grado = <any>propuestaGrado;
          const files = [];
          if (this.info_propuesta_grado.FormatoProyecto.file !== undefined) {
            files.push({ file: this.info_propuesta_grado.FormatoProyecto.file, documento: this.FormatoProyecto, key: 'FormatoProyecto' });
          }
          if (files.length !== 0) {
            this.nuxeoService.updateDocument$(files, this.documentoService)
              .subscribe(response => {
                if (Object.keys(response).length === files.length) {
                  const documentos_actualizados = <any>response;
                  this.info_propuesta_grado.TipoProyectoId = this.info_propuesta_grado.TipoProyecto;
                  this.info_propuesta_grado.GrupoInvestigacionLineaInvestigacionId = this.info_propuesta_grado.LineaInvestigacion.Id;
                  this.info_propuesta_grado.InscripcionId = <Inscripcion>{Id: 1 * this.inscripcion_id};
                  this.info_propuesta_grado.DocumentoId = this.FormatoProyecto;
                  this.inscripcionService.put('propuesta', this.info_propuesta_grado)
                    .subscribe(res => {
                      if (res !== null) {
                        if (documentos_actualizados['FormatoProyecto'] !== undefined) {
                          this.info_propuesta_grado.FormatoProyecto = documentos_actualizados['FormatoProyecto'].url + '';
                        }
                        this.loading = false;
                        this.loadPropuestaGrado();
                        this.eventChange.emit(true);
                        this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                          this.translate.instant('GLOBAL.propuesta_grado') + ' ' +
                          this.translate.instant('GLOBAL.confirmarActualizar'));
                      }
                    },
                      (error: HttpErrorResponse) => {
                        Swal({
                          type: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                            this.translate.instant('GLOBAL.propuesta_grado'),
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
                      this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            this.info_propuesta_grado.TipoProyectoId = this.info_propuesta_grado.TipoProyecto;
            this.info_propuesta_grado.GrupoInvestigacionLineaInvestigacionId = this.info_propuesta_grado.LineaInvestigacion.Id;
            this.info_propuesta_grado.InscripcionId = <Inscripcion>{Id: 1 * this.inscripcion_id};
            this.info_propuesta_grado.DocumentoId = this.FormatoProyecto;
            this.inscripcionService.put('propuesta', this.info_propuesta_grado)
              .subscribe(res => {
                if (res !== null) {
                  this.eventChange.emit(true);
                  this.loadPropuestaGrado();
                  this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                    this.translate.instant('GLOBAL.propuesta_grado') + ' ' +
                    this.translate.instant('GLOBAL.confirmarActualizar'));
                }
              },
                (error: HttpErrorResponse) => {
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.propuesta_grado'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          }
        }
      });
  }

  createPropuestaGrado(propuestaGrado: any): void {
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
          this.info_propuesta_grado = <PropuestaGrado>propuestaGrado;
          if (this.info_propuesta_grado.FormatoProyecto.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub,
              name: this.autenticationService.getPayload().sub,
              key: 'FormatoProyecto',
              file: this.info_propuesta_grado.FormatoProyecto.file, IdDocumento: 5,
            });
          }
          this.nuxeoService.getDocumentos$(files, this.documentoService)
            .subscribe(response => {
              if (Object.keys(response).length === files.length) {
                this.filesUp9 = <any>response;
                if (this.filesUp9['FormatoProyecto'] !== undefined) {
                  this.info_propuesta_grado.DocumentoId = this.filesUp9['FormatoProyecto'].Id;
                }
                this.info_propuesta_grado.TipoProyectoId = this.info_propuesta_grado.TipoProyecto;
                this.info_propuesta_grado.GrupoInvestigacionLineaInvestigacionId = this.info_propuesta_grado.LineaInvestigacion.Id;
                this.info_propuesta_grado.InscripcionId = <Inscripcion>{Id: 1 * this.inscripcion_id};
                this.inscripcionService.post('propuesta/', this.info_propuesta_grado)
                  .subscribe(res => {
                    const r = <any>res;
                    if (r !== null && r.Type !== 'error') {
                      this.info_propuesta_grado = <PropuestaGrado>res;
                      this.loading = false;
                      this.eventChange.emit(true);
                      this.showToast('info', this.translate.instant('GLOBAL.crear'),
                        this.translate.instant('GLOBAL.propuesta_grado') + ' ' +
                        this.translate.instant('GLOBAL.confirmarCrear'));
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
                          this.translate.instant('GLOBAL.propuesta_grado'),
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
                    this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  ngOnInit() {
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_propuesta_grado === undefined) {
        this.createPropuestaGrado(event.data.PropuestaGrado);
      } else {
        this.updatePropuestaGrado(event.data.PropuestaGrado);
      }
    }
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

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formPropuestaGrado.campos[this.getIndexForm('GrupoInvestigacion')].opciones = list.listGrupoInvestigacion[0];
        this.formPropuestaGrado.campos[this.getIndexForm('TipoProyecto')].opciones = list.listTipoProyecto[0];
      },
    );
  }
}
