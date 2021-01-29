import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { SgaMidService } from './../../../@core/data/sga_mid.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { ExperienciaService } from '../../../@core/data/experiencia.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../@core/data/users.service';

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

  organizacion: any;
  soporte: any;
  documentosSoporte = [];

  constructor(
    private translate: TranslateService,
    private campusMidService: CampusMidService,
    private sgaMidService: SgaMidService,
    private ubicacionesService: UbicacionService,
    private experienciaService: ExperienciaService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sanitization: DomSanitizer,
    private users: UserService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.persona_id = this.users.getPersonaId();
    this.loadData();
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
        const r = <any>response;
        const soportes = [];
        if (response !== null && r.Data.Code != '400') {

          this.data = <Array<any>>response.Data.Body[1];
          this.info_experiencia_laboral = this.data;

          for (let i = 0; i < this.info_experiencia_laboral.length; i++) {
            if (this.info_experiencia_laboral[i].Soporte + '' !== '0') {
              soportes.push({ Id: this.info_experiencia_laboral[i].Soporte, key: 'DocumentoExp' + i });
            }
          }

          this.nuxeoService.getDocumentoById$(soportes, this.documentoService)
            .subscribe(response => {
              this.documentosSoporte = <Array<any>>response;
              if (Object.values(this.documentosSoporte).length === this.info_experiencia_laboral.length) {
                for (let i = 0; i < this.info_experiencia_laboral.length; i++) {
                  this.info_experiencia_laboral[i].Soporte = this.cleanURL(this.documentosSoporte['DocumentoExp' + i]);
                }
              }
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
          footer: this.translate.instant('experiencia_laboral.cargar_experiencia'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });

  }

  ngOnInit() {
  }
}
