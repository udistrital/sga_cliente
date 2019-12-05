import { PersonaService } from '../../data/persona.service';
import { Injectable } from '@angular/core';
import { IAppState } from '../app.state';
import { Store } from '@ngrx/store';
import { REDUCER_LIST } from '../reducer.constants';
import { InscripcionService } from '../../data/inscripcion.service';
import { CoreService } from '../../data/core.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { IdiomaService } from '../../data/idioma.service';
import { UbicacionService } from '../../data/ubicacion.service';
import { ProyectoAcademicoService } from '../../data/proyecto_academico.service';
import { EnteService } from '../../data/ente.service';
@Injectable()
export class ListService {

  constructor(
    private personaService: PersonaService,
    private inscripcionService: InscripcionService,
    private idiomaService: IdiomaService,
    private coreService: CoreService,
    private tercerosService: TercerosService,
    private ubicacionService: UbicacionService,
    private programaAcademicoService: ProyectoAcademicoService,
    // private producccionAcademicaService: ProduccionAcademicaService,
    private enteService: EnteService,
    private store: Store<IAppState>) {

  }


  public findGenero() {
    this.store.select(REDUCER_LIST.Genero).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria/?query=GrupoInfoComplementariaId.Id:6')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.Genero, result);
              },
              error => {
                this.addList(REDUCER_LIST.Genero, []);
              },
            );
        }
      },
    );
  }

  public findGrupoSanguineo() {
    this.store.select(REDUCER_LIST.Sanguineo).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria/?query=GrupoInfoComplementariaId.Id:7')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.Sanguineo, result);
              },
              error => {
                this.addList(REDUCER_LIST.Sanguineo, []);
              },
            );
        }
      },
    );
  }

  public findFactorRh() {
    this.store.select(REDUCER_LIST.RH).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria/?query=GrupoInfoComplementariaId.Id:8')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.RH, result);
              },
              error => {
                this.addList(REDUCER_LIST.RH, []);
              },
            );
        }
      },
    );
  }

  public findClasificacionNivelIdioma() {
    this.store.select(REDUCER_LIST.ClasificacionNivelIdioma).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.idiomaService.get('clasificacion_nivel_idioma/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.ClasificacionNivelIdioma, result);
              },
              error => {
                this.addList(REDUCER_LIST.ClasificacionNivelIdioma, []);
              },
            );
        }
      },
    );
  }

  public findEstadoInscripcion() {
    this.store.select(REDUCER_LIST.EstadoInscripcion).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.inscripcionService.get('estado_inscripcion/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.EstadoInscripcion, result);
              },
              error => {
                this.addList(REDUCER_LIST.EstadoInscripcion, []);
              },
            );
        }
      },
    );
  }

  public findEstadoCivil() {
    this.store.select(REDUCER_LIST.EstadoCivil).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria/?query=GrupoInfoComplementariaId.Id:2')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.EstadoCivil, result);
              },
              error => {
                this.addList(REDUCER_LIST.EstadoCivil, []);
              },
            );
        }
      },
    );
  }

  public findGrupoEtnico() {
    this.store.select(REDUCER_LIST.GrupoEtnico).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria/?query=GrupoInfoComplementariaId.Id:3')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.GrupoEtnico, result);
              },
              error => {
                this.addList(REDUCER_LIST.GrupoEtnico, []);
              },
            );
        }
      },
    );
  }

  public findIdioma() {
    this.store.select(REDUCER_LIST.Idioma).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.idiomaService.get('idioma/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.Idioma, result);
              },
              error => {
                this.addList(REDUCER_LIST.Idioma, []);
              },
            );
        }
      },
    );
  }

  public findLineaInvestigacion() {
    this.store.select(REDUCER_LIST.LineaInvestigacion).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.coreService.get('linea_investigacion/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.LineaInvestigacion, result);
              },
              error => {
                this.addList(REDUCER_LIST.LineaInvestigacion, []);
              },
            );
        }
      },
    );
  }

  public findPais() {
    this.store.select(REDUCER_LIST.Pais).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ubicacionService.get('lugar/?query=TipoLugar.Nombre:PAIS,Activo:true&limit=0') // TODO: filtrar pais
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.Pais, result);
              },
              error => {
                this.addList(REDUCER_LIST.Pais, []);
              },
            );
        }
      },
    );
  }

  public findCiudad() {
    this.store.select(REDUCER_LIST.Ciudad).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ubicacionService.get('lugar/?query=Activo:true&limit=0') // TODO: filtrar ciudad
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.Ciudad, result);
              },
              error => {
                this.addList(REDUCER_LIST.Ciudad, []);
              },
            );
        }
      },
    );
  }

  public findLugar() {
    this.store.select(REDUCER_LIST.Lugar).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ubicacionService.get('lugar/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.Lugar, result);
              },
              error => {
                this.addList(REDUCER_LIST.Lugar, []);
              },
            );
        }
      },
    );
  }

  public findMetodologia() {
    this.store.select(REDUCER_LIST.Metodologia).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.programaAcademicoService.get('metodologia/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.Metodologia, result);
              },
              error => {
                this.addList(REDUCER_LIST.Metodologia, []);
              },
            );
        }
      },
    );
  }

  public findNivelFormacion() {
    this.store.select(REDUCER_LIST.NivelFormacion).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.programaAcademicoService.get('nivel_formacion/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.NivelFormacion, result);
              },
              error => {
                this.addList(REDUCER_LIST.NivelFormacion, []);
              },
            );
        }
      },
    );
  }

  public findNivelIdioma() {
    this.store.select(REDUCER_LIST.NivelIdioma).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.idiomaService.get('valor_nivel_idioma/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.NivelIdioma, result);
              },
              error => {
                this.addList(REDUCER_LIST.NivelIdioma, []);
              },
            );
        }
      },
    );
  }

  public findProgramaAcademico() {
    this.store.select(REDUCER_LIST.ProgramaAcademico).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.programaAcademicoService.get('proyecto_academico_institucion/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.ProgramaAcademico, result);
              },
              error => {
                this.addList(REDUCER_LIST.ProgramaAcademico, []);
              },
            );
        }
      },
    );
  }

  public findTipoContacto() {
    this.store.select(REDUCER_LIST.TipoContacto).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.enteService.get('tipo_contacto/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.TipoContacto, result);
              },
              error => {
                this.addList(REDUCER_LIST.TipoContacto, []);
              },
            );
        }
      },
    );
  }

  public findTipoDiscapacidad() {
    this.store.select(REDUCER_LIST.TipoDiscapacidad).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria/?query=GrupoInfoComplementariaId.Id:1')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.TipoDiscapacidad, result);
              },
              error => {
                this.addList(REDUCER_LIST.TipoDiscapacidad, []);
              },
            );
        }
      },
    );
  }

  public findEPS() {
    this.store.select(REDUCER_LIST.EPS).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('tercero_tipo_tercero/?query=TipoTerceroId.Id:3&limit=0')
            .subscribe(
              (result: any[]) => {
                for (let i = 0; i < result.length; i++) {
                  result[i] = result[i]['TerceroId']
                }
                this.addList(REDUCER_LIST.EPS, result);
              },
              error => {
                this.addList(REDUCER_LIST.EPS, []);
              },
            );
        }
      },
    );
  }



  public findTipoICFES() {
    this.store.select(REDUCER_LIST.ICFES).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.inscripcionService.get('tipo_icfes')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.ICFES, result);
              },
              error => {
                this.addList(REDUCER_LIST.ICFES, []);
              },
            );
        }
      },
    );
  }

  public findTipoLugar() {
    this.store.select(REDUCER_LIST.TipoLugar).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ubicacionService.get('tipo_lugar/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.TipoLugar, result);
              },
              error => {
                this.addList(REDUCER_LIST.TipoLugar, []);
              },
            );
        }
      },
    );
  }

  public findTitulacion() {
    this.store.select(REDUCER_LIST.Titulacion).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.programaAcademicoService.get('titulacion/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.Titulacion, result);
              },
              error => {
                this.addList(REDUCER_LIST.Titulacion, []);
              },
            );
        }
      },
    );
  }

  public findTipoIdentificacion() {
    this.store.select(REDUCER_LIST.TipoIdentificacion).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('tipo_documento/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.TipoIdentificacion, result);
              },
              error => {
                this.addList(REDUCER_LIST.TipoIdentificacion, []);
              },
            );
        }
      },
    );
  }

  public findTipoProyecto() {
    this.store.select(REDUCER_LIST.TipoProyecto).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.inscripcionService.get('tipo_proyecto/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.TipoProyecto, result);
              },
              error => {
                this.addList(REDUCER_LIST.TipoProyecto, []);
              },
            );
        }
      },
    );
  }

  public findGrupoInvestigacion() {
    this.store.select(REDUCER_LIST.GrupoInvestigacion).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.coreService.get('grupo_investigacion/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.GrupoInvestigacion, result);
              },
              error => {
                this.addList(REDUCER_LIST.GrupoInvestigacion, []);
              },
            );
        }
      },
    );
  }

  public findPeriodoAcademico() {
    this.store.select(REDUCER_LIST.PeriodoAcademico).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.coreService.get('periodo/?query=Activo:true&limit=0')
            .subscribe(
              (result: any[]) => {
                console.info('Entro')
                console.info(result)
                this.addList(REDUCER_LIST.PeriodoAcademico, result);
              },
              error => {
                this.addList(REDUCER_LIST.PeriodoAcademico, []);
              },
            );
        }
      },
    );
  }

  public findLocalidadesBogota() {
    this.store.select(REDUCER_LIST.LocalidadesBogota).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria?limit=0&query=GrupoInfoComplementariaId__CodigoAbreviacion:Grupo_12')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.LocalidadesBogota, result);
              },
              error => {
                this.addList(REDUCER_LIST.LocalidadesBogota, []);
              },
            );
        }
      },
    );
  }

  public findTipoColegio() {
    this.store.select(REDUCER_LIST.TipoColegio).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria?limit=0&query=GrupoInfoComplementariaId__CodigoAbreviacion:Grupo_13')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.TipoColegio, result);
              },
              error => {
                this.addList(REDUCER_LIST.TipoColegio, []);
              },
            );
        }
      },
    );
  }

  public findSemestresSinEstudiar() {
    this.store.select(REDUCER_LIST.SemestresSinEstudiar).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.tercerosService.get('info_complementaria?limit=0&query=GrupoInfoComplementariaId__CodigoAbreviacion:Grupo_14')
            .subscribe(
              (result: any[]) => {
                this.addList(REDUCER_LIST.SemestresSinEstudiar, result);
              },
              error => {
                this.addList(REDUCER_LIST.SemestresSinEstudiar, []);
              },
            );
        }
      },
    );
  }

  private addList(type: string, object: Array<any>) {
    this.store.dispatch({
      type: type,
      payload: object,
    });
  }
}
