import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
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
  styleUrls: ['../derechos-pecuniarios.component.scss'],
})
export class DefinirConceptosComponent implements OnInit, OnChanges {
  vigencias: any[];
  tablaConceptos: any;
  datosConceptos: LocalDataSource;
  salario: string;
  salarioValor: number;
  vigenciaActual: FormControl;
  guardable: boolean = false;
  loading: boolean = false;

  @Input()
  mostrarCalcular: boolean = false;

  @Input()
  datosCargados: Concepto[] = [];

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private dialog: MatDialog,
    private parametrosService: ParametrosService,
    private sgaMidService: SgaMidService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.vigenciaActual = new FormControl('');
    this.datosConceptos = new LocalDataSource();
  }

  ngOnInit() {
    this.parametrosService
      .get('periodo?query=CodigoAbreviacion:VG&limit=0&sortby=Id&order=desc')
      .subscribe(
        response => {
          this.vigencias = response['Data'];
          this.activatedRoute.paramMap.subscribe(
            params => {
              if (params.get('Id') !== null) {
                this.vigenciaActual.setValue(parseInt(params.get('Id')));
                this.cargarSalario();
              }
            },
            error => {
              // pass
            },
          );
        },
        error => {
          this.popUpManager.showErrorToast(
            this.translate.instant('ERROR.general'),
          );
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
          valuePrepareFunction: (value: number) =>
            value.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
            }),
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent:
          '<i class="nb-plus" title="' +
          this.translate.instant('derechos_pecuniarios.tooltip_crear') +
          '"></i>',
        createButtonContent:
          '<i class="nb-checkmark" title="' +
          this.translate.instant('derechos_pecuniarios.tooltip_guardar') +
          '"></i>',
        cancelButtonContent:
          '<i class="nb-close" title="' +
          this.translate.instant('derechos_pecuniarios.tooltip_cancelar') +
          '"></i>',
      },
      edit: {
        editButtonContent:
          '<i class="nb-edit" title="' +
          this.translate.instant('derechos_pecuniarios.tooltip_editar') +
          '"></i>',
        saveButtonContent:
          '<i class="nb-checkmark" title="' +
          this.translate.instant('derechos_pecuniarios.tooltip_guargar') +
          '"></i>',
        cancelButtonContent:
          '<i class="nb-close" title="' +
          this.translate.instant('derechos_pecuniarios.tooltip_cancelar') +
          '"></i>',
      },
      delete: {
        deleteButtonContent:
          '<i class="nb-trash" title="' +
          this.translate.instant('derechos_pecuniarios.tooltip_eliminar') +
          '"></i>',
        confirmDelete: true,
      },
      noDataMessage: this.translate.instant('derechos_pecuniarios.no_data'),
    };
  }

  calcularValores() {
    if (this.datosConceptos.count() === 0) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('derechos_pecuniarios.no_conceptos_valores'),
      );
    } else {
      const totalConcepto = this.datosCargados.length;
      const datosAntiguos = [];
      const smldv = this.salarioValor / 30;
      for (let i = 0; i < totalConcepto; i++) {
        datosAntiguos[i] = this.datosCargados[i];
        switch (this.datosCargados[i].Codigo) {
          case '43':
            this.datosCargados[i].Costo =
              Math.round(
                (this.salarioValor * this.datosCargados[i].Factor) / 100,
              ) * 100;
            break;
          case '15':
            this.datosCargados[i].Costo =
              Math.round((smldv * this.datosCargados[i].Factor) / 50) * 50;
            break;
          default:
            this.datosCargados[i].Costo =
              Math.round((smldv * this.datosCargados[i].Factor) / 100) * 100;
        }
        this.datosConceptos.update(datosAntiguos[i], this.datosCargados[i]);
      }
      this.guardable = true;
    }
  }

  guardarValores() {
    if (this.datosConceptos.count() === 0) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('derechos_pecuniarios.no_conceptos_valores'),
      );
    } else {
      this.popUpManager
        .showConfirmAlert(
          this.translate.instant('derechos_pecuniarios.confirmar_guardar'),
        )
        .then(willSave => {
          if (willSave.value) {
            this.loading = true;
            this.sgaMidService
              .post('derechos_pecuniarios/actualizar_valor/', this.datosCargados)
              .subscribe(
                response => {
                  this.guardable = false;
                  this.loading = false;
                  this.popUpManager.showSuccessAlert(
                    this.translate.instant(
                      'derechos_pecuniarios.registro_costo',
                    ),
                  );
                },
                error => {
                  this.popUpManager.showErrorToast(
                    this.translate.instant(
                      'derechos_pecuniarios.error_registro_costo',
                    ),
                  );
                },
              );
          }
        });
    }
  }

  cargarSalario() {
    this.parametrosService
      .get(
        'parametro_periodo?limit=0&query=PeriodoId__Id:' +
          this.vigenciaActual.value,
      )
      .subscribe(
        response => {
          const data: any[] = response['Data'];
          if (Object.keys(data[0]).length > 0) {
            const conceptoSalario = data.filter(
              obj => obj['ParametroId']['TipoParametroId']['Id'] === 1,
            )[0]; // identificador de Salario Minimo
            this.salarioValor = JSON.parse(conceptoSalario['Valor']).Valor; // puede cambiar
            this.salario = this.salarioValor.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
            });
          } else {
            this.salarioValor = 0;
            this.salario = '';
            this.popUpManager.showErrorToast(
              this.translate.instant('derechos_pecuniarios.no_salario'),
            );
          }
        },
        error => {
          this.salarioValor = 0;
          this.salario = '';
          this.popUpManager.showErrorToast(
            this.translate.instant('ERROR.general'),
          );
        },
      );

    this.datosCargados = [];
    this.sgaMidService
      .get('derechos_pecuniarios/' + this.vigenciaActual.value)
      .subscribe(
        response => {
          const data: any[] = response.Data;
          if (Object.keys(data).length > 0 && Object.keys(data[0]).length > 0) {
            data.forEach(obj => {
              const concepto = new Concepto();
              concepto.Id = obj.ParametroId.Id;
              concepto.Codigo = obj.ParametroId.CodigoAbreviacion;
              concepto.Nombre = obj.ParametroId.Nombre;
              concepto.FactorId = obj.Id;
              concepto.Factor = JSON.parse(obj.Valor).NumFactor;
              if (JSON.parse(obj.Valor).Costo !== undefined) {
                concepto.Costo = JSON.parse(obj.Valor).Costo;
              }
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

  agregarConcepto() {
    const configDialogo = new MatDialogConfig();
    configDialogo.width = '900px';
    configDialogo.height = '350px';
    const conceptoDialogo = this.dialog.open(
      DialogoConceptosComponent,
      configDialogo,
    );
    conceptoDialogo.afterClosed().subscribe((concepto: Concepto) => {
      if (concepto !== undefined) {
        const nuevoConcepto = new ConceptoPost();
        nuevoConcepto.Concepto = {
          Nombre: concepto.Nombre,
          CodigoAbreviacion: concepto.Codigo.toString(),
          Activo: true,
          TipoParametroId: { Id: 2 }, // Identificador que agrupa los parametros de derechos pecuniarios
        };
        nuevoConcepto.Factor = {
          Valor: { NumFactor: concepto.Factor },
        };
        nuevoConcepto.Vigencia = {
          Id: this.vigenciaActual.value,
        };
        this.sgaMidService
          .post('derechos_pecuniarios', nuevoConcepto)
          .subscribe(
            response => {
              concepto.Id = response['Data']['Concepto']['Id'];
              concepto.FactorId = response['Data']['Factor']['Id'];
              this.datosConceptos.append(concepto);
              this.popUpManager.showSuccessAlert(
                this.translate.instant('derechos_pecuniarios.concepto_exito'),
              );
            },
            error => {
              this.popUpManager.showErrorToast(
                this.translate.instant('ERROR.general'),
              );
            },
          );
      }
    });
  }

  editarConcepto(event) {
    const configDialogo = new MatDialogConfig();
    configDialogo.width = '900px';
    configDialogo.height = '350px';
    configDialogo.data = this.datosCargados.find(
      obj => event.data.Id === obj.Id,
    );
    const conceptoDialogo = this.dialog.open(
      DialogoConceptosComponent,
      configDialogo,
    );
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
          Id: this.vigenciaActual.value,
        };
        this.sgaMidService
          .put('derechos_pecuniarios/update/' + event.data.Id, updateConcepto)
          .subscribe(
            response => {
              this.popUpManager.showSuccessAlert(
                this.translate.instant('derechos_pecuniarios.actualizado'),
              );
              this.datosConceptos.update(event.data, concepto);
            },
            error => {
              this.popUpManager.showErrorToast(
                this.translate.instant('ERROR.general'),
              );
            },
          );
      }
    });
  }

  inactivarConcepto(event) {
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant('derechos_pecuniarios.inactivar_concepto'),
      )
      .then(willDelete => {
        if (willDelete.value) {
          this.sgaMidService
            .delete('derechos_pecuniarios', event.data)
            .subscribe(
              response => {
                this.popUpManager.showSuccessAlert(
                  this.translate.instant('derechos_pecuniarios.inactivo'),
                );
                this.cargarSalario();
              },
              error => {
                this.popUpManager.showErrorToast(
                  this.translate.instant('ERROR.general'),
                );
              },
            );
        }
      });
  }
}
