import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PopUpManager } from '../../../managers/popUpManager';
import { Documento } from '../../../@core/data/models/documento/documento';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'ngx-view-documento-programa',
  templateUrl: './view-documento_programa.component.html',
  styleUrls: ['./view-documento_programa.component.scss'],
})
export class ViewDocumentoProgramaComponent implements OnInit {
  persona_id: number;
  inscripcion_id: number;
  periodo_id: number;
  programa_id: number;
  estado_inscripcion: number;
  info_documento_programa: any;
  programaDocumento: any;
  dataSop: Array<any>;
  docSoporte = [];
  variable = this.translate.instant('GLOBAL.tooltip_ver_registro')

  @Input('persona_id')
  set info(info: number) {
    this.persona_id = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion_id = info2;
  }

  tipoInscripcion_id = parseInt(sessionStorage.getItem('IdTipoInscripcion'), 10)

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sanitization: DomSanitizer,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,
    private userService: UserService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  editar() {
    this.url_editar.emit(true);
  }

  loadData(): void {
    this.info_documento_programa = <any>[];
    this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' +
      this.inscripcion_id + ',DocumentoProgramaId.ProgramaId:' + this.programa_id + ',DocumentoProgramaId.TipoInscripcionId:' + this.tipoInscripcion_id + ',DocumentoProgramaId.PeriodoId:' + parseInt(sessionStorage.getItem('IdPeriodo'), 10) + ',DocumentoProgramaId.Activo:true&limit=0').subscribe(
        (response: any[]) => {
          if (response !== null && Object.keys(response[0]).length > 0 && response[0] != '{}') {
            this.info_documento_programa = response;
            this.info_documento_programa.forEach(doc => {
              this.docSoporte.push({ Id: doc.DocumentoId, key: 'DocumentoPrograma' + doc.DocumentoId })
              doc.IdDoc = doc.DocumentoId;

              this.documentoService.get('documento/' + doc.DocumentoId).subscribe(
                (documento: Documento) => {
                  if (documento.Metadatos !== '') {
                    let metadatos = JSON.parse(documento.Metadatos);
                    if (metadatos.hasOwnProperty('aprobado')) {
                      doc.aprobado = metadatos.aprobado;
                      if (metadatos.aprobado) {
                        doc.estadoObservacion = 'Aprobado';
                        doc.observacion = metadatos.observacion;
                      } else {
                        doc.estadoObservacion = 'No Aprobado';
                        doc.observacion = metadatos.observacion;
                      }
                    }
                  }
                });

            });
            console.log("new nux doc prog")
            console.log(this.docSoporte)
            this.newNuxeoService.get(this.docSoporte).subscribe(
              response => {
                if (Object.keys(response).length > 0) {
                  this.info_documento_programa.forEach(doc => {
                    console.log("response:", response)
                    let f = response.find(file => doc.IdDoc === file.Id);
                    console.log("f find: ",JSON.parse(JSON.stringify(f)))
                    if (f !== undefined) {
                      doc.Documento = f["Documento"];
                    }
                  });
                  console.log("resultado: ",this.info_documento_programa)
                }
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_cargar_documento'));
              },
            );
          } else {
            this.info_documento_programa = null
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_cargar_documento'));
        },
    );
  }

  ngOnInit() {
    this.programa_id = parseInt(sessionStorage.getItem('ProgramaAcademicoId'));
    this.persona_id = this.persona_id ? this.persona_id : this.userService.getPersonaId();
    this.inscripcion_id = this.inscripcion_id ? this.inscripcion_id : parseInt(sessionStorage.getItem('IdInscripcion'));
    this.loadData();
  }

  abrirDocumento(documento: any) {
    documento.Id = documento.DocumentoId;
    this.revisar_doc.emit(documento);
  }
}
