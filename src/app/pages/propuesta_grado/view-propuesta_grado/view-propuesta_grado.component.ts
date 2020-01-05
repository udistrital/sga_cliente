import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { PropuestaGrado } from './../../../@core/data/models/inscripcion/propuesta_grado';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CIDCService } from '../../../@core/data/cidc.service';

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

  @Input('persona_id')
  set info(info: number) {
    this.persona_id = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion_id = info2;
    if (this.inscripcion_id !== null && this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '') {
      this.loadData();
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  constructor(private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private cidcService: CIDCService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sanitization: DomSanitizer,
    private users: UserService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.persona_id = this.users.getPersonaId();
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
            this.nuxeoService.getDocumentoById$(files9, this.documentoService)
              .subscribe(response_2 => {
                const filesResponse_2 = <any>response_2;
                if ((Object.keys(filesResponse_2).length !== 0) && (filesResponse_2['FormatoProyecto'] !== undefined)) {
                  temp.Documento = this.cleanURL(filesResponse_2['FormatoProyecto'] + '');
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
                      this.translate.instant('GLOBAL.soporte_documento'),
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
    //                         Swal({
    //                           type: 'error',
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
    //                     Swal({
    //                       type: 'error',
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
    //                 Swal({
    //                   type: 'error',
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
    //             Swal({
    //               type: 'error',
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
    //       Swal({
    //         type: 'error',
    //         title: error.status + '',
    //         text: this.translate.instant('ERROR.' + error.status),
    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //           this.translate.instant('GLOBAL.propuesta_grado'),
    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //       });
    //     });
  }

  ngOnInit() {
  }
}
