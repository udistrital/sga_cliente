import { Component, OnInit } from '@angular/core';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { HttpErrorResponse } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { FormGroup } from '@angular/forms';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { ParametrosService } from '../../../@core/data/parametros.service';

interface select_temporal {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'gestion-grupos',
  templateUrl: './gestion-grupos.component.html',
  styleUrls: ['./gestion-grupos.component.scss']
})
export class GestionGruposComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbDiponibilidadHorarios: Object;

  formStep1: FormGroup;
  formDef: any;
  niveles: any[];
  proyectos: any[];
  periodos: any[] ;
  bandera_registro_horario: boolean;

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
        this.createTable();
        this.updateLanguage();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.loadSelects();
    this.createTable();
  }

  // * ----------
  // * Creación de tabla (lista espacios_academicos) 
  //#region
  createTable() {
    this.tbDiponibilidadHorarios = {
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '2%',
        },
        codigo: {
          title: this.translate.instant('gestion_horarios.codigo_grupo'),
          editable: false,
          width: '5%',
          filter: true,
        },
        capacidad: {
          title: this.translate.instant('gestion_horarios.capacidad'),
          editable: false,
          width: '12%',
          filter: true,
        },
        espacio: {
          title: this.translate.instant('gestion_horarios.espacio_academico'),
          editable: false,
          width: '25%',
          filter: true,
        },
        inantivar: {
          title: this.translate.instant('gestion_horarios.acciones'),
          editable: false,
          width: '3%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
            })}
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
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

  to_main_component(){
    console.log("to_main_component");
    this.bandera_registro_horario =false;
  }


}

