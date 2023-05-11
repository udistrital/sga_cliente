import { Component, OnInit, OnChanges } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import { FormControl, Validators } from '@angular/forms';
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { UserService } from '../../../@core/data/users.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-asignacion-cupos',
  templateUrl: './asignacion_cupos.component.html',
  styleUrls: ['./asignacion_cupos.component.scss'],
})
export class AsignacionCuposComponent implements OnInit, OnChanges {
  toasterService: any;



  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  inscripcion_id: number;
  info_persona_id: number;
  info_ente_id: number;
  estado_inscripcion: number;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion: Inscripcion;
  preinscripcion: boolean;
  step = 0;
  cambioTab = 0;
  nForms: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;


  total: boolean = false;

  proyectos = [];
  criterios = [];
  periodos = [];
  niveles: NivelFormacion[];
  nivelSelect: NivelFormacion[];

  show_cupos = false;
  show_profile = false;
  show_expe = false;
  show_acad = false;

  info_persona: boolean;
  loading: boolean;
  ultimo_select: number;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  proyectos_selected: any[];
  criterio_selected: any[];
  selectTipoIcfes: any;
  selectTipoEntrevista: any;
  selectTipoPrueba: any;
  selectTabView: any;
  tag_view_posg: boolean;
  tag_view_pre: boolean;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  periodo: any;
  selectednivel: any ;
  esPosgrado: boolean = false;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private userService: UserService,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
  ) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.total = true;
    this.cargarPeriodo();
    this.nivel_load()
  }


  // cargarPeriodo() {
  //   return new Promise((resolve, reject) => {
  //     this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1')
  //     .subscribe(res => {
  //       const r = <any>res;
  //       if (res !== null && r.Type !== 'error') {
  //         this.periodo = <any>res[0];
  //         window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
  //         resolve(this.periodo);
  //         const periodos = <Array<any>>res;
  //        periodos.forEach(element => {
  //           this.periodos.push(element);
  //         });
  //       }
  //     },
  //     (error: HttpErrorResponse) => {
  //       reject(error);
  //     });
  //   });
  // }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = res.Data.find(p => p.Activo);
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  selectPeriodo() {
    this.selectednivel = undefined;
    this.proyectos_selected = undefined;
  }

  nivel_load() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: NivelFormacion[]) => {
        this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null && nivel.Nombre === 'Posgrado')
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  filtrarProyecto(proyecto) {
    if (this.selectednivel === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.selectednivel) {
        return true
      }
    } else {
      return false
    }
  }

  loadProyectos() {
    this.selectprograma = false;
    if (this.selectednivel !== NaN) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {
          this.autenticationService.getRole().then(
            (rol: Array <String>) => {
              let r = rol.find(role => (role == "ADMIN_SGA" || role == "VICERRECTOR" || role == "ASESOR_VICE")); // rol admin o vice
              if (r) {
                this.proyectos = <any[]>response.filter(
                  proyecto => this.filtrarProyecto(proyecto),
                );
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
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event): void {
    // console.info(event)
    switch (event) {
      case 'info_cupos':
        this.show_cupos = true;
        this.validarNvel();
        break;
        default:
            this.show_cupos = false;
        break;
    }
  }

  validarNvel() {
    this.esPosgrado = false;
    this.projectService.get('nivel_formacion?query=Id:' + Number(this.selectednivel)).subscribe(
      (response: NivelFormacion[]) => {
        this.nivelSelect = response.filter(nivel => nivel.NivelFormacionPadreId === null)
        if (this.nivelSelect[0].Nombre === 'Posgrado') {
          this.esPosgrado = true;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  ngOnInit() {

  }

  ngOnChanges() {

  }

}
