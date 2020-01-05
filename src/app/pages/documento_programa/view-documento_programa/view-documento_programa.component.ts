import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocumentoProgramaService } from '../../../@core/data/documento_programa.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'ngx-view-documento-programa',
  templateUrl: './view-documento_programa.component.html',
  styleUrls: ['./view-documento_programa.component.scss'],
})
export class ViewDocumentoProgramaComponent implements OnInit {
  persona_id: number;
  inscripcion_id: number;
  periodo_id: number;
  estado_inscripcion: number;
  info_documento_programa: any;
  programaDocumento: any;
  dataSop: Array<any>;
  docSoporte = [];

  @Input('persona_id')
  set info(info: number) {
    this.persona_id = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion_id = info2;
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== '') {
      this.loadData();
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  constructor(private translate: TranslateService,
    private documentoProgramaService: DocumentoProgramaService,
    private inscripcionService: InscripcionService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sanitization: DomSanitizer,
    private users: UserService) {
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      });
      this.persona_id = this.users.getPersonaId();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  loadData(): void {
    this.info_documento_programa = <any>[];
    this.inscripcionService.get('inscripcion/' + this.inscripcion_id)
      .subscribe(dato_inscripcion => {
        const inscripciondata = <any>dato_inscripcion;
        const programa = inscripciondata.ProgramaAcademicoId;
        const periodo = inscripciondata.PeriodoId;
        this.documentoProgramaService.get('soporte_documento_programa/?query=PersonaId:' +
          this.persona_id + '&limit=0')
          .subscribe(res => {
            if (res !== null && JSON.stringify(res[0]) !== '{}') {
              res.forEach(element => {
                this.documentoProgramaService.get('documento_programa/' + element.DocumentoProgramaId.Id)
                  .subscribe(documentoPrograma => {
                    if (documentoPrograma !== null && JSON.stringify(documentoPrograma[0]) !== '{}') {
                      this.programaDocumento =  <Array<any>>documentoPrograma;
                      // if (this.programaDocumento.PeriodoId === this.periodo) {
                        element.DocumentoPrograma = this.programaDocumento;
                        this.documentoProgramaService.get('tipo_documento_programa/' +
                          this.programaDocumento.TipoDocumentoProgramaId.Id)
                          .subscribe(tipoDocumentoPrograma => {
                            if (tipoDocumentoPrograma !== null && JSON.stringify(tipoDocumentoPrograma[0]) !== '{}') {
                              const tipoProgramaDocumento =  <Array<any>>tipoDocumentoPrograma;
                              element.DocumentoPrograma.TipoDocumentoPrograma = tipoProgramaDocumento;
                              
                              this.info_documento_programa.push(element);

                              this.nuxeoService.getDocumentoById$([
                                { Id: element.DocumentoId, key: 'DocumentoPrograma' + element.DocumentoId},
                              ], this.documentoService)
                                .subscribe(response => {
                                  const documentosSoporte = <Array<any>>response;
                                  // if (Object.values(documentosSoporte).length === data.length) {
                                    // for (let i = 0; i < data.length; i++) {
                                  element.Documento = this.cleanURL(documentosSoporte['DocumentoPrograma'+ element.DocumentoId + '']);
                                    // }      
                                  // }
                                },
                                (error: HttpErrorResponse) => {
                                  Swal({
                                    type: 'error',
                                    title: error.status + '',
                                    text: this.translate.instant('ERROR.' + error.status),
                                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                      this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
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
                                this.translate.instant('GLOBAL.tipo_documento_programa'),
                              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                            });
                          });
                      // }
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
    // this.inscripcionService.get('inscripcion/' + this.inscripcion_id)
    //   .subscribe(dato_inscripcion => {
    //     const inscripciondata = <any>dato_inscripcion;
    //     this.periodo_id = inscripciondata.PeriodoId;
    //     const programa = inscripciondata.ProgramaAcademicoId;
    //     this.estado_inscripcion = inscripciondata.EstadoInscripcionId.Id;
    //     this.documentoProgramaService.get('soporte_documento_programa/?query=PersonaId:' + this.persona_id +
    //       ',DocumentoProgramaId.PeriodoId:' + this.periodo_id + ',DocumentoProgramaId.ProgramaId:' + programa +
    //       '&sortby=Id&order=asc&limit=0')
    //       .subscribe(res => {
    //         if (res !== null) {
    //           this.dataSop = <Array<any>>res;
    //           const soportesSop = [];
    //           let archivos = 0;
    //           for (let i = 0; i < this.dataSop.length; i++) {
    //             if (this.dataSop[i].DocumentoId + '' !== '0') {
    //               soportesSop.push({ Id: this.dataSop[i].DocumentoId, key: 'DocumentoSop' + i });
    //               archivos = i;
    //             }
    //           }

    //           this.nuxeo.getDocumentoById$(soportesSop, this.docService)
    //           .subscribe(response2 => {
    //             this.docSoporte = <Array<any>>response2;
    //             if (Object.values(this.docSoporte).length > this.dataSop.length && this.docSoporte['DocumentoSop' + archivos] !== undefined &&
    //               this.dataSop[archivos].DocumentoId > 0) {
    //                 let contadorSop = 0;
    //                 this.dataSop.forEach(elementSop => {
    //                   this.documentoProgramaService.get('documento_programa/' + elementSop.DocumentoProgramaId.Id)
    //                     .subscribe(documentoPrograma => {
    //                       if (documentoPrograma !== null) {
    //                         this.programaDocumento =  <any>documentoPrograma;
    //                         if (this.programaDocumento.PeriodoId === this.periodo_id) {
    //                           elementSop.DocumentoPrograma = this.programaDocumento;
    //                           this.documentoProgramaService.get('tipo_documento_programa/' +
    //                             this.programaDocumento.TipoDocumentoProgramaId.Id)
    //                             .subscribe(tipoDocumentoPrograma => {
    //                               if (tipoDocumentoPrograma !== null) {
    //                                 elementSop.TipoDocumentoPrograma = <any>tipoDocumentoPrograma;
    //                                 elementSop.DocumentoId = this.cleanURL(this.docSoporte['DocumentoSop' + contadorSop] + '');
    //                                 contadorSop++;
    //                                 this.info_documento_programa.push(elementSop);
    //                               }
    //                             },
    //                               (error: HttpErrorResponse) => {
    //                                 Swal({
    //                                   type: 'error',
    //                                   title: error.status + '',
    //                                   text: this.translate.instant('ERROR.' + error.status),
    //                                   footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                                     this.translate.instant('GLOBAL.tipo_documento_programa'),
    //                                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                                 });
    //                               });
    //                         }
    //                       }
    //                     },
    //                       (error: HttpErrorResponse) => {
    //                         Swal({
    //                           type: 'error',
    //                           title: error.status + '',
    //                           text: this.translate.instant('ERROR.' + error.status),
    //                           footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                             this.translate.instant('GLOBAL.documento_programa'),
    //                           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                         });
    //                       });
    //                 });
    //               }
    //             },
    //             (error: HttpErrorResponse) => {
    //               Swal({
    //                 type: 'error',
    //                 title: error.status + '',
    //                 text: this.translate.instant('ERROR.' + error.status),
    //                 footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                   this.translate.instant('GLOBAL.documento_programa') + '|' +
    //                   this.translate.instant('GLOBAL.soporte_documento'),
    //                 confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //               });
    //             });
    //         }
    //       },
    //         (error: HttpErrorResponse) => {
    //           Swal({
    //             type: 'error',
    //             title: error.status + '',
    //             text: this.translate.instant('ERROR.' + error.status),
    //             footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //               this.translate.instant('GLOBAL.documento_programa'),
    //             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //           });
    //         });
    //   },
    //     (error: HttpErrorResponse) => {
    //       Swal({
    //         type: 'error',
    //         title: error.status + '',
    //         text: this.translate.instant('ERROR.' + error.status),
    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //           this.translate.instant('GLOBAL.admision'),
    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //       });
    // });
  }

  ngOnInit() {
  }
}
