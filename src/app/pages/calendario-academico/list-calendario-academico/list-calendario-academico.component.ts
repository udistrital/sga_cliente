import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { SgaMidService } from '../../../@core/data/sga_mid.service'
import { Calendario } from '../../../@core/data/models/calendario-academico/calendario';


@Component({
  selector: 'ngx-list-calendario-academico',
  templateUrl: './list-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss'],
})
export class ListCalendarioAcademicoComponent implements OnInit {

  settings: any;
  data: any[] = [];
  dataSource: LocalDataSource;
  activetab: boolean = false;
  calendars: Calendario[] = [];
  calendarForEditId: number = 0;
  nivel_load = [{nombre: 'Pregrado', id: 14}, { nombre: 'Posgrado', id: 15}];

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private sgaMidService: SgaMidService,
  ) {
    this.dataSource = new LocalDataSource();
    this.createTable();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
  }

  ngOnInit() {
    this.sgaMidService.get('consulta_calendario_academico?limit=0').subscribe(
      response => {
        response.map(calendar => {
          this.data.push({
            Id: calendar.Id,
            Nombre: calendar.Nombre,
            Periodo: calendar.Periodo,
            Dependencia: this.nivel_load.filter(nivel => nivel.id === calendar.Nivel)[0].nombre,
            Estado: calendar.Activo ? this.translate.instant('GLOBAL.activo') : this.translate.instant('GLOBAL.inactivo'),
          });
        });
        this.createTable();
      },
      error => {
        console.error(error);
      },
    );
  }

  createTable() {
    this.settings = {
      columns: {
        Id: {
          title: 'ID',
          editable: false,
          width: '5%',
        },
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          width: '25%',
          editable: false,
        },
        Periodo: {
          title: this.translate.instant('calendario.periodo'),
          width: '15%',
          editable: false,
        },
        Dependencia: {
          title: this.translate.instant('calendario.dependencia'),
          width: '15%',
          editable: false,
        },
        Estado: {
          title: this.translate.instant('calendario.estado'),
          width: '15%',
          editable: false,
        },
      },
      mode: 'external',
      actions: {
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'assign',
            title: '<i class="nb-compose"></i>',
          },
          {
            name: 'view',
            title: '<i class="nb-home"></i>',
          },
          {
            name: 'edit',
            title: '<i class="nb-edit"></i>',
          },
          {
            name: 'delete',
            title: '<i class="nb-trash"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
    }
    this.dataSource.load(this.data);
  }

  onAction(event) {
    console.log(event)
    switch (event.action) {
      case 'view':
        this.router.navigate(['../detalle-calendario/'+event.data.Id], {relativeTo: this.route});
        break;
      case 'edit':
        this.onEdit(event);
        break;
      case 'delete':
        this.onDelete(event);
        break;
      case 'assign':
        break;
    }
  }

  onCreate(event: any) {
    this.activateTab();
  }

  onEdit(event: any) {
    this.activateTab(event.data.Id); // ID del calendario seleccionado para edición
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

  activateTab(calendarId = 0) {
    this.activetab = !this.activetab;
    this.calendarForEditId = calendarId;
  }

}
