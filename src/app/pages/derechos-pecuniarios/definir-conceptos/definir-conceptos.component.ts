import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { DialogoConceptosComponent } from '../dialogo-conceptos/dialogo-conceptos.component';
import { Concepto } from '../../../@core/data/models/derechos-pecuniarios/concepto';
import { ConceptoPost } from '../../../@core/data/models/derechos-pecuniarios/concepto-post';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { ConceptoPut } from '../../../@core/data/models/derechos-pecuniarios/concepto-put';

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
  vigenciaActual: number;
  
  @Input()
  mostrarCalcular: boolean = false;

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

  ngOnChanges() {
    this.datosConceptos.load(this.datosCargados);
  }

  crearTablaConceptos() {
    this.tablaConceptos = {
      columns: {
        Id: {
          title: 'Id',
          editable: false,
          width: '5%',
        },
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
    } else {
      // aqui va la función de calcular los valores y el put para guardarlos
    }
  }

  cargarSalario(event) {
    this.vigenciaActual = event.value;
    this.parametrosService.get('parametro_periodo?limit=0&query=PeriodoId__Id:'+this.vigenciaActual).subscribe(
      response => {
        const data: any[] = response["Data"];
        if (Object.keys(data[0]).length > 0) {
          this.salario = JSON.parse(data[0]["Valor"]).Valor; // puede cambiar 
        } else {
          this.salario = 0;
          this.popUpManager.showErrorToast(this.translate.instant('derechos_pecuniarios.no_salario'));
        }
      },
      error => {
        this.salario = 0;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );

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

  agregarConcepto() {
    const configDialogo = new MatDialogConfig();
    configDialogo.width = '900px';
    configDialogo.height = '350px';
    const conceptoDialogo = this.dialog.open(DialogoConceptosComponent, configDialogo);
    conceptoDialogo.afterClosed().subscribe((concepto: Concepto) => {
      if (concepto !== undefined) {
        const nuevoConcepto = new ConceptoPost(); 
        nuevoConcepto.Concepto = {
          Nombre: concepto.Nombre,
          CodigoAbreviacion: concepto.Codigo,
          Activo: true,
          TipoParametroId: { Id: 2 }, // Identificador que agrupa los parametros de derechos pecuniarios
        };
        nuevoConcepto.Factor = {
          Valor: { NumFactor: concepto.Factor },
        };
        nuevoConcepto.Vigencia = {
          Id: this.vigenciaActual
        }
        this.sgaMidService.post('derechos_pecuniarios', nuevoConcepto).subscribe(
          response => {
            concepto.Id = response["Concepto"]["Id"];
            concepto.FactorId = response["Factor"]["Id"];
            this.datosConceptos.append(concepto);
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      }
    });
  }

  editarConcepto(event) {
    const configDialogo = new MatDialogConfig();
    configDialogo.width = '900px';
    configDialogo.height = '350px';
    configDialogo.data = this.datosCargados.find(obj => event.data.Id === obj.Id);
    const conceptoDialogo = this.dialog.open(DialogoConceptosComponent, configDialogo);
    conceptoDialogo.afterClosed().subscribe((concepto: Concepto) => {
      if (concepto !== undefined) {
        const updateConcepto = new ConceptoPut(); 
        updateConcepto.Concepto = {
          Id: concepto.Id,
          Nombre: concepto.Nombre,
          CodigoAbreviacion: concepto.Codigo,
          Activo: true,
          TipoParametroId: { Id: 2 }, // Identificador que agrupa los parametros de derechos pecuniarios
        };
        updateConcepto.Factor = {
          Id: configDialogo.data.FactorId,
          Valor: { NumFactor: concepto.Factor },
        };
        updateConcepto.Vigencia = {
          Id: this.vigenciaActual
        }
        this.sgaMidService.put('derechos_pecuniarios/update/'+event.data.Id, updateConcepto).subscribe(
          response => {
            this.popUpManager.showSuccessAlert(this.translate.instant('derechos_pecuniarios.actualizado'));
            this.datosConceptos.update(event.data, concepto);
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      }
    });
  }

  inactivarConcepto(event) {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('derechos_pecuniarios.inactivar_concepto')
    ).then(willDelete => {
      if(willDelete.value) {
        this.sgaMidService.delete('derechos_pecuniarios', event.data).subscribe(
          response => {
            this.popUpManager.showSuccessAlert(this.translate.instant('derechos_pecuniarios.inactivo'));
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          }
        )
      }
    });
  }

}
