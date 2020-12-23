import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { PopUpManager } from '../../../managers/popUpManager';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-list-tipo-inscripcion',
  templateUrl: './list-tipo_inscripcion.component.html',
  styleUrls: ['./list-tipo_inscripcion.component.scss'],
})
export class ListTipoInscripcionComponent implements OnInit {
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  loading: boolean = false;

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private toasterService: ToasterService,
    private popUpManager: PopUpManager,
  ) {
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
    this.settings = {
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.id'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
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
        NivelId: {
          title: this.translate.instant('tipo_inscripcion.nivel'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value == 14 ? this.translate.instant('GLOBAL.pregrado') : this.translate.instant('GLOBAL.posgrado');
          },
        },
        Especial: {
          title: this.translate.instant('tipo_inscripcion.cupo_especial'),
          // type: 'boolean;',
          valuePrepareFunction: (value) => {
            return value ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');
          },
        },
        Activo: {
          title: this.translate.instant('tipo_inscripcion.estado'),
          valuePrepareFunction: (value) => {
            return value ? this.translate.instant('GLOBAL.activo') : this.translate.instant('GLOBAL.inactivo');
          },
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
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
      noDataMessage: this.translate.instant('tipo_inscripcion.sin_procesos'),
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.inscripcionService.get('tipo_inscripcion/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        this.source.load(data);
        this.loading = false;
      }
    });
  }

  ngOnInit() {
    this.loading = true;
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
      title: this.translate.instant('tipo_inscripcion.inactivar'),
      text: this.translate.instant('tipo_inscripcion.seguro_deshabilitar_tipo_inscripcion'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.inscripcionService.put('tipo_inscripcion/' + event.data.Id, JSON.stringify({
            "Activo": false,
            "CodigoAbreviacion": event.data.CodigoAbreviacion,
            "Descripcion": event.data.Descripcion,
            "Especial": event.data.Especial,
            "FechaCreacion": event.data.FechaCreacion,
            "FechaModificacion": event.data.FechaModificacion,
            "Id": event.data.Id,
            "NivelId": event.data.NivelId,
            "Nombre": event.data.Nombre,
            "NumeroOrden": event.data.NumeroOrden
          })).subscribe(
            (response: any) => {
              if (JSON.stringify(response) == null) {
                this.popUpManager.showErrorAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado_error'));
              } else {
                this.popUpManager.showSuccessAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado'));
                // this.ngOnInit();
                this.loadData();
                this.cargarCampos();
              }
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('tipo_inscripcion.tipo_inscripcion_deshabilitado_error'));
            },
          );
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
