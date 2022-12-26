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
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { ZipManagerService } from '../../../@core/utils/zip-manager.service';
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
  ViendoSoportes: boolean = false;

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

  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sgaMidService: SgaMidService,
    private sanitization: DomSanitizer,
    private users: UserService,
    private newNuxeoService: NewNuxeoService,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService) {
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
            this.info_produccion_academica.forEach((produccion) => {
              produccion["VerSoportes"] = false;
              produccion["Soportes"] = [];
              produccion.Metadatos.forEach((m) => {
                let itemForm = JSON.parse(m.MetadatoSubtipoProduccionId.TipoMetadatoId.FormDefinition)
                if ( itemForm.etiqueta == "file") {
                  this.newNuxeoService.get([{Id: m.Valor}]).subscribe(
                    (response) => {
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(response[0].Metadatos);
                      let prepareNombre: string = (produccion.SubtipoProduccionId.Nombre).toUpperCase() + ' (' + produccion.Titulo + ')';
                      let prepareDoc = {
                        Documento: response[0]["Documento"],
                        DocumentoId: response[0].Id,
                        aprobado: estadoDoc.aprobado,
                        estadoObservacion: estadoDoc.estadoObservacion,
                        observacion: estadoDoc.observacion,
                        nombreDocumento: this.translate.instant('produccion_academica.'+itemForm.label_i18n),
                        tabName: prepareNombre, 
                        carpeta: "Produccion Academica/"+prepareNombre.replace(/[\<\>\:\"\|\?\*\/\.]/g,'')};
                      produccion["Soportes"].push(prepareDoc);
                    this.zipManagerService.adjuntarArchivos([prepareDoc]);
                    }
                  );
                  
                }
              });
            });
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

  verListaDocumentos(produccionClicked) {
    this.info_produccion_academica.forEach((produccion) => {
      if(produccionClicked.Id == produccion.Id) {
        produccion["VerSoportes"] = !produccion["VerSoportes"];
      } else {
        produccion["VerSoportes"] = false;
      }
    });
    this.ViendoSoportes = this.info_produccion_academica.some((produccion) => produccion["VerSoportes"] == true);    
  }

  verDocumento(document) {
    this.revisar_doc.emit(document);
  }
}
