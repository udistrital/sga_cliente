import { Component, OnInit } from '@angular/core';
import { VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { FORM_REVISION_CONSOLIDADO } from '../forms/form-consolidado';
import { Ng2StButtonComponent } from '../../../@theme/components';

@Component({
  selector: 'revision-consolidado',
  templateUrl: './revision-consolidado.component.html',
  styleUrls: ['./revision-consolidado.component.scss']
})
export class RevisionConsolidadoComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbRevConsolidados: Object;
  dataRevConsolidados: LocalDataSource;

  formRevConsolidado: any;
  dataRevConsolidado: any;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager
    ) {
      this.dataRevConsolidados = new LocalDataSource();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
        this.buildFormRevConsolidado();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formRevConsolidado = {...FORM_REVISION_CONSOLIDADO};
    this.buildFormRevConsolidado();
    this.createTable();
    const data = [
      {
        proyecto_curricular: 'Ing en Comedia',
        codigo: '123',
        fecha_radicado: '02/03/2020',
        periodo_academico: '2023-1',
        gestion: {value: undefined, type: 'editar', disabled: false},
        estado: 'por definir',
        enviar: {value: undefined, type: 'enviar', disabled: false},
      }
    ]
    this.dataRevConsolidados.load(data);
  }

  createTable() {
    this.tbRevConsolidados = {
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '2%',
        },
        proyecto_curricular: {
          title: this.translate.instant('GLOBAL.proyecto_academico'),
          editable: false,
          width: '25%',
          filter: true,
        },
        codigo: {
          title: this.translate.instant('GLOBAL.codigo'),
          editable: false,
          width: '15%',
          filter: true,
        },
        fecha_radicado: {
          title: this.translate.instant('ptd.fecha_radicado'),
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

  buildFormRevConsolidado() {
    this.formRevConsolidado.btn = this.translate.instant('GLOBAL.guardar');
    this.formRevConsolidado.titulo = this.translate.instant(this.formRevConsolidado.titulo_i18n);
    this.formRevConsolidado.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

}
