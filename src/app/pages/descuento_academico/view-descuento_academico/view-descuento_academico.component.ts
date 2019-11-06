import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { SolicitudDescuento } from '../../../@core/data/models/descuento/solicitud_descuento';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

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
  dataDes: Array<any>;
  solicituddescuento: SolicitudDescuento;
  docDesSoporte = [];

  @Input('persona_id')
  set info(info: number) {
    this.persona = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion = info2;
    if (this.inscripcion !== undefined && this.inscripcion !== 0 && this.inscripcion.toString() !== '') {
      this.loadData();
    }
  }

  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  constructor(private translate: TranslateService,
    private mid: CampusMidService,
    private docdesService: DocumentoService,
    private nuxeoDes: NuxeoService,
    private sanitization: DomSanitizer,
    private inscripciones: InscripcionService) {
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      });
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.inscripciones.get('inscripcion/' + this.inscripcion)
      .subscribe(dato_inscripcion => {
        const inscripciondata = <any>dato_inscripcion;
        this.programa = inscripciondata.ProgramaAcademicoId;
        this.periodo = inscripciondata.PeriodoId;
        this.estado_inscripcion = inscripciondata.EstadoInscripcionId.Id;
        this.mid.get('descuento_academico/descuentopersonaperiododependencia/?PersonaId=' + this.persona +
          '&DependenciaId=' + this.programa + '&PeriodoId=' + this.periodo)
          .subscribe(descuentos => {
            if (descuentos !== null) {
              this.dataDes = <Array<any>>descuentos;
              const soportesDes = [];
              let archivosDes = 0;

              for (let i = 0; i < this.dataDes.length; i++) {
                if (this.dataDes[i].DocumentoId + '' !== '0') {
                  soportesDes.push({ Id: this.dataDes[i].DocumentoId, key: 'DocumentoDes' + i });
                  archivosDes = i;
                }
              }

              this.nuxeoDes.getDocumentoById$(soportesDes, this.docdesService)
                .subscribe(responseDes => {
                  this.docDesSoporte = <Array<any>>responseDes;

                  if (Object.values(this.docDesSoporte).length > this.dataDes.length && this.docDesSoporte['DocumentoDes' + archivosDes] !== undefined &&
                    this.dataDes[archivosDes].DocumentoId > 0) {
                    let contadorDes = 0;
                    this.info_descuento = <any>[];

                    this.dataDes.forEach(elementDes => {
                      elementDes.DocumentoId = this.cleanURL(this.docDesSoporte['DocumentoDes' + contadorDes] + '');
                      contadorDes++;
                      this.info_descuento.push(elementDes);
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
                  this.translate.instant('GLOBAL.descuentos_dependencia'),
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
              this.translate.instant('GLOBAL.admision'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
      });
  }

  ngOnInit() {
  }
}
