import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Periodo } from './../../../@core/data/models/periodo/periodo';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';


@Component({
  selector: 'ngx-list-periodo',
  templateUrl: './list-periodo.component.html',
  styleUrls: ['./list-periodo.component.scss'],
  })
export class ListPeriodoComponent implements OnInit {
  uid: number;
  cambiotab: boolean = false;
  settings: any;
  info_periodo: Periodo;
  year = [];
  periodo = [];
  opcionSeleccionadoAno: string  = '0';
  verSeleccionAno: string        = '';
  opcionSeleccionadoPeriodo: string  = '0';
  verSeleccionPeriodo: string        = '';
  verSeleccionPeriodoArre: string        = '';
  @Output() eventChange = new EventEmitter();

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
  ) {
    this.loadData();
    this.cargarCampos();
    this.loadAno();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    this.cargarCampos();
    });
  }

  cargarCampos() {
    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      mode: 'external',
      columns: {
        Year: {
          title: this.translate.instant('GLOBAL.ano'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Ciclo: {
          title: this.translate.instant('GLOBAL.periodo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        CodigoAbreviacion: {
          title: this.translate.instant('GLOBAL.codigo_abreviacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Activo: {
          title: this.translate.instant('GLOBAL.activo'),
          // type: 'boolean;',
          valuePrepareFunction: (value) => {
            return value ? this.translate.instant('GLOBAL.activo') : this.translate.instant('GLOBAL.inactivo');
          },
        },
        InicioVigencia: {
          title: this.translate.instant('GLOBAL.fecha_inicio'),
          valuePrepareFunction: value => moment(value).format('DD-MM-YYYY'),
        },
        FinVigencia: {
          title: this.translate.instant('GLOBAL.fecha_fin'),
          valuePrepareFunction: value => moment(value).format('DD-MM-YYYY'),
        }
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.parametrosService.get('periodo?query=CodigoAbreviacion:PA&limit=0').subscribe(res => {
      if (res !== null) {
        const data = <any[]>res['Data'];
        this.source.load(data);
          }
    });
  }

  loadAno() {
    this.parametrosService.get('periodo?query=CodigoAbreviacion:VG&fields=Year')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Status === '200') {
          this.year = <any[]>res['Data'];
          
/*           this.year = this.year.filter((valorActual, indiceActual, arreglo) => {
          return arreglo.findIndex(valorDelArreglo => JSON.stringify(valorDelArreglo) === JSON.stringify(valorActual)) === indiceActual
        });
 */
        }
      },
      (error: HttpErrorResponse) => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status))
      });
  }
  capturarAno() {
    // Pasamos el valor seleccionado a la variable verSeleccion
  if (this.opcionSeleccionadoAno == null) {
    this.popUpManager.showAlert(
      this.translate.instant('GLOBAL.atencion'),
      this.translate.instant('periodo.seleccione_ano')
    );
  } else {
    this.verSeleccionAno = '' + this.opcionSeleccionadoAno['Year'];
    this.loadPeriodo();
  }
}
  loadPeriodo() {
  this.parametrosService.get('periodo?query=Year:' + this.verSeleccionAno + ',CodigoAbreviacion:PA&fields=Ciclo')
  .subscribe(res => {
    const r = <any>res;
    if (res !== null && r.Status === '200') {
      this.periodo = <any[]>res['Data'];
    }
  },
  (error: HttpErrorResponse) => {
    this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
  });
}
capturarPeriodo() {
  if (this.opcionSeleccionadoPeriodo == null) {
    this.popUpManager.showAlert(
      this.translate.instant('GLOBAL.atencion'),
      this.translate.instant('periodo.seleccione_ano')
    );
  }else {
  this.verSeleccionPeriodo = this.opcionSeleccionadoPeriodo['Ciclo'];
  this.traerPeriodoSelect();
}
}
traerPeriodoSelect() {
    this.parametrosService.get('periodo?query=Year:' + this.verSeleccionAno + ',Ciclo:' + this.verSeleccionPeriodo)
    .subscribe(res => {
      const r = <any>res;
      if (res !== null && r.Status === '200') {
        this.info_periodo = <Periodo>(<any[]> res['Data'])[0];
      }
    },
    (error: HttpErrorResponse) => {
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status))
    });
  }

   ActivarPeriodo() {
     if (this.info_periodo == null) {
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.atencion'),
          this.translate.instant('periodo.seleccione_periodo')
        );
     } else {
     if (this.info_periodo.Activo === true) {
    this.popUpManager.showAlert(
      this.translate.instant('GLOBAL.atencion'),
      this.translate.instant('periodo.habilitado')
    );
  } else {
    this.popUpManager.showConfirmAlert(this.translate.instant('periodo.periodo_habilitar'))
    .then((ok) => {
      if (ok.value) {
        this.info_periodo.Activo = true;
        this.parametrosService.put('periodo', this.info_periodo)
          .subscribe(res => {
            this.eventChange.emit(true);
            this.loadData();
            this.popUpManager.showSuccessAlert(this.translate.instant('periodo.periodo_habilitado'));
          });
      }
    });
  }
}}
DeshabilitarPeriodo() {
  if (this.info_periodo == null) {
    this.popUpManager.showAlert(
      this.translate.instant('GLOBAL.atencion'),
      this.translate.instant('periodo.seleccione_periodo')
    );
 } else {
  if (this.info_periodo.Activo === false) {
    this.popUpManager.showAlert(
      this.translate.instant('GLOBAL.atencion'),
      this.translate.instant('periodo.deshabilitado')
    )
  } else {
    this.popUpManager.showConfirmAlert(this.translate.instant('periodo.periodo_deshabilitar'))
    .then((ok) => {
      if (ok.value) {
        this.info_periodo.Activo = false;
        this.parametrosService.put('periodo', this.info_periodo)
          .subscribe(res => {
            this.eventChange.emit(true);
            this.loadData();
            this.popUpManager.showSuccessAlert(this.translate.instant('periodo.periodo_deshabilitado'));
          });
      }
    });
  }
 }
}


  ngOnInit() {
  }

  onEdit(event): void {
    this.uid = event.data.Id;
    this.activetab();
  }

  onCreate(event): void {
    this.uid = 0;
    this.activetab();
  }

  onDelete(event): void {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('periodo.seguro_eliminar_periodo'),
      this.translate.instant('GLOBAL.eliminar')
    ).then((willDelete) => {
      if (willDelete.value) {
        this.parametrosService.delete('periodo', event.data).subscribe(res => {
          if (res !== null) {
            this.loadData();
            this.popUpManager.showSuccessAlert(this.translate.instant('periodo.periodo_eliminado'));
          }
        });
      }
    });
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }


  itemselec(event): void {
    // console.log("afssaf");
  }

}
