import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { Subscription } from 'rxjs';
import { NbDialogRef } from '@nebular/theme';
import { Validators, FormControl } from '@angular/forms';
import { TipoDocumentoPrograma } from '../../../@core/data/models/inscripcion/tipo_documento_programa';
import { PopUpManager } from '../../../managers/popUpManager';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { DocumentoPrograma } from '../../../@core/data/models/documento/documento_programa';

@Component({
  selector: 'ngx-select-documento-proyecto',
  templateUrl: './select-documento-proyecto.component.html',
  styleUrls: ['./select-documento-proyecto.component.scss'],
})
export class SelectDocumentoProyectoComponent implements OnInit {
  uid: number;
  config: ToasterConfig;
  settings: any;
  Campo2Control = new FormControl('', [Validators.required]);
  source: LocalDataSource = new LocalDataSource();
  administrar_documentos: boolean = false;
  boton_retornar: boolean = false;
  loading: boolean;

  documentos = [];
  subscription: Subscription;
  documento_proyecto = [];

  constructor(private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private dialogRef: NbDialogRef<SelectDocumentoProyectoComponent>,
    private popUpManager: PopUpManager,
    private toasterService: ToasterService) {
    this.loading = true;
    this.loadData();
    this.loadDataProyecto();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  @Input() asDialog: boolean;
  dismissDialog() {
    this.dialogRef.close();
  }

  cargarCampos() {
    this.settings = {
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      actions: {
        edit: false,
        add: false,
        columnTitle: this.translate.instant('GLOBAL.eliminar'),
        position: 'right',
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '80%',
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
  }

  activetab(): void {
    this.administrar_documentos = !this.administrar_documentos;
    this.boton_retornar = !this.boton_retornar;
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.loadDataProyecto();
      this.administrar_documentos = !this.administrar_documentos;
    }
  }

  onCreateDocument(event: any) {
    const documento = <TipoDocumentoPrograma>event.value;
    if (!this.documento_proyecto.find((documento_registrado: any) => documento_registrado.Id === documento.Id) && documento.Id) {

      const opt: any = {
        title: this.translate.instant('GLOBAL.registrar'),
        text: this.translate.instant('documento_proyecto.seguro_continuar_registrar_documento'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
      };

      Swal.fire(opt)
        .then((create) => {
          if (create.value) {
            Swal.fire({
              title: this.translate.instant('documento_proyecto.carga_nuevo_documento'),
              html: `<b></b>`,
              timerProgressBar: true,
              onOpen: () => {
                Swal.showLoading();
              },
            });

            let content = Swal.getHtmlContainer();
            if (content) {
              const b: any = content.querySelector('b');
              if (b) {
                b.textContent = this.translate.instant('GLOBAL.carga_recolectando');
              }
            }

            const documentoNuevo: DocumentoPrograma = new DocumentoPrograma();
            documentoNuevo.TipoDocumentoProgramaId = documento;
            documentoNuevo.Activo = true;
            documentoNuevo.PeriodoId = parseInt(sessionStorage.getItem('PeriodoId'), 10);
            documentoNuevo.ProgramaId = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10);
            documentoNuevo.TipoInscripcionId = parseInt(sessionStorage.getItem('TipoInscripcionId'), 10);

            content = Swal.getHtmlContainer();
            if (content) {
              const b: any = content.querySelector('b');
              if (b) {
                b.textContent = this.translate.instant('GLOBAL.carga_guardando');
              }
            }

            this.inscripcionService.post('documento_programa', documentoNuevo).subscribe(response => {
              Swal.close();
              if (response.Type !== 'error') {

                const opt1: any = {
                  title: this.translate.instant('GLOBAL.registrar'),
                  text: this.translate.instant('documento_proyecto.documento_creado'),
                  icon: 'success',
                  buttons: true,
                  dangerMode: true,
                  showCancelButton: true,
                };

                Swal.fire(opt1).then((willCreate) => {
                  if (willCreate.value) {
                    this.loadDataProyecto();
                  }
                });

              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_creado'));
              }
            }, () => {
              this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('documento_proyecto.documento_no_creado'));
            });
          }
        });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('documento_proyecto.error_documento_ya_existe'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  onDeleteDocument(event: any) {
    const documento = <TipoDocumentoPrograma>event.data;
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
          Swal.fire({
            title: this.translate.instant('documento_proyecto.carga_eliminando_documento'),
            html: `<b></b>`,
            timerProgressBar: true,
            onOpen: () => {
              Swal.showLoading();
            },
          });

          const documentoModificado: DocumentoPrograma = new DocumentoPrograma();
          documentoModificado.TipoDocumentoProgramaId = documento;
          documentoModificado.Activo = false;
          documentoModificado.FechaCreacion = event.data.FechaPrograma;
          documentoModificado.Id = event.data.IdDocPrograma;
          documentoModificado.PeriodoId = parseInt(sessionStorage.getItem('PeriodoId'), 10);
          documentoModificado.ProgramaId = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10);

          this.inscripcionService.put('documento_programa', documentoModificado).subscribe(res => {
            Swal.close()
            if (res.Type !== 'error') {

              const opt1: any = {
                title: this.translate.instant('GLOBAL.eliminar'),
                text: this.translate.instant('documento_proyecto.documento_eliminado'),
                icon: 'success',
                buttons: true,
                dangerMode: true,
                showCancelButton: true,
              };

              Swal.fire(opt1).then((willDelete1) => {
                if (willDelete1.value) {
                  this.loadDataProyecto();
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

  openListDocumentoComponent() {
    this.administrar_documentos = true;
    this.boton_retornar = true;
  }

  retorno(event) {
    this.boton_retornar = event;
    this.loadData();
  }

  close() {
    this.dialogRef.close();
  }

  loadData() {
    this.loading = true;
    this.documentos = [];
    this.inscripcionService.get('tipo_documento_programa?limit=0&query=Activo:true').subscribe(
      response => {
        response.forEach(documento => {
          this.documentos.push(documento);
          this.loading = false;
        });
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadDataProyecto() {
    this.loading = true;
    this.documento_proyecto = [];
    this.inscripcionService.get('documento_programa?query=Activo:true,ProgramaId:' + sessionStorage.getItem('ProgramaAcademicoId') + ',TipoInscripcionId:' + sessionStorage.getItem('TipoInscripcionId') + ',PeriodoId:'+sessionStorage.getItem('PeriodoId') + '&limit=0').subscribe(
      response => {
        if(response === undefined || response === null){
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
        else if (response.length == 1 && !response[0].hasOwnProperty('TipoDocumentoProgramaId')){
        }
        else{
          response.forEach(documento => {
            documento.TipoDocumentoProgramaId.IdDocPrograma = documento.Id;
            documento.TipoDocumentoProgramaId.FechaPrograma = documento.FechaCreacion;
            this.documento_proyecto.push(<TipoDocumentoPrograma>documento.TipoDocumentoProgramaId);
          });
          this.source.load(this.documento_proyecto);
        }
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
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
