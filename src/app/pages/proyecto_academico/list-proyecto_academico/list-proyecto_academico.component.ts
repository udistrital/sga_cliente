import { Component, OnInit, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { MatTableDataSource } from '@angular/material';
import { MatSort } from '@angular/material/sort';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { ConsultaProyectoAcademicoComponent } from '../consulta-proyecto_academico/consulta-proyecto_academico.component';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { ModificarProyectoAcademicoComponent } from '../modificar-proyecto_academico/modificar-proyecto_academico.component';
import { ProyectoAcademicoInstitucion } from '../../../@core/data/models/proyecto_academico/proyecto_academico_institucion';

@Component({
  selector: 'ngx-list-proyecto-academico',
  templateUrl: './list-proyecto_academico.component.html',
  styleUrls: ['../proyecto_academico.component.scss'],
})
export class ListProyectoAcademicoComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  dataSource: any;
  index: any;
  idproyecto: any;
  codigosnies: Number;
  codigo: string;
  facultad: string;
  nombre: String;
  nivel: string;
  iddependencia: number;
  metodologia: string;
  abreviacion: string;
  correo: string;
  numerocreditos: Number;
  duracion: Number;
  tipo_duracion: string;
  ciclos: string;
  oferta: string;
  enfasis: any[];
  consulta: boolean = false;
  idfacultad: Number;
  idnivel: Number;
  idmetodo: Number;
  idunidad: Number;
  idarea: Number;
  idnucleo: Number;
  coordinador: [];
  oferta_check: boolean = false;
  ciclos_check: boolean = false;
  loading: boolean = false;
  titulacion_snies: string;
  numero_acto: string;
  ano_acto: string;
  titulacion_mujer: string;
  titulacion_hombre: string;
  competencias: string;
  resolucion_acreditacion: string;
  resolucion_acreditacion_ano: string;
  fecha_creacion_resolucion: Date;
  resolucion_alta_calidad: string;
  resolucion_alta_calidad_ano: string;
  fecha_creacion_resolucion_alta_calidad: Date;
  vigencia_resolucion_meses_alta_calidad: string;
  vigencia_resolucion_anos_alta_calidad: string;
  existe_registro_alta_calidad: boolean = false;
  fecha_inicio_coordinador: Date;
  vigencia_resolucion_meses: string;
  vigencia_resolucion_anos: string;
  id_coordinador: any;
  proyectoJson: any;
  id_documento_acto: string;
  id_documento_registor_calificado: string;
  id_documento_alta_calidad: string;
  id_documento_registro_coordinador: number;
  proyecto_padre_id: ProyectoAcademicoInstitucion;

  listaDatos = []
  source: LocalDataSource;

  constructor(
    private translate: TranslateService,
    private proyectoacademicoService: ProyectoAcademicoService,
    private sgamidService: SgaMidService,
    public dialog: MatDialog,
    private toasterService: ToasterService,
  ) {
    this.source = new LocalDataSource();
    this.loading = true;
    this.loadData();
    // this.source.load(this.listaDatos)

    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  cargarCampos() {
    this.settings = {
      columns: {
        Id: {
          title: this.translate.instant('consultaproyecto.id'),
          width: '5%',
        },
        NombreFacultad: {
          title: this.translate.instant('consultaproyecto.facultad'),
          width: '15%',
        },
        proyecto: {
          title: this.translate.instant('consultaproyecto.nombre'),
          width: '25%',
        },
        NivelProyecto: {
          title: this.translate.instant('consultaproyecto.nivel'),
          width: '8%',
        },
        codigo: {
          title: this.translate.instant('consultaproyecto.codigo'),
          width: '7%',
        },
        codigoSNIES: {
          title: this.translate.instant('consultaproyecto.codigosnies'),
          width: '7%',
        },
        OfertaLetra: {
          title: this.translate.instant('consultaproyecto.activo'),
          width: '3%',
        },
        FechaVenimientoAcreditacion: {
          title: this.translate.instant('consultaproyecto.registro'),
          width: '10%',
        },
        FechaVenimientoCalidad: {
          title: this.translate.instant('consultaproyecto.calidad'),
          width: '10%',
        },
      },
      mode: 'external',
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),

        custom: [
          {
            name: 'consulta',
            title: '<i class="nb-search" title="' +
              this.translate.instant('consultaproyecto.consulta') +
              '"></i>',
          },
          {
            name: 'editar',
            title: '<i class="nb-edit" title="' +
              this.translate.instant('consultaproyecto.editar') +
              '"></i>',
          },
          {
            name: 'inhabilitar',
            title: '<i class="nb-locked" title="' +
              this.translate.instant('consultaproyecto.inhabilitar') +
              '"></i>',
          },
        ],
      },
    };
    this.source.load(this.listaDatos);
  }

  loadData(): void {
    this.loading = true;
    this.sgamidService.get('consulta_proyecto_academico/').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        data.forEach(element => {
          if (element.FechaVenimientoAcreditacion !== null) {
            element.FechaVenimientoAcreditacion = moment(element.FechaVenimientoAcreditacion, 'YYYY-MM-DD').format('DD-MM-YYYY');
          }
          if (element.FechaVenimientoCalidad !== null) {
            element.FechaVenimientoCalidad = moment(element.FechaVenimientoCalidad, 'YYYY-MM-DD').format('DD-MM-YYYY');
          }
          element.codigo = element.ProyectoAcademico.Codigo;
          element.codigoSNIES = element.ProyectoAcademico.CodigoSnies;
          element.NivelProyecto = element.ProyectoAcademico.NivelFormacionId.Nombre;
          element.proyecto = element.ProyectoAcademico.Nombre;
          element.Id = element.ProyectoAcademico.Id;
          this.source.load(data)
        });
        this.loading = false;
      }
    },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.proyecto_academico'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
        this.loading = false;
      });
  }

  onAction(event) {
    this.highlight(event)
    switch (event.action) {
      case 'consulta':
        this.promesaid_consulta(event);
        break;
      case 'editar':
        this.promesaid_modificar(event);
        break;
      case 'inhabilitar':
        this.inhabilitarProyecto(event.data);
        break;
    }
  }

  openDialogConsulta(): void {
    const dialogRef = this.dialog.open(ConsultaProyectoAcademicoComponent, {
      width: '1000px',
      height: '750px',
      data: {
        codigointerno: this.codigo,
        codigosnies: this.codigosnies,
        nombre: this.nombre,
        facultad: this.facultad,
        nivel: this.nivel,
        metodologia: this.metodologia,
        abreviacion: this.abreviacion,
        correo: this.correo,
        numerocreditos: this.numerocreditos,
        duracion: this.duracion,
        tipoduracion: this.tipo_duracion,
        ciclos: this.ciclos,
        ofrece: this.oferta,
        enfasis: this.enfasis,
        Id: this.idproyecto,
        id_documento_acto: this.id_documento_acto,
        proyecto_padre_id: this.proyecto_padre_id,
        iddependencia:this.iddependencia,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadproyectos();
    });
  }

  openDialogModificar(): void {
    const dialogRef = this.dialog.open(ModificarProyectoAcademicoComponent, {
      width: '1000px',
      height: '750px',
      data: {
        codigointerno: this.codigo,
        codigosnies: this.codigosnies,
        nombre: this.nombre,
        facultad: this.facultad,
        nivel: this.nivel,
        metodologia: this.metodologia,
        abreviacion: this.abreviacion,
        correo: this.correo,
        numerocreditos: this.numerocreditos,
        duracion: this.duracion,
        tipoduracion: this.tipo_duracion,
        ciclos: this.ciclos,
        ofrece: this.oferta,
        enfasis: this.enfasis,
        idfacultad: this.idfacultad,
        idnivel: this.idnivel,
        idmetodo: this.idmetodo,
        idunidad: this.idunidad,
        oferta_check: this.oferta_check,
        ciclos_check: this.ciclos_check,
        titulacion_snies: this.titulacion_snies,
        titulacion_mujer: this.titulacion_mujer,
        titulacion_hombre: this.titulacion_hombre,
        competencias: this.competencias,
        idarea: this.idarea,
        idnucleo: this.idnucleo,
        resolucion_acreditacion: this.resolucion_acreditacion,
        resolucion_acreditacion_ano: this.resolucion_acreditacion_ano,
        fecha_creacion_registro: this.fecha_creacion_resolucion,
        vigencia_meses: this.vigencia_resolucion_meses,
        vigencia_anos: this.vigencia_resolucion_anos,
        idproyecto: this.idproyecto,
        numero_acto: this.numero_acto,
        ano_acto: this.ano_acto,
        Id: this.idproyecto,
        proyectoJson: this.proyectoJson,
        fechainiciocoordinador: this.fecha_inicio_coordinador,
        idcoordinador: this.id_coordinador,
        tieneregistroaltacalidad: this.existe_registro_alta_calidad,
        resolucion_alta: this.resolucion_alta_calidad,
        resolucion_alta_ano: this.resolucion_alta_calidad_ano,
        vigencia_meses_alta: this.vigencia_resolucion_meses_alta_calidad,
        vigencia_ano_alta: this.vigencia_resolucion_anos_alta_calidad,
        fecha_creacion_registro_alta: this
          .fecha_creacion_resolucion_alta_calidad,
        id_documento_acto: this.id_documento_acto,
        id_documento_registor_calificado: this.id_documento_registor_calificado,
        id_documento_alta_calidad: this.id_documento_alta_calidad,
        id_documento_registro_coordinador: this
          .id_documento_registro_coordinador,
        proyecto_padre_id: this.proyecto_padre_id,
        iddependencia:this.iddependencia,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadproyectos();
    });
  }

  filterPredicate(data: string, filter: string): boolean {
    data = data.trim().toLowerCase();
    filter = filter.trim().toLowerCase();
    return data.indexOf(filter) >= 0;
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() { }

  loadproyectos() {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('oferta.evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    this.loading = true;
    this.sgamidService.get('consulta_proyecto_academico/').subscribe(
      (res: any[]) => {
        res.forEach(element => {
          this.listaDatos.push(element)
        });
        if (res !== null && res[0] !== 'error') {
          this.dataSource = new MatTableDataSource(res);
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = (data: any, filter: string) =>
            this.filterPredicate(data.ProyectoAcademico.Nombre, filter);
          this.dataSource.data.forEach(
            (data: any) => (data.proyecto = data.ProyectoAcademico.Nombre),
          ); // para ordenar por nombre de proyecto
          this.loading = false;
        } else {
          Swal.fire(opt1).then(willDelete => {
            if (willDelete.value) {
              this.loading = false;
            }
          });
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
        this.loading = false;
      },
    );
  }

  obteneridporid_consulta() {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('oferta.evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    this.sgamidService
      .get('consulta_proyecto_academico/' + this.idproyecto)
      .subscribe(
        (res: any) => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            this.codigo = res.map(
              (data: any) => data.ProyectoAcademico.Codigo,
            );
            this.codigosnies = res.map(
              (data: any) => data.ProyectoAcademico.CodigoSnies,
            );
            this.nombre = res.map((data: any) => data.ProyectoAcademico.Nombre);
            this.facultad = res.map((data: any) => data.NombreFacultad);
            this.nivel = res.map(
              (data: any) => data.ProyectoAcademico.NivelFormacionId.Nombre,
            );
            this.metodologia = res.map(
              (data: any) => data.ProyectoAcademico.MetodologiaId.Nombre,
            );
            this.abreviacion = res.map(
              (data: any) => data.ProyectoAcademico.CodigoAbreviacion,
            );
            this.correo = res.map(
              (data: any) => data.ProyectoAcademico.CorreoElectronico,
            );
            this.numerocreditos = res.map(
              (data: any) => data.ProyectoAcademico.NumeroCreditos,
            );
            this.duracion = res.map(
              (data: any) => data.ProyectoAcademico.Duracion,
            );
            this.iddependencia = res.map(
              (data: any) => data.ProyectoAcademico.DependenciaId,
            );
            this.tipo_duracion = res.map((data: any) => data.NombreUnidad);
            this.ciclos = res.map((data: any) => data.CiclosLetra);
            this.oferta = res.map((data: any) => data.OfertaLetra);
            this.enfasis = res.map((data: any) => data.Enfasis)[0];
            this.id_documento_acto = res.map(
              (data: any) => data.ProyectoAcademico.EnlaceActoAdministrativo,
            )[0];
            this.proyecto_padre_id = res.map(
              (data: any) => data.ProyectoAcademico.ProyectoPadreId,
            )[0];
            this.openDialogConsulta();
          } else {
            Swal.fire(opt1).then(willDelete => {
              if (willDelete.value) {
              }
            });
          }
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        },
      );
  }

  obteneridporid_modificar() {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('oferta.evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    this.sgamidService
      .get('consulta_proyecto_academico/' + this.idproyecto)
      .subscribe(
        (res: any) => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            this.codigo = res.map(
              (data: any) => data.ProyectoAcademico.Codigo,
            );
            this.codigosnies = res.map(
              (data: any) => data.ProyectoAcademico.CodigoSnies,
            );
            this.nombre = res.map((data: any) => data.ProyectoAcademico.Nombre);
            this.facultad = res.map((data: any) => data.NombreFacultad);
            this.nivel = res.map(
              (data: any) => data.ProyectoAcademico.NivelFormacionId.Nombre,
            );
            this.metodologia = res.map(
              (data: any) => data.ProyectoAcademico.MetodologiaId.Nombre,
            );
            this.abreviacion = res.map(
              (data: any) => data.ProyectoAcademico.CodigoAbreviacion,
            );
            this.correo = res.map(
              (data: any) => data.ProyectoAcademico.CorreoElectronico,
            );
            this.numerocreditos = res.map(
              (data: any) => data.ProyectoAcademico.NumeroCreditos,
            );
            this.duracion = res.map(
              (data: any) => data.ProyectoAcademico.Duracion,
            );
            this.tipo_duracion = res.map((data: any) => data.NombreUnidad);
            this.ciclos = res.map((data: any) => data.CiclosLetra);
            this.oferta = res.map((data: any) => data.OfertaLetra);
            this.enfasis = res.map((data: any) => data.Enfasis)[0];
            this.idfacultad = res.map(
              (data: any) => data.ProyectoAcademico.FacultadId,
            );
            this.idnivel = res.map(
              (data: any) => data.ProyectoAcademico.NivelFormacionId.Id,
            );
            this.idmetodo = res.map(
              (data: any) => data.ProyectoAcademico.MetodologiaId.Id,
            );
            this.idunidad = res.map(
              (data: any) => data.ProyectoAcademico.UnidadTiempoId,
            );
            this.oferta_check = res.map(
              (data: any) => data.ProyectoAcademico.Oferta,
            );
            this.ciclos_check = res.map(
              (data: any) => data.ProyectoAcademico.CiclosPropedeuticos,
            );
            this.titulacion_snies = res.map(
              (data: any) => data.Titulaciones[0].Nombre,
            );
            this.titulacion_mujer = res.map(
              (data: any) => data.Titulaciones[1].Nombre,
            );
            this.titulacion_hombre = res.map(
              (data: any) => data.Titulaciones[2].Nombre,
            );
            this.competencias = res.map(
              (data: any) => data.ProyectoAcademico.Competencias,
            );
            this.idarea = res.map(
              (data: any) => data.ProyectoAcademico.AreaConocimientoId,
            );
            this.idnucleo = res.map(
              (data: any) => data.ProyectoAcademico.NucleoBaseId,
            );
            this.resolucion_acreditacion = res.map(
              (data: any) => data.Registro[0].NumeroActoAdministrativo,
            );

            this.iddependencia = res.map(
              (data: any) => data.ProyectoAcademico.DependenciaId,
            );
            this.resolucion_acreditacion_ano = res.map(
              (data: any) => data.Registro[0].AnoActoAdministrativoId,
            );

            this.fecha_creacion_resolucion = res.map(
              (data: any) => data.Registro[0].FechaCreacionActoAdministrativo,
            );
            this.vigencia_resolucion_meses = res.map((data: any) =>
              data.Registro[0].VigenciaActoAdministrativo.substr(6, 1),
            );
            this.vigencia_resolucion_anos = res.map((data: any) =>
              data.Registro[0].VigenciaActoAdministrativo.substr(12, 1),
            );
            this.id_documento_registor_calificado = res.map(
              (data: any) => data.Registro[0].EnlaceActo,
            )[0];
            this.numero_acto = res.map(
              (data: any) => data.ProyectoAcademico.NumeroActoAdministrativo,
            );
            this.ano_acto = res.map(
              (data: any) => data.ProyectoAcademico.AnoActoAdministrativo,
            );
            this.existe_registro_alta_calidad = res.map((data: any) =>
              Boolean(data.TieneRegistroAltaCalidad),
            );
            this.resolucion_alta_calidad = res.map(
              (data: any) => data.NumeroActoAdministrativoAltaCalidad,
            );
            this.resolucion_alta_calidad_ano = res.map(
              (data: any) => data.AnoActoAdministrativoIdAltaCalidad,
            );
            this.fecha_creacion_resolucion_alta_calidad = res.map(
              (data: any) => data.FechaCreacionActoAdministrativoAltaCalidad,
            );
            this.id_documento_alta_calidad = res.map(
              (data: any) => data.EnlaceActoAdministrativoAltaCalidad,
            )[0];
            this.id_documento_acto = res.map(
              (data: any) => data.ProyectoAcademico.EnlaceActoAdministrativo,
            )[0];
            if (this.existe_registro_alta_calidad[0] === true) {
              this.vigencia_resolucion_meses_alta_calidad = res.map(
                (data: any) =>
                  data.VigenciaActoAdministrativoAltaCalidad.substr(6, 1),
              );
              this.vigencia_resolucion_anos_alta_calidad = res.map(
                (data: any) =>
                  data.VigenciaActoAdministrativoAltaCalidad.substr(12, 1),
              );
            } else {
              this.vigencia_resolucion_meses_alta_calidad = null;
              this.vigencia_resolucion_anos_alta_calidad = null;
            }
            this.proyectoJson = res.map(
              (data: any) => data.ProyectoAcademico,
            )[0];
            this.proyecto_padre_id = res.map(
              (data: any) => data.ProyectoAcademico.ProyectoPadreId,
            )[0];
            this.openDialogModificar();
          } else {
            Swal.fire(opt1).then(willDelete => {
              if (willDelete.value) {
              }
            });
          }
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        },
      );
  }

  promesaid_consulta(id: number): Promise<{ id: number }> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ id: id });
        this.obteneridporid_consulta();
      }, 600);
    });
  }

  promesaid_modificar(id: number): Promise<{ id: number }> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ id: id });
        this.obteneridporid_modificar();
        this.consultacoordinador();
      }, 600);
    });
  }

  highlight(row): void {
    this.idproyecto = row.data.ProyectoAcademico.Id;
  }

  consultacoordinador() {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('oferta.evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    this.proyectoacademicoService
      .get(
        'proyecto_academico_rol_tercero_dependencia/?query=ProyectoAcademicoInstitucionId.Id:' +
        this.idproyecto,
      )
      .subscribe(
        (res: any) => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            this.coordinador = <any>res;
            this.coordinador.forEach((uni: any) => {
              if (uni.Activo === true) {
                this.coordinador = uni;
              }
            });
            this.id_coordinador = this.coordinador['TerceroId'];
            this.fecha_inicio_coordinador = this.coordinador['FechaInicio'];
            this.id_documento_registro_coordinador = this.coordinador[
              'ResolucionAsignacionId'
            ];
          } else {
            Swal.fire(opt1).then(willDelete => {
              if (willDelete.value) {
              }
            });
          }
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        },
      );
  }

  inhabilitarProyecto(row: any): void {
    let inhabilitar_title = this.translate.instant(
      'consultaproyecto.inhabilitar_proyecto',
    );
    let inhabilitar_text = this.translate.instant(
      'consultaproyecto.seguro_continuar_inhabilitar_proyecto',
    );
    let inhabilitar_ok = this.translate.instant(
      'consultaproyecto.proyecto_inhabilitado',
    );
    let inhabilitar_error = this.translate.instant(
      'consultaproyecto.proyecto_no_inhabilitado',
    );
    if (!row.ProyectoAcademico.Oferta) {
      inhabilitar_title = this.translate.instant(
        'consultaproyecto.habilitar_proyecto',
      );
      inhabilitar_text = this.translate.instant(
        'consultaproyecto.seguro_continuar_habilitar_proyecto',
      );
      inhabilitar_ok = this.translate.instant(
        'consultaproyecto.proyecto_habilitado',
      );
      inhabilitar_error = this.translate.instant(
        'consultaproyecto.proyecto_no_habilitado',
      );
    }
    const opt: any = {
      title: inhabilitar_title,
      text: inhabilitar_text,
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt).then(willDelete => {
      if (willDelete.value) {
        const proyectoAModificar = row.ProyectoAcademico;
        proyectoAModificar.Activo = !proyectoAModificar.Activo;
        proyectoAModificar.Oferta = !proyectoAModificar.Oferta;
        this.sgamidService
          .put(
            'consulta_proyecto_academico/inhabilitar_proyecto',
            proyectoAModificar,
          )
          .subscribe(
            (res: any) => {
              if (res.Type !== 'error') {
                this.loadproyectos();
                this.loadData();
                this.showToast('info', inhabilitar_title, inhabilitar_ok);
              } else {
                this.showToast(
                  'error',
                  this.translate.instant('GLOBAL.error'),
                  inhabilitar_error,
                );
              }
            },
            () => {
              this.showToast(
                'error',
                this.translate.instant('GLOBAL.error'),
                inhabilitar_error,
              );
            },
          );
      }
    });
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
