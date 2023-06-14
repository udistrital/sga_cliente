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
import { MODALS, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { animate, style, transition, trigger } from '@angular/animations';

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

  formPlanEstudio: FormParams;
  formGroupPlanEstudio: FormGroup;

  tbPlanesEstudio: Object;
  dataPlanesEstudio: LocalDataSource;

  tbEspaciosAcademicos: Object;
  dataEspaciosAcademicos: LocalDataSource;

  tbSemestre: Object;
  dataSemestre: LocalDataSource[];

  niveles: any[];
  proyectos: any[];

  desactivarAgregarSemestre: boolean = false;

  emuleListEspacios: any[] = [
    {
      _id: "1",
      espacioAcademico: "Calculo 1",
      prerequisitos: "Ninguno",
      clase: "Obigatorio básico",
      creditos: 3
    },
    {
      _id: "2",
      espacioAcademico: "Calculo 2",
      prerequisitos: "Calculo 1",
      clase: "Obigatorio básico",
      creditos: 3
    },
    {
      _id: "3",
      espacioAcademico: "Calculo 3",
      prerequisitos: "Calculo 2",
      clase: "Obigatorio básico",
      creditos: 3
    },
    {
      _id: "4",
      espacioAcademico: "Calculo 4",
      prerequisitos: "Calculo 3",
      clase: "Obigatorio básico",
      creditos: 3
    },
  ];

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private projectService: ProyectoAcademicoService,
  ) {
    this.dataPlanesEstudio = new LocalDataSource();
    this.dataEspaciosAcademicos = new LocalDataSource();
    this.dataSemestre = [];
    this.translate.onLangChange.subscribe(() => {
      this.createTablePlanesEstudio();
      this.createTableEspaciosAcademicos();
      this.createTableSemestre();
    })
  }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.loadSelects();
    this.createTablePlanesEstudio();

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
        editar: {
          title: this.translate.instant('GLOBAL.enviar'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              console.log("editar: ", out.value, out.rowData)
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
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '5%',
        },
        espacioAcademico: {
          title: this.translate.instant('ptd.espacio_academico'),
          editable: false,
          width: '25%',
          filter: true,
        },
        prerequisitos: {
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
    }
  }

  removeFromSemester(event) {
    if (this.desactivarAgregarSemestre) {
      this.dataEspaciosAcademicos.add(event.data);
      this.dataEspaciosAcademicos.refresh();
      this.dataSemestre[this.dataSemestre.length-1].remove(event.data);
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
    this.tbSemestre = {
      columns: {
        espacioAcademico: {
          title: this.translate.instant('ptd.espacio_academico'),
          editable: false,
          width: '23%',
          filter: true,
        },
        creditos: {
          title: this.translate.instant('proyecto.creditos_proyecto'),
          editable: false,
          width: '7%',
          filter: true,
        },
        htd: {
          title: this.translate.instant('espacios_academicos.htd'),
          editable: false,
          width: '7%',
          filter: true,
        },
        htc: {
          title: this.translate.instant('espacios_academicos.htc'),
          editable: false,
          width: '7%',
          filter: true,
        },
        hta: {
          title: this.translate.instant('espacios_academicos.hta'),
          editable: false,
          width: '7%',
          filter: true,
        },
        obligatorioBasico: {
          title: this.translate.instant('espacios_academicos.obligatorioBasico'),
          editable: false,
          width: '7%',
          filter: true,
        },
        obligatorioComplementario: {
          title: this.translate.instant('espacios_academicos.obligatorioComplementario'),
          editable: false,
          width: '7%',
          filter: true,
        },
        teorico: {
          title: this.translate.instant('espacios_academicos.teorico'),
          editable: false,
          width: '7%',
          filter: true,
        },
        practico: {
          title: this.translate.instant('espacios_academicos.practico'),
          editable: false,
          width: '7%',
          filter: true,
        },
        teoricoPractico: {
          title: this.translate.instant('espacios_academicos.teoricoPractico'),
          editable: false,
          width: '7%',
          filter: true,
        },
        electivaIntrinseca: {
          title: this.translate.instant('espacios_academicos.electivaIntrinseca'),
          editable: false,
          width: '7%',
          filter: true,
        },
        electivaExtrinseca: {
          title: this.translate.instant('espacios_academicos.electivaExtrinseca'),
          editable: false,
          width: '7%',
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
            name: 'remove_from_semester',
            title: '<i class="nb-close-circled" title="' + this.translate.instant('plan_estudios.quitar_espacio') + '"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
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
    this.vista = VIEWS.FORM;
    this.dataEspaciosAcademicos.load(this.emuleListEspacios);
  }

  guardar() {
    this.formGroupPlanEstudio.markAllAsTouched();
    if (this.formGroupPlanEstudio.valid) {
      this.popUpManager.showPopUpGeneric(this.translate.instant('plan_estudios.plan_estudios'), 
                                       this.translate.instant('plan_estudios.seguro_crear'), MODALS.INFO, true).then(
      (action) => {
        if (action.value) {
          console.log('creado ok')
        }    
      }
    );
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
        }    
      }
    );
  }

  agregarSemestre() {
    const semestresMax = Number(this.formGroupPlanEstudio.get('numeroSemestres').value);
    if (semestresMax && this.dataSemestre.length < semestresMax) {
      this.desactivarAgregarSemestre = true;
      this.dataSemestre.push(new LocalDataSource());
      this.createTableSemestre();
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
      this.loading = false;
    } catch (error) {
      console.warn(error);
      this.loading = false;
    }
  }
  //#endregion
  // * ----------

}
