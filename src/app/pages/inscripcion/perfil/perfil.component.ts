import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import pdfMake from 'pdfmake/build/pdfmake';
import html2canvas from 'html2canvas';

@Component({
  selector: 'ngx-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {

  info_persona_id: number;
  info_inscripcion_id: number;
  loading: boolean;

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

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  @ViewChild('comprobante') comprobante: ElementRef;

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.loading = true;
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(event, obj): any {
    this.url_editar.emit(obj);
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.imprimir = this.imprimir.toString() === 'true';
    this.en_revision = this.en_revision.toString() === 'true';
  }

  activarImprimir(event: boolean) {
    if (this.imprimir && event) {
      setTimeout(() => this.generarComprobante()
      .then(() => {
        console.info("entra aca")
        this.imprimir = false;
        this.loading = false;
      }), 500);
    } else {
      this.loading = false;
    }
  }

  generarComprobante(): Promise<any> {
    return new Promise((resolve, reject) => {
      let docDefinition;
      html2canvas(this.comprobante.nativeElement).then(
        canvas => {
          docDefinition = {
            content: [
              {
                image: canvas.toDataURL('image/png'),
                width: 550,
                scale: 1,
              },
              {
                image: canvas.toDataURL('image/png'),
                width: 550,
                absolutePosition: {x: 40, y: -795},
                pageBreak: 'before',
                scale: 1,
              },
            ]
          }
          const pdfDoc = pdfMake.createPdf(docDefinition);
          pdfDoc.download();
          resolve(true)
        }
      ).catch(
        error => {
          reject(error);
        }
      );
    })
  }

  abrirDocumento(documento: any) {
    if (this.en_revision) {
      this.revisar_doc.emit(documento)
    } else {
      window.open(documento)
    }
  }

}
