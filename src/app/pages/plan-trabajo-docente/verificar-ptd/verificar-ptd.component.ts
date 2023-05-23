import { Component, OnInit } from '@angular/core';
import { MODALS, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { FORM_INFO_DOCENTE } from '../forms/form-info_docente';
import { FORM_VERIFICAR_PTD } from '../forms/form-verificar_ptd';

@Component({
  selector: 'verificar-ptd',
  templateUrl: './verificar-ptd.component.html',
  styleUrls: ['./verificar-ptd.component.scss']
})
export class VerificarPtdComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbPlanes: Object;
  dataPlanes: LocalDataSource;

  formDocente: any;
  dataDocente: any;
  formVerificar: any;
  dataVerificar: any;

  readonly MODALS = MODALS;

  asignaturaAdd: any = undefined;
  
  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager
    ) {
      this.dataPlanes = new LocalDataSource();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
        this.buildFormDocente();
        this.buildFormVerificar();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST,
    this.formDocente = {...FORM_INFO_DOCENTE};
    this.formVerificar = {...FORM_VERIFICAR_PTD};
    this.createTable();
    this.buildFormDocente();
    this.buildFormVerificar();
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
    this.dataPlanes.load(data)
  }

  createTable() {
    this.tbPlanes = {
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

  buildFormVerificar() {
    this.formVerificar.btn = this.translate.instant('ptd.dar_respuesta');
    this.formVerificar.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

}
