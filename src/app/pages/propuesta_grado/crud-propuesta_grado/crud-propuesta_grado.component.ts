import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { PropuestaGrado } from './../../../@core/data/models/inscripcion/propuesta_grado';
import { PropuestaPost } from './../../../@core/data/models/inscripcion/propuesta_post';
import { Inscripcion } from './../../../@core/data/models/inscripcion/inscripcion';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CIDCService } from '../../../@core/data/cidc.service';
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
import { PopUpManager } from '../../../managers/popUpManager';

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
      // this.buscarID_prop();
    }
  }

  @Input('persona_id')
  set info(persona_id: number) {
    this.persona_id = persona_id;
  }

  @Input('inscripcion_id')
  set info2(inscripcion_id: number) {
    if (inscripcion_id !== undefined && inscripcion_id !== 0 && inscripcion_id.toString() !== '') {
      this.inscripcion_id = inscripcion_id;
      // if (this.inscripcion_id !== undefined && this.inscripcion_id !== null && this.inscripcion_id !== 0 &&
      //   this.inscripcion_id.toString() !== '') {
      //  console.info('InscripcionPro: ' + this.inscripcion_id);
      this.loadPropuestaGrado();
      if (this.formData) {
        this.createPropuestaGrado(this.formData);
      }
    }
  }

  @Output() crear_inscripcion: EventEmitter<any> = new EventEmitter();

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_propuesta_grado: any;
  info_propuesta_grado_post: any;
  formPropuestaGrado: any;
  regPropuestaGrado: any;
  clean: boolean;
  loading: boolean = false;
  existePropuesta: boolean;
  percentage: number;
  grupoSeleccionado: any;
  formData: any;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private inscripcionService: InscripcionService,
    private cidcService: CIDCService,
    private store: Store<IAppState>,
    private listService: ListService,
    private popUpManager: PopUpManager,
    private toasterService: ToasterService) {
    this.formPropuestaGrado = FORM_PROPUESTA_GRADO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.cargarValores();
    this.listService.findLineaInvestigacion();
    this.listService.findTipoProyecto();
    // this.listService.findTipoParametro();
    this.loadLists();
    this.loadPropuestaGrado();
  }

  async cargarValores(){
    this.loading = true;
    await this.listService.findGrupoInvestigacion();
    this.loading = false;
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
  }

  public loadPropuestaGrado(): void {
    this.loading = true;
    this.inscripcionService.get('propuesta?query=Activo:true,InscripcionId:' + Number(window.sessionStorage.getItem('IdInscripcion')))
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          this.existePropuesta = true;
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
                this.cidcService.get('research_group/' + temp.GrupoInvestigacionId)
                  .subscribe(grupo => {
                    if (grupo !== null) {
                      temp.GrupoInvestigacion = <any>grupo;
                      this.cidcService.get('research_focus/' + temp.LineaInvestigacionId)
                        .subscribe(linea => {
                          if (linea !== null) {
                            temp.LineaInvestigacion = <any>linea;
                            // temp.LineaInvestigacion.name = temp.LineaInvestigacion.LineaInvestigacion.name;
                            // this.formPropuestaGrado.campos[this.getIndexForm('LineaInvestigacion')].opciones.push(temp.LineaInvestigacion);
                            temp.TipoProyecto = temp.TipoProyectoId;
                            this.info_propuesta_grado = temp;
                            this.loading = false;
                          }
                        },
                          (error: HttpErrorResponse) => {
                            Swal.fire({
                              icon:'error',
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
                      Swal.fire({
                        icon:'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                          this.translate.instant('GLOBAL.grupo_investigacion'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
              }
              this.loading = false;
            },
              (error: HttpErrorResponse) => {
                this.loading = false;
                Swal.fire({
                  icon:'error',
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
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon:'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.propuesta_grado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
      this.loading = false;
  }

  createPropuestaGrado(propuestaGrado: any): void {
    const opt: any = {
      title: this.existePropuesta? this.translate.instant('GLOBAL.actualizar'): this.translate.instant('GLOBAL.crear'),
      text: this.existePropuesta? this.translate.instant('propuesta_grado.seguro_continuar_actualizar') :this.translate.instant('propuesta_grado.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_propuesta_grado = <PropuestaGrado>propuestaGrado;
          const files = [];
          if (this.info_propuesta_grado.FormatoProyecto.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub, key: 'FormatoProyecto',
              file: this.info_propuesta_grado.FormatoProyecto.file, IdDocumento: 7
            });
          }
          if (this.existePropuesta) {
            this.putPropuestaGrado(files);
          } else {
            this.uploadResolutionFile(files);
          }
        }
      });
  }

  uploadResolutionFile(file) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.nuxeoService.getDocumentos$(file, this.documentoService)
        .subscribe(response => {
          // resolve(response['undefined'].Id); // desempacar el response, puede dejar de llamarse 'undefined'
          if (Object.keys(response).length === file.length) {
            const filesUp = <any>response;
            if (filesUp['FormatoProyecto'] !== undefined) {
              this.info_propuesta_grado_post = new PropuestaPost;
              this.info_propuesta_grado_post.Id = 0;
              this.info_propuesta_grado_post.Activo = true;
              this.info_propuesta_grado_post.Nombre = this.info_propuesta_grado.Nombre;
              this.info_propuesta_grado_post.Resumen = this.info_propuesta_grado.Resumen;
              this.info_propuesta_grado_post.TipoProyectoId = this.info_propuesta_grado.TipoProyectoId;
              this.info_propuesta_grado_post.DocumentoId = filesUp['FormatoProyecto'].Id;
              // if (this.detalleExp != null && this.indexSelect != null && !Number.isNaN(this.indexSelect)) {
              // this.info_experiencia_laboral.indexSelect = this.indexSelect;
              this.info_propuesta_grado_post.GrupoInvestigacionId = this.info_propuesta_grado.GrupoInvestigacion.id;
              this.info_propuesta_grado_post.LineaInvestigacionId = this.info_propuesta_grado.LineaInvestigacion.id;
              // this.info_propuesta_grado.InscripcionId = { Id: Number(window.sessionStorage.getItem('IdInscripcion')) };

              this.loading = true;
              this.inscripcionService.get('inscripcion/' + Number(window.sessionStorage.getItem('IdInscripcion')))
                .subscribe(res => {
                  const r = <any>res;
                  if (r !== null && r.Type !== 'error') {
                    this.info_propuesta_grado_post.InscripcionId = r;
                    this.loading = true;
                    this.inscripcionService.post('propuesta/', this.info_propuesta_grado_post)
                      .subscribe(res => {
                        const r = <any>res;
                        if (r !== null && r.Type !== 'error') {
                          this.info_propuesta_grado = <PropuestaGrado><unknown>res;
                          this.loading = false;
                          this.eventChange.emit(true);
                          // this.showToast('info', this.translate.instant('GLOBAL.crear'),
                          //   this.translate.instant('propuesta_grado.propuesta_grado_registrada'));
                            this.popUpManager.showSuccessAlert(this.translate.instant('propuesta_grado.propuesta_grado_registrada'));
                        } else {
                          // this.showToast('error', this.translate.instant('GLOBAL.error'),
                          //   this.translate.instant('GLOBAL.error'));
                            this.popUpManager.showErrorToast(this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'));
                        }
                        this.loading = false;
                      },
                        (error: HttpErrorResponse) => {
                          this.loading = false;
                          Swal.fire({
                            icon:'error',
                            title: error.status + '',
                            text: this.translate.instant('ERROR.' + error.status),
                            footer: this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'),
                            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                          });
                        });

                  } else {
                    this.showToast('error', this.translate.instant('GLOBAL.error'),
                      this.translate.instant('GLOBAL.error'));
                  }
                  this.loading = false;
                },
                  (error: HttpErrorResponse) => {
                    this.loading = false;
                    Swal.fire({
                      icon:'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      footer: this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                  });
            }
          }
          this.loading = false;
        }, error => {
          this.loading = false;
          reject(error);
        });
    });
  }

  putPropuestaGrado(file) {
    if(file.length > 0)
    {
      return new Promise((resolve, reject) => {
        this.nuxeoService.getDocumentos$(file, this.documentoService)
          .subscribe(response => {
            // resolve(response['undefined'].Id); // desempacar el response, puede dejar de llamarse 'undefined'
            if (Object.keys(response).length === file.length) {
              const filesUp = <any>response;
              if (filesUp['FormatoProyecto'] !== undefined) {
                this.actualizar(filesUp['FormatoProyecto'].Id);
              }
            }
          }, error => {
            reject(error);
          });
      });
    }else {
      return new Promise((resolve, reject) => {
        this.actualizar(this.info_propuesta_grado.DocumentoId);
      });
    }
  }

  actualizar(documentoID: number){
    this.loading = true;
    this.info_propuesta_grado_post = new PropuestaPost;
      this.info_propuesta_grado_post.Id = this.info_propuesta_grado.Id;
      this.info_propuesta_grado_post.Activo = true;
      this.info_propuesta_grado_post.Nombre = this.info_propuesta_grado.Nombre;
      this.info_propuesta_grado_post.Resumen = this.info_propuesta_grado.Resumen;
      this.info_propuesta_grado_post.TipoProyectoId = this.info_propuesta_grado.TipoProyectoId;
      this.info_propuesta_grado_post.DocumentoId = documentoID;
      this.info_propuesta_grado_post.GrupoInvestigacionId = this.info_propuesta_grado.GrupoInvestigacion.id;
      this.info_propuesta_grado_post.LineaInvestigacionId = this.info_propuesta_grado.LineaInvestigacion.id;

      this.inscripcionService.get('inscripcion/' + Number(window.sessionStorage.getItem('IdInscripcion')))
        .subscribe(res => {
          const r = <any>res;
          if (r !== null && r.Type !== 'error') {
            this.info_propuesta_grado_post.InscripcionId = r;
            this.loading = true;
            this.inscripcionService.put('propuesta/', this.info_propuesta_grado_post)
              .subscribe(res => {
                const r = <any>res;
                if (r !== null && r.Type !== 'error') {
                  this.info_propuesta_grado = <PropuestaGrado><unknown>res;
                  this.loading = false;
                  this.eventChange.emit(true);
                  // this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                  //   this.translate.instant('propuesta_grado.propuesta_grado_actualizada'));
                  this.popUpManager.showSuccessAlert(this.translate.instant('propuesta_grado.propuesta_grado_actualizada'));
                } else {
                  // this.showToast('error', this.translate.instant('GLOBAL.error'),
                  //   this.translate.instant('GLOBAL.error'));
                  this.popUpManager.showSuccessAlert(this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'));
                }
                this.loading = false;
              },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal.fire({
                    icon:'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });

          } else {
            this.showToast('error', this.translate.instant('GLOBAL.error'),
              this.translate.instant('GLOBAL.error'));
          }
          this.loading = false;
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            Swal.fire({
              icon:'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
  }

  ngOnInit() {
    this.loadPropuestaGrado();
  }

  validarForm(event) {
    if (event.valid) {
      this.formData = event.data.PropuestaGrado;
      if (!this.inscripcion_id && this.inscripcion_id != undefined) {
        this.crear_inscripcion.emit(this.formData);
      } else {
        this.createPropuestaGrado(this.formData);
      }
      this.result.emit(event);
      // if (this.info_propuesta_grado === undefined) {
      // this.createPropuestaGrado(event.data.PropuestaGrado);
      // } else {
      // this.updatePropuestaGrado(event.data.PropuestaGrado);
      // }
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
    this.loading = true;
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formPropuestaGrado.campos[this.getIndexForm('GrupoInvestigacion')].opciones = list.listGrupoInvestigacion[0];
        this.formPropuestaGrado.campos[this.getIndexForm('LineaInvestigacion')].opciones = list.listLineaInvestigacion[0];
        this.formPropuestaGrado.campos[this.getIndexForm('TipoProyectoId')].opciones = list.listTipoProyecto[0];
        // this.formPropuestaGrado.campos[this.getIndexForm('TipoProyectoId')].opciones = list.listTipoParametro[0];
        this.loading = false;
      },
    );
  }
}
