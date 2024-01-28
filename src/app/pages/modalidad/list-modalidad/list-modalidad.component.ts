import { Component, OnInit, ViewChild } from '@angular/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Modalidad } from '../../../@core/data/models/modalidad/modalidad';

@Component({
  selector: 'ngx-list-modalidad',
  templateUrl: './list-modalidad.component.html',
  styleUrls: ['./list-modalidad.component.scss']
})
export class ListModalidadComponent implements OnInit {

  dataSource: MatTableDataSource<Modalidad>;
  displayedColumns: string[] = ['acciones', 'Nombre', 'Descripcion', 'CodigoAbreviacion', 'Activo'];
  nombresColumnas = []

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  modalidades = [];

  modalidadId: number;
  showCrud: boolean = false;

  constructor(private translate: TranslateService,
    private proyectoAcademicoService: ProyectoAcademicoService) {
      this.nombresColumnas["acciones"] = "GLOBAL.acciones";
      this.nombresColumnas["Nombre"] = "GLOBAL.nombre";
      this.nombresColumnas["Descripcion"] = "GLOBAL.descripcion";
      this.nombresColumnas["CodigoAbreviacion"] = "GLOBAL.codigo_abreviacion";
      this.nombresColumnas["Activo"] = "GLOBAL.activo";
    }

  ngOnInit() {
    this.loadModalidades();
  }

  loadModalidades()  {
    this.proyectoAcademicoService.get('modalidad/?limit=0')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.modalidades = <any>res;
          this.dataSource = new MatTableDataSource(res);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

  aplicarFiltro(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  registrarModalidad() {
    this.modalidadId = null;
    this.showCrud = true;
  }

  onChange(event) {
    if (event) {
      this.loadModalidades();
      this.showCrud = !this.showCrud;
    }
  }

  cambiarTab(): void {
    this.showCrud = !this.showCrud;
  }

  editarRegistro(event): void {
    this.modalidadId = event.Id;
    this.cambiarTab();
  }

  eliminarRegistro(event): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('modalidad.seguro_continuar_eliminar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.proyectoAcademicoService.delete('modalidad/', event)
         .subscribe((res: any) => {
            if (res.Type !== 'error') {
              this.loadModalidades();
              Swal.fire({
                icon: 'success',
                title: this.translate.instant('GLOBAL.eliminar'),
                text: this.translate.instant('modalidad.eliminada'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: this.translate.instant('GLOBAL.error'),
                text: this.translate.instant('modalidad.no_eliminada'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            }
          }, () => {
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('GLOBAL.error'),
              text: this.translate.instant('modalidad.no_eliminada'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
      }
    });
  }

}
