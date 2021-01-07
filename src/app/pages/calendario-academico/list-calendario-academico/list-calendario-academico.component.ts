import { Component, OnInit, Output, Input } from '@angular/core';
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
  calendarForNew: boolean = false;
  nivel_load = [{ nombre: 'Pregrado', id: 14 }, { nombre: 'Posgrado', id: 15 }];
  loading: boolean = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private sgaMidService: SgaMidService,
    private eventoService: EventoService,
    private dialog: MatDialog,
    private popUpManager: PopUpManager,
  ) {
    this.dataSource = new LocalDataSource();
    this.createTable();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
  }
  recargarDespuesClon(newItem) {
    this.calendarForEditId = newItem
    console.info("recarga")
    console.info(this.calendarForEditId)
    this.ngOnInit()
  }

  ngOnInit() {
    console.info("LLAMADO")
    this.loading = true;
    this.data = []
    this.sgaMidService.get('consulta_calendario_academico?limit=0').subscribe(
      (response: any )=> {
        const r = <any>response;
        if (response !== null && r.Response.Code == '404') {
          // this.popUpManager.showErrorToast(this.translate.instant('ERROR.404'));
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.sin_calendarios'));
        } else if (response !== null && r.Response.Code == '400') {
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.sin_calendarios'));
        } else {
          response.Response.Body[1].map(calendar => {
            this.data.push({
              Id: calendar.Id,
              Nombre: calendar.Nombre,
              Periodo: calendar.Periodo,
              Dependencia: this.nivel_load.filter(nivel => nivel.id === calendar.Nivel)[0].nombre,
              Estado: calendar.Activo ? this.translate.instant('GLOBAL.activo') : this.translate.instant('GLOBAL.inactivo'),
            });
          });
          this.createTable();
        }
        this.loading = false;
        console.info(this.loading)
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }

  createTable() {
    this.settings = {
      columns: {
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
            title: '<i class="nb-compose" data-toggle="tooltip" title="' + this.translate.instant('calendario.tooltip_asignar_proyecto') + '"></i>',
          },
          {
            name: 'clone',
            title: '<i class="nb-plus-circled" data-toggle="tooltip" title="' + this.translate.instant('calendario.tooltip_clonar') + '"></i>',
          },
          {
            name: 'view',
            title: '<i class="nb-home" data-toggle="tooltip" title="' + this.translate.instant('calendario.tooltip_detalle') + '"></i>',
          },
          {
            name: 'edit',
            title: '<i class="nb-edit" data-toggle="tooltip" title="' + this.translate.instant('calendario.tooltip_editar') + '"></i>',
          },
          {
            name: 'delete',
            title: '<i class="nb-trash" data-toggle="tooltip" title="' + this.translate.instant('calendario.tooltip_inactivar') + '"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="nb-plus" data-toggle="tooltip" title="' + this.translate.instant('calendario.tooltip_crear') + '"></i>',
      },
    }
    this.dataSource.load(this.data);
  }

  onAction(event) {
    switch (event.action) {
      case 'view':
        this.router.navigate(['../detalle-calendario', { Id: event.data['Id'] }], { relativeTo: this.route });
        break;
      case 'edit':
        this.onEdit(event);
        break;
      case 'clone':
        this.onUpdate(event);
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
    this.activateTab()
  }

  onUpdate(event: any) {
    this.activateTab(event.data.Id, true);
  }

  onEdit(event: any) {
    this.activateTab(event.data.Id); // ID del calendario seleccionado para edición
  }

  onDelete(event: any) {
    this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_continuar_inhabilitar_calendario'))
      .then(willDelete => {
        if (willDelete.value) {
          this.sgaMidService.put('consulta_calendario_academico/inhabilitar_calendario/' + event.data.Id, JSON.stringify({ "id": event.data.Id })).subscribe(
            (response: any) => {
              if (JSON.stringify(response) != "200") {
                this.popUpManager.showErrorAlert(this.translate.instant('calendario.calendario_no_inhabilitado'));
              } else {
                this.popUpManager.showSuccessAlert(this.translate.instant('calendario.calendario_inhabilitado'));
                this.ngOnInit();
              }
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('calendario.error_registro_calendario'));
            },
          );
        }
      });
  }

  onAssign(event: any) {
    const assignConfig = new MatDialogConfig();
    assignConfig.width = '800px';
    assignConfig.height = '300px';

    this.eventoService.get('tipo_evento?limit=0&query=CalendarioID__Id:' + event.data.Id).subscribe(
      response => {
        if (Object.keys(response[0]).length === 0) {
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.no_asignable'))
        } else {
          this.eventoService.get('calendario/' + event.data.Id).subscribe(
            (calendar: Calendario) => {
              assignConfig.data = { calendar: calendar, data: event.data };
              const newAssign = this.dialog.open(AsignarCalendarioProyectoComponent, assignConfig);
              newAssign.afterClosed().subscribe((data) => {
                if (data !== undefined) {
                  calendar.DependenciaId = JSON.stringify({ proyectos: data })
                  this.eventoService.put('calendario', calendar).subscribe(
                    response => {
                      this.popUpManager.showSuccessAlert(this.translate.instant('calendario.proyectos_exito'));
                    },
                    error => {
                      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
                    },
                  );
                }
              });
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            },
          );
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  changeTab(event: any) {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.activetab = false;
    } else {
      this.activetab = true;
    }
  }

  activateTab(calendarId = 0, calendarState = false) {
    this.activetab = !this.activetab;
    this.calendarForEditId = calendarId;
    this.calendarForNew = calendarState;
  }

}
