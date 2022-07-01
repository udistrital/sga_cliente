import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { IdiomaService } from '../../../@core/data/idioma.service';
import { UserService } from '../../../@core/data/users.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import { DocumentoService } from '../../../@core/data/documento.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import Swal from 'sweetalert2';
import { ListService } from '../../../@core/store/services/list.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FormControl, Validators } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-inscripcion_general',
  templateUrl: './inscripcion_general.component.html',
  styleUrls: ['./inscripcion_general.component.scss'],
})
export class InscripcionGeneralComponent implements OnInit, OnChanges {
  toasterService: any;
  hide_header_labels: boolean;
  basic_info_button: boolean = false;
  formacion_academica_button: boolean = false;
  documentos_programa_button: boolean = false;
  detalle_inscripcion: boolean = false;
  experiencia_laboral: boolean = false;
  produccion_academica: boolean = false;
  es_transferencia: boolean = false;
  nivel: any;

  @Input('inscriptionSettings')
  set nameInscription(inscriptionSettings: any) {
    const {
      basic_info_button,
      hide_header_labels,
      formacion_academica_button,
      documentos_programa_button,
      nivel,
      select_tipo,
      detalle_inscripcion,
      experiencia_laboral,
      produccion_academica,
      es_transferencia,
    } = inscriptionSettings;

    this.nivel = nivel;
    this.selectTipo = select_tipo;
    this.hide_header_labels = !!hide_header_labels;
    this.basic_info_button = basic_info_button;
    this.formacion_academica_button = formacion_academica_button;
    this.documentos_programa_button = documentos_programa_button;
    this.detalle_inscripcion = detalle_inscripcion;
    this.experiencia_laboral = experiencia_laboral;
    this.produccion_academica = produccion_academica;
    this.es_transferencia = es_transferencia;
  }

  @Input('inscripcion_id')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === '0') {
      this.selectedValue = undefined;
      window.localStorage.setItem('programa', this.selectedValue);
    }
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      this.getInfoInscripcion();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();
  @Output() changeTab: EventEmitter<any> = new EventEmitter();
  @Output() ocultarBarra: EventEmitter<boolean> = new EventEmitter();

  inscripcion_id: number;
  info_persona_id: number;
  info_ente_id: number;
  estado_inscripcion: number;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion: Inscripcion;
  step = 0;
  enfasisSelected: any = null;
  cambioTab = 0;
  nForms: number;
  SelectedTipoBool: boolean = true;
  Campo1Control = new FormControl('', [Validators.required]);
  enfasisControl = new FormControl('', [Validators.required]);

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
  posgrados: any[];
  tipo_inscripciones = [];

  show_info_pregrado = false;
  show_info_externa = false;
  show_info = false;
  show_profile = false;
  show_acad_pregrado = false;
  show_acad = false;
  show_expe = false;
  show_proy = false;
  show_prod = false;
  show_desc = false;
  show_docu = false;
  showRegreso: boolean = true;

  info_contacto: boolean;
  info_familiar: boolean;
  info_persona: boolean;
  info_caracteristica: boolean;
  info_inscripcion: any;
  loading: boolean;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  tipo_inscripcion_selected: any;
  selectTipo: any;
  selectTabView: any;
  tipo_documentos: any[];
  tag_view_posg: boolean;
  tag_view_pre: boolean;
  selectprograma: boolean = true;
  periodo: any;
  imprimir: boolean = false;

  tieneEnfasis: boolean = false;
  enfasis: any = [];

  constructor(
    private listService: ListService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private documentoService: DocumentoService,
    private idiomaService: IdiomaService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private programaService: ProyectoAcademicoService,
    private sgaMidService: SgaMidService,
  ) {
    sessionStorage.setItem('TerceroId', this.userService.getPersonaId().toString());
    this.info_persona_id = this.userService.getPersonaId();
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.total = true;
    //this.loading = true;
    this.listService.findPais();
    this.loadData();
  }

  activateTab() {
    // No se muestra la vista de inscripción sino la de preinscripción
    this.changeTab.emit(false);
  }

  getInfoInscripcion() {
    this.inscripcionService.get('inscripcion/' + this.inscripcion_id).subscribe(
      (response: any) => {
        this.enfasisSelected = response.EnfasisId ? response.EnfasisId : null;
      });
  }

  async loadData() {
    this.inscripcion = new Inscripcion();
    this.inscripcion.Id = parseInt(sessionStorage.getItem('IdInscripcion'), 10);
    this.inscripcion.ProgramaAcademicoId = sessionStorage.getItem('ProgramaAcademico');
    const IdPeriodo = parseInt(sessionStorage.getItem('IdPeriodo'), 10);
    const IdTipo = parseInt(sessionStorage.getItem('IdTipoInscripcion'), 10)
    const IdPrograma = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10)
    // Se carga el nombre del periodo al que se inscribió
    this.loadPeriodo(IdPeriodo);
    // Se carga el tipo de inscripción
    this.loadTipoInscripcion(IdTipo);
    // Se carga el nivel del proyecto
    this.loadNivel(IdPrograma);
  }

  loadProject() {
    this.loading = true;
    this.posgrados = new Array;
    const IdNivel = parseInt(sessionStorage.getItem('IdNivel'), 10);
    this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + IdNivel).subscribe(
      response => {
        const r = <any>response;
        this.loading = false;
        if (response !== null && response !== '{}' && r.Type !== 'error' && r.length !== 0) {
          const inscripcionP = <Array<any>>response;
          this.posgrados = inscripcionP;
          this.selectedValue = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10);
        } else {
          this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_inscripcion'));
        }
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadNivel(IdPrograma: number) {
    this.loading = true;
    this.programaService.get('proyecto_academico_institucion/?query=Id:' + IdPrograma).subscribe(
      (response: any) => {
        let IdNivel;
        if (response[0].NivelFormacionId.NivelFormacionPadreId !== null) {
          IdNivel = response[0].NivelFormacionId.NivelFormacionPadreId.Id;
          this.loading = false;
        } else {
          IdNivel = response[0].NivelFormacionId.Id;
          this.loading = false;
        }
        this.programaService.get('nivel_formacion/' + IdNivel).subscribe(
          (res: any) => {
            this.loading = false;
            this.inscripcion.Nivel = res.Nombre;
            this.inscripcion.IdNivel = res.Id;
            sessionStorage.setItem('IdNivel', res.Id)
            this.loadProject();
          },
          error => {
            this.loading = false;
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadTipoInscripcion(IdTipo: number) {
    this.loading = true;
    this.inscripcionService.get('tipo_inscripcion/' + IdTipo).subscribe(
      (response: any) => {
        this.loading = false;
        this.inscripcion.TipoInscripcion = response.Nombre;
        this.loading = false;
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadPeriodo(IdPeriodo: number) {
    this.loading = true;
    this.parametrosService.get('periodo/' + IdPeriodo).subscribe(
      (response: any) => {
        this.loading = false;
        this.inscripcion.PeriodoId = response.Data.Nombre;
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  create_inscription(data) {
    const info_inscripcion_temp = {
      Id: 0,
      PersonaId: this.info_persona_id || 4,
      ProgramaAcademicoId: this.selectedValue.Id || 0, // Cambiar por el periodo
      PeriodoId: this.periodo.Id,
      AceptaTerminos: true,
      FechaAceptaTerminos: new Date(),
      Activo: true,
      EstadoInscripcionId: {
        Id: 1,
      },
      TipoInscripcionId: this.tipo_inscripcion_selected,
    }
    this.loading = true;
    this.inscripcionService.post('inscripcion', info_inscripcion_temp)
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.inscripcion_id = r.Id;
          this.loading = false;
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('inscripcion.error_registrar_informacion'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  setPercentage_info(number, tab) {
    this.percentage_tab_info[tab] = (number * 100) / 2;
    this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
    this.setPercentage_total();
  }

  setPercentage_info_externo(number, tab) {
    this.percentage_tab_info[tab] = (number * 100) / 3;
    this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
    this.setPercentage_total();
  }

  setPercentage_acad(number, tab) {
    this.percentage_tab_acad[tab] = (number * 100) / 2;
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }

  setPercentage_acad_pre(number, tab) {
    this.percentage_tab_acad[tab] = (number * 100);
    if (!this.es_transferencia) {
      this.percentage_tab_acad[tab] = (number * 100) / 2;
    }
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }

  setPercentage_expe(number, tab) {
    this.percentage_tab_expe[tab] = (number * 100) / 1;
    this.percentage_expe = Math.round(UtilidadesService.getSumArray(this.percentage_tab_expe));
    this.setPercentage_total();
  }

  setPercentage_proy(number, tab) {
    this.percentage_tab_proy[tab] = (number * 100) / 1;
    this.percentage_proy = Math.round(UtilidadesService.getSumArray(this.percentage_tab_proy));
  }

  setPercentage_desc(number, tab) {
    this.percentage_tab_desc[tab] = (number * 100) / 1;
    this.percentage_desc = Math.round(UtilidadesService.getSumArray(this.percentage_tab_desc));
  }

  setPercentage_docu(number, tab) {
    this.percentage_tab_docu[tab] = (number * 100) / 1;
    this.percentage_docu = Math.round(UtilidadesService.getSumArray(this.percentage_tab_docu));
    this.setPercentage_total();
  }

  setPercentage_prod(number, tab) {
    this.percentage_tab_prod[tab] = (number * 100) / 1;
    this.percentage_prod = Math.round(UtilidadesService.getSumArray(this.percentage_tab_prod));
    this.percentage_prod = (this.percentage_prod * 100) / this.percentage_prod;
  }

  setPercentage_total() {
    this.percentage_total = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info)) / 4;  // Información básica
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad)) / 4; // Formación académica
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_docu)) / 4; // Documentos solicitados
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_expe)) / 4; // Experiencia laboral
    this.result.emit(this.percentage_total);
    if (sessionStorage.EstadoInscripcion) {
      if (this.percentage_total >= 100) {
        this.total = false;
      }
    }
    // if (this.info_inscripcion !== undefined) {
    //   if (this.info_inscripcion.EstadoInscripcionId.Id > 1) {
    //     this.percentage_total = 100;
    //   }
    //   if (this.percentage_total >= 100) {
    //     if (this.info_inscripcion.EstadoInscripcionId.Id === 1) {
    //       this.total = false;
    //     }
    //   }
    // }
  }

  loadPercentageInfoCaracteristica(factor: number) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('persona/consultar_complementarios/' + this.info_persona_id)
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Response.Code !== '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2));
            this.percentage_tab_info[1] = Number((100 / factor));
            this.loading = false;
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[1] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_info);
        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageInfoContacto(factor: number) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('inscripciones/info_complementaria_tercero/' + this.info_persona_id)
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Response.Code !== '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2));
            this.percentage_tab_info[2] = Number((100 / factor));
            this.loading = false;
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[2] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_info);
        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageInfoFamiliar(factor: number) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('persona/consultar_familiar/' + this.info_persona_id)
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Response.Code !== '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2)) + 0.01;
            this.percentage_tab_info[3] = Number((100 / factor));
            this.loading = false;
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[3] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_info);
        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageFormacionAcademica() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('formacion_academica?Id=' + this.info_persona_id)
        .subscribe(res => {
          if (res.Response.Code === '200') {
            this.percentage_acad = this.percentage_acad + 50;
            this.percentage_tab_acad[0] = 50;
            this.loading = false;
          } else {
            this.percentage_acad = this.percentage_acad + 0;
            this.percentage_tab_acad[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_acad)
        },
          error => {
            this.loading = false;
            reject(error)
          });
    });
  }

  loadPercentageFormacionAcademicaPregado(factor) {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('persona/consultar_formacion_pregrado/' + this.info_persona_id)
        .subscribe(res => {
          if (res.Status === '200') {
            this.percentage_acad = this.percentage_acad + (100 / factor);
            this.percentage_tab_acad[0] = (100 / factor);
            this.loading = false;
          } else {
            this.percentage_acad = this.percentage_acad + 0;
            this.percentage_tab_acad[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_acad)
        },
          error => {
            this.loading = false;
            reject(error)
          });
    });
  }
  loadPercentageIdiomas() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.idiomaService.get('conocimiento_idioma?query=TercerosId:' + this.info_persona_id + '&limit=0')
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            this.percentage_acad = this.percentage_acad + 50;
            this.percentage_tab_acad[1] = 50;
            this.loading = false;
          } else {
            this.percentage_acad = this.percentage_acad + 0;
            this.percentage_tab_acad[1] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_acad);
        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageExperienciaLaboral() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('experiencia_laboral/by_tercero?Id=' + this.info_persona_id)
        .subscribe((res: any) => {
          if (res.Data.Code === '200') {
            this.percentage_expe = 100;
            this.percentage_tab_expe[0] = 100;
            this.loading = false;
          } else {
            this.percentage_expe = 0;
            this.percentage_tab_expe[0] = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_expe);
        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageProduccionAcademica() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('produccion_academica/pr_academica/' + this.info_persona_id)
        .subscribe(res => {
          if (res.Response.Code === '200') {
            this.percentage_prod = 100;
            this.loading = false;
          } else {
            this.percentage_prod = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_prod);
        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
    this.loading = false;
  }

  loadPercentageDocumentos() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' +
        this.inscripcion.Id + ',DocumentoProgramaId.ProgramaId:' + parseInt(sessionStorage.ProgramaAcademicoId, 10) + ',DocumentoProgramaId.TipoInscripcionId:' + parseInt(sessionStorage.getItem('IdTipoInscripcion'), 10) + '&limit=0').subscribe(
          (res: any[]) => {
            if (res !== null && JSON.stringify(res[0]) !== '{}') {
              this.percentage_docu = 0;
              for (let i = 0; i < res.length; i++) {
                this.documentoService.get('documento/' + res[i].DocumentoId).subscribe(
                  response => {

                    if (response.Metadatos === '') {
                      this.percentage_docu += (1 / this.tipo_documentos.length * 100);
                    } else {
                      if (response.Metadatos !== '') {
                        if (JSON.parse(response.Metadatos).aprobado) {
                          this.percentage_docu += (1 / this.tipo_documentos.length * 100);
                        }
                      }
                    }
                    this.percentage_docu = Math.round(this.percentage_docu);

                    if (this.percentage_docu >= 98) {
                      this.percentage_docu = 100;
                    }

                    this.percentage_tab_docu[0] = this.percentage_docu;
                    this.loading = false;
                  })
              };
              resolve(this.percentage_docu);
            } else {
              this.percentage_docu = 0;
              this.percentage_tab_docu[0] = 0;
              this.loading = false;
              resolve(this.percentage_docu);
            }
          },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageDescuentos() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('descuento_academico/descuentopersonaperiododependencia?' + 'PersonaId=' +
        Number(window.localStorage.getItem('persona_id')) + '&DependenciaId=' +
        Number(window.sessionStorage.getItem('ProgramaAcademicoId')) + '&PeriodoId=' + Number(window.sessionStorage.getItem('IdPeriodo')))
        .subscribe((res: any) => {
          if (res.Data.Code === '200') {
            this.percentage_desc = 100;
            this.loading = false;
          } else {
            this.percentage_desc = 0;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_desc)
        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  loadPercentageTrabajoDeGrado() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('propuesta?query=Activo:true,InscripcionId:' +
        Number(window.sessionStorage.getItem('IdInscripcion'))).subscribe((res: any) => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            this.percentage_proy = 100;
            this.loading = false;
          }
          this.loading = false;
          resolve(this.percentage_proy)

        },
          error => {
            this.loading = false;
            reject(error);
          });
    });
  }

  public loadLists() {
    this.inscripcionService.get('documento_programa?query=Activo:true,ProgramaId:' + parseInt(sessionStorage.ProgramaAcademicoId, 10) + ',TipoInscripcionId:' + parseInt(sessionStorage.getItem('IdTipoInscripcion'), 10) + '&limit=0').subscribe(
      response => {
        this.tipo_documentos = <any[]>response;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  async ngOnInit() {
    await this.loadLists();

    // Consulta si hay información en el tab de información personal
    if (this.percentage_info === 0) {
      if (this.selectTipo === 'Transferencia externa' || this.nivel == 'Pregrado') {
        await this.loadPercentageInfoCaracteristica(3);
        await this.loadPercentageInfoContacto(3);
        await this.loadPercentageInfoFamiliar(3);
      } else {
        await this.loadPercentageInfoCaracteristica(2);
        await this.loadPercentageInfoContacto(2);
      }
    }

    // Consulta si hay información en formación académica
    if (this.percentage_acad === 0) {
      if (this.nivel == 'Pregrado') {
        let factor = 1
        if (this.selectTipo != 'Transferencia interna' && this.selectTipo != 'Reingreso' && this.selectTipo != 'Transferencia externa') {
          let factor = 2
          ////////////////////////////////////////////////////////////////////////////////
          ////// TO DO: Preguntas de ingreso a al univerisdad en inscripción normal //////
          ////////////////////////////////////////////////////////////////////////////////
        }
        await this.loadPercentageFormacionAcademicaPregado(factor);
      } else {
        await this.loadPercentageFormacionAcademica();
        await this.loadPercentageIdiomas();
      }
    }

    // Consulta si hay información en experiencia laboral
    if (this.percentage_expe === 0) {
      await this.loadPercentageExperienciaLaboral();
    }

    // Consulta si hay información en produccion academica
    if (this.percentage_prod === 0) {
      await this.loadPercentageProduccionAcademica();
    }

    // Consulta si hay información en documentos solicitados
    if (this.percentage_docu === 0) {
      await this.loadPercentageDocumentos();
    }

    // Consulta si hay información en descuento
    if (this.percentage_desc === 0) {
      await this.loadPercentageDescuentos();
    }

    // Consulta si hay información en propuesta trabajo de grado
    if (this.percentage_proy === 0) {
      await this.loadPercentageTrabajoDeGrado();
    }

    this.setPercentage_total();
  }

  realizarInscripcion() {
    if(this.Campo1Control.status == "VALID" && this.enfasisControl.status == "VALID") {
      
      this.loading = true;
      this.inscripcionService.get('inscripcion/' + parseInt(sessionStorage.IdInscripcion, 10)).subscribe(
        (response: any) => {
          const inscripcionPut: any = response;
          inscripcionPut.ProgramaAcademicoId = parseInt(sessionStorage.ProgramaAcademicoId, 10);
          
          if (this.tieneEnfasis) {
            if (this.enfasisSelected) {
              inscripcionPut.EnfasisId = parseInt(this.enfasisSelected, 10);
            } else {
              inscripcionPut.EnfasisId = parseInt(this.enfasisControl.value,10);
            }
          }

          this.loading = true;
          this.inscripcionService.get('estado_inscripcion?query=Nombre:INSCRITO').subscribe(
            (response: any) => {
              this.loading = false;
              const estadoInscripcio: any = response[0];
              inscripcionPut.EstadoInscripcionId = estadoInscripcio;

              this.loading = true;
              this.inscripcionService.put('inscripcion/', inscripcionPut)
                .subscribe(res_ins => {
                  this.loading = false;
                  const r_ins = <any>res_ins;
                  if (res_ins !== null && r_ins.Type !== 'error') {
                    this.loading = false;
                    this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
                    this.imprimir = true;
                    this.perfil_editar('perfil');
                  }
                },
                  (error: any) => {
                    this.loading = false;
                    if (error.System.Message.includes('duplicate')) {
                      Swal.fire({
                        icon: 'info',
                        text: this.translate.instant('inscripcion.error_update_programa_seleccionado'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

                      });
                    } else {
                      this.loading = false;
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                          this.translate.instant('GLOBAL.admision'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    }
                  });
            },
            error => {
              this.loading = false;
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            },
          );
        },
        error => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    } else {
      this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'),this.translate.instant('enfasis.select_enfasis'));
      this.enfasisControl.markAsTouched();
    }
    
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event): void {
    this.ocultarBarra.emit(true);
    switch (event) {
      case 'info_contacto':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_expe = false;
        this.info_contacto = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_prod = false;
        break;
      case 'info_caracteristica':
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = true;
        this.info_persona = false;
        this.show_proy = false;
        this.show_docu = false;
        this.show_desc = false;
        this.show_prod = false;
        this.showRegreso = false;
        break;
      case 'info_persona':
        if (this.selectTipo === 'Pregrado') {
          this.viewtag = 'Informacion_pregrado'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Posgrado') {
          this.viewtag = 'Informacion_posgrado'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Transferencia interna' || this.selectTipo === 'Reingreso') {
          if (this.nivel === 'Pregrado') {
            this.viewtag = 'Informacion_pregrado'
            this.selecttabview(this.viewtag);
          }
          if (this.nivel === 'Posgrado') {
            this.viewtag = 'Informacion_posgrado'
            this.selecttabview(this.viewtag);
          }
        }
        if (this.inscripcion.TipoInscripcion === 'Transferencia externa') {
          this.viewtag = 'Informacion_externa'
          this.selecttabview(this.viewtag);
        }
        break;
      case 'info_familiar':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_familiar = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_prod = false;
        break;
      case 'experiencia_laboral':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_acad = false;
        this.show_docu = false;
        this.show_expe = true;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_prod = false;
        break;
      case 'formacion_academica':
        if (this.selectTipo === 'Pregrado') {
          this.viewtag = 'Formacion_pregrago'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Posgrado') {
          this.viewtag = 'Formacion_posgrago'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Transferencia interna' || this.selectTipo === 'Reingreso' || this.selectTipo === 'Transferencia externa') {
          if (this.nivel === 'Pregrado') {
            this.viewtag = 'Formacion_pregrago'
            this.selecttabview(this.viewtag);
          }
          if (this.nivel === 'Posgrado') {
            this.viewtag = 'Formacion_posgrago'
            this.selecttabview(this.viewtag);
          }
        }
        break;
      case 'produccion_academica':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_expe = false;
        this.show_docu = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_proy = false;
        this.show_prod = true;
        break;
      case 'documento_programa':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.show_docu = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case 'descuento_matricula':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.show_docu = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = true;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case 'propuesta_grado':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_docu = false;
        this.show_acad = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_proy = true;
        this.info_persona = false;
        this.show_desc = false;
        this.show_prod = false;
        break;
      case 'perfil':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = true;
        this.show_acad = false;
        this.info_contacto = false;
        this.show_docu = false;
        this.info_caracteristica = false;
        this.show_desc = false;
        this.show_expe = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        break;
      default:
        this.show_info = false;
        this.show_docu = false;
        this.show_profile = false;
        this.show_acad = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_desc = false;
        this.show_expe = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        this.imprimir = false;
        this.showRegreso = true;
        break;
    }
  }

  selecttabview(viewtag) {
    switch (viewtag) {
      case ('Informacion_pregrado'):
        this.showRegreso = false;
        this.show_info_pregrado = true;
        this.show_profile = false;
        this.show_acad_pregrado = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Formacion_pregrago'):
        this.showRegreso = false;
        this.show_info_pregrado = false;
        this.show_profile = false;
        this.show_acad_pregrado = true;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Informacion_posgrado'):
        this.showRegreso = false;
        this.show_info = true;
        this.show_profile = false;
        this.show_acad = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Formacion_posgrago'):
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = true;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Informacion_externa'):
        this.showRegreso = false;
        this.show_info_externa = true;
        this.show_profile = false;
        this.show_acad_pregrado = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
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

  ngOnChanges() {
  }

  tipo_inscripcion() {
    if (this.inscripcion.IdNivel === 1) {
      this.selectedTipo = 'Pregrado'
    } else {
      this.selectedTipo = 'Posgrado'
    }
    if (this.selectedValue !== undefined) {
      sessionStorage.setItem('ProgramaAcademicoId', this.selectedValue);
      this.programaService.get('proyecto_academico_enfasis/?query=ProyectoAcademicoInstitucionId.Id:' + this.selectedValue)
        .subscribe((enfasis: any) => {
          this.enfasis = enfasis.map((e) => (e.EnfasisId));
          this.tieneEnfasis = this.enfasis.length > 0;
        })
    } else {
      this.tieneEnfasis = false;
      this.enfasis = [];
    }
    switch (this.selectedTipo) {
      case ('Pregrado'):
        this.selectTipo = 'Pregrado';
        this.selectprograma = true;
        break;
      case ('Posgrado'):
        this.selectTipo = 'Posgrado';
        this.selectprograma = true;
        break;
      case ('Transferencia interna'):
        this.selectprograma = false;
        this.selectTipo = 'Transferencia interna';
        break;
      case ('Reingreso'):
        this.selectprograma = false;
        this.selectTipo = 'Reingreso';
        break;
      case ('Transferencia externa'):
        this.selectprograma = true;
        this.selectTipo = 'Transferencia externa';
        break;
      case ('Profesionalización tecnólogos'):
        this.selectTipo = 'Pregrado';
        this.selectprograma = true;
        break;
      case ('Ciclos propedéuticos'):
        this.selectTipo = 'Pregrado';
        this.selectprograma = true;
        break;
      case ('Movilidad Académica'):
        this.selectTipo = 'Pregrado';
        this.selectprograma = true;
        break;
    }


  }

  mostrarBarraExterna() {
    this.ocultarBarra.emit(false);
  }
}
