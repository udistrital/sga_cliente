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
import { InfoCaracteristica } from '../../../@core/data/models/informacion/info_caracteristica';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'ngx-view-info-persona',
  templateUrl: './view-info-persona.component.html',
  styleUrls: ['./view-info-persona.component.scss'],
})
export class ViewInfoPersonaComponent implements OnInit {

  info_persona_id: number;
  info_info_persona: InfoPersona;
  info_persona_user: string;

  info_info_caracteristica: InfoCaracteristica;
  tipoDiscapacidad: string = undefined;
  tipoPoblacion: string = undefined;
  idSoporteDiscapacidad: number = undefined;
  idSoportePoblacion: number = undefined;
  docDiscapacidad: any;
  docPoblacion: any;

  @Input('persona_id')
  set name(persona_id: number) {
    this.info_persona_id = persona_id;
    this.loadInfoPersona();
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

   // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  constructor(private sgaMidService: SgaMidService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private translate: TranslateService,
    private userService: UserService,
    private newNuxeoService: NewNuxeoService,
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
            this.sgaMidService.get('persona/consultar_complementarios/' + this.info_persona_id)
            .subscribe( res => {
              if (res !== null && res.Response.Code !== '404') {
                this.info_info_caracteristica = <InfoCaracteristica>res.Response.Body[0].Data;

                if(this.info_info_caracteristica.hasOwnProperty('IdDocumentoDiscapacidad')){
                  this.idSoporteDiscapacidad = <number>this.info_info_caracteristica["IdDocumentoDiscapacidad"];
                  this.newNuxeoService.get([{Id: this.idSoporteDiscapacidad}]).subscribe(
                    respose => {
                      this.docDiscapacidad = respose[0];
                    }
                  )
                  this.tipoDiscapacidad = "";
                  let total = this.info_info_caracteristica.TipoDiscapacidad.length - 1;
                  this.info_info_caracteristica.TipoDiscapacidad.forEach((dis, i) => {
                    this.tipoDiscapacidad += dis.Nombre;
                    if(i < total){
                      this.tipoDiscapacidad += ", ";
                    }
                  });
                }

                if(this.info_info_caracteristica.hasOwnProperty('IdDocumentoPoblacion')){
                  this.idSoportePoblacion = <number>this.info_info_caracteristica["IdDocumentoPoblacion"];
                  this.newNuxeoService.get([{Id: this.idSoportePoblacion}]).subscribe(
                    respose => {
                      this.docPoblacion = respose[0];
                    }
                  )
                  this.tipoPoblacion = "";
                  let total = this.info_info_caracteristica.TipoPoblacion.length - 1;
                  this.info_info_caracteristica.TipoPoblacion.forEach((dis, i) => {
                    this.tipoPoblacion += dis.Nombre;
                    if(i < total){
                      this.tipoPoblacion += ", ";
                    }
                  });
                }
                
              } else {
                this.info_info_caracteristica = undefined;
              }
            },
            (error: HttpErrorResponse) => {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
            })
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

  verInfoCaracteristca(documento: any) {
    documento.DocumentoId = documento.Id;
    this.revisar_doc.emit(documento);
  }
}
