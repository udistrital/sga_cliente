import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { IdiomaService } from '../../../@core/data/idioma.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { UserService } from '../../../@core/data/users.service';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'ngx-view-idiomas',
  templateUrl: './view-idiomas.component.html',
  styleUrls: ['./view-idiomas.component.scss'],
})
export class ViewIdiomasComponent implements OnInit {
  ente: number;
  inscripcion: number;

  @Input('persona_id')
  set info(info: number) {
    this.ente = info;
    this.loadInfoIdioma();
  };

  @Input('inscripcion_id')
  set dato(info_inscripcion_id: number) {
    if (info_inscripcion_id !== undefined && info_inscripcion_id !== 0 && info_inscripcion_id.toString() !== '') {
      this.inscripcion = info_inscripcion_id;
    }
  }

  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  info_idioma: any;
  info_examen: any;

  constructor(
    private translate: TranslateService,
    private users: UserService,
    private inscripcionService: InscripcionService,
    private idiomaService: IdiomaService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.ente = this.users.getEnte();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  public loadInfoIdioma(): void {
    this.idiomaService.get('conocimiento_idioma/?query=Persona:' + this.ente +
      '&limit=0')
      .subscribe(res => {
        if (res !== null) {
          this.info_idioma = <Array<any>>res;
          if (this.inscripcion !== undefined && this.inscripcion !== 0 && this.inscripcion.toString() !== '') {
            this.inscripcionService.get('inscripcion_posgrado/?query=InscripcionId:' + this.inscripcion)
              .subscribe(resexamen => {
                this.info_examen = <any>resexamen[0];
                if (this.info_examen !== null && this.info_examen.Type !== 'error') {
                  this.idiomaService.get('idioma/' + this.info_examen.Idioma)
                    .subscribe(resex => {
                      if (resex !== null) {
                        this.info_examen.Idioma = <any>resex;
                      }
                    },
                      (error: HttpErrorResponse) => {
                        Swal({
                          type: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.cargar') + '-' +
                            this.translate.instant('GLOBAL.idiomas'),
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
                      this.translate.instant('GLOBAL.idioma_examen'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          }
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.idiomas'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  ngOnInit() {
  }
}
