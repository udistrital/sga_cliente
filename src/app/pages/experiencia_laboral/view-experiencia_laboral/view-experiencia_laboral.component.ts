import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
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
  ente: number;
  info_experiencia_laboral: any;
  data: Array<any>;

  @Input('persona_id')
  set info(info: number) {
    this.ente = info;
    this.loadData();
  }

  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  organizacion: any;
  soporte: any;
  documentosSoporte = [];

  constructor(
    private translate: TranslateService,
    private campusMidService: CampusMidService,
    private ubicacionesService: UbicacionService,
    private experienciaService: ExperienciaService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sanitization: DomSanitizer,
    private users: UserService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.ente = this.users.getEnte();
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.info_experiencia_laboral = <any>[];
    this.experienciaService.get('soporte_experiencia_laboral/?query=ExperienciaLaboral.Persona:' + this.ente +
      '&sortby=Id&order=asc&limit=0')
      .subscribe(res => {
        if (res !== null) {
          const data = <Array<any>>res;
          const soportes = [];
          const id_exp = [];

          for (let i = 0; i < data.length; i++) {
            if (data[i].Documento + '' !== '0') {
              soportes.push({ Id: data[i].Documento, key: 'DocumentoExp' + i });
              id_exp.push(data[i].ExperienciaLaboral.Id);
            }
          }

          this.nuxeoService.getDocumentoById$(soportes, this.documentoService)
            .subscribe(response => {
              this.documentosSoporte = <Array<any>>response;

              if (Object.values(this.documentosSoporte).length === data.length) {
                this.experienciaService.get('experiencia_laboral/?query=Persona:' + this.ente +
                  '&sortby=Id&order=asc&limit=0')
                  .subscribe(res2 => {
                    if (res2 !== null) {
                      const data2 = <Array<any>>res2;
                      let contador = 0;
                      data2.forEach(element => {
                        this.campusMidService.get('organizacion/' + element.Organizacion)
                          .subscribe(organizacion => {
                            if (organizacion !== null) {
                              const organizacion_info = <any>organizacion;
                              element.Organizacion = organizacion_info;
                              this.ubicacionesService.get('lugar/' + organizacion_info.Ubicacion.UbicacionEnte.Lugar)
                                .subscribe(pais => {
                                  if (pais !== null) {
                                    const pais_info = <any>pais;
                                    element.PaisEmpresa = pais_info.Nombre;
                                    element.Documento = this.cleanURL(this.documentosSoporte['DocumentoExp' + contador] + '');
                                    contador++;
                                    this.info_experiencia_laboral.push(element);
                                  }
                                },
                                  (error: HttpErrorResponse) => {
                                    Swal({
                                      type: 'error',
                                      title: error.status + '',
                                      text: this.translate.instant('ERROR.' + error.status),
                                      footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                        this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
                                        this.translate.instant('GLOBAL.pais_empresa'),
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
                                  this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
                                  this.translate.instant('GLOBAL.nombre_empresa'),
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
                        this.translate.instant('GLOBAL.experiencia_laboral'),
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
              this.translate.instant('GLOBAL.experiencia_laboral'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  ngOnInit() {
  }
}
