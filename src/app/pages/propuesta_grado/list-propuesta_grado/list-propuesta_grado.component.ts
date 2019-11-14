import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CoreService } from '../../../@core/data/core.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-list-propuesta-grado',
  templateUrl: './list-propuesta_grado.component.html',
  styleUrls: ['./list-propuesta_grado.component.scss'],
})
export class ListPropuestaGradoComponent implements OnInit {
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  data: any;
  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private coreService: CoreService,
    private toasterService: ToasterService) {
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
    this.settings = {
      actions: {
        columnTitle: '',
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
        Id: {
          title: this.translate.instant('GLOBAL.id'),
          width: '5%',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.titulo_propuesta'),
          width: '30%',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Grupoinvestigacion: {
          title: this.translate.instant('GLOBAL.grupo_investigacion'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        Lineainvestigacion: {
          title: this.translate.instant('GLOBAL.linea_investigacion'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        Tipoproyecto: {
          title: this.translate.instant('GLOBAL.tipo_proyecto'),
          width: '15%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        Documento: {
          title: this.translate.instant('GLOBAL.formato_proyecto'),
          width: '10%',
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
    this.inscripcionService.get('propuesta/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        data.forEach(element => {
          element.Documento = element.DocumentoId;
          this.inscripcionService.get('tipo_proyecto/' + element.TipoProyectoId.Id)
            .subscribe(tipo => {
              element.TipoProyecto = <any>tipo;
              this.coreService.get('linea_investigacion_grupo_investigacion/' +
                element.GrupoInvestigacionLineaInvestigacionId)
                .subscribe(linea_grupo => {
                  const linea_grupo_info = <any>linea_grupo;
                  this.coreService.get('grupo_investigacion/' +
                    linea_grupo_info.GrupoInvestigacionId)
                    .subscribe(grupo => {
                      element.GrupoInvestigacion = <any>grupo;
                      this.coreService.get('linea_investigacion/' +
                        linea_grupo_info.LineaInvestigacionId)
                        .subscribe(linea => {
                          element.LineaInvestigacion = <any>linea;
                          this.source.load(data);
                        },
                          (error: HttpErrorResponse) => {
                            Swal({
                              type: 'error',
                              title: error.status + '',
                              text: this.translate.instant('ERROR.' + error.status),
                              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                this.translate.instant('GLOBAL.grupo_investigacion') + '|' +
                                this.translate.instant('GLOBAL.linea_investigacion'),
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
                            this.translate.instant('GLOBAL.grupo_investigacion') + '|' +
                            this.translate.instant('GLOBAL.grupo_investigacion'),
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
                        this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                        this.translate.instant('GLOBAL.grupo_investigacion'),
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
                    this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                    this.translate.instant('GLOBAL.tipo_proyecto'),
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
            this.translate.instant('GLOBAL.propuesta_grado'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  ngOnInit() {
  }

  onEdit(event): void {
    this.uid = event.data.Id;
    this.activetab();
  }

  onCreate(event): void {
    this.uid = 0;
    this.activetab();
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
          this.inscripcionService.delete('propuesta/', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', this.translate.instant('GLOBAL.eliminar'),
                this.translate.instant('GLOBAL.propuesta_grado') + ' ' +
                this.translate.instant('GLOBAL.confirmarEliminar'));
            }
          },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                  this.translate.instant('GLOBAL.propuesta_grado'),
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
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }

  itemselec(event): void {
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
