import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { InfoPersona } from '../../../@core/data/models/informacion/info_persona';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { UserService } from '../../../@core/data/users.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-view-info-persona',
  templateUrl: './view-info-persona.component.html',
  styleUrls: ['./view-info-persona.component.scss'],
})
export class ViewInfoPersonaComponent implements OnInit {

  info_persona_id: number;
  info_info_persona: InfoPersona;
  info_persona_user: string;

  @Input('persona_id')
  set name(persona_id: number) {
    this.info_persona_id = persona_id;
    this.loadInfoPersona();
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  constructor(private sgaMidService: SgaMidService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private translate: TranslateService,
    private userService: UserService,
    private popUpManager: PopUpManager) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    // this.loadInfoPersona();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  ngOnInit() {
  }

  public loadInfoPersona(): void {
    const id = this.info_persona_id ? this.info_persona_id : this.userService.getPersonaId();
    if (id !== undefined && id !== 0 && id.toString() !== '') {
      this.sgaMidService.get('persona/consultar_persona/' + id)
        .subscribe(res => {
          const r = <any>res;
          if (r !== null && r.Type !== 'error') {
            this.info_info_persona = <InfoPersona>res;
          } else {
            this.info_info_persona = undefined;
          }
        },
          (error: HttpErrorResponse) => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
          });
    } else {
      this.info_info_persona = undefined
    }
  }
}
