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

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-criterio-admision',
  templateUrl: './criterio_admision.component.html',
  styleUrls: ['./criterio_admision.component.scss'],
})
export class CriterioAdmisionComponent implements OnInit, OnChanges {
  toasterService: any;

  @Input('criterios_select')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    console.info('Posgrado ins: ' + this.inscripcion_id)
    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === '0') {
      this.selectedValue = undefined;
      window.localStorage.setItem('programa', this.selectedValue);
    }
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      // this.getInfoInscripcion();
    }
  }

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

  percentage_info: number = 0;
  percentage_acad: number = 0;
  percentage_expe: number = 0;
  percentage_proy: number = 0;
  percentage_prod: number = 0;
  percentage_desc: number = 0;
  percentage_docu: number = 0;
  percentage_total: number = 0;

  total: boolean = false;

  percentage_tab_info = [];
  percentage_tab_expe = [];
  percentage_tab_acad = [];
  proyectos = [];
  criterios = [];
  periodos = [];
  nivel_load = [{nombre: 'Pregrado', id: 14}, { nombre: 'Posgrado', id: 15}];

  show_icfes = false;
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
  ) {
    this.imagenes = IMAGENES;
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.total = true;
    this.loadData();
    this.loadCriterios();
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();
      console.info('Carga hecha')
      console.info(this.info_persona_id)
      await this.cargarPeriodo();
    } catch (error) {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('inscripcion.error_cargar_informacion'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
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


  setPercentage_info(number, tab) {
    console.info(number)
    this.percentage_tab_info[tab] = (number * 100) / 2;
    this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
    this.setPercentage_total();
  }

  setPercentage_acad(number, tab) {
    this.percentage_tab_acad[tab] = (number * 100) / 2;
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }
  setPercentage_total() {
    this.percentage_total = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info)) / 2;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad)) / 4;
    if (this.info_inscripcion !== undefined) {
      if (this.info_inscripcion.EstadoInscripcionId.Id > 1) {
        this.percentage_total = 100;
      }
      if (this.percentage_total >= 100) {
        if (this.info_inscripcion.EstadoInscripcionId.Id === 1) {
          this.total = false;
        }
      }
    }
  }

  loadProyectos() {
    // window.localStorage.setItem('IdNivel', String(this.selectednivel.id));
    this.selectprograma = false;
    this.oikosService.get('dependencia/?query=DependenciaTipoDependencia.TipoDependenciaId.Id:' + Number(this.selectednivel.id) +
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
  activeCriterios() {
  this.selectcriterio = false;
}
  loadCriterios() {
    this.evaluacionService.get('requisito/?query=Activo:true&limit=0')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          const CriteriosConsultados = <Array<any>>res;
            this.criterios = CriteriosConsultados;
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
      case 'info_icfes':
        this.show_icfes = true;
        break;
        case 'info_entrevista':
          this.preinscripcion = true;
          break;
      case 'info_entrevista':
        this.show_icfes = false;
        break;
        default:
            this.show_icfes = false;
        break;
    }
  }

  ngOnInit() {

    }

  ngOnChanges() {

  }



  viewtab() {
    console.info('Tipo criterio')
    console.info(this.criterio_selected)
      this.selectTipoIcfes = false;
      this.selectTipoEntrevista = false;
      this.selectTipoPrueba = false;
    for (let i = 0; i < this.criterio_selected.length; i++) {
      if (this.criterio_selected[i]['Nombre'] === 'ICFES') {
      this.selectTipoIcfes = true;
      }
      if (this.criterio_selected[i]['Nombre'] === 'Entrevista') {
        this.selectTipoEntrevista = true;
      }
      if (this.criterio_selected[i]['Nombre'] === 'Prueba') {
        this.selectTipoPrueba = true;
      }
    }
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
