import { OrganizacionService } from './../../../@core/data/organizacion.service';
import { SgaMidService } from './../../../@core/data/sga_mid.service';
import { UserService } from './../../../@core/data/users.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { ExperienciaService } from '../../../@core/data/experiencia.service';
import { HttpErrorResponse } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-list-experiencia-laboral',
  templateUrl: './list-experiencia_laboral.component.html',
  styleUrls: ['./list-experiencia_laboral.component.scss'],
})
export class ListExperienciaLaboralComponent implements OnInit {
  uid: number;
  eid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  source: LocalDataSource = new LocalDataSource();
  data: Array<any>;
  detalleExp: any;
  indexSelect: number;
  crud = false;

  @Input('ente_id')
  set name(ente_id: number) {
    if (ente_id !== undefined && ente_id !== null && ente_id.toString() !== '') {
      this.eid = ente_id;
      this.loadData();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage: number;
  persona_id: number;

  constructor(private translate: TranslateService,
    private toasterService: ToasterService,
    private sgaMidService: SgaMidService,
    private experienciaService: ExperienciaService,
    private userService: UserService,
    private popUpManager: PopUpManager,
    private organizacionService: OrganizacionService) {
    if (this.eid !== undefined && this.eid !== null && this.eid.toString() !== '') {
      this.loadData();
    }
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loading = false;
    this.persona_id = this.userService.getPersonaId();
    if (this.persona_id !== undefined && this.persona_id !== null && this.persona_id.toString() !== '') {
      this.loadData();
    }
  }

  cargarCampos() {
    this.settings = {
      columns: {
        NombreEmpresa: {
          title: this.translate.instant('GLOBAL.nombre_empresa'),
          width: '35%',
          valuePrepareFunction: (value) => {
            return value.NombreCompleto;
          },
        },
        Cargo: {
          title: this.translate.instant('GLOBAL.cargo'),
          width: '25%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        FechaInicio: {
          title: this.translate.instant('GLOBAL.fecha_inicio'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return formatDate(value, 'yyyy-MM-dd', 'en');
          },
        },
        FechaFinalizacion: {
          title: this.translate.instant('GLOBAL.fecha_fin'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return formatDate(value, 'yyyy-MM-dd', 'en');
          },
        },
      },
      mode: 'external',
      actions: {
        add: false,
        edit: true,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent: '<i class="nb-plus" title="' + this.translate.instant('experiencia_laboral.tooltip_crear') + '"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('experiencia_laboral.tooltip_editar') + '"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('experiencia_laboral.tooltip_eliminar') + '"></i>',
        confirmDelete: true,
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.loading = true;
    this.sgaMidService.get('experiencia_laboral/by_tercero?Id=' + this.persona_id).subscribe(
      (response: any) => {
        if (response !== null && response.Data.Code === '200') {
          this.data = <Array<any>>response.Data.Body[1];
          this.loading = false;
          this.getPercentage(1);
          this.source.load(this.data);
        } else if (response !== null && response.Data.Code === '404') {
          this.popUpManager.showToast('info', this.translate.instant('experiencia_laboral.no_data'));
        } else {
          this.showToast('error', this.translate.instant('GLOBAL.error'),
            this.translate.instant('experiencia_laboral.error'));
        }
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('experiencia_laboral.cargar_experiencia'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  ngOnInit() {
    this.uid = 0;
    this.indexSelect = NaN;
    this.detalleExp = undefined;
  }

  onEdit(event): void {
    this.uid = event.data.Id;
    this.indexSelect = event.index;
    this.detalleExp = this.data[event.index];
    this.crud = true;
  }

  onCreate(event): void {
    this.uid = 0;
    this.crud = true;
    this.indexSelect = NaN;
    this.detalleExp = undefined;
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
      this.indexSelect = NaN;
      this.detalleExp = undefined;
      this.loadData();
      this.cargarCampos();
    }
  }

  getPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  itemselec(event): void {
  }

  onDelete(event): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('GLOBAL.eliminar') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          this.experienciaService.delete('experiencia_laboral', event.data).subscribe(res => {
            if (res !== null) {
              // this.loadData();
              this.showToast('info', this.translate.instant('GLOBAL.eliminar'),
                this.translate.instant('GLOBAL.experiencia_laboral') + ' ' +
                this.translate.instant('GLOBAL.confirmarEliminar'));
            }
            this.loading = false;
          },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                  this.translate.instant('GLOBAL.experiencia_laboral'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        }
        this.loading = false;
      });
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
