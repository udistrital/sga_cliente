import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EvaluacionInscripcionService } from '../../../@core/data/evaluacion_inscripcion.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { TAGS_INSCRIPCION_PROGRAMA } from './def_tags_por_programa';
import { UserService } from '../../../@core/data/users.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';

@Component({
  selector: 'def-suite-inscrip-programa',
  templateUrl: './def-suite-inscrip-programa.component.html',
  styleUrls: ['./def-suite-inscrip-programa.component.scss']
})
export class DefSuiteInscripProgramaComponent implements OnInit {

  loading: boolean = false;

  periodo: any;
  periodos: any[];
  nivel: any;
  niveles: any[];
  proyecto: any;
  proyectos: any[];
  proyectosFiltered: any[];
  tipoInscrip: any;
  tiposInscrip: any[];
  tiposInscripFiltered: any[];

  tagsObject = undefined;
  nuevaSuite: boolean = false;
  respuestaTagsOriginal: any; 

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private inscripcionService: InscripcionService,
    private evaluacionInscripcionService: EvaluacionInscripcionService,
    private userService: UserService,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {

    });
  }

  async ngOnInit() {
    this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
    try {
      this.loading = true;
      await this.cargarPeriodo();
      await this.cargarNivel();
      await this.cargarProyectos();
      await this.cargarTipoInscripcion();
      this.loading = false;
    } catch (error) {
      this.popUpManager.showErrorToast(this.translate.instant('Error.general'));
      this.loading = false;
    }
  }

  cargarPeriodo(){
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((response: any) => {
          if (response != null && response.Status == '200') {
            this.periodo = response.Data.find(p => p.Activo).Id;
            this.periodos = response.Data;
            resolve(this.periodos);
          } else {
            reject({Periodo: "Bad answer"});
          }
        },
        (error: HttpErrorResponse) => {
          reject({Periodo: error});
        });
    });
  }

  cargarNivel(){
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?query=Activo:true,NivelFormacionPadreId__isnull:true&limit=2')
        .subscribe((response: any) => {
          if (response != null && response.Status != '404' 
              && Object.keys(response[0]).length > 0) {
                this.niveles = response;
                resolve(this.niveles);
          } else {
            reject({Nivel: "Bad answer"});
          }
        },
        (error: HttpErrorResponse) => {
          reject({Nivel: error});
        });
    });
  }

  cargarProyectos(){
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true&limit=0&fields=Id,Nombre,NivelFormacionId')
        .subscribe((response: any) => {
          if (response != null && response.Status != '404' 
              && Object.keys(response[0]).length > 0) {
                this.autenticationService.getRole().then(
                  (rol: Array <String>) => {
                    let r = rol.find(role => (role == "ADMIN_SGA" || role == "VICERRECTOR" || role == "ASESOR_VICE")); // rol admin o vice
                    if (r) {
                      this.proyectos = response;
                    } else {
                      const id_tercero = this.userService.getPersonaId();
                      this.sgaMidService.get('admision/dependencia_vinculacion_tercero/'+id_tercero).subscribe(
                        (respDependencia: any) => {
                          const dependencias = <Number[]>respDependencia.Data.DependenciaId;
                          this.proyectos = <any[]>response.filter(
                            proyecto => dependencias.includes(proyecto.Id)
                          );
                          if (dependencias.length > 1) {
                            this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'),this.translate.instant('admision.multiple_vinculacion'));//+". "+this.translate.instant('GLOBAL.comunicar_OAS_error'));
                            //this.proyectos.forEach(p => { p.Id = undefined })
                          }
                        },
                        (error: any) => {
                          this.popUpManager.showErrorAlert(this.translate.instant('admision.no_vinculacion_no_rol')+". "+this.translate.instant('GLOBAL.comunicar_OAS_error'));
                        }
                      );
                    }
                  }
                );
                resolve(this.proyectos);
          } else {
            reject({Proyecto: "Bad answer"});
          }
        },
        (error: HttpErrorResponse) => {
          reject({Proyecto: error});
        });
    });
  }

  cargarTipoInscripcion(){
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('tipo_inscripcion?query=Activo:true&limit=0')
        .subscribe((response: any) => {
          if (response != null && response.Status != '404' 
              && Object.keys(response[0]).length > 0) {
                this.tiposInscrip = response;
                resolve(this.tiposInscrip);
          } else {
            reject({TipoInscrip: "Bad answer"});
          }
        },
        (error: HttpErrorResponse) => {
          reject({TipoInscrip: error});
        });
    });
  }

  cambioPeriodo(selPeriodo) {
    this.nivel = undefined;
    this.proyecto = undefined;
    this.tipoInscrip = undefined;
    this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
  }
  
  filtrarPorNivel(selNivel) {
    this.proyectosFiltered = this.proyectos.filter(
      (proyect) => {
        if (proyect.NivelFormacionId.Id == selNivel) {
          return true;
        } else if (proyect.NivelFormacionId.NivelFormacionPadreId != null) {
          if (proyect.NivelFormacionId.NivelFormacionPadreId.Id == selNivel) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }      
    );
    this.tiposInscripFiltered = this.tiposInscrip.filter(
      (tipo) => {
        return (tipo.NivelId == selNivel);
      }
    );
    this.proyecto = undefined;
    this.tipoInscrip = undefined;
    this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
  }

  cambioProyecto(selProyecto) {
    this.tipoInscrip = undefined;
    this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
  }

  cambioTipoInscrip(selTipoInscrip) {
    this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
    if (this.periodo && this.nivel && this.proyecto && this.tipoInscrip) {
      this.loading = true;
      this.evaluacionInscripcionService.get('tags_por_dependencia?query=Activo:true,PeriodoId:'+this.periodo+',DependenciaId:'+this.proyecto+',TipoInscripcionId:'+this.tipoInscrip)
        .subscribe((response: any) => {
          if (response != null && response.Status == '200') {
            if (Object.keys(response.Data[0]).length > 0) {
              this.nuevaSuite = false;
              this.tagsObject = JSON.parse(response.Data[0].ListaTags);
              this.respuestaTagsOriginal = response.Data[0];
              this.loading = false;
            } else {
              this.loading = false;
              this.popUpManager.showAlert(this.translate.instant('admision.definicion_suite_inscripcion_programa'), this.translate.instant('admision.no_tiene_suite'));
              this.nuevaSuite = true;
              this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
            }
          } else {
            this.loading = false;
              this.popUpManager.showAlert(this.translate.instant('admision.definicion_suite_inscripcion_programa'), this.translate.instant('admision.no_tiene_suite'));
          }
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        });
    }
  }

  clickTag(tag) {
    switch (tag) {
      case 'info_persona':
        this.tagsObject.info_persona.selected = !this.tagsObject.info_persona.selected;
        this.tagsObject.info_persona.required = this.tagsObject.info_persona.selected;
        break;
      case 'formacion_academica':
        this.tagsObject.formacion_academica.selected = !this.tagsObject.formacion_academica.selected;
        this.tagsObject.formacion_academica.required = this.tagsObject.formacion_academica.selected;
        break;
      case 'idiomas':
        this.tagsObject.idiomas.selected = !this.tagsObject.idiomas.selected;
        this.tagsObject.idiomas.required = this.tagsObject.idiomas.selected;
        break;
      case 'experiencia_laboral':
        this.tagsObject.experiencia_laboral.selected = !this.tagsObject.experiencia_laboral.selected;
        this.tagsObject.experiencia_laboral.required = this.tagsObject.experiencia_laboral.selected;
        break;
      case 'produccion_academica':
        this.tagsObject.produccion_academica.selected = !this.tagsObject.produccion_academica.selected;
        this.tagsObject.produccion_academica.required = this.tagsObject.produccion_academica.selected;
        break;
      case 'documento_programa':
        this.tagsObject.documento_programa.selected = !this.tagsObject.documento_programa.selected;
        this.tagsObject.documento_programa.required = this.tagsObject.documento_programa.selected;
        break;
      case 'descuento_matricula':
        this.tagsObject.descuento_matricula.selected = !this.tagsObject.descuento_matricula.selected;
        this.tagsObject.descuento_matricula.required = this.tagsObject.descuento_matricula.selected;
        break;
      case 'propuesta_grado':
        this.tagsObject.propuesta_grado.selected = !this.tagsObject.propuesta_grado.selected;
        this.tagsObject.propuesta_grado.required = this.tagsObject.propuesta_grado.selected;
        break;
      case 'perfil':
        this.tagsObject.perfil.selected = !this.tagsObject.perfil.selected;
        this.tagsObject.perfil.required = this.tagsObject.perfil.selected;
        break;
    
      default:
        break;
    }
  }

  guardar() {
    if (this.periodo && this.nivel && this.proyecto && this.tipoInscrip) {
      if (this.nuevaSuite) {
        let postData = {
          Activo: true,
          DependenciaId: this.proyecto,
          ListaTags: JSON.stringify(this.tagsObject),
          PeriodoId: this.periodo,
          TipoInscripcionId: this.tipoInscrip,
        };
        this.postTags(postData);
      } else {
        let putData = {...this.respuestaTagsOriginal};
        putData.ListaTags = JSON.stringify(this.tagsObject);
        this.putTags(putData);
      }
    }
  }

  postTags(dataJson) {
    this.popUpManager.showConfirmAlert(this.translate.instant('admision.guardar_suite_inscripción'), this.translate.instant('admision.definicion_suite_inscripcion_programa'))
      .then((Accion) => {
        if (Accion.value) {
          this.loading = true;
          this.evaluacionInscripcionService.post('tags_por_dependencia', dataJson)
            .subscribe((response: any) => {
              if (response != null && response.Status == '201') {
                this.loading = false;
                this.tagsObject = JSON.parse(response.Data.ListaTags);
                this.popUpManager.showSuccessAlert(this.translate.instant('admision.guardado_existoso_suite'));
              } else {
                this.loading = false;
                this.popUpManager.showErrorAlert(this.translate.instant('admision.fallo_guardado_suite'));
              }
            },
            (error: HttpErrorResponse) => {
              this.loading = false;
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            });
        }
      })
  }

  putTags(dataJson) {
    this.popUpManager.showConfirmAlert(this.translate.instant('admision.cambios_suite_inscripción'), this.translate.instant('admision.definicion_suite_inscripcion_programa'))
      .then((Accion) => {
        if (Accion.value) {
          this.loading = true;
          this.evaluacionInscripcionService.put('tags_por_dependencia', dataJson)
            .subscribe((response: any) => {
              if (response != null && response.Status == '200') {
                this.loading = false;
                this.tagsObject = JSON.parse(response.Data.ListaTags);
                this.popUpManager.showSuccessAlert(this.translate.instant('admision.guardado_existoso_suite'));
              } else {
                this.loading = false;
                this.popUpManager.showErrorAlert(this.translate.instant('admision.fallo_guardado_suite'));
              }
            },
            (error: HttpErrorResponse) => {
              this.loading = false;
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            });
        }
      })
  }

}
