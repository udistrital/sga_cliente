import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { OikosService } from '../../../@core/data/oikos.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { UserService } from '../../../@core/data/users.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import Swal from 'sweetalert2';
import { SgaMidService } from '../../../@core/data/sga_mid.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-preinscripcion',
  templateUrl: './preinscripcion.component.html',
  styleUrls: ['./preinscripcion.component.scss'],
})
export class PreinscripcionComponent implements OnInit, OnChanges {

  @Input('inscripcion_id')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
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
  percentage_tab_proy = [];
  percentage_tab_prod = [];
  percentage_tab_desc = [];
  percentage_tab_docu = [];
  posgrados = [];
  tipo_inscripciones = [];
  periodos = [];

  show_info = false;
  show_profile = false;
  show_expe = false;
  show_acad = false;

  info_persona: boolean;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  tipo_inscripcion_selected: any;
  selectTipo: any;
  selectTabView: any;
  tag_view_posg: boolean;
  tag_view_pre: boolean;
  selectprograma: boolean = true;
  periodo: any;
  selectednivel: any;

  loading: boolean = false;
  toasterService: any;

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private programaService: OikosService,
    private sgaMidService: SgaMidService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.total = true;
    this.show_info = true;  
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();
    } catch (error) {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('inscripcion.error_cargar_informacion'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  setPercentage_info(number, tab) {
    setTimeout(()=>{
      this.percentage_tab_info[tab] = (number * 100) / 2;
      this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
      this.setPercentage_total();
    });
  }

  setPercentage_acad(number, tab) {
    this.percentage_tab_acad[tab] = (number * 100) / 2;
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }
  setPercentage_total() {
    this.percentage_total = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info)) / 2;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad)) / 4;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_docu)) / 4;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_proy)) / 4;
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

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event): void {
    switch (event) {
      case 'info_persona':
        this.show_info = true;
        break;
        case 'info_preinscripcion':
          this.preinscripcion = true;
          break;
      case 'perfil':
        this.show_info = false;
        this.show_profile = true;
        break;
      default:
        this.show_info = false;
        this.show_profile = false;
        break;
    }
  }
  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.info_persona')) {
      if (this.info_persona)
        this.perfil_editar('info_persona');
    } else if (event.tabTitle === this.translate.instant('GLOBAL.info_caracteristica')) {
      this.perfil_editar('info_caracteristica');
    } else if (event.tabTitle === this.translate.instant('GLOBAL.informacion_contacto')) {
      this.perfil_editar('info_contacto');
    }
  }

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges() {

  }
}
