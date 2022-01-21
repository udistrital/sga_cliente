import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CustomizeButtonComponent } from '../../../@theme/components/customize-button/customize-button.component';

@Component({
  selector: 'list-notas',
  templateUrl: './list-notas.component.html',
  styleUrls: ['./list-notas.component.scss']
})
export class ListNotasComponent implements OnInit {
  settings: any;
  dataSource: LocalDataSource;

  constructor(
    private translate: TranslateService,
    private router: Router,
  ) { 
    this.dataSource = new LocalDataSource();

  }

  ngOnInit() {
    this.createTable();
    this.loadData();
  }

  createTable() {
    this.settings = {
      actions: false,
      columns: {
        Nivel: {
          title: this.translate.instant('notas.nivel'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Codigo: {
          title: this.translate.instant('GENERAL.codigo'),
          editable: false,
          width: '30%',
          filter: false,
        },
        Asignatura: {
          title: this.translate.instant('notas.asignatura'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Periodo: {
          title: this.translate.instant('notas.periodo'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Grupo: {
          title: this.translate.instant('notas.grupo'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Inscritos: {
          title: this.translate.instant('notas.inscritos'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Carrera: {
          title: this.translate.instant('notas.carrera'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Opcion: {
          title: this.translate.instant('notas.opcion'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => {
              this.router.navigate([`pages/notas/crud-notas/${data.Id}`])
            })
          },
        },
      },
      mode: 'external',
    }
  }


  loadData() {
    const data = [{
      Nivel: 'Pregrado',
      Codigo: 1125,
      Asignatura: "Bases de datos",
      Periodo: "2",
      Grupo: '1',
      Inscritos: 15,
      Carrera: "Ingenieria de sistemas",
      Opcion: {
        icon: 'fa fa-pencil fa-2x',
        label: 'Registrar notas',
        class: "btn btn-primary"
      },
    }]
    this.dataSource.load(data)
  }
}
