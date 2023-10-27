import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { CdkDragMove, CdkDragRelease, CdkDragStart } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { FormGroup } from '@angular/forms';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { ParametrosService } from '../../../@core/data/parametros.service';

interface elementDragDrop {
  id: number;
  nombre: string;
  idCarga: string;
  idEspacioAcademico: string;
  idActividad: string;
  horas: number;
  horaFormato: string;
  sede: any,
  edificio: any,
  salon: any,
  tipo: number;
  estado: number;
  bloqueado: boolean;
  dragPosition: { x: number, y: number };
  prevPosition: { x: number, y: number };
  finalPosition: { x: number, y: number };
}

interface select_temporal {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'registro-horarios',
  templateUrl: './registro-horarios.component.html',
  styleUrls: ['./registro-horarios.component.scss']
})
export class RegistroHorariosComponent implements OnInit {


    /** Definitions for horario */
    readonly horarioSize = { days: 7, hourIni: 6, hourEnd: 23, difHoras: 23 - 6, stepHour: 0.25 };
    readonly containerGridLengths = {
      x: this.horarioSize.days,
      y: (this.horarioSize.hourEnd - this.horarioSize.hourIni),
    };
    readonly snapGridSize = { x: 150, y: 75, ymin: 75 * 0.25 }; //px no olvide editarlas en scss si las cambia
    readonly containerGridsize = {
      x: this.containerGridLengths.x * this.snapGridSize.x,
      y: this.containerGridLengths.y * this.snapGridSize.y
    };
    readonly tipo = { carga_lectiva: 1, actividades: 2 };
    readonly estado = { flotando: 1, ubicado: 2, ocupado: 3 }
  
    matrixBusy = Array(this.containerGridLengths.x)
      .fill(0).map(() => Array(this.containerGridLengths.y / this.horarioSize.stepHour)
        .fill(0).map(() => false)
      )
  
    genHoursforTable() {
      return Array(this.horarioSize.hourEnd - this.horarioSize.hourIni).fill(0).map((_, index) => index + this.horarioSize.hourIni);
    }
  
    @ViewChild('contenedorCargaLectiva', { static: false }) contenedorCargaLectiva: ElementRef;
    listaCargaLectiva: any[] = [];
    listaOcupacion: any[] = [];
    /*************************** */
  
    /** Entradas y Salidas */
    @Input() WorkingMode: Symbol = undefined;
    @Input() Rol: string = undefined;
    @Input() Data: any = undefined;
    @Output() OutCancelar: EventEmitter<boolean> = new EventEmitter();
    @Output() OutLoading: EventEmitter<boolean> = new EventEmitter();


  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbDiponibilidadHorarios: Object;

  formStep1: FormGroup;
  formDef: any;
  niveles: any[];
  proyectos: any[];
  periodos: any[] ;

  readonly ACTIONS = ACTIONS;
  crear_editar: Symbol;
  temporal: select_temporal[] = [
    {value: 'Valor_1', viewValue: 'Steak'},
    {value: 'Valor_2', viewValue: 'Pizza'},
    {value: 'Valor_3', viewValue: 'Tacos'},
  ];

  constructor(
    private translate: TranslateService,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    ) {
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {

        this.updateLanguage();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.loadSelects();
  }



  getIndexOf(campos: any[], label: string): number {
    return campos.findIndex(campo => campo.nombre == label);
  }

  updateLanguage() {
    this.reloadLabels(this.formDef.campos_p1);
  }

  reloadLabels(campos: any[]) {
    campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  myOnChanges(label: string, field: any) {
    if (label == 'nivel' && field) {
      let idx = this.getIndexOf(this.formDef.campos_p1, 'subnivel');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId && (nivel.NivelFormacionPadreId.Id == field.Id));
      }
      idx = this.getIndexOf(this.formDef.campos_p1, 'proyectoCurricular');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = [];
      }
    }
    if (label == 'subnivel' && field) {
      let idx = this.getIndexOf(this.formDef.campos_p1, 'proyectoCurricular');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = this.proyectos.filter(proyecto => proyecto.NivelFormacionId && (proyecto.NivelFormacionId.Id == field.Id));
      }
    }

  }




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
  // * Insertar info parametrica en formulario (en algunos se tiene en cuenta el rol y se pueden omitir) 
  //#region
  async loadSelects() {
    this.loading = true;
    try {
      // ? carga paralela de parametricas
      let promesas = [];
      promesas.push(this.loadNivel().then(niveles => {
        this.niveles = niveles;
        let idx = this.formDef.campos_p1.findIndex(campo => campo.nombre == 'nivel')
        if (idx != -1) {
          this.formDef.campos_p1[idx].opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId == undefined);
        }
      }));
      promesas.push(this.loadProyectos().then(proyectos => {this.proyectos = proyectos}));
      await Promise.all(promesas);
      this.loading = false;
    } catch (error) {
      console.warn(error);
      this.loading = false;
      const falloEn = Object.keys(error)[0];
    }
      
  }
  //#endregion
  // * ----------

  cargarPeriodo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"periodos": null});
          }
        }, (err) => {
          reject({"periodos": err});
        }
      );
    });
  }



// Metodos componente matrix de horario 





}




