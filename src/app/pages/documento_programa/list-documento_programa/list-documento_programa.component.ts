import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from '../../../managers/popUpManager';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { SoporteDocumentoAux } from '../../../@core/data/models/documento/soporte_documento_aux';

@Component({
  selector: 'ngx-list-documento-programa',
  templateUrl: './list-documento_programa.component.html',
  styleUrls: ['./list-documento_programa.component.scss'],
})
export class ListDocumentoProgramaComponent implements OnInit {
  uid: number;
  persona: number;
  programa: number;
  periodo: number;
  inscripcion: number;
  cambiotab: boolean = false;
  contador: number;
  settings: any;
  data: any;
  info_data: any;
  programaDocumento: any;
  tipoProgramaDocumento: any;
  soporteDocumento: SoporteDocumentoAux[];
  soporteId: number;
  source: LocalDataSource = new LocalDataSource();

  @Input('persona_id')
  set info(info: number) {
    this.persona = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion = info2;
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
        this.loadData();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
  ) {
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loading = false;
  }

  cargarCampos() {
    this.settings = {
      columns: {
        TipoDocumento: {
          title: this.translate.instant('GLOBAL.tipo_documento_programa'),
          width: '90%',
          editable: false,
        },
      },
      mode: 'external',
      hideSubHeader: true,
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'open',
            title: '<i class="nb-compose"></i>'
          },
          {
            name: 'edit',
            title: '<i class="nb-edit"></i>'
          }
        ]
      },
    };
  }

  loadData(): void {
    this.soporteDocumento = [];
    this.inscripcionService.get('soporte_documento_programa?query=InscripcionId:' + this.inscripcion).subscribe(
      (response: any[]) => {
        if (Object.keys(response[0]).length > 0) {
          response.forEach(soporte => {
            const documento: SoporteDocumentoAux = new SoporteDocumentoAux();
            documento.TipoDocumentoId = soporte['DocumentoProgramaId']['TipoDocumentoProgramaId']['Id'];
            documento.TipoDocumento = soporte['DocumentoProgramaId']['TipoDocumentoProgramaId']['Nombre'];
            documento.DocumentoId = soporte['DocumentoId'];
            documento.SoporteDocumentoId = soporte['Id']
            this.soporteDocumento.push(documento);
          });
          this.source.load(this.soporteDocumento);
        } else {
          this.popUpManager.showAlert(
            this.translate.instant('GLOBAL.info'), this.translate.instant('documento_programa.no_documentos')
          )
        }
      },
      (error: HttpErrorResponse) => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
      },
    );
  }

  ngOnInit() {
    this.uid = 0;
  }

  onOpen(event) {
    const filesToGet = [
      {
        Id: event.data.DocumentoId,
        key: event.data.DocumentoId,
      },
    ];
    this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService)
      .subscribe(response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          filesToGet.forEach((file: any) => {
            const url = filesResponse[file.Id];
            window.open(url);
          });
        }
      },
      error => {
        this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
      },
    );
  }

  onEdit(event): void {
    this.uid = event.data.TipoDocumentoId;
    this.soporteId = event.data.SoporteDocumentoId;
    console.log(event)
  }

  onAction(event): void {
    switch(event.action) {
      case 'open':
        this.onOpen(event);
        break;
      case 'edit':
        this.onEdit(event);
        break;
    }
  }

  onChange(event) {
    if (event) {
      this.getPercentage(this.soporteDocumento.length / event)
      this.uid = 0;
      this.loadData();
    }
  }

  getPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

}
