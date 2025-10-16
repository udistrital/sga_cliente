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
import { DocumentoService } from '../../../@core/data/documento.service';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { Documento } from '../../../@core/data/models/documento/documento';

@Component({
  selector: 'ngx-list-experiencia-laboral',
  templateUrl: './list-experiencia_laboral.component.html',
  styleUrls: ['./list-experiencia_laboral.component.scss'],
})
export class ListExperienciaLaboralComponent implements OnInit {
  uid: number;
  id: number;
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
    private organizacionService: OrganizacionService,
    private documentoService: DocumentoService,
    private utilidades: UtilidadesService,) {
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
            if(value !== ''){
              return formatDate(value, 'yyyy-MM-dd', 'en');
            }else{
              return ('Actual')
            }
          },
        },
        Estado: {
          title: this.translate.instant('admision.estado'),
          width: '5%',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Observacion: {
          title: this.translate.instant('admision.observacion'),
          width: '5%',
          valuePrepareFunction: (value) => {
            return value;
          },
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
          this.data.forEach(async (expLab) => {
            let estadoDoc = await <any>this.cargarEstadoDocumento(expLab.Soporte);
            expLab.Estado = estadoDoc.estadoObservacion;
            expLab.Observacion = estadoDoc.observacion;
            this.source.load(this.data);
          });
          this.source.load(this.data);
        } else if (response !== null && response.Data.Code === '404') {
          this.popUpManager.showAlert('', this.translate.instant('experiencia_laboral.no_data'));
          this.getPercentage(0);
          this.source.load([]);
        } else {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.error'),
            this.translate.instant('experiencia_laboral.error'));
            this.getPercentage(0);
            this.source.load([]);
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
        this.getPercentage(0);
        this.source.load([]);
      });
  }

  cargarEstadoDocumento(Id: any) {
    return new Promise((resolve) => {
      this.documentoService.get('documento/' + Id).subscribe(
        (doc: Documento) => {
          let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
          resolve(estadoDoc)
        });
    });
  }

  ngOnInit() {
    this.uid = 0;
    this.indexSelect = NaN;
    this.detalleExp = undefined;
  }

  onEdit(event): void {
    this.id = event.data.Id;
    this.uid = event.data.Id;
    this.indexSelect = event.index;
    this.detalleExp = this.data[event.index];
    this.crud = true;
    this.activetab();
  }

  onCreate(event): void {
    this.uid = 0;
    this.crud = true;
    this.indexSelect = NaN;
    this.detalleExp = undefined;
    this.activetab();
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  onChange(event) {
    if (event) {
      this.uid = 0;
      this.indexSelect = NaN;
      this.detalleExp = undefined;
      this.loadData();
      this.cargarCampos();
      this.cambiotab = false;
    }
  }

  getPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  itemselec(event): void {
    this.id = event.data.Id;
  }

  onDelete(event): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('experiencia_laboral.eliminar'),
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
          this.sgaMidService.delete('experiencia_laboral', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
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
    // this.config = new ToasterConfig({
    //   // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
    //   positionClass: 'toast-top-center',
    //   timeout: 5000,  // ms
    //   newestOnTop: true,
    //   tapToDismiss: false, // hide on click
    //   preventDuplicates: true,
    //   animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
    //   limit: 5,
    // });
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
