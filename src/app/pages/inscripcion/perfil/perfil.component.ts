import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
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
  imprimir: boolean;

  @Input('info_persona_id')
  set name(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
  }

  @Input('inscripcion_id')
  set dato(info_inscripcion_id: number) {
    this.info_inscripcion_id = info_inscripcion_id;
  }

  @Input('imprimir')
  set impr(imprimir: boolean) {
    this.imprimir = imprimir;
    if (this.imprimir) {
      setTimeout(() => this.generarComprobante().then(() => this.imprimir = false), 4000);
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('comprobante') comprobante: ElementRef;

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(event, obj): any {
    this.url_editar.emit(obj);
  }

  ngOnInit() {
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
      ).catch(error => reject(error));
    })
  }

}
