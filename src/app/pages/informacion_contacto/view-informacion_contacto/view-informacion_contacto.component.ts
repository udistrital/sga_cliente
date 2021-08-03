import { InfoContactoGet } from '../../../@core/data/models/ente/info_contacto_get';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-view-informacion-contacto',
  templateUrl: './view-informacion_contacto.component.html',
  styleUrls: ['./view-informacion_contacto.component.scss'],
})
export class ViewInformacionContactoComponent implements OnInit {

  info_informacion_contacto: any;
  persona_id: number;

  // @Input('informacion_contacto_id')
  // set name(informacion_contacto_id: number) {
  //   this.informacion_contacto_id = informacion_contacto_id;
  //   this.loadInformacionContacto();
  // }

  @Input('persona_id')
  set info(info: number) {
    if (info) {
      this.persona_id = info;
      this.loadInformacionContacto();
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private sgaMidService: SgaMidService,
    private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  public loadInformacionContacto(): void {
    if (this.persona_id !== undefined && this.persona_id !== 0 &&
      this.persona_id.toString() !== '') {
        this.sgaMidService.get(`inscripciones/info_complementaria_tercero/${this.persona_id}`)
          .subscribe(res => {
            if (res !== null) {
              this.info_informacion_contacto = <any>res;
            }
          },
            (error: HttpErrorResponse) => {
              Swal.fire({
                icon:'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('informacion_contacto_posgrado.informacion_contacto_no_registrada'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
      // this.campusMidService.get('persona/consultar_contacto/' + this.informacion_contacto_id)
      //   .subscribe(res => {
      //     const r = <any>res;
      //     if (r !== null && r.Type !== 'error') {
      //       this.info_informacion_contacto = <InfoContactoGet>res;
      //     } else {
      //       this.info_informacion_contacto = undefined;
      //     }
      //   },
      //     (error: HttpErrorResponse) => {
      //       Swal.fire({
      //         icon:'error',
      //         title: error.status + '',
      //         text: this.translate.instant('ERROR.' + error.status),
      //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
      //           this.translate.instant('GLOBAL.informacion_contacto'),
      //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      //       });
      //     });
    } else {
      this.info_informacion_contacto = undefined;
    }
  }

  ngOnInit() {
  }
}
