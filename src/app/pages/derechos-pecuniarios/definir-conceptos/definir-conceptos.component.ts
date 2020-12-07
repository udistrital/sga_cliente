import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { DialogoConceptosComponent } from '../dialogo-conceptos/dialogo-conceptos.component';
import { Concepto } from '../../../@core/data/models/derechos-pecuniarios/concepto';

@Component({
  selector: 'ngx-definir-conceptos',
  templateUrl: './definir-conceptos.component.html',
  styleUrls: ['../derechos-pecuniarios.component.scss']
})
export class DefinirConceptosComponent implements OnInit, OnChanges {

  vigencias: any[];
  tablaConceptos: any;
  datosConceptos: LocalDataSource;
  salario: number;

  @Input()
  datosCargados: any[] = [];

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.vigencias = [{Id: 1, Nombre: '2020'}, {Id: 2, Nombre: '2019'}, {Id: 3, Nombre: '2018'}]
    this.crearTablaConceptos();
    this.datosConceptos = new LocalDataSource();
    this.salario = 880000;
  }

  ngOnChanges() {
    this.datosConceptos.load(this.datosCargados);
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
    } else{
      var totalConcepto=this.datosCargados.length;
      var resultado = [];
      var smldv = this.salario/30;
      for (var i = 0; i < totalConcepto; i++){
        this.datosCargados[i].Costo = smldv*this.datosCargados[i].Factor;
        console.log(this.datosCargados[i].Nombre)
        console.log(this.datosCargados[i].Costo)
      }
    }
  }

  agregarConcepto() {
    const configDialogo = new MatDialogConfig();
    configDialogo.width = '900px';
    configDialogo.height = '350px';
    const conceptoDialogo = this.dialog.open(DialogoConceptosComponent, configDialogo);
    conceptoDialogo.afterClosed().subscribe((concepto: Concepto) => {
      console.log(concepto);
      this.datosConceptos.append(concepto);
      //POST
    });
  }

  editarConcepto(event) {
    const configDialogo = new MatDialogConfig();
    configDialogo.width = '900px';
    configDialogo.height = '350px';
    configDialogo.data = event.data;
    const conceptoDialogo = this.dialog.open(DialogoConceptosComponent, configDialogo);
    conceptoDialogo.afterClosed().subscribe((concepto: Concepto) => {
      console.log(concepto);
      //PUT
    });
  }

  inactivarConcepto(event) {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('derechos_pecuniarios.inactivar_concepto')
    ).then(willDelete => {
      if(willDelete.value) {
        //inactivar
      }
    })
  }

}
