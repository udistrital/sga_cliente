import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { FormacionAcademicaService } from '../../../@core/data/formacion_academica.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { formatDate } from '@angular/common';
import { PopUpManager } from '../../../managers/popUpManager';
import * as moment from 'moment';

@Component({
  selector: 'ngx-list-formacion-academica',
  templateUrl: './list-formacion_academica.component.html',
  styleUrls: ['./list-formacion_academica.component.scss'],
})
export class ListFormacionAcademicaComponent implements OnInit {
  uid: number;
  pid: number;
  UpdateInfo: boolean = false;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  source: LocalDataSource = new LocalDataSource();
  persona_id: number;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean = true;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private toasterService: ToasterService,
    private userService: UserService,
    private campusMidService: CampusMidService,
    private sgaMidService: SgaMidService,
    private formacionService: FormacionAcademicaService,
    private ubicacionService: UbicacionService,
    private proyectoAcademicoService: ProyectoAcademicoService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.persona_id = this.userService.getPersonaId();
    this.loadData();
    this.cargarCampos();
    this.loading = true;
  }

  getPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  cargarCampos() {
    this.settings = {
      columns: {
        Nit: {
          title: this.translate.instant('GLOBAL.nit'),
          width: '10%',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        NombreCompleto: {
          title: this.translate.instant('GLOBAL.nombre_universidad'),
          width: '28%',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Ubicacion: {
          title: this.translate.instant('GLOBAL.pais_universidad'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        ProgramaAcademico: {
          title: this.translate.instant('GLOBAL.programa_academico'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        FechaInicio: {
          title: this.translate.instant('GLOBAL.fecha_inicio'),
          width: '10%',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        FechaFinalizacion: {
          title: this.translate.instant('GLOBAL.fecha_fin'),
          width: '10%',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
      },
      mode: 'external',
      actions: {
        add: false,
        edit: true,
        delete: true,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('formacion_academica.tooltip_editar') + '"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('formacion_academica.tooltip_eliminar') + '"></i>',
        confirmDelete: true,
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.loading = true;
    this.sgaMidService.get('formacion_academica?Id=' + this.persona_id)
    .subscribe(response => {
      if (response !== null && response.Response.Code === '404') {
        this.loading = false;
        this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
      } else if (response !== null && response.Response.Code === '200') {
        const data = <Array<any>>response.Response.Body[0];
        const dataInfo = <Array<any>>[];
        data.forEach(element => {
          const FechaI = element.FechaInicio;
          const FechaF = element.FechaFinalizacion;
          element.FechaInicio = FechaI.substring(0, 2) + '-' + FechaI.substring(2, 4) + '-' + FechaI.substring(4, 8);
          element.FechaFinalizacion = FechaF.substring(0, 2) + '-' + FechaF.substring(2, 4) + '-' + FechaF.substring(4, 8);
          dataInfo.push(element);
          this.getPercentage(1);
          this.source.load(dataInfo);
        });
        this.loading = false;
      } else {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.400'));
      }
    },
    (error: HttpErrorResponse) => {
      this.loading = false;
      this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
    });
  }

  ngOnInit() {
    this.loadData();
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  onEdit(event): void {
    this.uid = event.data.Nit;
    this.pid = event.data.ProgramaAcademico.Id;
    this.UpdateInfo = true;
  }

  onCreate(event): void {
    this.uid = 0;
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event) {
  }

  itemselec(event): void {
    this.uid = event.data.Nit;
    this.pid = event.data.ProgramaAcademico.Id;
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
          this.campusMidService.delete('formacionacademica', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', this.translate.instant('GLOBAL.eliminar'),
                this.translate.instant('GLOBAL.formacion_academica') + ' ' +
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
                  this.translate.instant('GLOBAL.formacion_academica'),
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
      type: 'info', // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }
}
