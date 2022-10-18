import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PropuestaGrado } from './../../../@core/data/models/inscripcion/propuesta_grado';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CIDCService } from '../../../@core/data/cidc.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'ngx-view-propuesta-grado',
  templateUrl: './view-propuesta_grado.component.html',
  styleUrls: ['./view-propuesta_grado.component.scss'],
})
export class ViewPropuestaGradoComponent implements OnInit {
  info_propuesta_grado: PropuestaGrado;
  persona_id: number;
  inscripcion_id: number;
  estado_inscripcion: number;
  FormatoProyecto: any;
  variable = this.translate.instant('GLOBAL.tooltip_ver_registro')
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: number) {
    this.persona_id = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion_id = info2;
    if (this.inscripcion_id !== null && this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '') {
      // this.loadData();
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('listo') listo: EventEmitter<boolean> = new EventEmitter();

  constructor(private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private cidcService: CIDCService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private newNuxeoService: NewNuxeoService,
    private sanitization: DomSanitizer) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    //this.persona_id = this.users.getPersonaId();
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.inscripcionService.get('propuesta/?query=Activo:true,InscripcionId:' + this.inscripcion_id)
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const temp = <any>res[0];
          const files9 = []
          if (temp.DocumentoId + '' !== '0') {
            files9.push({ Id: temp.DocumentoId, key: 'FormatoProyecto' });
          }
          console.log("this get is for propuesta")
          this.newNuxeoService.get(files9).subscribe(
            response_2 => {
              const filesResponse_2 = <any>response_2;
              if ((Object.keys(filesResponse_2).length !== 0) && (filesResponse_2 !== undefined)) {
                temp.Documento = filesResponse_2[0].url;
                this.cidcService.get('research_units/' + temp.GrupoInvestigacionId)
                  .subscribe(grupo => {
                    if (grupo !== null) {
                      temp.GrupoInvestigacion = <any>grupo;
                      this.cidcService.get('subtypes/' + temp.LineaInvestigacionId)
                        .subscribe(linea => {
                          if (linea !== null) {
                            temp.LineaInvestigacion = <any>linea;
                            // temp.LineaInvestigacion.name = temp.LineaInvestigacion.LineaInvestigacion.name;
                            // this.formPropuestaGrado.campos[this.getIndexForm('LineaInvestigacion')].opciones.push(temp.LineaInvestigacion);
                            //  temp.TipoProyecto = temp.TipoProyectoId;
                            this.info_propuesta_grado = temp;
                          }
                        },
                          (error: HttpErrorResponse) => {
                            Swal.fire({
                              icon: 'error',
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
                        icon: 'error',
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
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.propuesta_grado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    // this.inscripcionService.get('propuesta/?query=InscripcionId:' + this.inscripcion_id +
    //   '&limit=0')
    //   .subscribe(res => {
    //     if (res !== null) {
    //       const propuesta = <any>res[0];
    //       this.estado_inscripcion = res[0].InscripcionId.EstadoInscripcionId.Id;
    //       this.info_propuesta_grado = propuesta;
    //       this.coreService.get('linea_investigacion_grupo_investigacion/' +
    //         propuesta.GrupoInvestigacionLineaInvestigacionId)
    //         .subscribe(linea_grupo => {
    //           const linea_grupo_info = <any>linea_grupo;
    //           this.coreService.get('grupo_investigacion/' +
    //             linea_grupo_info.GrupoInvestigacionId)
    //             .subscribe(grupo => {
    //               propuesta.GrupoInvestigacion = <any>grupo;
    //               this.coreService.get('linea_investigacion/' +
    //                 linea_grupo_info.LineaInvestigacionId)
    //                 .subscribe(linea => {
    //                   propuesta.LineaInvestigacion = <any>linea;
    //                   const soportes = [];
    //                   if (propuesta.DocumentoId + '' !== '0') {
    //                     soportes.push({ Id: propuesta.DocumentoId, key: 'Propuesta' });
    //                   }

    //                   this.nuxeoService.getDocumentoById$(soportes, this.documentoService)
    //                     .subscribe(response => {
    //                       propuesta.DocumentoId = this.cleanURL(response['Propuesta'] + '');
    //                       this.info_propuesta_grado = propuesta;
    //                     },
    //                       (error: HttpErrorResponse) => {
    //                         Swal.fire({
    //                           icon:'error',
    //                           title: error.status + '',
    //                           text: this.translate.instant('ERROR.' + error.status),
    //                           footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                             this.translate.instant('GLOBAL.propuesta_grado') + '|' +
    //                             this.translate.instant('GLOBAL.soporte_documento'),
    //                           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                         });
    //                       });
    //                 },
    //                   (error: HttpErrorResponse) => {
    //                     Swal.fire({
    //                       icon:'error',
    //                       title: error.status + '',
    //                       text: this.translate.instant('ERROR.' + error.status),
    //                       footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                         this.translate.instant('GLOBAL.grupo_investigacion') + '|' +
    //                         this.translate.instant('GLOBAL.linea_investigacion'),
    //                       confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                     });
    //                   });
    //             },
    //               (error: HttpErrorResponse) => {
    //                 Swal.fire({
    //                   icon:'error',
    //                   title: error.status + '',
    //                   text: this.translate.instant('ERROR.' + error.status),
    //                   footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                     this.translate.instant('GLOBAL.grupo_investigacion') + '|' +
    //                     this.translate.instant('GLOBAL.grupo_investigacion'),
    //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                 });
    //               });
    //         },
    //           (error: HttpErrorResponse) => {
    //             Swal.fire({
    //               icon:'error',
    //               title: error.status + '',
    //               text: this.translate.instant('ERROR.' + error.status),
    //               footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                 this.translate.instant('GLOBAL.propuesta_grado') + '|' +
    //                 this.translate.instant('GLOBAL.grupo_investigacion'),
    //               confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //             });
    //           });
    //     }
    //   },
    //     (error: HttpErrorResponse) => {
    //       Swal.fire({
    //         icon:'error',
    //         title: error.status + '',
    //         text: this.translate.instant('ERROR.' + error.status),
    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //           this.translate.instant('GLOBAL.propuesta_grado'),
    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //       });
    //     });
  }

  loadPropuestaGrado(): void {
    this.inscripcionService.get('propuesta?query=Activo:true,InscripcionId:' + Number(window.sessionStorage.getItem('IdInscripcion')))
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const temp = <PropuestaGrado>res[0];
          const files9 = []
          if (temp.DocumentoId + '' !== '0') {
            files9.push({ Id: temp.DocumentoId, key: 'FormatoProyecto' });
          }
          this.newNuxeoService.get(files9).subscribe(
            response_2 => {
              console.log("////////// nuxeo get ////////")
              const filesResponse_2 = <any>response_2;
              if ((Object.keys(filesResponse_2).length !== 0) && (filesResponse_2 !== undefined)) {
                temp.FormatoProyecto = filesResponse_2[0].url;
                temp.Soporte = {
                  ...temp,
                  ...{ Documento: filesResponse_2[0].Documento },
                }
                this.FormatoProyecto = temp.DocumentoId;
                console.log("///> ", temp)
                if (temp.GrupoInvestigacionId === 0) {
                  temp.GrupoInvestigacion = <any>{ name: "No aplica" };
                  this.info_propuesta_grado = temp;
                } else {
                  this.cidcService.get('research_units/' + temp.GrupoInvestigacionId)
                    .subscribe(grupo => {
                      if (grupo !== null) {
                        temp.GrupoInvestigacion = <any>grupo;
                        this.info_propuesta_grado = temp;
                      }
                    }, (error: HttpErrorResponse) => {
                      this.listo.emit(false);
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                          this.translate.instant('GLOBAL.grupo_investigacion'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
                }

                if (temp.LineaInvestigacionId === 0) {
                  temp.LineaInvestigacion = <any>{ st_name: "No aplica" };
                  this.info_propuesta_grado = temp;
                } else {
                  this.cidcService.get('subtypes/' + temp.LineaInvestigacionId)
                    .subscribe(linea => {
                      if (linea !== null) {
                        temp.LineaInvestigacion = <any>linea;
                        this.info_propuesta_grado = temp;
                      }
                    }, (error: HttpErrorResponse) => {
                      this.listo.emit(false);
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                          this.translate.instant('GLOBAL.linea_investigacion'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
                }
                this.listo.emit(true);
              }
            },
              (error: HttpErrorResponse) => {
                this.listo.emit(false);
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        } else {
          this.listo.emit(true);
        }
      },
        (error: HttpErrorResponse) => {
          this.listo.emit(false);
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.propuesta_grado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  verPropuesta(document) {
    document.Id = document.DocumentoId;
    this.revisar_doc.emit(document);
  }

  ngOnInit() {
    this.loadPropuestaGrado();
  }
}
