import { Component, OnInit, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { DocumentoProgramaService } from '../../../@core/data/documento_programa.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';
import { NbDialogRef } from '@nebular/theme';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-list-documento-proyecto',
  templateUrl: './list-documento-proyecto.component.html',
  styleUrls: ['./list-documento-proyecto.component.scss'],
})
export class ListDocumentoProyectoComponent implements OnInit {
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  loading: boolean;

  documentos = [];
  administrar_documentos: boolean = true;
  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
    private dialogRef: NbDialogRef<ListDocumentoProyectoComponent>,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
    private DocumentoProgramaService: DocumentoProgramaService,
    private toasterService: ToasterService) {
    this.cargarCampos();
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  @Input() asDialog: boolean;
  dismissDialog() {
    this.dialogRef.close();
  }

  // @Input() administrar_documentos: boolean;

  @Output() retorno = new EventEmitter<boolean>();

  cargarCampos() {
    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        CodigoAbreviacion: {
          title: this.translate.instant('GLOBAL.codigo_abreviacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Activo: {
          title: this.translate.instant('GLOBAL.activo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        NumeroOrden: {
          title: this.translate.instant('GLOBAL.numero_orden'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.documentos = []
    this.loading = true;
    this.inscripcionService.get('tipo_documento_programa?limit=0').subscribe(
      response => {
        response.forEach(documento => {
          this.loading = true;
          if (documento.Activo) {
            documento.Activo = 'Sí'
          } else {
            documento.Activo = 'No'
          }
          this.documentos.push(documento);
          this.source.load(this.documentos);
          this.loading = false;
        });
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  ngOnInit() {
  }

  itemselec(event) {

  }

  onEdit(event): void {
    this.uid = event.data.Id;
    this.activetab();
  }

  onDelete(event): void {
    console.log(event.data)
  }

  onCreate(event): void {
    this.uid = 0;
    this.activetab();
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
    this.activetabFather()
  }

  close() {
    this.dialogRef.close();
  }

  activetabFather(): void {
    this.retorno.emit(!this.cambiotab);
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.activetab();
    }
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }

}
