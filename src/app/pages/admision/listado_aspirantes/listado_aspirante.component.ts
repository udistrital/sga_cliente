import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { OikosService } from '../../../@core/data/oikos.service';
import { CoreService } from '../../../@core/data/core.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FormControl, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { EvaluacionInscripcionService } from '../../../@core/data/evaluacion_inscripcion.service';
import { AnyService } from '../../../@core/data/any.service';
import { environment } from '../../../../environments/environment';
import * as _ from 'lodash';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-listado-aspirante',
  templateUrl: './listado_aspirante.component.html',
  styleUrls: ['./listado_aspirante.component.scss'],
})
export class ListadoAspiranteComponent implements OnInit, OnChanges {

  config: ToasterConfig;
  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  inscritos: any = [];
  admitidos: any[];
  datos_persona: any;
  inscripcion: Inscripcion;
  preinscripcion: boolean;
  step = 0;
  cambioTab = 0;
  nForms: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;
  infoActulizacion: any;


  proyectos = [];
  periodos = [];

  loading: boolean;
  programa_seleccionado: any;
  selectedValue: any;
  selectedTipo: any;
  proyectos_selected: any;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  periodo: any;
  selectednivel: any;
  buttoncambio: boolean = true;
  info_consultar_aspirantes: any;
  settings_emphasys: any;
  arr_cupos: any[] = [];
  source_emphasys: LocalDataSource = new LocalDataSource();
  show_listado = false;
  niveles: NivelFormacion[];
  Aspirantes = [];
  cuposProyecto: number;
  estadoAdmitido = null;
  estados = [];

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  cuposAsignados: number = 0;
  constructor(
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private oikosService: OikosService,
    private coreService: CoreService,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService,
    private tercerosService: TercerosService,
    private toasterService: ToasterService,
    private anyService: AnyService,
    private evaluacionService: EvaluacionInscripcionService) {


    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {

    });
    this.cargarPeriodo();
    this.nivel_load();
    this.show_listado = false;
    this.inscripcionService.get('estado_inscripcion')
      .subscribe((state) => {
        this.estados = state.map((e) => {
          if (e.Nombre === 'ADMITIDO') {
            this.estadoAdmitido = e;
          }
          return {
            value: e.Id,
            title: e.Nombre
          }
        })
        console.log(this.estados);
        this.createTable()
      })
  }

  createTable() {
    this.settings_emphasys = {
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      actions: {
        delete: false,
        edit: true,
        add: false,
        position: 'right',
      },
      mode: 'internal',
      columns: {
        // TipoDocumento: {
        //   title: this.translate.instant('GLOBAL.Tipo'),
        //   // type: 'string;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        //   width: '2%',
        // },
        NumeroDocumento: {
          editable: false,
          title: this.translate.instant('GLOBAL.Documento'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '10%',
        },
        NombreAspirante: {
          editable: false,
          title: this.translate.instant('GLOBAL.Nombre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '50%',
        },
        NotaFinal: {
          editable: false,
          title: this.translate.instant('GLOBAL.Puntaje'),
          sort: true,
          sortDirection: 'desc',
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '5%',
        },
        TipoInscripcionId: {
          editable: false,
          title: this.translate.instant('GLOBAL.TipoInscripcion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          width: '25%',
        },
        EstadoInscripcionId: {
          title: this.translate.instant('GLOBAL.Estado'),
          valuePrepareFunction: (cell, row, test) => {
            var t = test.column.editor.config.list.find(x => x.value === cell.Id)
            if (t)
              return t.title
          },
          filter: false,
          width: '250px',
          type: 'html',
          editor: {
            type: 'list',
            config: {
              list: this.estados
            },
          }
        },
      },
      edit: {
        confirmSave: true,
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('experiencia_laboral.tooltip_editar') + '"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
    };
  }


  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = <any>res['Data'][0];
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

  cargarCantidadCupos() {
    this.evaluacionService.get('cupos_por_dependencia/?query=DependenciaId:' + Number(this.proyectos_selected.Id) + '&limit=0').subscribe(
      (response: any) => {
        if (response !== null && response !== undefined && response[0].Id !== undefined) {
          this.cuposProyecto = response[0].CuposHabilitados;
        } else {
          this.cuposProyecto = 0;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }



  activar_button() {
    this.buttoncambio = false;
    this.cargarCantidadCupos();
    this.mostrartabla();
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

  onSaveConfirm(event) {
    const newState = this.estados.filter((data) => (data.value === parseInt(event.newData.EstadoInscripcionId, 10)))[0];
    Swal.fire({
      title: this.translate.instant('GLOBAL.' + 'confirmar_actualizar'),
      text: newState.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.' + 'actualizar')
    }).then((result) => {
      if (result.value) {
        const updateState = {
          ...event.newData.Inscripcion,
          ...{ EstadoInscripcionId: { Id: newState.value } }
        }
        this.inscripcionService.put('inscripcion', updateState)
          .subscribe((response) => {
            console.log(response);
            Swal.fire(
              this.translate.instant('GLOBAL.' + 'operacion_exitosa'),
              '',
              'success'
            )
            this.mostrartabla()
            event.confirm.resolve(event.newData);
          })

      } else {
        event.confirm.reject();
      }
    });
  }

  loadProyectos() {
    this.show_listado = false;
    this.selectprograma = false;
    this.proyectos = [];
    if (this.selectednivel !== NaN && this.selectednivel !== undefined) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {
          this.proyectos = <any[]>response.filter(
            proyecto => this.filtrarProyecto(proyecto),
          );
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  // mostrartabla() {
  //   this.show_listado = true

  //   this.info_consultar_aspirantes = {
  //     Id_proyecto: Number(this.proyectos_selected['Id']),
  //     Id_periodo: Number(this.periodo['Id']),
  //   }
  //         this.sgamidService.post('admision/consulta_aspirantes', this.info_consultar_aspirantes)
  //           .subscribe(res => {
  //             const r = <any>res
  //             if (r !== null && r.Type !== 'error') {
  //               this.loading = false;
  //               r.sort((puntaje_mayor, puntaje_menor ) =>  puntaje_menor.NotaFinal - puntaje_mayor.NotaFinal )
  //                const data = <Array<any>>r;
  //                this.source_emphasys.load(data);

  //             } else {
  //               this.showToast('error', this.translate.instant('GLOBAL.error'),
  //                 this.translate.instant('GLOBAL.error'));
  //             }
  //           },
  //             (error: HttpErrorResponse) => {
  //               Swal.fire({
  //                 icon:'error',
  //                 title: error.status + '',
  //                 text: this.translate.instant('ERROR.' + error.status),
  //                 footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                   this.translate.instant('GLOBAL.info_estado'),
  //                 confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //               });
  //             });
  // }

  mostrartabla() {
    this.show_listado = true
    this.source_emphasys = new LocalDataSource();
    this.Aspirantes = [];
    this.inscritos = [];
    this.admitidos = [];

    this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + this.proyectos_selected.Id + ',PeriodoId:' + this.periodo.Id + '&sortby=NotaFinal&order=desc').subscribe(
      (res: any) => {
        const r = <any>res
        if (res !== '[{}]') {
          if (r !== null && r.Type !== 'error') {
            this.loading = false;
            const data = <Array<any>>r;
            this.admitidos = data.filter((inscripcion) => (inscripcion.EstadoInscripcionId.Nombre === 'ADMITIDO'));
            this.inscritos = data.filter((inscripcion) => (inscripcion.EstadoInscripcionId.Nombre === 'INSCRITO'));
            console.log(data)
            this.cuposAsignados = this.admitidos.length;
            // this.source_emphasys.load(data);
            data.forEach(element => {
              if (element.PersonaId != undefined) {
                this.tercerosService.get('tercero/' + element.PersonaId).subscribe(
                  (res: any) => {
                    let aspiranteAux = {
                      Inscripcion: element,
                      NumeroDocumento: res.Id,
                      NombreAspirante: res.NombreCompleto,
                      NotaFinal: element.NotaFinal,
                      TipoInscripcionId: element.TipoInscripcionId,
                      EstadoInscripcionId: element.EstadoInscripcionId,
                    }
                    this.Aspirantes.push(aspiranteAux);
                    this.source_emphasys.load(this.Aspirantes);
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
                  },
                );
              }
            });

          } else {
            this.showToast('error', this.translate.instant('GLOBAL.error'),
              this.translate.instant('GLOBAL.error'));
          }
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('admision.no_data'));
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
            this.translate.instant('GLOBAL.info_estado'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }


  ngOnInit() {

  }

  ngOnChanges() {

  }

  admitir(inscrito) {
    const promiseInscrito = new Promise((resolve, reject) => {
      this.inscripcionService.put('inscripcion', inscrito)
        .subscribe((response) => {
          resolve(response);
        })
    });
    return promiseInscrito;
  }

  async admitirInscritos() {
    const cuposTotales = Math.abs(this.cuposProyecto - this.admitidos.length);
    const numero_inscritos = this.inscritos.length < cuposTotales ? this.inscritos.length : cuposTotales;
    const inscritosOrdenados = _.orderBy(this.inscritos, [(i: any) => (i.NotaFinal)], ['desc']);
    console.log('inscritos ordenados', inscritosOrdenados);

    Swal.fire({
      title: `${this.translate.instant('GLOBAL.admitir')} ${numero_inscritos} ${this.translate.instant('GLOBAL.aspirantes_inscritos')}`,
      html: `${this.translate.instant('GLOBAL.se_admitiran')} ${numero_inscritos} ${this.translate.instant('GLOBAL.aspirantes_inscritos')}`,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      confirmButtonText: this.translate.instant('GLOBAL.admitir')
    })
      .then(async (result) => {
        if (result.value) {
          Swal.fire({
            title: `${this.translate.instant('GLOBAL.admitiendo_aspirantes')} ...`,
            html: `<b></b> de ${numero_inscritos} ${this.translate.instant('GLOBAL.aspirantes_admitidos')}`,
            timerProgressBar: true,
            onBeforeOpen: () => {
              Swal.showLoading()
            }
          });
          for (let i = 0; i < numero_inscritos; i++) {
            const updateState = {
              ...inscritosOrdenados[i],
              ...{ EstadoInscripcionId: { Id: this.estadoAdmitido.Id } }
            }
            const content = Swal.getContent();
            if (content) {
              const b = content.querySelector('b')
              if (b) {
                b.textContent = i + 1 + '';
              }
            }
            console.log('inscritos ordenados', inscritosOrdenados);

            await this.admitir(updateState);
            if ((i + 1) === numero_inscritos) {
              Swal.close();
              Swal.fire({
                title: this.translate.instant('GLOBAL.proceso_admision_exitoso'),
                text: `${this.translate.instant('GLOBAL.se_admitieron')}  ${numero_inscritos} ${this.translate.instant('GLOBAL.aspirantes_correctamente')} `,
                icon: 'success'
              })
              this.mostrartabla();
            }
          }

        }
      })
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
