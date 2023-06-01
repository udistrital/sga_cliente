import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Ng2StButtonComponent, Ng2StCheckComponent } from '../../../@theme/components';
import { PopUpManager } from '../../../managers/popUpManager';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { dialogoPreAsignacionPtdComponent } from './dialogo-preasignacion/dialogo-preasignacion.component';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'preasignacion',
  templateUrl: './preasignacion.component.html',
  styleUrls: ['./preasignacion.component.scss']
})
export class PreAsignacionPtdComponent implements OnInit {

  loading: boolean;
  tbEstructura: Object;
  data: LocalDataSource;
  periodos: any[] = [];
  periodo: any;
  asignaturaAdd: any = undefined;
  rol: Array<String>;
  coodrinador = false;
  dialogConfig: MatDialogConfig;

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService
  ) {
    this.data = new LocalDataSource();
    this.cargarPeriodo();
  }

  ngOnInit() {
    this.popUpManager.showAlert(this.translate.instant('ptd.seleccion_periodo'), "")

    this.autenticationService.getRole().then((rol: Array<String>) => {
      this.rol = rol
      this.coodrinador = this.rol.find(role => (role == 'COORDINADOR' || role == 'ADMIN_DOCENCIA')) ? true : false
      this.createTable();

      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
      });
    });

    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.width = '1000px';
    this.dialogConfig.height = '600px';
    this.dialogConfig.data = {};
  }

  createTable() {
    this.tbEstructura = {
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
    if (this.coodrinador) {
      this.tbEstructura['columns'] = {
        docente: {
          title: this.translate.instant('notas.docente'),
          editable: false,
          width: '15%',
          filter: true,
        },
        espacio_academico: {
          title: this.translate.instant('practicas_academicas.espacio_academico'),
          editable: false,
          width: '15%',
          filter: true,
        },
        periodo: {
          title: this.translate.instant('GLOBAL.periodo'),
          editable: false,
          width: '3%',
          filter: true,
        },
        grupo: {
          title: this.translate.instant('asignaturas.grupo'),
          editable: false,
          width: '5%',
          filter: true,
        },
        proyecto: {
          title: this.translate.instant('GLOBAL.proyecto_academico'),
          editable: false,
          width: '12%',
          filter: true,
        },
        nivel: {
          title: this.translate.instant('GLOBAL.nivel'),
          editable: false,
          width: '5%',
          filter: true,
        },
        aprobacion_docente: {
          title: this.translate.instant('ptd.aprobacion_docente'),
          editable: false,
          width: '9%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StCheckComponent,
        },
        aprobacion_proyecto: {
          title: this.translate.instant('ptd.aprobacion_proyecto'),
          editable: false,
          width: '9%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StCheckComponent,
        },
        enviar: {
          title: this.translate.instant('GLOBAL.enviar'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              let data = {
                "preasignaciones": [
                  { "Id": out["rowData"].id },
                ],
                "no-preasignaciones": [],
                "docente": false,
              }

              this.sgaMidService.put('plan_trabajo_docente/aprobacion_preasignacion', data).subscribe((res) => {
                this.popUpManager.showSuccessAlert(this.translate.instant('ptd.aprobacion_preasignacion'));
                this.loadPreasignaciones();
              });
            })
          }
        },
        editar: {
          title: this.translate.instant('GLOBAL.editar'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              this.dialogConfig.data = out["rowData"];
              const preasignacionDialog = this.dialog.open(dialogoPreAsignacionPtdComponent, this.dialogConfig);
              preasignacionDialog.afterClosed().subscribe(result => {
                this.loadPreasignaciones();
              });
            })
          }
        },
      }
    } else {
      this.tbEstructura['columns'] = {
        espacio_academico: {
          title: this.translate.instant('practicas_academicas.espacio_academico'),
          editable: false,
          width: '15%',
          filter: true,
        },
        periodo: {
          title: this.translate.instant('GLOBAL.periodo'),
          editable: false,
          width: '3%',
          filter: true,
        },
        grupo: {
          title: this.translate.instant('asignaturas.grupo'),
          editable: false,
          width: '4%',
          filter: true,
        },
        proyecto: {
          title: this.translate.instant('GLOBAL.proyecto_academico'),
          editable: false,
          width: '12%',
          filter: true,
        },
        nivel: {
          title: this.translate.instant('GLOBAL.nivel'),
          editable: false,
          width: '5%',
          filter: true,
        },
        aprobacion_docente: {
          title: this.translate.instant('ptd.aprobacion_docente'),
          editable: false,
          width: '9%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StCheckComponent,
          onComponentInitFunction: (instance) => {
            instance.checkboxVal.subscribe((val) => {
              this.data.getAll().then((data) => {
                let index = data.findIndex((el) => { return el == val.Data });
                data[index]['aprobacion_docente'] = {
                  "disabled": false,
                  "value": val.value
                };
                this.data.load(data);
              });
            })
          },
        },
        aprobacion_proyecto: {
          title: this.translate.instant('ptd.aprobacion_proyecto'),
          editable: false,
          disabled: true,
          width: '9%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StCheckComponent,
        }
      }
    }
  }

  agregacionPreasignacion() {
    this.dialogConfig.data = {};
    const preasignacionDialog = this.dialog.open(dialogoPreAsignacionPtdComponent, this.dialogConfig);
    preasignacionDialog.afterClosed().subscribe(result => {
      this.loadPreasignaciones();
    });
  }

  enviarAprobacion() {
    let req = {
      "preasignaciones": [],
      "no-preasignaciones": [],
      "docente": true,
    }

    this.data.getAll().then(
      data => {
        data.forEach((preasignacion) => {
          if (preasignacion.aprobacion_docente.value) {
            req.preasignaciones.push({ "Id": preasignacion.id });
          } else {
            req['no-preasignaciones'].push({ "Id": preasignacion.id });
          }
        });

        this.sgaMidService.put('plan_trabajo_docente/aprobacion_preasignacion', req).subscribe((res) => {
          this.popUpManager.showSuccessAlert(this.translate.instant('ptd.aprobacion_preasignacion'));
          this.loadPreasignaciones();
        }, err => {
          this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_aprobacion_preasignacion'));
        });
      },
    );
  }

  loadPreasignaciones() {
    if (this.coodrinador) {
      this.sgaMidService.get('plan_trabajo_docente/preasignaciones/' + this.periodo.Id).subscribe(res => {
        if (res !== null) {
          this.data.load(res["Data"]);
        }
        this.loading = false;
      }, err => {
        this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_preasignaciones'));
        this.loading = false;
      });
    } else {
      const id_tercero = this.userService.getPersonaId();
      this.sgaMidService.get('plan_trabajo_docente/preasignaciones_docente/' + id_tercero + '/' + this.periodo.Id).subscribe(res => {
        if (res !== null) {
          this.data.load(res["Data"]);
        }
        this.loading = false;
      }, err => {
        this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_preasignaciones'));
        this.loading = false;
      });
    }
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA,activo:true&sortby=Id&order=desc&limit=0')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
            resolve(this.periodos);
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  selectPeriodo(periodo) {
    this.periodo = periodo.value;
    this.loading = true;
    if (this.periodo) {
      this.loadPreasignaciones();
    } else {
      this.data.load([]);
      this.loading = false;
    }
  }
}
