import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Periodo } from './../../../@core/data/models/periodo/periodo';
import { Calendarioevento } from './../../../@core/data/models/oferta_academica/calendarioevento';
import { OfertaAcademicaService } from '../../../@core/data/oferta_academica.service';
import { ClienteHabilitarPeriodoService } from '../../../@core/data/cliente_habilitar_periodo.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import 'style-loader!angular2-toaster/toaster.css';
import { MatTableDataSource } from '@angular/material';



@Component({
  selector: 'ngx-list-calendarioevento',
  templateUrl: './list-calendarioevento.component.html',
  styleUrls: ['./list-calendarioevento.component.scss'],
  })
export class ListCalendarioeventoComponent implements OnInit {
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  info_periodo: Periodo;
  info_calendario: Calendarioevento;
  ano = [];
  periodo = [];
  opcionSeleccionadoAno: string  = '0';
  verSeleccionAno: string        = '';
  opcionSeleccionadoPeriodo: string  = '0';
  verSeleccionPeriodo: string        = '';
  verSeleccionPeriodoArre: string        = '';
  displayedColumns = ['Proyecto_curricular', 'Fecha_inicio', 'Fecha_fin'];
  dataSource: any;
  @Output() eventChange = new EventEmitter();

  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService, private ofertaAcademicaService: OfertaAcademicaService,
    private clienteHabilitarPeriodoService: ClienteHabilitarPeriodoService, private toasterService: ToasterService, private http: HttpClient ) {
    this.loadAno();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }
  applyFilter(filterValue: string) {
      this.ofertaAcademicaService.get('consulta_academica/' + this.info_periodo.Id )
      .subscribe(res => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.dataSource = new MatTableDataSource();
        this.dataSource = res;
        this.dataSource = this.dataSource.filter((row: any) => (((row.TipoEventoId.DependenciaId )
        .toLowerCase()).indexOf(filterValue.toLowerCase())) !== -1)
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

  useLanguage(language: string) {
    this.translate.use(language);
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


loadevento() {
  const opt1: any = {
    title: this.translate.instant('GLOBAL.atencion'),
    text: this.translate.instant('oferta.evento'),
    icon: 'warning',
    buttons: true,
    dangerMode: true,
    showCancelButton: true,
  }
  this.ofertaAcademicaService.get('consulta_academica/' + this.info_periodo.Id )
  .subscribe(res => {
  if (res !== null && res[0] !== 'error') {
    this.dataSource = new MatTableDataSource();
    this.dataSource = res;
  }else {
    Swal(opt1)
    .then((willDelete) => {
      if (willDelete.value) {

      }
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

  ListarOferta() {
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
            this.loadevento();
          };
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
      text: this.translate.instant('oferta.seguro_eliminar_oferta'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {

      if (willDelete.value) {
        this.clienteHabilitarPeriodoService.delete('calendarioevento/', event.data).subscribe(res => {
          if (res !== null) {
            this.showToast('info', this.translate.instant('GLOBAL.eliminar'), this.translate.instant('oferta.oferta_eliminado'));
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
