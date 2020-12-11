import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Concepto } from '../../../@core/data/models/derechos-pecuniarios/concepto';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-consultar-conceptos',
  templateUrl: './consultar-conceptos.component.html',
  styleUrls: ['../derechos-pecuniarios.component.scss']
})
export class ConsultarConceptosComponent implements OnInit {

  vigencias: any[];
  tablaConceptos: any;
  datosConceptos: LocalDataSource;
  vigenciaActual: number;
  datosCargados: any[] = [];

  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private sgaMidService: SgaMidService,
    ) {
    this.datosConceptos = new LocalDataSource();
  }

  ngOnInit() {
    this.parametrosService.get('periodo?limit=0&sortby=Id&order=desc').subscribe(
      response => {
        this.vigencias = response["Data"];
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
    this.crearTablaConceptos();
  }

  cargarDatos(event) {
    this.vigenciaActual = event.value;
    this.datosCargados = [];
    this.sgaMidService.get('derechos_pecuniarios/' + this.vigenciaActual).subscribe(
      response => {
        var data: any[] = response['Data'];
        if (Object.keys(data).length > 0 && Object.keys(data[0]).length > 0) {
          data.forEach(obj => {
            var concepto = new Concepto();
            concepto.Id = obj.ParametroId.Id;
            concepto.Codigo = obj.ParametroId.CodigoAbreviacion;
            concepto.Nombre = obj.ParametroId.Nombre;
            concepto.FactorId = obj.Id
            concepto.Factor = JSON.parse(obj.Valor).NumFactor;
            this.datosCargados.push(concepto);
          });
        } else {
          this.popUpManager.showAlert('info', this.translate.instant('derechos_pecuniarios.no_conceptos'));
        }
        this.datosConceptos.load(this.datosCargados);
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );

  }

  crearTablaConceptos() {
    this.tablaConceptos = {
      columns: {
        Codigo: {
          title: this.translate.instant('derechos_pecuniarios.codigo'),
          editable: false,
          width: '25%',
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
      actions: {
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      noDataMessage: this.translate.instant('derechos_pecuniarios.no_data'),
    }
  }

}
