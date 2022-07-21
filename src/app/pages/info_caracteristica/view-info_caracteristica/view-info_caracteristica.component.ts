import { InfoCaracteristica } from '../../../@core/data/models/informacion/info_caracteristica';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { SgaMidService } from '../../../@core/data/sga_mid.service';

@Component({
  selector: 'ngx-view-info-caracteristica',
  templateUrl: './view-info_caracteristica.component.html',
  styleUrls: ['./view-info_caracteristica.component.scss'],
})
export class ViewInfoCaracteristicaComponent implements OnInit {

  info_info_caracteristica: InfoCaracteristica;
  info_caracteristica_id: number;

  @Input('info_caracteristica_id')
  set info(info: number) {
    this.info_caracteristica_id = info;
    this.loadInfoCaracteristica();
  };

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

  public loadInfoCaracteristica(): void {
    if (this.info_caracteristica_id !== undefined && this.info_caracteristica_id !== 0 &&
      this.info_caracteristica_id.toString() !== '') {
      this.sgaMidService.get('/persona/consultar_complementarios/' + this.info_caracteristica_id)
        .subscribe(res => {
          const r = <any>res;
          if (r !== null && r.Type !== 'error') {
            this.info_info_caracteristica = <InfoCaracteristica>res;
          } else {
            this.info_info_caracteristica = undefined;
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon:'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.info_info_caracteristica = undefined;
    }
  }

  ngOnInit() {
  }
}
