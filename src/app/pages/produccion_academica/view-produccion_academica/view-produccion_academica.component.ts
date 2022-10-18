import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CIDCService } from '../../../@core/data/cidc.service';
import { ProduccionAcademicaPost } from '../../../@core/data/models/produccion_academica/produccion_academica';
import { SgaMidService } from '../../../@core/data/sga_mid.service';

@Component({
  selector: 'ngx-view-produccion-academica',
  templateUrl: './view-produccion_academica.component.html',
  styleUrls: ['./view-produccion_academica.component.scss'],
})
export class ViewProduccionAcademicaComponent implements OnInit {
  info_produccion_academica: ProduccionAcademicaPost[];
  persona_id: number;
  inscripcion_id: number;
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: number) {
    if (info && info !== null && info !== 0 && info.toString() !== '') {
      this.persona_id = info;
      this.loadData();
    }
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion_id = info2;
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  constructor(private translate: TranslateService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sgaMidService: SgaMidService,
    private sanitization: DomSanitizer,
    private users: UserService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    //    this.persona_id = parseInt(sessionStorage.getItem('TerceroId'));
//    this.loadData();
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
    this.sgaMidService.get('produccion_academica/pr_academica/' + this.persona_id)
      .subscribe((res: any) => {
        if (res !== null) {
          if (res.Response.Code === '200') {
            this.info_produccion_academica = <Array<ProduccionAcademicaPost>>res.Response.Body[0];
          } else if (res.Response.Code === '400') {
            Swal.fire({
              icon: 'error',
              title: '400',
              text: this.translate.instant('ERROR.400'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }
        }
      }, (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  ngOnInit() {
  }
}
