import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'definir-conceptos',
  templateUrl: './definir-conceptos.component.html',
  styleUrls: ['../derechos-pecuniarios.component.scss']
})
export class DefinirConceptosComponent implements OnInit {

  vigencias: any[];
  tablaConceptos: any;
  datosConceptos: LocalDataSource;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.vigencias = [{Id: 1, Nombre: '2020'}, {Id: 2, Nombre: '2019'}, {Id: 3, Nombre: '2018'}]
    this.crearTablaConceptos();
    this.datosConceptos = new LocalDataSource();
  }

  crearTablaConceptos() {
    this.tablaConceptos = {
      columns: {
        Codigo: {
          title: this.translate.instant('derechos_pecuniarios.codigo'),
          editable: false,
          width: '30%',
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          width: '30%',
          editable: false,
        },
        Factor: {
          title: this.translate.instant('derechos_pecuniarios.factor'),
          editable: false,
          width: '15%',
          filter: false,
        },
        Costo: {
          title: this.translate.instant('derechos_pecuniarios.costo'),
          editable: false,
          width: '25%',
          filter: false,
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
      },
      noDataMessage: this.translate.instant('derechos_pecuniarios.no_data'),
    }
  }

  calcularValores() {
    if (this.datosConceptos.count() === 0) {
      this.popUpManager.showAlert('info', this.translate.instant('derechos_pecuniarios.no_conceptos'));
    }
  }

}
