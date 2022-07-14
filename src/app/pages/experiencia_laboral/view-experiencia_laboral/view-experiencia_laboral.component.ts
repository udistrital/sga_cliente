import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { SgaMidService } from './../../../@core/data/sga_mid.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'ngx-view-experiencia-laboral',
  templateUrl: './view-experiencia_laboral.component.html',
  styleUrls: ['./view-experiencia_laboral.component.scss'],
})
export class ViewExperienciaLaboralComponent implements OnInit {
  persona_id: number;
  info_experiencia_laboral: any;
  data: Array<any>;

  @Input('persona_id')
  set info(info: number) {
    if (info) {
      this.persona_id = info;
      this.loadData();
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  organizacion: any;
  soporte: any;
  documentosSoporte = [];
  variable = this.translate.instant('solicitudes.tooltip_ver_registro')

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private nuxeoService: NuxeoService,
    private newNuxeoService: NewNuxeoService,
    private sanitization: DomSanitizer) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
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

  loadData(): void {
    this.info_experiencia_laboral = <any>[];
    this.sgaMidService.get('experiencia_laboral/by_tercero?Id=' + this.persona_id).subscribe(
      (response: any) => {
        const soportes = [];
        if (response.Data.Code === '200') {
          this.data = <Array<any>>response.Data.Body[1];
          this.info_experiencia_laboral = this.data;
          for (let i = 0; i < this.info_experiencia_laboral.length; i++) {
            if (this.info_experiencia_laboral[i].Soporte + '' !== '0') {
              soportes.push({ Id: this.info_experiencia_laboral[i].Soporte, key: 'DocumentoExp' + this.info_experiencia_laboral[i].Soporte });
              this.info_experiencia_laboral[i].IdDoc = parseInt(this.info_experiencia_laboral[i].Soporte,10);
            }
          }
          this.newNuxeoService.get(soportes).subscribe(
            response => {
                this.documentosSoporte = <Array<any>>response;
                console.log("sop:",soportes)
                console.log("new method",JSON.parse(JSON.stringify(this.documentosSoporte)));
                if (Object.values(this.documentosSoporte).length === this.info_experiencia_laboral.length) {
                  console.log("si length exp:", JSON.parse(JSON.stringify(this.info_experiencia_laboral)))
                  this.info_experiencia_laboral.forEach(info => {
                    let doc = this.documentosSoporte.find(doc => doc.Id == info.IdDoc);
                    console.log("doc for: ", info.Soporte, " > ", doc)
                    if (doc !== undefined) {
                      info.Soporte = doc;
                    }
                  });
                  /* for (let i = 0; i < this.info_experiencia_laboral.length; i++) {
                    this.info_experiencia_laboral[i].Soporte = this.documentosSoporte[i];
                  } */
                }
                console.log("exp lab:", this.info_experiencia_laboral)
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon:'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
                    this.translate.instant('GLOBAL.soporte_documento'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        } if (response.Data.Code === "400") {
          Swal.fire({
            icon:'error',
            text: this.translate.instant('ERROR 400'),
            footer: this.translate.instant('experiencia_laboral.cargar_experiencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon:'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('experiencia_laboral.cargar_experiencia'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  verDocumento(document) {
    this.revisar_doc.emit(document);
  }

  ngOnInit() {
  }
}
