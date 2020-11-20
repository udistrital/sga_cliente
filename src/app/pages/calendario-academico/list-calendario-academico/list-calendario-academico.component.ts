import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { SgaMidService } from '../../../@core/data/sga_mid.service'
import { Calendario } from '../../../@core/data/models/calendario-academico/calendario';
import { PopUpManager } from '../../../managers/popUpManager';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AsignarCalendarioProyectoComponent } from '../asignar-calendario-proyecto/asignar-calendario-proyecto.component';
import { EventoService } from '../../../@core/data/evento.service';


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
  loading: boolean = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private sgaMidService: SgaMidService,
    private eventoService: EventoService,
    private popUpmanager: PopUpManager,
    private dialog: MatDialog,
  ) {
    this.dataSource = new LocalDataSource();
    this.createTable();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
  }

  ngOnInit() {
    this.loading = true;
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
        this.loading = false;
      },
      error => {
        this.popUpmanager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
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
        // this.router.navigate(['../detalle-calendario/'+event.data.Id], {relativeTo: this.route});
        this.router.navigate(['../detalle-calendario', {Id:event.data['Id']} ], {relativeTo: this.route});
        break;
      case 'edit':
        this.onEdit(event);
        break;
      case 'delete':
        this.onDelete(event);
        break;
      case 'assign':
        this.onAssign(event);
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

  onAssign(event: any) {
    const assignConfig = new MatDialogConfig();
    assignConfig.width = '800px';
    assignConfig.height = '400px';
    
    this.eventoService.get('calendario/'+event.data.Id).subscribe(
      (calendar: Calendario) => {
        assignConfig.data = {calendar: calendar, data: event.data};
        const newAssign = this.dialog.open(AsignarCalendarioProyectoComponent, assignConfig);
        newAssign.afterClosed().subscribe((data) => {
          if (data !== undefined) {
            calendar.DependenciaId = JSON.stringify({proyectos: data})
            this.eventoService.put('calendario', calendar).subscribe(
              response => {
                this.popUpmanager.showSuccessAlert(this.translate.instant('calendario.proyectos_exito'));
              },
              error => {
                this.popUpmanager.showErrorToast(this.translate.instant('ERROR.general'));
              },
            );
          }
        });
      },
      error => {
        this.popUpmanager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    )
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
