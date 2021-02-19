import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { Router, ResolveEnd } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { OikosService } from '../../../@core/data/oikos.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { UserService } from '../../../@core/data/users.service';
import { CoreService } from '../../../@core/data/core.service';
import { TercerosService} from '../../../@core/data/terceros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import { IMAGENES } from './imagenes';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { from } from 'rxjs';
import { ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FormControl, Validators } from '@angular/forms';
import { EvaluacionInscripcionService } from '../../../@core/data/evaluacion_inscripcion.service';
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { PopUpManager } from '../../../managers/popUpManager';

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

  config: ToasterConfig;
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
  imagenes: any;
  periodo: any;
  selectednivel: any ;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  constructor(
    private translate: TranslateService,
    private router: Router,
    private terceroService: TercerosService,
    private oikosService: OikosService,
    private userService: UserService,
    private coreService: CoreService,
    private evaluacionService: EvaluacionInscripcionService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
  ) {
    this.imagenes = IMAGENES;
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.total = true;
    this.cargarPeriodo();
    this.nivel_load()
  }


  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.periodo = <any>res[0];
          window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
          resolve(this.periodo);
          const periodos = <Array<any>>res;
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

  nivel_load() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: NivelFormacion[]) => {
        this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null)
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }


  loadProyectos() {
    // window.localStorage.setItem('IdNivel', String(this.selectednivel.id));
    this.selectprograma = false;
    this.oikosService.get('dependencia?query=DependenciaTipoDependencia.TipoDependenciaId.Id:' + Number(this.selectednivel) +
    ',Activo:true&limit=0')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          const ProyectosConsultados = <Array<any>>res;
            this.proyectos = ProyectosConsultados;
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.programa_academico'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event): void {
    console.info(event)
    switch (event) {
      case 'info_cupos':
        this.show_cupos = true;
        break;
        default:
            this.show_cupos = false;
        break;
    }
  }

  ngOnInit() {

  }

  ngOnChanges() {

  }

}
