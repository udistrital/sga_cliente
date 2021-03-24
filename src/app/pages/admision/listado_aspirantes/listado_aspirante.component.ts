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

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
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
    private evaluacionService: EvaluacionInscripcionService,) {
    this.settings_emphasys = {
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      actions: {
        delete: false,
        edit: false,
        add: false,
        position: 'right',
      },
      mode: 'external',
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
          title: this.translate.instant('GLOBAL.Documento'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '10%',
        },
        NombreAspirante: {
          title: this.translate.instant('GLOBAL.Nombre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '50%',
        },
        NotaFinal: {
          title: this.translate.instant('GLOBAL.Puntaje'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '5%',
        },
        TipoInscripcionId: {
          title: this.translate.instant('GLOBAL.TipoInscripcion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          width: '25%',
        },
        EstadoInscripcionId: {
          title: this.translate.instant('GLOBAL.Estado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          width: '10%',
        },
      },
    };

    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.cargarPeriodo();
    this.nivel_load();
    this.show_listado = false;
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
        this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null && nivel.Nombre == 'Posgrado')
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
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

  loadProyectos() {
    this.show_listado = false;
    this.selectprograma = false;
    this.proyectos = [];
    if (this.selectednivel !== NaN && this.selectednivel !== undefined) {
      this.projectService.get('proyecto_academico_institucion?query=NivelFormacionId:' + Number(this.selectednivel) + '&limit=0').subscribe(
        (response: any) => {
          if (response !== null || response !== undefined) {
            this.proyectos = <any>response;
          }
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
  //               Swal({
  //                 type: 'error',
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

    this.inscripcionService.get('inscripcion?query=EstadoInscripcionId__Id:2,ProgramaAcademicoId:' + this.proyectos_selected.Id + ',PeriodoId:' + this.periodo.Id + '&sortby=Id&order=asc').subscribe(
      (res: any) => {
        const r = <any>res
        if (res !== '[{}]') {
          if (r !== null && r.Type !== 'error') {
            this.loading = false;
            r.sort((puntaje_mayor, puntaje_menor) => puntaje_menor.NotaFinal - puntaje_mayor.NotaFinal)
            const data = <Array<any>>r;
            // this.source_emphasys.load(data);
            data.forEach(element => {
              if (element.PersonaId != undefined) {
                this.tercerosService.get('tercero/' + element.PersonaId).subscribe(
                  (res: any) => {
                    var aspiranteAux = {
                      NumeroDocumento: res.Id,
                      NombreAspirante: res.NombreCompleto,
                      NotaFinal: element.NotaFinal,
                      TipoInscripcionId: element.TipoInscripcionId,
                      EstadoInscripcionId: element.EstadoInscripcionId
                    }
                    this.Aspirantes.push(aspiranteAux);
                    this.source_emphasys.load(this.Aspirantes);
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));

                  }
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
        Swal({
          type: 'error',
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
