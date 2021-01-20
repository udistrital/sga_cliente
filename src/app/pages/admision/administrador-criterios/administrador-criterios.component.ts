import { Component, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Criterio } from '../../../@core/data/models/admision/criterio';
import { DialogoCriteriosComponent } from '../dialogo-criterios/dialogo-criterios.component';

@Component({
  selector: 'administrador-criterios',
  templateUrl: './administrador-criterios.component.html',
  styleUrls: ['./administrador-criterios.component.scss']
})
export class AdministradorCriteriosComponent implements OnInit {

  criterios: any[];
  criterioSettings: any;
  criterioSource: LocalDataSource;
  subcriterioSettings: any;

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
  ) {
    this.inicializarTablas()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.inicializarTablas()
    })
  }

  ngOnInit() {
  }

  inicializarTablas() {
    this.criterioSettings = {
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          width: '20%',
          editable: false,
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          width: '70%',
          editable: false,
        }
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
    }

    this.subcriterioSettings = {
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          width: '30%',
          editable: false,
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          width: '30%',
          editable: false,
        },
        Estado: {
          title: this.translate.instant('GLOBAL.estado'),
          width: '30%',
          editable: false,
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
    }
  }

  agregarCriterio() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '800px';
    dialogConfig.height = '300px';
    dialogConfig.data = {};
    const criterioDialog = this.dialog.open(DialogoCriteriosComponent, dialogConfig);
    criterioDialog.afterClosed().subscribe((criterio: Criterio) => {
      if (criterio !== undefined) {
        console.log(criterio)
      }
    });
  }

  editarCriterio(event) {

  }

  inactivarCriterio(event) {

  }

  agregarSubcriterio(event, criterio) {

  }

  editarSubcriterio(event, criterio) {

  }

  inactivarSubcriterio(event, criterio) {

  }

}
