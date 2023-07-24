import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { FORM_PLAN_ESTUDIO } from './form-plan_estudio';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FormParams } from '../../../@core/data/models/define-form-fields';
import { FormGroup } from '@angular/forms';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { LocalDataSource } from 'ng2-smart-table';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { ACTIONS, MODALS, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { animate, style, transition, trigger } from '@angular/animations';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PlanEstudiosService } from '../../../@core/data/plan_estudios.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatStepper } from '@angular/material';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { PlanEstudio } from '../../../@core/data/models/plan_estudios/plan_estudio';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'creacion-plan-estudios',
  templateUrl: './creacion-plan-estudios.component.html',
  styleUrls: ['./creacion-plan-estudios.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(150%)' }))
      ])
    ])
  ]
})
export class CreacionPlanEstudiosComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  planEstudioBody: any;
  formPlanEstudio: FormParams;
  formGroupPlanEstudio: FormGroup;

  tbPlanesEstudio: Object;
  planesEstudio: any[];
  dataPlanesEstudio: LocalDataSource;

  tbEspaciosAcademicos: Object;
  dataEspaciosAcademicos: LocalDataSource;

  tbSemestre: Object;
  dataSemestre: LocalDataSource[];

  tbSemestreTotal: Object;
  dataSemestreTotal: LocalDataSource[];
  dataSemestreTotalTotal: LocalDataSource;

  niveles: any[];
  proyectos: any[];

  desactivarAgregarSemestre: boolean = false;

  proyecto_id: number;
  ListEspacios: any[] = [];
  readonly formatototal = {
    nombre: "TOTAL",
    creditos: 0,
    htd: 0,
    htc: 0,
    hta: 0,
    OB: 0,
    OC: 0,
    EI: 0,
    EE: 0,
    CP: 0,
    ENFQ_TEO: 0,
    ENFQ_PRAC: 0,
    ENFQ_TEOPRAC: 0, 
  }

  readonly ACTIONS = ACTIONS;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
    private sgaMidService: SgaMidService,
    private domSanitizer: DomSanitizer,
    private planEstudiosService: PlanEstudiosService,
    private gestorDocumentalService: NewNuxeoService
  ) {
    this.dataPlanesEstudio = new LocalDataSource();
    this.dataEspaciosAcademicos = new LocalDataSource();
    this.dataSemestre = [];
    this.dataSemestreTotal = [];
    this.dataSemestreTotalTotal = new LocalDataSource();
    this.translate.onLangChange.subscribe(() => {
      this.createTablePlanesEstudio();
      this.createTableEspaciosAcademicos();
      this.createTableSemestre();
      this.createTableSemestreTotal();
    })
  }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.loadSelects();
    this.createTablePlanesEstudio();
    this.gestorDocumentalService.clearLocalFiles();
  }

  crearFormulario() {
    this.formPlanEstudio = <FormParams>(UtilidadesService.hardCopy(FORM_PLAN_ESTUDIO));
    this.formPlanEstudio.nivel.opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId == undefined);
  }

  // * ----------
  // * Crear tabla de lista planes estudio
  //#region
  createTablePlanesEstudio() {
    this.tbPlanesEstudio = {
      columns: {
        plan_estudio: {
          title: this.translate.instant('plan_estudios.plan_estudios'),
          editable: false,
          width: '25%',
          filter: true,
        },
        proyectoCurricular: {
          title: this.translate.instant('inscripcion.proyecto_curricular'),
          editable: false,
          width: '15%',
          filter: true,
        },
        resolucion: {
          title: this.translate.instant('plan_estudios.resolucion'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        estado: {
          title: this.translate.instant('GLOBAL.estado'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        totalCreditos: {
          title: this.translate.instant('plan_estudios.total_creditos'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        ver: {
          title: this.translate.instant('GLOBAL.ver'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              console.log("ver: ", out.value, out.rowData)
            })}
        },
        enviar: {
          title: this.translate.instant('GLOBAL.enviar'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              console.log("enviar: ", out.value, out.rowData)
            })}
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  createTableEspaciosAcademicos() {
    this.tbEspaciosAcademicos = {
      pager: {
        perPage: 5,
      },
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '5%',
        },
        nombre: {
          title: this.translate.instant('ptd.espacio_academico'),
          editable: false,
          width: '25%',
          filter: true,
        },
        prerequisitos_str: {
          title: this.translate.instant('espacios_academicos.espacios_requeridos'),
          editable: false,
          width: '25%',
          filter: true,
        },
        clase: {
          title: this.translate.instant('GLOBAL.clase'),
          editable: false,
          width: '25%',
          filter: true,
        },
        creditos: {
          title: this.translate.instant('proyecto.creditos_proyecto'),
          editable: false,
          width: '15%',
          filter: true,
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'add_to_semester',
            title: '<i class="nb-plus-circled" title="' + this.translate.instant('plan_estudios.agregar_espacio') + '"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  onAction(event): void {
    switch (event.action) {
      case 'add_to_semester':
        this.addtoSemester(event);
        break;
      case 'remove_from_semester':
        this.removeFromSemester(event);
        break;
    }
  }

  addtoSemester(event) {
    if (this.dataSemestre.length >= 1 && this.desactivarAgregarSemestre) {
      this.dataSemestre[this.dataSemestre.length-1].add(event.data);
      this.dataSemestre[this.dataSemestre.length-1].refresh();
      this.dataEspaciosAcademicos.remove(event.data);
      const semestreId = this.dataSemestre.length-1;
      const totalSemestre = this.filaTotal(this.dataSemestre[semestreId]);
      this.dataSemestreTotal[semestreId].load(totalSemestre);
      this.dataSemestreTotal[semestreId].refresh();
    }
  }

  removeFromSemester(event) {
    if (this.desactivarAgregarSemestre) {
      this.dataEspaciosAcademicos.add(event.data);
      this.dataEspaciosAcademicos.refresh();
      this.dataSemestre[this.dataSemestre.length-1].remove(event.data);
      const semestreId = this.dataSemestre.length-1;
      const totalSemestre = this.filaTotal(this.dataSemestre[semestreId]);
      this.dataSemestreTotal[semestreId].load(totalSemestre);
      this.dataSemestreTotal[semestreId].refresh();
    }
  }

  limpiarSemestre(semestre: LocalDataSource) {
    this.popUpManager.showPopUpGeneric(this.translate.instant('plan_estudios.plan_estudios'), 
                                       this.translate.instant('plan_estudios.seguro_limpiar'), MODALS.QUESTION, true).then(
      (action) => {
        if (action.value) {
          semestre.getAll().then((data) => {
            data.forEach((dataind) => {
              this.dataEspaciosAcademicos.add(dataind)
            })
            this.dataEspaciosAcademicos.refresh();
            semestre.load([]);
          })
        }    
      }
    );
  }

  createTableSemestre() {
    const checkmark = this.domSanitizer.bypassSecurityTrustHtml(`<div style="font-size: 2rem; text-align: center;"><i class="nb-checkmark-circle"></i></div>`);
    this.tbSemestre = {
      columns: {
        nombre: {
          title: this.translate.instant('ptd.espacio_academico'),
          editable: false,
          width: '23%',
          filter: false,
        },
        creditos: {
          title: this.translate.instant('plan_estudios.creditos'),
          editable: false,
          width: '7%',
          filter: false,
        },
        htd: {
          title: this.translate.instant('espacios_academicos.htd'),
          editable: false,
          width: '7%',
          filter: false,
        },
        htc: {
          title: this.translate.instant('espacios_academicos.htc'),
          editable: false,
          width: '7%',
          filter: false,
        },
        hta: {
          title: this.translate.instant('espacios_academicos.hta'),
          editable: false,
          width: '7%',
          filter: false,
        },
        OB: {
          title: this.translate.instant('espacios_academicos.obligatorioBasico'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
          valuePrepareFunction: (valor: number) =>
            (valor === 1)
              ?  checkmark
              : '',
        },
        OC: {
          title: this.translate.instant('espacios_academicos.obligatorioComplementario'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
          valuePrepareFunction: (valor: number) =>
            (valor === 1)
              ? checkmark
              : '',
        },
        EI: {
          title: this.translate.instant('espacios_academicos.electivaIntrinseca'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
          valuePrepareFunction: (valor: number) =>
            (valor === 1)
              ? checkmark
              : '',
        },
        EE: {
          title: this.translate.instant('espacios_academicos.electivaExtrinseca'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
          valuePrepareFunction: (valor: number) =>
            (valor === 1)
              ? checkmark
              : '',
        },
        CP: {
          title: this.translate.instant('espacios_academicos.componentePropedeutico'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
          valuePrepareFunction: (valor: number) =>
            (valor === 1)
              ? checkmark
              : '',
        },
        ENFQ_TEO: {
          title: this.translate.instant('espacios_academicos.teorico'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
          valuePrepareFunction: (valor: number) =>
            (valor === 1)
              ? checkmark
              : '',
        },
        ENFQ_PRAC: {
          title: this.translate.instant('espacios_academicos.practico'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
          valuePrepareFunction: (valor: number) =>
            (valor === 1)
              ? checkmark
              : '',
        },
        ENFQ_TEOPRAC: {
          title: this.translate.instant('espacios_academicos.teoricoPractico'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
          valuePrepareFunction: (valor: number) =>
            (valor === 1)
              ? checkmark
              : '',
        }, 
      },
      hideSubHeader: true,
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'remove_from_semester',
            title: '<i class="nb-close-circled" title="' + this.translate.instant('plan_estudios.quitar_espacio') + '"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  createTableSemestreTotal() {
    this.tbSemestreTotal = {
      columns: {
        nombre: {
          title: this.translate.instant('ptd.espacio_academico'),
          editable: false,
          width: '23%',
          filter: false,
        },
        creditos: {
          title: this.translate.instant('plan_estudios.creditos'),
          editable: false,
          width: '7%',
          filter: false,
          type: 'html',
        },
        htd: {
          title: this.translate.instant('espacios_academicos.htd'),
          editable: false,
          width: '7%',
          filter: false,
        },
        htc: {
          title: this.translate.instant('espacios_academicos.htc'),
          editable: false,
          width: '7%',
          filter: false,
        },
        hta: {
          title: this.translate.instant('espacios_academicos.hta'),
          editable: false,
          width: '7%',
          filter: false,
        },
        OB: {
          title: this.translate.instant('espacios_academicos.obligatorioBasico'),
          editable: false,
          width: '7%',
          filter: false,
        },
        OC: {
          title: this.translate.instant('espacios_academicos.obligatorioComplementario'),
          editable: false,
          width: '7%',
          filter: false,
        },
        EI: {
          title: this.translate.instant('espacios_academicos.electivaIntrinseca'),
          editable: false,
          width: '7%',
          filter: false,
        },
        EE: {
          title: this.translate.instant('espacios_academicos.electivaExtrinseca'),
          editable: false,
          width: '7%',
          filter: false,
        },
        CP: {
          title: this.translate.instant('espacios_academicos.componentePropedeutico'),
          editable: false,
          width: '7%',
          filter: false,
        },
        ENFQ_TEO: {
          title: this.translate.instant('espacios_academicos.teorico'),
          editable: false,
          width: '7%',
          filter: false,
        },
        ENFQ_PRAC: {
          title: this.translate.instant('espacios_academicos.practico'),
          editable: false,
          width: '7%',
          filter: false,
        },
        ENFQ_TEOPRAC: {
          title: this.translate.instant('espacios_academicos.teoricoPractico'),
          editable: false,
          width: '7%',
          filter: false,
        }, 
      },
      hideSubHeader: true,
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'remove_from_semester',
            title: '<i class="nb-info"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  filaTotal(semestre: LocalDataSource): any {
    let total = <any>UtilidadesService.hardCopy(this.formatototal);
    semestre.getAll().then((data) => {
      if (data.length > 0) {
        data.forEach((dataind) => {
          total.creditos += dataind.creditos;
          total.htd += dataind.htd;
          total.htc += dataind.htc;
          total.hta += dataind.hta;
          total.OB += dataind.OB;
          total.OC += dataind.OC;
          total.EI += dataind.EI;
          total.EE += dataind.EE;
          total.CP += dataind.CP;
          total.ENFQ_TEO += dataind.ENFQ_TEO;
          total.ENFQ_PRAC += dataind.ENFQ_PRAC;
          total.ENFQ_TEOPRAC += dataind.ENFQ_TEOPRAC;
        })
      }
    });
    this.totalTotal();
    return [total];
  }

  totalTotal() {
    let total = <any>UtilidadesService.hardCopy(this.formatototal);
    this.dataSemestre.forEach(semestre => {
      semestre.getAll().then((data) => {
        if (data.length > 0) {
          data.forEach((dataind) => {
            total.creditos += dataind.creditos;
            total.htd += dataind.htd;
            total.htc += dataind.htc;
            total.hta += dataind.hta;
            total.OB += dataind.OB;
            total.OC += dataind.OC;
            total.EI += dataind.EI;
            total.EE += dataind.EE;
            total.CP += dataind.CP;
            total.ENFQ_TEO += dataind.ENFQ_TEO;
            total.ENFQ_PRAC += dataind.ENFQ_PRAC;
            total.ENFQ_TEOPRAC += dataind.ENFQ_TEOPRAC;
          })
        }
      });
    });
    this.dataSemestreTotalTotal.load([total]);
    this.dataSemestreTotalTotal.refresh();
  }
  //#endregion
  // * ----------

  // * ----------
  // * Reaccionar a cambios de formularios 
  //#region
  cambioEn(event: any): void {
    const fieldNombre = Object.keys(event)[0];
    switch (fieldNombre) {
      case 'nivel':
        if (event.nivel) {
          this.formPlanEstudio.subnivel.opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId && (nivel.NivelFormacionPadreId.Id == event.nivel.Id));
        } else {
          this.formPlanEstudio.subnivel.opciones = [];
          this.formGroupPlanEstudio.patchValue({subnivel: undefined});
        }
        break;

      case 'subnivel':
        if (event.subnivel) {
          this.formPlanEstudio.proyectoCurriular.opciones = this.proyectos.filter(proyecto => proyecto.NivelFormacionId && (proyecto.NivelFormacionId.Id == event.subnivel.Id));
        } else {
          this.formPlanEstudio.proyectoCurriular.opciones = [];
          this.formGroupPlanEstudio.patchValue({proyectoCurriular: undefined});
        }
        break;
      
      case 'proyectoCurriular':
        if (event.proyectoCurriular) {
          this.formPlanEstudio.codigoProyecto.valor = event.proyectoCurriular.Codigo;
          this.formGroupPlanEstudio.patchValue({codigoProyecto: event.proyectoCurriular.Codigo});
          this.proyecto_id = event.proyectoCurriular.Id;
        } else {
          this.formPlanEstudio.codigoProyecto.valor = undefined;
          this.formGroupPlanEstudio.patchValue({codigoProyecto: undefined});
        }
        break;
    
      default:
        break;
    }

  }

  actualizarForm(event) {
    this.formGroupPlanEstudio = event;
  }
  //#endregion
  // * ----------

  // * ----------
  // * Acciones botones 
  //#region
  nuevoPlanEstudio() {
    this.crearFormulario();
    this.createTableEspaciosAcademicos();
    this.createTableSemestreTotal();
    this.totalTotal();
    this.vista = VIEWS.FORM;
    this.dataEspaciosAcademicos.load([]);
  }

  guardar(stepper: MatStepper) {
    this.formGroupPlanEstudio.markAllAsTouched();
    if (this.formGroupPlanEstudio.valid) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('plan_estudios.plan_estudios'), 
        this.translate.instant('plan_estudios.seguro_crear'), 
        MODALS.INFO, 
        true).then(
          (action) => {
            if (action.value) {
              this.prepareCreate(stepper);
            }    
          });
    }
  }

  limpiar() {
    this.popUpManager.showPopUpGeneric(this.translate.instant('plan_estudios.plan_estudios'), 
                                       this.translate.instant('plan_estudios.seguro_limpiar'), MODALS.QUESTION, true).then(
      (action) => {
        if (action.value) {
          this.formGroupPlanEstudio.reset();
        }    
      }
    );
  }

  cancelar() {
    this.popUpManager.showPopUpGeneric(this.translate.instant('plan_estudios.plan_estudios'), 
                                       this.translate.instant('plan_estudios.seguro_cancelar'), MODALS.WARNING, true).then(
      (action) => {
        if (action.value) {
          this.formGroupPlanEstudio.reset();
          this.dataSemestre = [];
          this.vista = VIEWS.LIST;
          this.loadSelects();
        }    
      }
    );
  }

  agregarSemestre() {
    const semestresMax = Number(this.formGroupPlanEstudio.get('numeroSemestres').value);
    if (semestresMax && this.dataSemestre.length < semestresMax) {
      this.desactivarAgregarSemestre = true;
      this.dataSemestre.push(new LocalDataSource());
      let total = <any>UtilidadesService.hardCopy(this.formatototal);
      this.dataSemestreTotal.push(new LocalDataSource([total]));
      this.createTableSemestre();
      this.createTableSemestreTotal();
    }
  }

  finalizarSemestre() {
    this.popUpManager.showPopUpGeneric(this.translate.instant('plan_estudios.plan_estudios'), 
                                       this.translate.instant('plan_estudios.seguro_finalizar'), MODALS.INFO, true).then(
      (action) => {
        if (action.value) {
          this.desactivarAgregarSemestre = false;
        }    
      }
    );
  }
  //#endregion
  // * ----------

  // * ----------
  // * Carga información paramétrica (selects)
  //#region
  loadNivel(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"nivel": null});
          }
        }, (err) => {
          reject({"nivel": err});
        }
      );
    });
  }

  loadProyectos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"proyecto": null});
          }
        }, (err) => {
          reject({"proyecto": err});
        }
      );
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Carga planes de estudio existentes
  //#region
  loadPlanesEstudio(): Promise<PlanEstudio[]>{
    return new Promise<any>((resolve, reject) => {
      this.planEstudiosService.get("plan_estudio?query=activo:true&limit=0").subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            resolve([]);
          }
        }, (err) => {
          reject({"plan_estudio": err})
        }
      );
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Cargar informacion particular 
  //#region
  consultarEspaciosAcademicos(id_proyecto: number): Promise<any> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('espacios_academicos/byProject/'+id_proyecto).subscribe((resp) => {
        this.loading = false;
        resolve(resp.Data);
      }, (err) => {
        this.loading = false;
        reject({"espacios": err});
      })
    })
  }
  //#endregion
  // * ----------

  // * ----------
  // * Insertar info parametrica en formulario 
  //#region
  async loadSelects() {
    this.loading = true;
    try {
      // ? carga paralela de parametricas
      let promesas = [];
      promesas.push(this.loadNivel().then(niveles => {
        this.niveles = niveles;
      }));
      promesas.push(this.loadProyectos().then(proyectos => {
        this.proyectos = proyectos;
      }));
      await Promise.all(promesas);
      
      // Datos de la tabla planes de estudio
      this.planesEstudio = await this.loadPlanesEstudio();
      this.planesEstudio.forEach(plan => {
        this.organizarDatosTablaPlanEstudio(plan);
      });
      this.dataPlanesEstudio.load(this.planesEstudio);

      this.loading = false;
    } catch (error) {
      const falloEn = Object.keys(error)[0];
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                                           this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
                                           this.translate.instant('ERROR.persiste_error_comunique_OAS'),
                                           MODALS.ERROR, false);
      this.loading = false;
    }
  }
  //#endregion
  // * ----------

  // * ----------
  // * Funciones para carga y descarga de archivos
  //#region
  prepararArchivos(): any[]{
    const idTipoDocument = 72; // carpeta Nuxeo
    const archivos = <any[]>this.formPlanEstudio.soportes.archivosLocal;
    return archivos.map(archivo => {
      return {
        IdDocumento: idTipoDocument,
        nombre: (archivo.file.name).split('.')[0],
        descripcion: "Soporte Plan de Estudios",
        file: archivo.file
      }
    })
  }

  cargarArchivos(archivos): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.gestorDocumentalService.uploadFiles(archivos).subscribe(
        (respuesta: any[]) => {
          const listaIds = respuesta.map(f => {
            return f.res.Id;
          });
          resolve(listaIds);
        }
      );
    });
  }

  // * ----------
  // * Estructuracion plan de estudio
  //#region
  prepareIds2Stringify(idsArchivos: number[], nameField: string): string {
    let result = {}
    result[nameField] = []
    if (idsArchivos){
      result[nameField] = idsArchivos;
    }
    return JSON.stringify(result);
  }

  organizarDatosTablaPlanEstudio(plan: any){
    const proyecto = this.proyectos.find(proyecto => proyecto.Id == plan.ProyectoAcademicoId);    
    plan["proyectoCurricular"] = proyecto["Nombre"];

    plan["plan_estudio"] = plan["Nombre"];
    plan["resolucion"] = plan["NumeroResolucion"];
    plan["totalCreditos"] = plan["TotalCreditos"];

    const estado = plan["EstadoAprobacionId"];
    plan["estado"] = estado["Nombre"];

    plan["ver"] = {value: ACTIONS.VIEW, type: 'ver', disabled: false};
    plan["enviar"] = {value: ACTIONS.SEND, type: 'enviar', disabled: false};
  }
  //#endregion
  // * ----------

  // * ----------
  // * Crear plan de estudios datos básicos 
  //#region

  async prepareCreate(stepper: MatStepper){
    this.loading = true;
    let newPlanEstudio = new PlanEstudio();
    newPlanEstudio.Nombre = "";
    newPlanEstudio.NumeroResolucion = Number(this.formGroupPlanEstudio.get('numeroResolucion').value);
    newPlanEstudio.NumeroSemestres = Number(this.formGroupPlanEstudio.get('numeroSemestres').value);
    newPlanEstudio.ProyectoAcademicoId = Number(this.formGroupPlanEstudio.get('proyectoCurriular').value["Id"]);
    newPlanEstudio.TotalCreditos = Number(this.formGroupPlanEstudio.get('totalCreditosPrograma').value);
    newPlanEstudio.AnoResolucion = Number(this.formGroupPlanEstudio.get('anioResolucion').value);
    newPlanEstudio.Codigo = this.formGroupPlanEstudio.get('codigoPlanEstudio').value;

    const archivos = this.prepararArchivos();
    const idsArchivos = await this.cargarArchivos(archivos);
    newPlanEstudio.SoporteDocumental = this.prepareIds2Stringify(idsArchivos, "SoporteDocumental");
    this.loading = false;

    this.createStudyPlan(newPlanEstudio).then((res: any) => {
      this.consultarEspaciosAcademicos(this.proyecto_id).then((result) => {
        this.ListEspacios = result;
        this.dataEspaciosAcademicos.load(this.ListEspacios);
        stepper.next();
      }, (error) => {
        this.ListEspacios = [];
        const falloEn = Object.keys(error)[0];
        this.popUpManager.showPopUpGeneric(
          this.translate.instant('ERROR.titulo_generico'),
          this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
          this.translate.instant('ERROR.persiste_error_comunique_OAS'),
          MODALS.ERROR, false);
      });
    });
  }

  createStudyPlan(planEstudioBody: PlanEstudio) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.sgaMidService.post('plan_estudios/base', planEstudioBody)
      .subscribe(res => {
        this.loading = false;
        this.popUpManager.showSuccessAlert(
          this.translate.instant('plan_estudios.plan_estudios_creacion_ok')
          );
          resolve(res);
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorAlert(
            this.translate.instant('plan_estudios.plan_estudios_creacion_error')
            );
          });
    });
  }
  //#endregion
  // * ----------
}
