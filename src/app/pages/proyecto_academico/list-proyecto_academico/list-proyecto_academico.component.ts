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
import { PersonaService } from '../../../@core/data/persona.service';
import { Persona } from '../../../@core/data/models/persona';

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
  displayedColumns = ['Id', 'Facultad', 'Nombre Proyecto', 'Nivel Proyecto', 'codigo', 'Oferta', 'registro', 'calidad', 'Consulta', 'editar', 'inhabilitar'];
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
  oferta: string;
  enfasis: any[];
  consulta: boolean= false;
  idfacultad: Number;
  idnivel: Number;
  idmetodo: Number;
  idunidad: Number;
  idarea: Number;
  idnucleo: Number;
  coordinador: [];
  oferta_check: boolean = false;
  ciclos_check: boolean = false;
  titulacion_snies: string;
  numero_acto: string;
  ano_acto: string;
  titulacion_mujer: string;
  titulacion_hombre: string;
  competencias: string;
  resolucion_acreditacion: string;
  resolucion_acreditacion_ano: string;
  fecha_creacion_resolucion: Date;
  fecha_inicio_coordinador: Date;
  vigencia_resolucion_meses: string;
  vigencia_resolucion_anos: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  id_coordinador: Number;
  segundo_apellido: string;
  nombre_completo: string;
  source: LocalDataSource = new LocalDataSource();
  proyectoJson: any;

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
             tipoduracion: this.tipo_duracion, ciclos: this.ciclos, ofrece: this.oferta, enfasis: this.enfasis, Id: this.idproyecto},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadproyectos();
    });
  }

  openDialogModificar(): void {
    const dialogRef = this.dialog.open(ModificarProyectoAcademicoComponent, {
      width: '1000px',
      height: '750px',
      data: {codigosnies: this.codigosnies, nombre: this.nombre, facultad: this.facultad, nivel: this.nivel, metodologia: this.metodologia,
             abreviacion: this.abreviacion, correo: this.correo, numerocreditos: this.numerocreditos, duracion: this.duracion,
             tipoduracion: this.tipo_duracion, ciclos: this.ciclos, ofrece: this.oferta, enfasis: this.enfasis, idfacultad: this.idfacultad,
             idnivel: this.idnivel, idmetodo: this.idmetodo, idunidad: this.idunidad, oferta_check: this.oferta_check, ciclos_check: this.ciclos_check,
             titulacion_snies: this.titulacion_snies, titulacion_mujer: this.titulacion_mujer, titulacion_hombre: this.titulacion_hombre,
             competencias: this.competencias, idarea: this.idarea, idnucleo: this.idnucleo, resolucion_acreditacion: this.resolucion_acreditacion,
             resolucion_acreditacion_ano: this.resolucion_acreditacion_ano, fecha_creacion_registro: this.fecha_creacion_resolucion,
             vigencia_meses: this.vigencia_resolucion_meses, vigencia_anos: this.vigencia_resolucion_anos, idproyecto: this.idproyecto,
             numero_acto: this.numero_acto, ano_acto: this.ano_acto, Id: this.idproyecto, proyectoJson: this.proyectoJson,
              fechainiciocoordinador: this.fecha_inicio_coordinador, idcoordinador: this.id_coordinador},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadproyectos();
    });
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    /*
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
    */
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
    .subscribe((res: any[]) => {
    if (res !== null && res[0] !== 'error') {
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.filterPredicate = (data: any, filter: string) => data.ProyectoAcademico.Nombre.indexOf(filter) !== -1;
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


  obteneridporid_consulta() {
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
        this.oferta = res.map((data: any) => (data.OfertaLetra));
        this.enfasis = res.map((data: any) => (data.Enfasis))[0];
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

  obteneridporid_modificar() {
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
        this.oferta = res.map((data: any) => (data.OfertaLetra));
        this.enfasis = res.map((data: any) => (data.Enfasis))[0];
        this.idfacultad = res.map((data: any) => (data.ProyectoAcademico.DependenciaId));
        this.idnivel = res.map((data: any) => (data.ProyectoAcademico.NivelFormacionId.Id));
        this.idmetodo = res.map((data: any) => (data.ProyectoAcademico.MetodologiaId.Id));
        this.idunidad = res.map((data: any) => (data.ProyectoAcademico.UnidadTiempoId));
        this.oferta_check = res.map((data: any) => (data.ProyectoAcademico.Oferta));
        this.ciclos_check = res.map((data: any) => (data.ProyectoAcademico.CiclosPropedeuticos));
        this.titulacion_snies = res.map((data: any) => (data.Titulaciones[0].Nombre));
        this.titulacion_mujer = res.map((data: any) => (data.Titulaciones[1].Nombre));
        this.titulacion_hombre = res.map((data: any) => (data.Titulaciones[2].Nombre));
        this.competencias = res.map((data: any) => (data.ProyectoAcademico.Competencias));
        this.idarea = res.map((data: any) => (data.ProyectoAcademico.AreaConocimientoId));
        this.idnucleo = res.map((data: any) => (data.ProyectoAcademico.NucleoBaseId));
        this.resolucion_acreditacion = res.map((data: any) => (data.Registro[0].NumeroActoAdministrativo));
        this.resolucion_acreditacion_ano = res.map((data: any) => (data.Registro[0].AnoActoAdministrativoId));
        this.fecha_creacion_resolucion = res.map((data: any) => (data.Registro[0].FechaCreacionActoAdministrativo));
        this.vigencia_resolucion_meses = res.map((data: any) => (data.Registro[0].VigenciaActoAdministrativo.substr(6, 1)));
        this.vigencia_resolucion_anos = res.map((data: any) => (data.Registro[0].VigenciaActoAdministrativo.substr(12, 1)));
        this.numero_acto = res.map((data: any) => (data.ProyectoAcademico.NumeroActoAdministrativo));
        this.ano_acto = res.map((data: any) => (data.ProyectoAcademico.AnoActoAdministrativo));
        this.proyectoJson = res.map((data: any) => (data.ProyectoAcademico))[0];

        this.openDialogModificar();
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

  promesaid_consulta(id: number): Promise<{id: number}> {
    return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: id });
          this.obteneridporid_consulta()
      }, 600);
    });
}

promesaid_modificar(id: number): Promise<{id: number}> {
  return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: id });
        this.obteneridporid_modificar()
        this.consultacoordinador()
    }, 600);
  });
}

  highlight(row ): void {
    this.idproyecto = row.ProyectoAcademico.Id;

 }

 consultacoordinador() {
  const opt1: any = {
    title: this.translate.instant('GLOBAL.atencion'),
    text: this.translate.instant('oferta.evento'),
    icon: 'warning',
    buttons: true,
    dangerMode: true,
    showCancelButton: true,
  }
  this.proyectoacademicoService.get('proyecto_academico_rol_persona_dependecia/?query=ProyectoAcademicoInstitucionId.Id:' + this.idproyecto )
  .subscribe((res: any) => {
    const r = <any>res;
    if (res !== null && r.Type !== 'error') {
    this.fecha_inicio_coordinador = res.map((data: any) => (data.FechaInicio))[0];
    this.id_coordinador = res.map((data: any) => (data.PersonaId));
    this.coordinador = <any>res;
    console.info(this.coordinador)
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

inhabilitarProyecto(row: any): void {
  let inhabilitar_title = this.translate.instant('consultaproyecto.inhabilitar_proyecto');
  let inhabilitar_text = this.translate.instant('consultaproyecto.seguro_continuar_inhabilitar_proyecto');
  let inhabilitar_ok = this.translate.instant('consultaproyecto.proyecto_inhabilitado');
  let inhabilitar_error = this.translate.instant('consultaproyecto.proyecto_no_inhabilitado');
  if (!row.ProyectoAcademico.Oferta) {
    inhabilitar_title = this.translate.instant('consultaproyecto.habilitar_proyecto');
    inhabilitar_text = this.translate.instant('consultaproyecto.seguro_continuar_habilitar_proyecto');
    inhabilitar_ok = this.translate.instant('consultaproyecto.proyecto_habilitado');
    inhabilitar_error = this.translate.instant('consultaproyecto.proyecto_no_habilitado');
  }
  const opt: any = {
    title: inhabilitar_title,
    text: inhabilitar_text,
    icon: 'warning',
    buttons: true,
    dangerMode: true,
    showCancelButton: true,
  };
  Swal(opt)
  .then((willDelete) => {
    if (willDelete.value) {
      const proyectoAModificar = row.ProyectoAcademico;
      proyectoAModificar.Activo = !proyectoAModificar.Activo;
      proyectoAModificar.Oferta = !proyectoAModificar.Oferta;
      this.sgamidService.put('consulta_proyecto_academico/inhabilitar_proyecto', proyectoAModificar)
        .subscribe((res: any) => {
          if (res.Type !== 'error') {
            this.loadproyectos();
            this.showToast('info', inhabilitar_title, inhabilitar_ok);
          } else {
            this.showToast('error', this.translate.instant('GLOBAL.error'), inhabilitar_error);
          }
        }, () => {
          this.showToast('error', this.translate.instant('GLOBAL.error'), inhabilitar_error);
        });
    }
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
