import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { SolicitudDescuento } from '../../../@core/data/models/descuento/solicitud_descuento';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { SgaMidService } from './../../../@core/data/sga_mid.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { PivotDocument } from '../../../@core/utils/pivot_document.service';

@Component({
  selector: 'ngx-view-descuento-academico',
  templateUrl: './view-descuento_academico.component.html',
  styleUrls: ['./view-descuento_academico.component.scss'],
})
export class ViewDescuentoAcademicoComponent implements OnInit {
  persona: number;
  inscripcion: number;
  estado_inscripcion: number;
  periodo: number;
  programa: number;
  info_descuento: any;
  info_temp: any;
  dataInfo:any;
  dataDes: Array<any>;
  solicituddescuento: SolicitudDescuento;
  docDesSoporte = [];
  variable = this.translate.instant('GLOBAL.tooltip_ver_registro')

  @Input('persona_id')
  set info(info: number) {
    this.persona = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion = info2;
    if (this.inscripcion !== undefined && this.inscripcion !== 0 && this.inscripcion.toString() !== '') {
      //this.loadData();
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  constructor(private translate: TranslateService,
    private mid: CampusMidService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sanitization: DomSanitizer,
    private inscripcionService: InscripcionService,
    public pivotDocument : PivotDocument, 
    private sgaMidService: SgaMidService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.pivotDocument.info$.subscribe((data)=> {
      if(data){
        this.dataInfo = data;
        this.loadData(this.dataInfo);
      }
    })
    this.pivotDocument.updateDocument
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  loadData(dataInfo): void {
    this.sgaMidService.get('descuento_academico/descuentopersonaperiododependencia?' +
      'PersonaId=' + dataInfo.TerceroId + '&DependenciaId=' +
      dataInfo.ProgramaAcademicoId+ '&PeriodoId=' + dataInfo.IdPeriodo)
      .subscribe((result: any) => {
        const r = <any>result.Data.Body[1];
        if (result !== null && result.Data.Code == '200') {
          const data = <Array<SolicitudDescuento>>r;
          const soportes = [];
          this.info_descuento = data;
          console.log('info_descuento', this.info_descuento)
          for (let i = 0; i < this.info_descuento.length; i++) {
            if (this.info_descuento[i].DocumentoId + '' !== '0') {
              soportes.push({ Id: this.info_descuento[i].DocumentoId, key: i });
            }
          }
          console.log(soportes);

          this.nuxeoService.getFilesNew(soportes)
            .subscribe(response => {
              this.docDesSoporte = <Array<any>>response;
              console.log(this.docDesSoporte);
                for (let i = 0; i < this.docDesSoporte.length; i++) {
                  (this.info_descuento[this.docDesSoporte[i]['key']]).Soporte = this.docDesSoporte[i];
                }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
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
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.descuento_matricula') + '|' +
              this.translate.instant('GLOBAL.descuento_matricula'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  loadDataOld(): void {
    this.inscripcionService.get('inscripcion/' + this.inscripcion)
      .subscribe(dato_inscripcion => {
        const inscripciondata = <any>dato_inscripcion;
        this.programa = inscripciondata.ProgramaAcademicoId;
        this.periodo = inscripciondata.PeriodoId;
        this.programa = 16;
        this.mid.get(`descuento_academico/descuentopersonaperiododependencia?` +
          `PersonaId=${this.persona}&DependenciaId=${this.programa}&PeriodoId=${this.periodo}`)
          .subscribe(res => {
            if (res !== null) {
              this.info_descuento = <Array<SolicitudDescuento>>res;

              this.info_descuento.forEach(descuento => {
                this.nuxeoService.getDocumentoById$([
                  { Id: descuento.DocumentoId, key: 'DocumentoPrograma' + descuento.DocumentoId },
                ], this.documentoService)
                  .subscribe(response => {
                    const documentosSoporte = <Array<any>>response;
                    // if (Object.values(documentosSoporte).length === data.length) {
                    // for (let i = 0; i < data.length; i++) {
                    descuento.Documento = this.cleanURL(documentosSoporte['DocumentoPrograma' + descuento.DocumentoId + '']);
                    // }
                    // }
                  },
                    (error: HttpErrorResponse) => {
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
                          this.translate.instant('GLOBAL.soporte_documento'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
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
                  this.translate.instant('GLOBAL.descuento_matricula') + '|' +
                  this.translate.instant('GLOBAL.descuento_matricula'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.descuento_matricula') + '|' +
              this.translate.instant('GLOBAL.admision'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    // this.inscripciones.get('inscripcion/' + this.inscripcion)
    //   .subscribe(dato_inscripcion => {
    //     const inscripciondata = <any>dato_inscripcion;
    //     this.programa = inscripciondata.ProgramaAcademicoId;
    //     this.periodo = inscripciondata.PeriodoId;
    //     this.estado_inscripcion = inscripciondata.EstadoInscripcionId.Id;
    //     this.mid.get('descuento_academico/descuentopersonaperiododependencia/?PersonaId=' + this.persona +
    //       '&DependenciaId=' + this.programa + '&PeriodoId=' + this.periodo)
    //       .subscribe(descuentos => {
    //         if (descuentos !== null) {
    //           this.dataDes = <Array<any>>descuentos;
    //           const soportesDes = [];
    //           let archivosDes = 0;

    //           for (let i = 0; i < this.dataDes.length; i++) {
    //             if (this.dataDes[i].DocumentoId + '' !== '0') {
    //               soportesDes.push({ Id: this.dataDes[i].DocumentoId, key: 'DocumentoDes' + i });
    //               archivosDes = i;
    //             }
    //           }

    //           this.nuxeoDes.getDocumentoById$(soportesDes, this.docdesService)
    //             .subscribe(responseDes => {
    //               this.docDesSoporte = <Array<any>>responseDes;

    //               if (Object.values(this.docDesSoporte).length > this.dataDes.length && this.docDesSoporte['DocumentoDes' + archivosDes] !== undefined &&
    //                 this.dataDes[archivosDes].DocumentoId > 0) {
    //                 let contadorDes = 0;
    //                 this.info_descuento = <any>[];

    //                 this.dataDes.forEach(elementDes => {
    //                   elementDes.DocumentoId = this.cleanURL(this.docDesSoporte['DocumentoDes' + contadorDes] + '');
    //                   contadorDes++;
    //                   this.info_descuento.push(elementDes);
    //                 });
    //               }
    //             },
    //               (error: HttpErrorResponse) => {
    //                 Swal.fire({
    //                   icon:'error',
    //                   title: error.status + '',
    //                   text: this.translate.instant('ERROR.' + error.status),
    //                   footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //                     this.translate.instant('GLOBAL.documento_programa'),
    //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //                 });
    //               });
    //         }
    //       },
    //         (error: HttpErrorResponse) => {
    //           Swal.fire({
    //             icon:'error',
    //             title: error.status + '',
    //             text: this.translate.instant('ERROR.' + error.status),
    //             footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //               this.translate.instant('GLOBAL.descuentos_dependencia'),
    //             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //           });
    //         });
    //   },
    //     (error: HttpErrorResponse) => {
    //       Swal.fire({
    //         icon:'error',
    //         title: error.status + '',
    //         text: this.translate.instant('ERROR.' + error.status),
    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //           this.translate.instant('GLOBAL.admision'),
    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //       });
    //   });
  }

  ngOnInit() {
  }
}
