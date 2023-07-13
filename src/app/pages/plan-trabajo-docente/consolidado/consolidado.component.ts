import { Component, OnInit } from '@angular/core';
import { VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { FORM_CONSOLIDADO, FORM_RESPUESTA_DEC } from '../forms/form-consolidado';

@Component({
  selector: 'consolidado',
  templateUrl: './consolidado.component.html',
  styleUrls: ['./consolidado.component.scss']
})
export class ConsolidadoComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbConsolidados: Object;
  dataConsolidados: LocalDataSource;

  formNewEditConsolidado: any;
  dataNewEditConsolidado: any;
  newEditConsolidado: boolean;

  formRespuestaConsolidado: any;
  dataRespuestaConsolidado: any;
  respuestaConsolidado: boolean;
  
  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager
    ) {
      this.dataConsolidados = new LocalDataSource();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
        this.buildFormNewEditConsolidado();
        this.buildFormRespuestaConsolidado();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formNewEditConsolidado = {...FORM_CONSOLIDADO};
    this.formRespuestaConsolidado = {...FORM_RESPUESTA_DEC};
    this.buildFormNewEditConsolidado();
    this.buildFormRespuestaConsolidado();
    this.createTable();
    const data = [
      {
        proyecto_curricular: 'Ing en Comedia',
        codigo: '123',
        fecha_radicado: '02/03/2020',
        periodo_academico: '2023-1',
        revision_decanatura: {value: undefined, type: 'ver', disabled: false},
        gestion: {value: undefined, type: 'editar', disabled: false},
        estado: 'por definir',
        enviar: {value: undefined, type: 'enviar', disabled: false},
      }
    ]
    this.dataConsolidados.load(data);
  }

  createTable() {
    this.tbConsolidados = {
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
        revision_decanatura: {
          title: this.translate.instant('ptd.revision_decanatura'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              this.vista = VIEWS.FORM;
              this.respuestaConsolidado = true;
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
              this.newEditConsolidado = true;
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

  buildFormNewEditConsolidado() {
    this.formNewEditConsolidado.btn = this.translate.instant('GLOBAL.guardar');
    this.formNewEditConsolidado.titulo = this.translate.instant(this.formNewEditConsolidado.titulo_i18n);
    this.formNewEditConsolidado.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  buildFormRespuestaConsolidado() {
    this.formRespuestaConsolidado.btn = this.translate.instant('GLOBAL.aceptar');
    //this.formRespuestaConsolidado.titulo = this.translate.instant(this.formNewEditConsolidado.titulo_i18n);
    this.formRespuestaConsolidado.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  regresar() {
    this.vista = VIEWS.LIST;
    this.newEditConsolidado = false;
    this.respuestaConsolidado = false;
  }
}
