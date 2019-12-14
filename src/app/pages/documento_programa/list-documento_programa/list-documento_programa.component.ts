import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { DocumentoProgramaService } from '../../../@core/data/documento_programa.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

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
  config: ToasterConfig;
  settings: any;
  data: any;
  info_data: any;
  programaDocumento: any;
  tipoProgramaDocumento: any;
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
        // this.getDocumentosPrograma();
        // this.loadData();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage: number;

  constructor(private translate: TranslateService,
    private documentoProgramaService: DocumentoProgramaService,
    private inscripcionService: InscripcionService,
    private toasterService: ToasterService) {
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loading = false;
  }

  cargarCampos() {
    this.settings = {
      actions: {
        columnTitle: '',
        add: false,
        edit: true,
        delete: true,
      },
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
        DocumentoPrograma: {
          title: this.translate.instant('GLOBAL.tipo_documento_programa'),
          width: '100%',
          valuePrepareFunction: (value) => {
            return value.TipoDocumentoPrograma.Nombre;
          },
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getDocumentosPrograma(): void {
    this.contador = 0;
    this.inscripcionService.get('inscripcion/' + this.inscripcion)
      .subscribe(dato_inscripcion => {
        const inscripciondata = <any>dato_inscripcion;
        if (dato_inscripcion !== null && JSON.stringify(dato_inscripcion[0]) !== '{}') {
          const programa = inscripciondata.ProgramaAcademicoId;
          const periodo = inscripciondata.PeriodoId;
          this.documentoProgramaService.get('documento_programa/?query=ProgramaId:' + programa +
            ',PeriodoId:' + periodo + '&limit=0')
            .subscribe(documentoPrograma => {
              if (documentoPrograma !== null && JSON.stringify(documentoPrograma[0]) !== '{}') {
                const docProgramas = <Array<any>>documentoPrograma;
                this.contador = docProgramas.length;
              }
            },
              (error: HttpErrorResponse) => {
                Swal({
                  type: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.documento_programa'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.documento_programa') + '|' +
              this.translate.instant('GLOBAL.admision'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  loadData(): void {
    this.info_data = <any>[];
    this.inscripcionService.get('inscripcion/' + this.inscripcion)
      .subscribe(dato_inscripcion => {
        const inscripciondata = <any>dato_inscripcion;
        this.programa = inscripciondata.ProgramaAcademicoId;
        this.periodo = inscripciondata.PeriodoId;
        this.documentoProgramaService.get('soporte_documento_programa/?query=PersonaId:' +
          this.persona + '&limit=0')
          .subscribe(res => {
            if (res !== null && JSON.stringify(res[0]) !== '{}') {
              this.data = <Array<any>>res;
              this.data.forEach(element => {
                this.documentoProgramaService.get('documento_programa/' + element.DocumentoProgramaId.Id)
                  .subscribe(documentoPrograma => {
                    if (documentoPrograma !== null && JSON.stringify(documentoPrograma[0]) !== '{}') {
                      this.programaDocumento =  <Array<any>>documentoPrograma;
                      if (this.programaDocumento.PeriodoId === this.periodo) {
                        element.DocumentoPrograma = this.programaDocumento;
                        this.documentoProgramaService.get('tipo_documento_programa/' +
                          this.programaDocumento.TipoDocumentoProgramaId.Id)
                          .subscribe(tipoDocumentoPrograma => {
                            if (tipoDocumentoPrograma !== null && JSON.stringify(tipoDocumentoPrograma[0]) !== '{}') {
                              this.tipoProgramaDocumento =  <Array<any>>tipoDocumentoPrograma;
                              element.DocumentoPrograma.TipoDocumentoPrograma = this.tipoProgramaDocumento;
                              this.loading = false;
                              this.info_data.push(element);
                              this.getPercentage(this.info_data.length / this.contador);
                              this.source.load(this.info_data);
                          }
                        },
                          (error: HttpErrorResponse) => {
                            Swal({
                              type: 'error',
                              title: error.status + '',
                              text: this.translate.instant('ERROR.' + error.status),
                              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                this.translate.instant('GLOBAL.tipo_documento_programa'),
                              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                            });
                          });
                      }
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.documento_programa'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
              });
            }
          },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                  this.translate.instant('GLOBAL.documento_programa'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.documento_programa') + '|' +
              this.translate.instant('GLOBAL.admision'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  ngOnInit() {
    this.uid = 0;
  }

  onEdit(event): void {
    this.uid = event.data.Id;
  }

  onCreate(event): void {
    this.uid = 0;
  }

  onDelete(event): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('GLOBAL.eliminar') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.documentoProgramaService.delete('soporte_documento_programa/', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', this.translate.instant('GLOBAL.eliminar'),
                this.translate.instant('GLOBAL.documento_programa') + ' ' +
                this.translate.instant('GLOBAL.confirmarEliminar'));
            }
          },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                  this.translate.instant('GLOBAL.documento_programa'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        }
      });
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
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
      this.uid = 0;
      console.info(this.uid);
      this.loadData();
    }
  }

  itemselec(event): void {
  }

  getPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
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
