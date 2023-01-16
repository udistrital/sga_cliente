import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import pdfMake from 'pdfmake/build/pdfmake';
import { PivotDocument } from '../../../@core/utils/pivot_document.service';
import html2canvas from 'html2canvas';
import { interval, Subject, Subscription } from 'rxjs';
import { ZipManagerService } from '../../../@core/utils/zip-manager.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { SgaMidService } from '../../../@core/data/sga_mid.service';

@Component({
  selector: 'ngx-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  private onDestroy$ = new Subject<void>();

  info_persona_id: number;
  info_inscripcion_id: number;
  loading: boolean;
  timer: Subscription;
  @Input('info_persona_id')
  set name(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
  }

  @Input('inscripcion_id')
  set dato(info_inscripcion_id: number) {
    this.info_inscripcion_id = info_inscripcion_id;
  }

  @Input('en_revision')
  en_revision: boolean = false;

  @Input('imprimir') imprimir: boolean = false;

  @Input('SuiteTags') SuiteTags: any;

  suiteLoaded: boolean = false;
  selectedTags: string[] = [];
  maxTags: number = 0;
  contTag: number = 0;
  reduceWhenloading: number = 0.9;
  data = {
    "INSCRIPCION": {},
    "ASPIRANTE": {},
    "PAGO": {},
    "DOCUMENTACION": {}
  };
  showErrors = false;

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService,
    public pivotDocument: PivotDocument,
    private zipManagerService: ZipManagerService,
    private popUpManager: PopUpManager,
    private sgaMidService: SgaMidService,) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.loading = false;
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(event, obj): any {
    this.url_editar.emit(obj);
  }

  ngOnInit() {
    this.zipManagerService.limpiarArchivos();
  }

  ngOnChanges() {
    this.imprimir = this.imprimir.toString() === 'true';
    this.en_revision = this.en_revision.toString() === 'true';
    this.manageSuiteTags(this.SuiteTags);
    if (this.imprimir) {
      this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.imprimir_comprobante'), this.translate.instant('inscripcion.info_impresion_auto'),'info',false);
    }
  }

  manageSuiteTags(Suite) {
    if (Suite == undefined) {
      this.suiteLoaded = false;
    } else {
      Object.keys(Suite).forEach((tag: string) => {
        Suite[tag]["render"] = false;
        Suite[tag]["buttonNext"] = false;
        if (Suite[tag].selected) {
          this.selectedTags = this.selectedTags.concat(tag);
        }
      })
      this.SuiteTags = Suite;
      this.maxTags = this.selectedTags.length;
      this.suiteLoaded = true;
    }
  }

  abrirDocumento(documento: any) {
    if (this.en_revision) {
      this.revisar_doc.emit(documento)
    } else {
      documento.observando = true; 
      this.revisar_doc.emit(documento)
    }
  }

  descargar_compilado_zip() {
    this.loading = true;
    let nombre: string = sessionStorage.getItem('nameFolder');
    nombre = nombre.toUpperCase();
    this.zipManagerService.generarZip(nombre).then((zip: string) => {
      this.loading = false;
      this.guardar_archivo(zip, nombre, ".zip");
    })
  }

  descargar_comprobante_inscription() {
    this.loading = true;

    let documentacion = this.zipManagerService.listarArchivos();
    let documentacionOrganizada: any = {};
    documentacion.forEach(doc => {
      documentacionOrganizada[doc.carpeta] = {}
    })
    documentacion.forEach(doc => {
      documentacionOrganizada[doc.carpeta][doc.grupoDoc] = []
    })
    documentacion.forEach(doc => {
      documentacionOrganizada[doc.carpeta][doc.grupoDoc].push(doc.nombreDocumento)
    })
    this.data.DOCUMENTACION = documentacionOrganizada;
    
    this.sgaMidService.post('generar_recibo/comprobante_inscripcion', this.data).subscribe(
      response => {
        this.loading = false;
        const dataComprobante = new Uint8Array(atob(response['Data']).split('').map(char => char.charCodeAt(0)));
        let comprobante_generado = window.URL.createObjectURL(new Blob([dataComprobante], { type: 'application/pdf' }));
        let nombre: string = sessionStorage.getItem('nameFolder');
        this.guardar_archivo(comprobante_generado, nombre, ".pdf");
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('inscripcion.fallo_carga_mensaje'));
      },
    );
  }

  guardar_archivo(urlFile: string, nombre: string, extension: string) {
    let download = document.createElement("a");
      download.href = urlFile;
      download.download = nombre+extension;
      document.body.appendChild(download);
      download.click();
      document.body.removeChild(download);
  }

  siguienteTagDesde(actualTag: string) {
    if (this.contTag < this.maxTags-1) {
      if (actualTag != undefined) {
        this.SuiteTags[actualTag].buttonNext = false;
      }
      this.SuiteTags[this.selectedTags[this.contTag]].render = true;
      this.SuiteTags[this.selectedTags[this.contTag]].buttonNext = true;
      document.getElementById(this.selectedTags[this.contTag]).scrollIntoView({behavior: 'smooth'})
      this.contTag++;
    } else if (this.contTag < this.maxTags) {
      this.SuiteTags[this.selectedTags[this.contTag-1]].buttonNext = false;
      this.contTag++;
      if (this.imprimir) {
        this.descargar_comprobante_inscription();
      }
    }
  }

  manageLoading(infoCarga, actualTag: string) {
    if(infoCarga.status == "start") {
      this.loading = true;
    }
    if(infoCarga.status == "completed") {
      this.loading = false;
      if (actualTag == "inscripcion") {
        this.data.INSCRIPCION = infoCarga.outInfo;
      }
      if (actualTag == "info_persona") {
        this.data.ASPIRANTE = infoCarga.outInfo;
      }
    }

    if ((actualTag == "inscripcion") && infoCarga.EstadoInscripcion) {
      this.showErrors = infoCarga.EstadoInscripcion != "Inscripción solicitada";
    }

    if(infoCarga.status == "failed") {
      this.loading = false;
      if (this.showErrors || this.en_revision) {
        if (actualTag != "inscripcion") {
          if (this.SuiteTags[actualTag].required) {
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.fallo_carga_mensaje'));  
          }
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.fallo_carga_mensaje'));
        }
      }
    }
    
    this.loading ? this.reduceWhenloading = 0.9 : this.reduceWhenloading = 1;
  }

}
