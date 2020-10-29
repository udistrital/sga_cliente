import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';


@Component({
  selector: 'ngx-list-calendario-academico',
  templateUrl: './list-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss']
})
export class ListCalendarioAcademicoComponent implements OnInit {

  settings: any;
  data: any[];
  activetab: boolean = false;

  constructor(
    private translate: TranslateService
  ) {
    this.createTable();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
  }

  ngOnInit() {
    //datos provisionales
    this.data = [
      {
        Nombre: "Calendario académico Posgrado 2020-III",
        Periodo: "2020-III",
        Dependencia: "Posgrado",
        Estado: "Activo"
      },
      {
        Nombre: "Calendario académico Pregrado 2020-III",
        Periodo: "2020-III",
        Dependencia: "Pregrado",
        Estado: "Activo"
      },
      {
        Nombre: "Calendario académico Pregrado 2020-I",
        Periodo: "2020-I",
        Dependencia: "Pregrado",
        Estado: "Inactivo"
      },
    ]
  }

  createTable() {
    this.settings = {
      columns: {
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          width: '20%',
          editable: false
        },
        Periodo: {
          title: this.translate.instant('calendario.periodo'),
          width: '20%',
          editable: false
        },
        Dependencia: {
          title: this.translate.instant('calendario.dependencia'),
          width: '20%',
          editable: false
        },
        Estado: {
          title: this.translate.instant('calendario.estado'),
          width: '20%',
          editable: false
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      }
    }
  }

  onCreate(event: any) {
    this.activateTab();
  }

  onEdit(event: any) {
    this.activateTab();
  }

  onDelete(event: any) {

  }

  changeTab(event: any) {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.activetab = false;
    } else {
      this.activetab = true;
    }
  }

  activateTab() {
    this.activetab = !this.activetab;
  }

}
