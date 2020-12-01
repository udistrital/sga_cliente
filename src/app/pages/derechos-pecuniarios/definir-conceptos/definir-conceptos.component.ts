import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { DialogoConceptosComponent } from '../dialogo-conceptos/dialogo-conceptos.component';
import { Concepto } from '../../../@core/data/models/derechos-pecuniarios/concepto';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';

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
    private parametrosService: ParametrosService,
    private sgaMidService: SgaMidService,
  ) {
    this.datosConceptos = new LocalDataSource();
  }

  ngOnInit() {
    this.parametrosService.get('salario_minimo?limit=0&sortby=Id&order=desc').subscribe(
      response => {
        this.vigencias = response;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
    this.crearTablaConceptos();
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
    }
  }

  cargarSalario(event) {
    this.salario = this.vigencias.filter(vg => vg.Id === event.value)[0].Valor;
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
