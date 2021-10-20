import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { UserService } from '../../../@core/data/users.service';
import { ProduccionAcademicaPost } from './../../../@core/data/models/produccion_academica/produccion_academica';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-list-produccion-academica',
  templateUrl: './list-produccion_academica.component.html',
  styleUrls: ['./list-produccion_academica.component.scss'],
})
export class ListProduccionAcademicaComponent implements OnInit {
  prod_selected: ProduccionAcademicaPost;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  persona_id: number;
  source: LocalDataSource = new LocalDataSource();
  percentage: number;
  loading: boolean = true;

  @Output('result') result: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private user: UserService,
    private popUpManager: PopUpManager,
    private toasterService: ToasterService) {
    this.persona_id = user.getPersonaId() || 1;
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  getPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  cargarCampos() {
    this.settings = {
      columns: {
        Titulo: {
          title: this.translate.instant('produccion_academica.titulo_produccion_academica'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '20%',
        },
        SubtipoProduccionId: {
          title: this.translate.instant('produccion_academica.tipo_produccion_academica'),
          // type: 'tipo_produccion_academica;',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          width: '15%',
        },
        Resumen: {
          title: this.translate.instant('produccion_academica.resumen'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '30%',
        },
        EstadoEnteAutorId: {
          title: this.translate.instant('produccion_academica.estado_autor'),
          // type: 'string',
          valuePrepareFunction: (value) => {
            return value.EstadoAutorProduccionId.Nombre;
          },
          width: '15%',
        },
        Fecha: {
          title: this.translate.instant('produccion_academica.fecha_publicacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return ((value) + '').substring(0, 10);
          },
          width: '10%',
        },
      },
      mode: 'external',
      actions: {
        add: true,
        edit: true,
        delete: true,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent: '<i class="nb-plus" title="' + this.translate.instant('produccion_academica.tooltip_crear') + '"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('produccion_academica.tooltip_editar') + '"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('produccion_academica.tooltip_eliminar') + '"></i>',
        confirmDelete: true,
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.loading = true;
    this.sgaMidService.get('produccion_academica/pr_academica/' + this.persona_id)
      .subscribe(res => {
        if (res !== null && res.Response.Code === '200') {
          const data = <Array<ProduccionAcademicaPost>>res.Response.Body[0];
          this.source.load(data);
          this.result.emit(1);
        } else if (res !== null && res.Response.Code === '404') {
          this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
        } else {
          Swal.fire({
            icon: 'error',
            text: this.translate.instant('ERROR.400'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
        this.loading = false;
      }, (error: HttpErrorResponse) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  ngOnInit() {
    this.loadData();
  }

  onEdit(event): void {
    if (event.data.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 1 || event.data.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 2) {
      this.prod_selected = event.data;
      this.activetab();
    } else if (event.data.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 3) {
      this.updateEstadoAutor(event.data);
    } else {
      this.showToast('error', 'Error', this.translate.instant('GLOBAL.accion_no_permitida'));
    }
  }

  onCreate(event): void {
    this.prod_selected = undefined;
    this.activetab();
  }

  onDelete(event): void {
    if (event.data.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 1) {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('produccion_academica.seguro_continuar_eliminar_produccion'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
      };
      Swal.fire(opt)
        .then((willDelete) => {
          if (willDelete.value) {
            this.sgaMidService.delete('produccion_academica', event.data).subscribe((res: any) => {
              if (res !== null) {
                if (res.Body.Id !== undefined) {
                  this.source.load([]);
                  this.loadData();
                  this.showToast('info', 'Ok', this.translate.instant('produccion_academica.produccion_eliminada'));
                } else {
                  this.showToast('info', 'Error', this.translate.instant('produccion_academica.produccion_no_eliminada'));
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
        });
    } else if (event.data.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 2) {
      const opt: any = {
        title: 'Error',
        text: this.translate.instant('produccion_academica.autor_no_puede_borrar'),
        icon: 'warning',
        buttons: false,
      };
      Swal.fire(opt);
    } else if (event.data.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 3) {
      this.updateEstadoAutor(event.data);
    } else {
      this.showToast('error', 'Error', this.translate.instant('GLOBAL.accion_no_permitida'));
    }
  }

  updateEstadoAutor(data: any): void {
    const opt: any = {
      title: 'Error',
      text: this.translate.instant('produccion_academica.autor_no_ha_confirmado'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willConfirm) => {
        if (willConfirm.value) {
          const optConfirmar: any = {
            title: this.translate.instant('GLOBAL.confirmar'),
            text: this.translate.instant('produccion_academica.confirma_participar_produccion'),
            icon: 'warning',
            buttons: true,
            dangerMode: true,
            showCancelButton: true,
            confirmButtonText: this.translate.instant('GLOBAL.si'),
            cancelButtonText: this.translate.instant('GLOBAL.no'),
          };
          Swal.fire(optConfirmar)
            .then((isAuthor) => {
              const dataPut = {
                acepta: isAuthor.value ? true : false,
                AutorProduccionAcademica: data.EstadoEnteAutorId,
              }
              this.loading = true;
              this.sgaMidService.put('produccion_academica/estado_autor_produccion/' + dataPut.AutorProduccionAcademica.Id, dataPut)
                .subscribe((res: any) => {
                  if (res.Type === 'error') {
                    Swal.fire({
                      icon: 'error',
                      title: res.Code,
                      text: this.translate.instant('ERROR.' + res.Code),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                    this.showToast('error', 'Error', this.translate.instant('produccion_academica.estado_autor_no_actualizado'));
                  } else {
                    this.loadData();
                    this.showToast('success', this.translate.instant('GLOBAL.actualizar'),
                      this.translate.instant('produccion_academica.estado_autor_actualizado'));
                  }
                  this.loading = false;
                }, (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal.fire({
                    icon: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
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
    // console.log("afssaf");
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
