import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Periodo } from './../../../@core/data/models/periodo/periodo';
import { ClienteHabilitarPeriodoService } from '../../../@core/data/cliente_habilitar_periodo.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';


@Component({
  selector: 'ngx-list-periodo',
  templateUrl: './list-periodo.component.html',
  styleUrls: ['./list-periodo.component.scss'],
  })
export class ListPeriodoComponent implements OnInit {
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  info_periodo: Periodo;
  ano = [];
  periodo = [];
  opcionSeleccionadoAno: string  = '0';
  verSeleccionAno: string        = '';
  opcionSeleccionadoPeriodo: string  = '0';
  verSeleccionPeriodo: string        = '';
  verSeleccionPeriodoArre: string        = '';
  @Output() eventChange = new EventEmitter();

  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService, private clienteHabilitarPeriodoService: ClienteHabilitarPeriodoService,
    private toasterService: ToasterService) {
    this.loadData();
    this.cargarCampos();
    this.loadAno();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    this.cargarCampos();
    });
  }

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
        Id: {
          title: this.translate.instant('GLOBAL.id'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Ano: {
          title: this.translate.instant('GLOBAL.ano'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Periodo: {
          title: this.translate.instant('GLOBAL.periodo'),
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
          // type: 'boolean;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        NumeroOrden: {
          title: this.translate.instant('GLOBAL.numero_orden'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        TipoPeriodo: {
          title: this.translate.instant('GLOBAL.tipo_periodo'),
          // type: 'tipo_periodo;',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.clienteHabilitarPeriodoService.get('periodo/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        this.source.load(data);
          }
    });
  }
  loadAno() {
    this.clienteHabilitarPeriodoService.get('periodo/?fields=Ano')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Periodo !== 'error') {
          this.ano = <any>res;
          this.ano = this.ano.filter((valorActual, indiceActual, arreglo) => {
          return arreglo.findIndex(valorDelArreglo => JSON.stringify(valorDelArreglo) === JSON.stringify(valorActual)) === indiceActual
        });

        }
      },
      (error: HttpErrorResponse) => {
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }
  capturarAno() {
    // Pasamos el valor seleccionado a la variable verSeleccion
  if (this.opcionSeleccionadoAno == null) {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('periodo.seleccione_ano'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    }; Swal(opt1)
    .then((willDelete) => {
      if (willDelete.value) {

      }
    });
  }else {
    this.verSeleccionAno = JSON.stringify(this.opcionSeleccionadoAno);
    this.verSeleccionAno = this.verSeleccionAno.substring(8, 12);
    this.loadPeriodo();
  }
}
  loadPeriodo() {
  this.clienteHabilitarPeriodoService.get('periodo/?query=Ano:' + this.verSeleccionAno + '&fields=Periodo')
  .subscribe(res => {
    const r = <any>res;
    if (res !== null && r.Type !== 'error') {
      this.periodo = <any>res;
    }
  },
  (error: HttpErrorResponse) => {
    Swal({
      type: 'error',
      title: error.status + '',
      text: this.translate.instant('ERROR.' + error.status),
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    });
  });
}
capturarPeriodo() {
  if (this.opcionSeleccionadoPeriodo == null) {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('periodo.seleccione_ano'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    }; Swal(opt1)
    .then((willDelete) => {
      if (willDelete.value) {

      }
    });
  }else {
  this.verSeleccionPeriodo = JSON.stringify(this.opcionSeleccionadoPeriodo);
  this.verSeleccionPeriodo = this.verSeleccionPeriodo.slice(12, -2);
  this.traerPeriodoSelect();
}
}
traerPeriodoSelect() {
    this.clienteHabilitarPeriodoService.get('periodo/?query=Ano:' + this.verSeleccionAno + ',Periodo:' + this.verSeleccionPeriodo)
    .subscribe(res => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.info_periodo = <Periodo>res[0];
      }
    },
    (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

   ActivarPeriodo() {
     if (this.info_periodo == null) {
        const opt1: any = {
          title: this.translate.instant('GLOBAL.atencion'),
          text: this.translate.instant('periodo.seleccione_periodo'),
          icon: 'warning',
          buttons: true,
          dangerMode: true,
          showCancelButton: true,
        };
        Swal(opt1)
        .then((willDelete) => {
          if (willDelete.value) {
          }
        });
     }else {
     if (this.info_periodo.Activo === true) {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('periodo.habilitado'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt1)
    .then((willDelete) => {
      if (willDelete.value) {

      }
    });
  }else {

    const opt: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('periodo.periodo_habilitado'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_periodo.Activo = true;
        this.clienteHabilitarPeriodoService.put('periodo', this.info_periodo)
          .subscribe(res => {
            this.eventChange.emit(true);
            this.showToast('info', this.translate.instant('periodo.se_habilita'), this.translate.instant('periodo.periodo_habilitado'));
            this.loadData();
          });
      }
    });
  }
}}
DeshabilitarPeriodo() {
  if (this.info_periodo == null) {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('periodo.seleccione_periodo'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt1)
    .then((willDelete) => {
      if (willDelete.value) {

      }
    });
 }else {
  if (this.info_periodo.Activo === false) {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('periodo.deshabilitado'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt1)
    .then((willDelete) => {
      if (willDelete.value) {

      }
    });
  }else {

    const opt: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('periodo.periodo_deshabilitado'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_periodo.Activo = false;
        this.clienteHabilitarPeriodoService.put('periodo', this.info_periodo)
          .subscribe(res => {
            this.eventChange.emit(true);
            this.showToast('info', this.translate.instant('periodo.se_deshabilita'), this.translate.instant('periodo.periodo_deshabilitado'));
            this.loadData();
          });
      }
    });
  }
 }
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
      text: this.translate.instant('periodo.seguro_eliminar_periodo'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {

      if (willDelete.value) {
        this.clienteHabilitarPeriodoService.delete('periodo/', event.data).subscribe(res => {
          if (res !== null) {
            this.loadData();
            this.showToast('info', this.translate.instant('GLOBAL.eliminar'), this.translate.instant('periodo.periodo_eliminado'));
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
