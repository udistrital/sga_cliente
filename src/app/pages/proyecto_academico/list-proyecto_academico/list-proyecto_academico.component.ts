import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { UserService } from '../../../@core/data/users.service';
import { ProduccionAcademicaPost } from '../../../@core/data/models/produccion_academica/produccion_academica';
import { HttpErrorResponse } from '@angular/common/http';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { MatTableDataSource } from '@angular/material';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { ConsultaProyectoAcademicoComponent } from '../consulta-proyecto_academico/consulta-proyecto_academico.component';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { delay } from 'rxjs/operators';
import { InformacionBasica } from '../../../@core/data/models/proyecto_academico/informacion_basica';
import { ModificarProyectoAcademicoComponent } from '../modificar-proyecto_academico/modificar-proyecto_academico.component';


export interface DialogData {
    codigosnies: Number;
    facultad: string;
    nombre: string;
    nivel: string;
    metodologia: string;
    abreviacion: string;
    correo: string;
    numerocreditos: Number;
    duracion: Number;
    tipoduracion: string;
    ciclos: Boolean;
    activo: Boolean;
    enfasis: string;
}


@Component({
  selector: 'ngx-list-proyecto-academico',
  templateUrl: './list-proyecto_academico.component.html',
  styleUrls: ['./list-proyecto_academico.component.scss'],
  })
export class ListProyectoAcademicoComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  dataSource: any;
  index: any;
  idproyecto: any;
  datosbasico: InformacionBasica;
  displayedColumns = ['Id', 'Facultad', 'Nombre Proyecto', 'Nivel Proyecto', 'codigo', 'Activo', 'registro', 'calidad', 'Consulta', 'editar', 'inhabilitar'];
  codigosnies: Number;
  facultad: string;
  nombre: String;
  nivel: string;
  metodologia: string;
  abreviacion: string;
  correo: string;
  numerocreditos: Number;
  duracion: Number;
  tipo_duracion: string;
  ciclos: string;
  activo: string;
  enfasis: string;
  consulta: boolean= false;
  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
    private proyectoacademicoService: ProyectoAcademicoService,
    private sgamidService: SgaMidService,
    public dialog: MatDialog,
    private toasterService: ToasterService) {
      this.loadproyectos();
  }


  openDialogConsulta(): void {
    const dialogRef = this.dialog.open(ConsultaProyectoAcademicoComponent, {
      width: '550px',
      height: '750px',
      data: {codigosnies: this.codigosnies, nombre: this.nombre, facultad: this.facultad, nivel: this.nivel, metodologia: this.metodologia,
             abreviacion: this.abreviacion, correo: this.correo, numerocreditos: this.numerocreditos, duracion: this.duracion,
             tipoduracion: this.tipo_duracion, ciclos: this.ciclos, ofrece: this.activo, enfasis: this.enfasis},
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openDialogModificar(): void {
    const dialogRef = this.dialog.open(ModificarProyectoAcademicoComponent, {
      width: '850px',
      height: '750px',
      data: {codigosnies: this.codigosnies, nombre: this.nombre, facultad: this.facultad, nivel: this.nivel, metodologia: this.metodologia,
             abreviacion: this.abreviacion, correo: this.correo, numerocreditos: this.numerocreditos, duracion: this.duracion,
             tipoduracion: this.tipo_duracion, ciclos: this.ciclos, ofrece: this.activo, enfasis: this.enfasis},
    });

    dialogRef.afterClosed().subscribe(result => {
    });
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
    this.sgamidService.get('consulta_proyecto_academico/' )
    .subscribe(res => {
    if (res !== null && res[0] !== 'error') {
      this.dataSource = new MatTableDataSource();
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

  obteneridporid() {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('oferta.evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    }
    this.sgamidService.get('consulta_proyecto_academico/' + this.idproyecto )
    .subscribe((res: any) => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.codigosnies = res.map((data: any) => (data.ProyectoAcademico.CodigoSnies));
        this.nombre = res.map((data: any) => (data.ProyectoAcademico.Nombre));
        this.facultad = res.map((data: any) => (data.NombreDependencia));
        this.nivel = res.map((data: any) => (data.ProyectoAcademico.NivelFormacionId.Nombre));
        this.metodologia = res.map((data: any) => (data.ProyectoAcademico.MetodologiaId.Nombre));
        this.abreviacion = res.map((data: any) => (data.ProyectoAcademico.CodigoAbreviacion));
        this.correo = res.map((data: any) => (data.ProyectoAcademico.CorreoElectronico));
        this.numerocreditos = res.map((data: any) => (data.ProyectoAcademico.NumeroCreditos));
        this.duracion = res.map((data: any) => (data.ProyectoAcademico.Duracion));
        this.tipo_duracion = res.map((data: any) => (data.NombreUnidad));
        this.ciclos = res.map((data: any) => (data.CiclosLetra));
        this.activo = res.map((data: any) => (data.ActivoLetra));
        this.enfasis = res.map((data: any) => (data.Enfasis[0].EnfasisId.Nombre));
        console.info(this.consulta)
        this.openDialogConsulta();
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
  promesaid(id: number): Promise<{id: number}> {
    return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: id });
          this.obteneridporid()
      }, 600);
    });
}

  highlight(row ): void {
    this.idproyecto = row.ProyectoAcademico.Id;

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
