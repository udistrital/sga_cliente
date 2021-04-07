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
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import Swal from 'sweetalert2';
import { SgaMidService } from '../../../@core/data/sga_mid.service';

import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-inscripcion_general',
  templateUrl: './inscripcion_general.component.html',
  styleUrls: ['./inscripcion_general.component.scss'],
})
export class InscripcionGeneralComponent implements OnInit, OnChanges {
  toasterService: any;

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
  cambioTab = 0;
  nForms: number;
  SelectedTipoBool: boolean = true;
  Campo1Control = new FormControl('', [Validators.required]);

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
  show_info_interna = false;
  show_info_externa = false;
  show_info_reingreso = false;
  show_info = false;
  show_profile = false;
  show_acad_pregrado = false;
  show_acad_externa = false;
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
  tag_view_posg: boolean;
  tag_view_pre: boolean;
  selectprograma: boolean = true;
  periodo: any;
  imprimir: boolean = false;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private idiomaService: IdiomaService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private programaService: ProyectoAcademicoService,
    private sgaMidService: SgaMidService,
  ) {
    sessionStorage.setItem('TerceroId', this.userService.getPersonaId().toString());
    this.info_persona_id = this.userService.getPersonaId();
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.total = true;
    this.loading = true;
    this.loadData();
  }

  activateTab() {
    //No se muestra la vista de inscripción sino la de preinscripción
    this.changeTab.emit(false);
  }

  async loadData() {
    this.inscripcion = new Inscripcion();
    this.inscripcion.Id = parseInt(sessionStorage.getItem('IdInscripcion'));
    this.inscripcion.ProgramaAcademicoId = sessionStorage.getItem('ProgramaAcademico');
    const IdPeriodo = parseInt(sessionStorage.getItem('IdPeriodo'));
    const IdTipo = parseInt(sessionStorage.getItem('IdTipoInscripcion'))
    const IdPrograma = parseInt(sessionStorage.getItem('ProgramaAcademicoId'))
    //Se carga el nombre del periodo al que se inscribió
    this.loadPeriodo(IdPeriodo);
    //Se carga el tipo de inscripción
    this.loadTipoInscripcion(IdTipo);
    //Se carga el nivel del proyecto
    this.loadNivel(IdPrograma);
  }

  loadProject() {
    this.loading = true;
    this.posgrados = new Array;
    const IdNivel = parseInt(sessionStorage.getItem('IdNivel'));
    this.loading = true;
    this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + IdNivel).subscribe(
      response => {
        const r = <any>response;
        this.loading = false;
        if (response !== null && response !== "{}" && r.Type !== 'error' && r.length != 0) {
          const inscripcionP = <Array<any>>response;
          this.posgrados = inscripcionP;
          this.selectedValue = parseInt(sessionStorage.getItem('ProgramaAcademicoId'));
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
    this.programaService.get('proyecto_academico_institucion/' + IdPrograma).subscribe(
      (response: any) => {
        const IdNivel = response.NivelFormacionId.Id;
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
          }
        );
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  loadTipoInscripcion(IdTipo: number) {
    this.loading = true;
    this.inscripcionService.get('tipo_inscripcion/' + IdTipo).subscribe(
      (response: any) => {
        this.loading = false;
        this.inscripcion.TipoInscripcion = response.Nombre;
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
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
      }
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
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal({
            type: 'error',
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

  setPercentage_acad(number, tab) {
    this.percentage_tab_acad[tab] = (number * 100) / 2;
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
    this.percentage_total = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info)) / 4;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad)) / 4;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_docu)) / 4;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_expe)) / 4;
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

  loadPercentageInfoCaracteristica(){
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('persona/consultar_complementarios/' + this.info_persona_id)
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            this.percentage_info = this.percentage_info + 50;
            this.percentage_tab_info[0] = 50;
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[0] = 0;
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

  loadPercentageInfoContacto(){
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('inscripciones/info_complementaria_tercero/'+this.info_persona_id)
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            this.percentage_info = this.percentage_info + 50;
            this.percentage_tab_info[1] = 50;
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[1] = 0;
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

  loadPercentageFormacionAcademica(){
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('formacion_academica?Id=' + this.info_persona_id)
        .subscribe(res => {
          if (res.Response.Code === "200"){
            this.percentage_acad = this.percentage_acad + 50;
            this.percentage_tab_acad[0] = 50;
          } else {
            this.percentage_acad = this.percentage_acad + 0;
            this.percentage_tab_acad[0] = 0;
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

  loadPercentageIdiomas(){
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.idiomaService.get('conocimiento_idioma?query=TercerosId:' + this.info_persona_id +'&limit=0')
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            this.percentage_acad = this.percentage_acad + 50;
            this.percentage_tab_acad[1] = 50;
          } else {
            this.percentage_acad = this.percentage_acad + 0;
            this.percentage_tab_acad[1] = 0;
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

  loadPercentageExperienciaLaboral(){
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('experiencia_laboral/by_tercero?Id=' + this.info_persona_id)
        .subscribe((res: any) => {
          if(res.Data.Code === "200"){
            this.percentage_expe = 100;
            this.percentage_tab_expe[1] = 100;
          } else {
            this.percentage_expe = 0;
            this.percentage_tab_expe[1] = 0;
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

  loadPercentageProduccionAcademica(){
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('produccion_academica/pr_academica/' + this.info_persona_id)
        .subscribe(res => {
          if(res.Response.Code === "200"){
            this.percentage_prod = 100;
          } else {
            this.percentage_prod = 0;            
          }
          this.loading = false;
          resolve(this.percentage_prod);
        },
        error => {
          this.loading = false;
          reject(error);
        });
    });
  }

  loadPercentageDocumentos(){
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' + this.inscripcion.Id + ',DocumentoProgramaId.ProgramaId:' + parseInt(sessionStorage.ProgramaAcademicoId)).subscribe(
        (res: any[]) => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            this.percentage_docu = 100;
            this.percentage_tab_docu[1] = 100;
          } else {
            this.percentage_docu = 0;
            this.percentage_tab_docu[1] = 0;
          } 
          this.loading = false;
          resolve(this.percentage_docu);
        },
        error => {
          this.loading = false;
          reject(error);
        });
    });
  }

  loadPercentageDescuentos(){
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('descuento_academico/descuentopersonaperiododependencia?' + 'PersonaId='+Number(window.localStorage.getItem('persona_id'))+'&DependenciaId='+Number(window.sessionStorage.getItem('ProgramaAcademicoId'))+'&PeriodoId='+Number(window.sessionStorage.getItem('IdPeriodo')))
        .subscribe((res: any) => {
          if(res.Data.Code === "200"){
            this.percentage_desc = 100;
          } else {
            this.percentage_desc = 0;
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

  async ngOnInit() {
    
    // Consulta si hay información en el tab de información personal
    if (this.percentage_info === 0){ 
      await this.loadPercentageInfoCaracteristica();
      await this.loadPercentageInfoContacto();
    }

    //Consulta si hay información en formación académica
    if(this.percentage_acad === 0){
      await this.loadPercentageFormacionAcademica();      
      await this.loadPercentageIdiomas();
    }

    //Consulta si hay información en experiencia laboral
    if(this.percentage_expe === 0){
      await this.loadPercentageExperienciaLaboral();
    }

    //Consulta si hay información en produccion academica
    if(this.percentage_prod === 0){
      await this.loadPercentageProduccionAcademica();
    }

    //Consulta si hay información en documentos solicitados
    if(this.percentage_docu === 0){
      await this.loadPercentageDocumentos();
    }

    //Consulta si hay información en descuento
    if(this.percentage_desc === 0){
      await this.loadPercentageDescuentos();
    }

    //Consulta si hay información en propuesta trabajo de grado
    if(this.percentage_proy === 0){
      //Pendiente
    }
    
    this.setPercentage_total();
  }

  realizarInscripcion() {
    this.loading = true;
    this.inscripcionService.get('inscripcion/' + parseInt(sessionStorage.IdInscripcion)).subscribe(
      (response: any) => {
        this.loading = false;
        const inscripcionPut: any = response;
        inscripcionPut.ProgramaAcademicoId = parseInt(sessionStorage.ProgramaAcademicoId);

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
                  Swal({
                    type: 'info',
                    text: this.translate.instant('inscripcion.error_update_programa_seleccionado'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

                  });
                } else {
                  this.loading = false;
                  Swal({
                    type: 'error',
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
          }
        );
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );

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
        // const ENTE = this.userService.getEnte();
        // if (ENTE !== 0 && ENTE !== undefined && ENTE.toString() !== '' && ENTE.toString() !== 'NaN' && this.info_ente_id === undefined) {
        //   this.info_ente_id = <number>ENTE;
        //   this.inscripcionService.get('inscripcion/?query=PersonaId:' + this.info_ente_id)
        //     .subscribe(inscripcion => {
        //       this.info_inscripcion = <any>inscripcion[0];
        //       if (inscripcion !== null && this.info_inscripcion.Type !== 'error') {
        //         this.inscripcion_id = this.info_inscripcion.Id;
        //         // this.getInfoInscripcion();
        //       }
        //     },
        //       (error: HttpErrorResponse) => {
        //         Swal({
        //           type: 'error',
        //           title: error.status + '',
        //           text: this.translate.instant('ERROR.' + error.status),
        //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
        //             this.translate.instant('GLOBAL.admision'),
        //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        //         });
        //       });
        // }
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
        if (this.selectTipo === 'Transferencia interna') {
          this.viewtag = 'Informacion_trasnferencia_interna'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Reingreso') {
          this.viewtag = 'Informacion_reingreso'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Transferencia externa') {
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
        if (this.selectTipo === 'Transferencia externa') {
          this.viewtag = 'Formacion_externa'
          this.showRegreso = false;
          this.selecttabview(this.viewtag);
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
      case ('Informacion_trasnferencia_interna'):
        this.showRegreso = false;
        this.show_info_interna = true;
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
      case ('Informacion_reingreso'):
        this.showRegreso = false;
        this.show_info_reingreso = true;
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
      case ('Formacion_externa'):
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad_externa = true;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
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
    if (this.selectedValue != undefined) {
      sessionStorage.setItem('ProgramaAcademicoId', this.selectedValue);
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
