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
  persona_id: number;
  inscripcion: number;
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: number) {
    if (info) {
      this.persona_id = info;
      // this.loadInfoIdioma();
      this.loadData();
    }
  };

  @Input('inscripcion_id')
  set dato(info_inscripcion_id: number) {
    if (info_inscripcion_id !== undefined && info_inscripcion_id !== 0 && info_inscripcion_id.toString() !== '') {
      this.inscripcion = info_inscripcion_id;
    }
  }

  // tslint:disable-next-line: no-output-rename
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
    this.persona_id = parseInt(sessionStorage.getItem('TerceroId'));
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    this.loadData();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  loadData(): void {
    this.idiomaService.get('conocimiento_idioma?query=TercerosId:' + this.persona_id +
      '&limit=0')
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const data = <Array<any>>res;
          this.info_idioma = data;
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
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
