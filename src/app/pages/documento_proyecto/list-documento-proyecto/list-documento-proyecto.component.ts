import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { NbDialogRef } from '@nebular/theme';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { TipoDocumentoPrograma } from '../../../@core/data/models/documento/tipo_documento_programa'

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
  info_doc_programa: TipoDocumentoPrograma;

  documentos = [];
  administrar_documentos: boolean = true;
  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
    private dialogRef: NbDialogRef<ListDocumentoProyectoComponent>,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
    private toasterService: ToasterService) {
    this.loading = true;
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
    this.documentos = [];
    this.loading = true;
    this.inscripcionService.get('tipo_documento_programa?limit=0').subscribe(
      response => {
        response.forEach(documento => {
          this.loading = true;
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

    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('documento_proyecto.seguro_continuar_eliminar_documento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_doc_programa = <TipoDocumentoPrograma>event.data;
          this.info_doc_programa.Activo = false;

          this.inscripcionService.put('tipo_documento_programa/', this.info_doc_programa)
            .subscribe((res: any) => {
              if (res.Type !== 'error') {

                const opt1: any = {
                  title: this.translate.instant('GLOBAL.eliminar'),
                  text: this.translate.instant('documento_proyecto.documento_eliminado'),
                  icon: 'success',
                  buttons: true,
                  dangerMode: true,
                  showCancelButton: true,
                };

                Swal.fire(opt1).then((willCreate) => {
                  if (willCreate.value) {
                    this.loadData();
                    this.activetabFather();
                  }
                });

              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_eliminado'));
              }
            }, () => {
              this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_eliminado'));
            });
        }
      });
  }

  onCreate(event): void {
    this.uid = 0;
    this.activetab();
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
    this.activetabFather();
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
