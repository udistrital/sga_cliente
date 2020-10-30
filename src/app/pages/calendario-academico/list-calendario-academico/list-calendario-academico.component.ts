import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';


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
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
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
        edit: false,
        delete: false,
        position: 'right',
        custom: [
          {
            name: 'view',
            title: '<i class="nb-list"></i>'
          },
          {
            name: 'edit',
            title: '<i class="nb-edit"></i>',
          },
          {
            name: 'delete',
            title: '<i class="nb-trash"></i>'
          }
        ]
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
    }
  }

  onAction(event) {
    switch (event.action) {
      case 'view':
        this.router.navigate(['../detalle-calendario'], {relativeTo: this.route});
        break;
      case 'edit':
        this.onEdit(event);
        break;
      case 'delete':
        this.onDelete(event);
        break;
      case 'clone':
        break;
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
