import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Concepto } from '../../../@core/data/models/derechos-pecuniarios/concepto';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-copiar-conceptos',
  templateUrl: './copiar-conceptos.component.html',
  styleUrls: ['../derechos-pecuniarios.component.scss'],
})
export class CopiarConceptosComponent implements OnInit {
  vigenciaElegida: FormControl;
  vigencias: any[];
  tablaConceptos: any;
  datosConceptos: LocalDataSource;
  datosCargados: Concepto[];

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private parametrosService: ParametrosService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
  ) {
    this.vigenciaElegida = new FormControl('');
    this.datosConceptos = new LocalDataSource();
  }

  ngOnInit() {
    this.parametrosService
      .get('periodo?query=CodigoAbreviacion:VG&limit=0&sortby=Id&order=desc')
      .subscribe(
        response => {
          this.vigencias = response['Data'];
        },
        error => {
          this.popUpManager.showErrorToast(
            this.translate.instant('ERROR.general'),
          );
        },
      );
    this.crearTablaConceptos();
  }

  crearTablaConceptos() {
    this.tablaConceptos = {
      columns: {
        Codigo: {
          title: this.translate.instant('derechos_pecuniarios.codigo'),
          editable: false,
          width: '40%',
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          width: '40%',
          editable: false,
        },
        Factor: {
          title: this.translate.instant('derechos_pecuniarios.factor'),
          editable: false,
          width: '20%',
          filter: false,
        },
      },
      mode: 'external',
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      /*
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
      },
*/
      noDataMessage: this.translate.instant('derechos_pecuniarios.no_data'),
    };
  }

  copiarConceptos() {
    // copiar conceptos
    // redirige a la de definir con los datos copiados
    const vigenciaClonar = {
      VigenciaActual: this.vigencias.filter(vig => vig.Activo === true)[0].Id,
      VigenciaAnterior: this.vigenciaElegida.value,
    };

    this.sgaMidService
      .post('derechos_pecuniarios/clonar', vigenciaClonar)
      .subscribe(
        response => {
          this.router.navigate(
            ['../definir-conceptos', { Id: vigenciaClonar.VigenciaActual }],
            { relativeTo: this.route },
          );
        },
        error => {
          this.popUpManager.showErrorToast(
            this.translate.instant('ERROR.general'),
          );
        },
      );
  }

  cambiarVigencia() {
    this.datosCargados = [];
    this.sgaMidService
      .get('derechos_pecuniarios/' + this.vigenciaElegida.value)
      .subscribe(
        response => {
          const data: any[] = response.Data;
          if (Object.keys(data).length > 0 && Object.keys(data[0]).length > 0) {
            data.forEach(obj => {
              const concepto = new Concepto();
              concepto.Id = obj.ParametroId.Id;
              concepto.Codigo = obj.ParametroId.CodigoAbreviacion;
              concepto.Nombre = obj.ParametroId.Nombre;
              concepto.Factor = JSON.parse(obj.Valor).NumFactor;
              this.datosCargados.push(concepto);
            });
          } else {
            this.popUpManager.showAlert(
              'info',
              this.translate.instant('derechos_pecuniarios.no_conceptos'),
            );
          }
          this.datosConceptos.load(this.datosCargados);
        },
        error => {
          this.popUpManager.showErrorToast(
            this.translate.instant('ERROR.general'),
          );
        },
      );
  }
}
