import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ClienteHabilitarPeriodoService } from '../../../@core/data/cliente_habilitar_periodo.service';
import {
  ToasterService,
  ToasterConfig,
  Toast,
  BodyOutputType,
} from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-list-tipo-periodo',
  templateUrl: './list-tipo_periodo.component.html',
  styleUrls: ['./list-tipo_periodo.component.scss'],
})
export class ListTipoPeriodoComponent implements OnInit {
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private translate: TranslateService,
    private clienteHabilitarPeriodoService: ClienteHabilitarPeriodoService,
    private toasterService: ToasterService,
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
          valuePrepareFunction: value => {
            return value;
          },
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          // type: 'string;',
          valuePrepareFunction: value => {
            return value;
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          // type: 'string;',
          valuePrepareFunction: value => {
            return value;
          },
        },
        CodigoAbreviacion: {
          title: this.translate.instant('GLOBAL.codigo_abreviacion'),
          // type: 'string;',
          valuePrepareFunction: value => {
            return value;
          },
        },
        Activo: {
          title: this.translate.instant('GLOBAL.activo'),
          // type: 'boolean;',
          valuePrepareFunction: value => {
            return value;
          },
        },
        NumeroOrden: {
          title: this.translate.instant('GLOBAL.numero_orden'),
          // type: 'number;',
          valuePrepareFunction: value => {
            return value;
          },
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent:
          '<i class="nb-plus" title="' +
          this.translate.instant('tipo_periodo.tooltip_crear') +
          '"></i>',
        createButtonContent:
          '<i class="nb-checkmark" title="' +
          this.translate.instant('tipo_periodo.tooltip_guardar') +
          '"></i>',
        cancelButtonContent:
          '<i class="nb-close" title="' +
          this.translate.instant('tipo_periodo.tooltip_cancelar') +
          '"></i>',
      },
      edit: {
        editButtonContent:
          '<i class="nb-edit" title="' +
          this.translate.instant('tipo_periodo.tooltip_editar') +
          '"></i>',
        saveButtonContent:
          '<i class="nb-checkmark" title="' +
          this.translate.instant('tipo_periodo.tooltip_guargar') +
          '"></i>',
        cancelButtonContent:
          '<i class="nb-close" title="' +
          this.translate.instant('tipo_periodo.tooltip_cancelar') +
          '"></i>',
      },
      delete: {
        deleteButtonContent:
          '<i class="nb-trash" title="' +
          this.translate.instant('tipo_periodo.tooltip_eliminar') +
          '"></i>',
        confirmDelete: true,
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.clienteHabilitarPeriodoService
      .get('tipo_periodo/?limit=0')
      .subscribe(res => {
        if (res !== null) {
          const data = <Array<any>>res;
          this.source.load(data);
        }
      });
  }

  ngOnInit() {}

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
      text: this.translate.instant('tipo_periodo.seguro_eliminar_tipo_periodo'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.clienteHabilitarPeriodoService
          .delete('tipo_periodo/', event.data)
          .subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast(
                'info',
                this.translate.instant('GLOBAL.eliminar'),
                this.translate.instant('tipo_periodo.tipo_periodo_eliminado'),
              );
            }
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
      timeout: 5000, // ms
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
