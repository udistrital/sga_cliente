import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { UserService } from '../../../@core/data/users.service';
import { ProduccionAcademicaPost } from '../../../@core/data/models/produccion_academica/produccion_academica';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { MatTableDataSource } from '@angular/material';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}


@Component({
  selector: 'ngx-list-proyecto-academico',
  templateUrl: './list-proyecto_academico.component.html',
  styleUrls: ['./list-proyecto_academico.component.scss'],
  })
export class ListProyectoAcademicoComponent implements OnInit {
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  dataSource: any;
  index: any;
  displayedColumns = ['Id', 'Facultad', 'Nombre Proyecto', 'Nivel Proyecto', 'codigo', 'Activo', 'registro', 'calidad', 'Consulta', 'editar', 'inhabilitar'];

  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
    private campusMidService: CampusMidService,
    private user: UserService,
    private proyectoacademicoService: ProyectoAcademicoService,
    private toasterService: ToasterService) {
      this.loadproyectos();
  }

  applyFilter(filterValue: string) {
    this.proyectoacademicoService.get('registro_calificado_acreditacion/' )
    .subscribe(res => {
    const r = <any>res;
    if (res !== null && r.Type !== 'error') {
      this.dataSource = new MatTableDataSource();
      this.dataSource = res;
      this.dataSource = this.dataSource.filter((row: any) => (((row.ProyectoAcademicoInstitucionId.Nombre )
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

  ngOnInit() {

  }
  loadproyectos() {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('oferta.evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    }
    this.proyectoacademicoService.get('registro_calificado_acreditacion/' )
    .subscribe(res => {
    if (res !== null && res[0] !== 'error') {
      this.dataSource = new MatTableDataSource();
      console.info(res)
      this.dataSource = res
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
  consultaproyecto() {
    console.info('ojoddfdff')
  console.info(this.index)
  }
  highlight(row, evt): void {
    console.info(row.Id );
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
