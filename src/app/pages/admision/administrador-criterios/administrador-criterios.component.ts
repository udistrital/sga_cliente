import { Component, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Criterio } from '../../../@core/data/models/admision/criterio';
import { DialogoCriteriosComponent } from '../dialogo-criterios/dialogo-criterios.component';
import { EvaluacionInscripcionService } from '../../../@core/data/evaluacion_inscripcion.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-administrador-criterios',
  templateUrl: './administrador-criterios.component.html',
  styleUrls: ['./administrador-criterios.component.scss']
})
export class AdministradorCriteriosComponent implements OnInit {

  criterios: Criterio[];
  criterioSettings: any;
  criterioSource: LocalDataSource;
  subcriterioSettings: any;
  dialogConfig: MatDialogConfig;

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private admisiones: EvaluacionInscripcionService,
    private popUpManager: PopUpManager,
  ) {
    this.inicializarTablas()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.inicializarTablas()
    })
  }

  ngOnInit() {
    this.criterios = [];
    this.criterioSource = new LocalDataSource();
    this.admisiones.get('requisito?limit=0&query=Activo:true').subscribe(
      (response: any) => {
        this.criterios = <Criterio[]>response.filter(c => c['RequisitoPadreId'] === null);
        this.criterios.forEach(criterio => {
          this.admisiones.get('requisito?limit=0&query=Activo:true,RequisitoPadreId.Id:' + criterio.Id).subscribe(
            (response: any) => {
              if (response.length > 0 && Object.keys(response[0]).length > 0) {
                criterio.Subcriterios = <Criterio[]>response;
              } else {
                criterio.Subcriterios = [];
              }
            },
            error => {
              criterio.Subcriterios = [];
              this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
            }
          );
        });
        this.criterioSource.load(this.criterios);
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      }
    );
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '800px';
    this.dialogConfig.height = '380px';
    this.dialogConfig.data = {};
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
          width: '50%',
          editable: false,
        },
        Asistencia: {
          title: this.translate.instant('admision.asistencia'),
          width: '20%',
          editable: false,
          valuePrepareFunction: (asist: boolean) => asist ? this.translate.instant('admision.asistencia') : this.translate.instant('GLOBAL.NA'),
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
      noDataMessage: this.translate.instant('admision.no_criterios'),
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
        Activo: {
          title: this.translate.instant('GLOBAL.estado'),
          width: '30%',
          editable: false,
          valuePrepareFunction: (activo: boolean) => activo ? this.translate.instant('GLOBAL.activo') : this.translate.instant('GLOBAL.inactivo'),
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
      noDataMessage: this.translate.instant('admision.no_criterios'),
    }
  }

  agregarCriterio() {
    this.dialogConfig.data = {};
    const criterioDialog = this.dialog.open(DialogoCriteriosComponent, this.dialogConfig);
    criterioDialog.afterClosed().subscribe((criterio: Criterio) => {
      if (criterio !== undefined) {
        this.admisiones.post('requisito', criterio).subscribe(
          (response: any) => {
            const newCriterio: Criterio = <Criterio>response;
            newCriterio.Subcriterios = [];
            this.criterios.push(newCriterio);
            this.criterioSource.load(this.criterios);
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_exito'));
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_registro_criterio'));
          }
        );
      }
    });
  }

  editarCriterio(event) {
    this.dialogConfig.data = { oldCriterio: event.data };
    const criterioDialog = this.dialog.open(DialogoCriteriosComponent, this.dialogConfig);
    criterioDialog.afterClosed().subscribe((criterio: Criterio) => {
      if (criterio !== undefined) {
        this.admisiones.put('requisito', criterio).subscribe(
          (response: any) => {
            const updatedCriterio: Criterio = <Criterio>response;
            this.criterioSource.update(event.data, updatedCriterio);
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_modificado'));
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_modificar_criterio'));
          }
        );
      }
    });
  }

  inactivarCriterio(event) {
    this.popUpManager.showConfirmAlert(this.translate.instant('admision.seguro_inactivar_criterio')).then(
      willDelete => {
        if (willDelete.value) {
          const criterio = <Criterio>event.data;
          criterio.Activo = false;
          this.admisiones.put('requisito', criterio).subscribe(
            response => {
              this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_inactivado'));
              this.ngOnInit();
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error_inactivar_criterio'));
            }
          );
        }
      }
    );
  }

  agregarSubcriterio(event, criterio: Criterio) {
    this.dialogConfig.data = {sub: true};
    const criterioDialog = this.dialog.open(DialogoCriteriosComponent, this.dialogConfig);
    criterioDialog.afterClosed().subscribe((subCriterio: Criterio) => {
      if (subCriterio !== undefined) {
        subCriterio.RequisitoPadreId = { Id: criterio.Id };
        this.admisiones.post('requisito', subCriterio).subscribe(
          (response: any) => {
            const newSubcriterio: Criterio = <Criterio>response;
            criterio.Subcriterios.push(newSubcriterio);
            event.source.load(criterio.Subcriterios);
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_exito'));
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_registro_criterio'));
          }
        );
      }
    });
  }

  editarSubcriterio(event) {
    this.dialogConfig.data = { oldCriterio: event.data, sub: true };
    const subcriterioDialog = this.dialog.open(DialogoCriteriosComponent, this.dialogConfig);
    subcriterioDialog.afterClosed().subscribe((subcriterio: Criterio) => {
      if (subcriterio !== undefined) {
        this.admisiones.put('requisito', subcriterio).subscribe(
          (response: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.criterio_modificado'));
            this.ngOnInit()
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_modificar_criterio'));
          }
        );
      }
    });
  }

}
