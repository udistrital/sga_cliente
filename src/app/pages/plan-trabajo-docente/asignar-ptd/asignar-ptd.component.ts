import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { FORM_INFO_DOCENTE } from '../forms/form-info_docente';
import { PopUpManager } from '../../../managers/popUpManager';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';

@Component({
  selector: 'asignar-ptd',
  templateUrl: './asignar-ptd.component.html',
  styleUrls: ['./asignar-ptd.component.scss']
})
export class AsignarPtdComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbDocente: Object;
  dataDocentes: LocalDataSource;

  formDocente: any;
  dataDocente: any;

  readonly MODALS = MODALS;
  
  readonly ACTIONS = ACTIONS;

  rolIs: String = undefined;
  canEdit: Symbol = ACTIONS.VIEW;

  asignaturaAdd: any = undefined;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private autenticationService: ImplicitAutenticationService
    ) {
      this.dataDocentes = new LocalDataSource();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
        this.buildFormDocente();
      })
    }

  ngOnInit() {
    this.autenticationService.getRole().then(
      (rol: Array <String>) => {
        rol.includes
        let r = rol.find(role => (role == ROLES.DOCENTE || role == ROLES.ADMIN_DOCENCIA || role == ROLES.COORDINADOR));
        if (r) {
          this.rolIs = r;
          this.canEdit = ACTIONS.EDIT;
        }
      }
    );
    this.loading = false;
    this.vista = VIEWS.LIST,
    this.formDocente = {...FORM_INFO_DOCENTE};
    this.createTable();
    this.buildFormDocente();
    const data = [
      {
        nombre: 'x',
        identificacion: '123',
        tipo_vinculacion: 'vinculacion',
        periodo_academico: '2022',
        soporte_documental: {value: undefined, type: 'ver', disabled: true},
        gestion: {value: undefined, type: 'editar', disabled: false},
        estado: 'por definir',
        enviar: {value: undefined, type: 'enviar', disabled: false},
      }
    ]
    this.dataDocentes.load(data);
  }

  createTable() {
    this.tbDocente = {
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '2%',
        },
        nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          editable: false,
          width: '25%',
          filter: true,
        },
        identificacion: {
          title: this.translate.instant('GLOBAL.Documento'),
          editable: false,
          width: '15%',
          filter: true,
        },
        tipo_vinculacion: {
          title: this.translate.instant('GLOBAL.tipo_vinculacion'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        periodo_academico: {
          title: this.translate.instant('calendario.periodo'),
          editable: false,
          width: '10%',
          filter: true,
        },
        soporte_documental: {
          title: this.translate.instant('GLOBAL.soporte_documental'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              console.log("ver soporte:", out);
            })}
        },
        gestion: {
          title: this.translate.instant('ptd.gest'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              this.vista = VIEWS.FORM;
              if (this.rolIs == ROLES.DOCENTE) {
                this.popUpManager.showPopUpGeneric(this.translate.instant('notas.docente'), this.translate.instant('ptd.aviso_informativo_docente_p1') + '.<br><br>' +
                this.translate.instant('ptd.aviso_informativo_docente_p2') + '.', MODALS.INFO, false)
              }
            })}
        },
        estado: {
          title: this.translate.instant('GLOBAL.estado'),
          editable: false,
          width: '12.5%',
          filter: true,
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
              console.log("enviar:", out);
            })}
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  buildFormDocente() {
    this.formDocente.titulo = this.translate.instant(this.formDocente.titulo_i18n);
    this.formDocente.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  copy_ptd() {
    if (this.rolIs == ROLES.DOCENTE) {
      this.popUpManager.showPopUpGeneric('', this.translate.instant('ptd.copiar_plan_ver_coordinador_p1') + "xxxx-xx" + '.<br>' +
                                             this.translate.instant('ptd.copiar_plan_ver_docente_p1') + '<br><br>' +
                                             this.translate.instant('ptd.copiar_plan_ver_docente_p2') + '.<br>' +
                                             this.translate.instant('ptd.copiar_plan_ver_docente_p3') + '.<br>' +
                                             this.translate.instant('ptd.copiar_plan_ver_docente_p4') + '.', MODALS.QUESTION, true)
        .then(action => {
          if (action.value) {
            console.log("copiar actividades")
          } else {
            console.log("cancelar")
          }
        });
    }
    if (this.rolIs == ROLES.ADMIN_DOCENCIA || this.rolIs == ROLES.COORDINADOR) {
      this.popUpManager.showPopUpGeneric('', this.translate.instant('ptd.copiar_plan_ver_coordinador_p1') + "xxxx-xx" + '.<br>' +
                                             this.translate.instant('ptd.copiar_plan_ver_coordinador_p2') + '.', MODALS.QUESTION, true)
        .then(action => {
          if (action.value) {
            console.log("copiar carga lectiva")
          } else {
            console.log("cancelar")
          }
        });
    }
    /* this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.copy_ptd'),"dsdsdsf", MODALS.INFO, true).then(
      action => {
        if (action.value) {
          console.log("copiar")
        } else {
          console.log("cancelar")
        }
      }) */
  }

}