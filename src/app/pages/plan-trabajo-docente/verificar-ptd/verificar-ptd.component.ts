import { Component, OnInit } from '@angular/core';
import { MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { FORM_INFO_DOCENTE } from '../forms/form-info_docente';
import { FORM_VERIFICAR_PTD } from '../forms/form-verificar_ptd';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { PlanTrabajoDocenteService } from '../../../@core/data/plan_trabajo_docente.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { UserService } from '../../../@core/data/users.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DialogoFirmaPtdComponent } from './dialogo-firma-ptd/dialogo-firma-ptd.component';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'verificar-ptd',
  templateUrl: './verificar-ptd.component.html',
  styleUrls: ['./verificar-ptd.component.scss']
})
export class VerificarPtdComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbPlanes: Object;
  dataPlanes: LocalDataSource;

  formDocente: any;
  dataDocente: any;
  formVerificar: any;
  dataVerificar: any;

  readonly MODALS = MODALS;

  isCoordinator: String = undefined;

  periodos: {select: any, opciones?: any[]} = {select: null};
  proyectos: {select: any, opciones?: any[]} = {select: null};
  estadosPlan: {select: any, opciones?: any[], opcionesfiltradas?: any[]} = {select: null};

  infoPlan: any;
  
  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private planTrabajoDocenteService: PlanTrabajoDocenteService,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
    private userService: UserService,
    private tercerosService: TercerosService,
    private dialog: MatDialog,
    private GestorDocumental: NewNuxeoService,
    ) {
      this.dataPlanes = new LocalDataSource();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
        this.buildFormDocente();
        this.buildFormVerificar();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST,
    this.formDocente = {...FORM_INFO_DOCENTE};
    this.formVerificar = {...FORM_VERIFICAR_PTD};
    this.loadSelects();
    this.createTable();
    this.buildFormDocente();
    this.buildFormVerificar();
    this.autenticationService.getRole().then(
      (rol: Array<String>) => {
        this.isCoordinator = rol.find(role => (role == ROLES.ADMIN_DOCENCIA || role == ROLES.COORDINADOR));
      }
    );
  }

  createTable() {
    this.tbPlanes = {
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '2%',
        },
        nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          editable: false,
          width: '20%',
          filter: true,
        },
        identificacion: {
          title: this.translate.instant('GLOBAL.Documento'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        tipo_vinculacion: {
          title: this.translate.instant('GLOBAL.tipo_vinculacion'),
          editable: false,
          width: '15%',
          filter: true,
        },
        periodo_academico: {
          title: this.translate.instant('calendario.periodo'),
          editable: false,
          width: '10%',
          filter: true,
        },
        soporte_documental: {
          title: this.translate.instant('GLOBAL.soporte_documental'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              const idDoc = Number(out.value);
              if (idDoc > 0) {
                this.verPTDFirmado(idDoc);
              } else {
                this.generarReporte('CA', out.rowData.tercero_id, out.rowData.vinculacion_id);
              }
            })}
        },
        gestion: {
          title: this.translate.instant('ptd.gest'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              this.cargarPlan(out.rowData);
            })}
        },
        estado: {
          title: this.translate.instant('GLOBAL.estado'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  buildFormDocente() {
    this.formDocente.titulo = this.translate.instant(this.formDocente.titulo_i18n);
    this.formDocente.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  buildFormVerificar() {
    this.formVerificar.btn = this.translate.instant('ptd.dar_respuesta');
    this.formVerificar.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  

  // * ----------
  // * Carga información paramétrica (selects)
  //#region
  loadPeriodo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            reject({"periodo": null});
          }
        }, (err) => {
          reject({"periodo": err});
        }
      );
    });
  }

  loadProyectos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"proyecto": null});
          }
        }, (err) => {
          reject({"proyecto": err});
        }
      );
    });
  }

  cargarEstadosPlan(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.planTrabajoDocenteService.get('estado_plan?query=activo:true&limit=0').subscribe(res => {
        if (res.Data.length > 0) {
          resolve(res.Data)
        } else {
          reject({"estado_plan": null})
        }
      }, err => {
        reject({"estado_plan": err})
      })
    });
  }
  //#endregion
  // * ----------


  // * ----------
  // * Insertar info parametrica en formulario 
  //#region
  async loadSelects() {
    this.loading = true;
    try {
      // ? carga paralela de parametricas
      let promesas = [];
      promesas.push(this.loadPeriodo().then(periodos => {this.periodos.opciones = periodos}));
      promesas.push(this.loadProyectos().then(proyectos => {this.proyectos.opciones = proyectos;}));
      promesas.push(this.cargarEstadosPlan().then(estadosPlan => {
        this.estadosPlan.opciones = estadosPlan;
        this.estadosPlan.opcionesfiltradas = this.estadosPlan.opciones.filter(estado => (estado.codigo_abreviacion == "APR") || (estado.codigo_abreviacion == "N_APR"));
      }));
      this.loading = false
    } catch (error) {
      console.warn(error);
      this.loading = false;
      const falloEn = Object.keys(error)[0];
      if (error[falloEn] == null) {
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                                           this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
                                           this.translate.instant('ERROR.persiste_error_comunique_OAS'),
                                           MODALS.ERROR, false);
      } else {
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                                           this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
                                           this.translate.instant('ERROR.persiste_error_comunique_OAS'),
                                           MODALS.ERROR, false);
      }
    }
  }
  //#endregion
  // * ----------

  filtrarPlanes(): void {
    if (this.periodos.select && this.proyectos.select ) {//&& this.isCoordinator) {
      this.loading = true;
      this.sgaMidService.get(`plan_trabajo_docente/planes_preaprobados/${this.periodos.select.Id}/${this.proyectos.select.Id}`).subscribe(
        (resp) => {
          let planes = <any[]>resp.Data;
          planes.forEach(plan => {
            plan.periodo_academico = this.periodos.opciones.find(p => p.Id === plan.periodo_academico).Nombre;
            plan.estado = this.estadosPlan.opciones.find(e => e._id === plan.estado).nombre;
          })
          this.dataPlanes.load(planes);
          this.loading = false;
        }, (err) => {
          this.loading = false;
          this.dataPlanes.load([]);
          console.warn(err);
          this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.verificacion_ptd'),this.translate.instant('ptd.no_planes_particulares'), MODALS.WARNING, false)
        }
      );
    }
  }

  cargarPlan(plan: any): void {
    this.loading = true;
    this.sgaMidService.get(`plan_trabajo_docente/plan/${plan.tercero_id}/${this.periodos.select.Id}/${plan.vinculacion_id}`).subscribe(
      (resp) => {
        this.loading = false;
        this.dataDocente = {
          Nombre: plan.nombre,
          Documento: plan.identificacion,
          Periodo: plan.periodo_academico,
          docente_id: plan.tercero_id,
          tipo_vinculacion_id: plan.vinculacion_id
        };
        this.infoPlan = resp.Data;
        
        this.formVerificar.campos[this.getIndexFormVerificar("EstadoAprobado")].opciones = this.estadosPlan.opcionesfiltradas;
        this.formVerificar.campos[this.getIndexFormVerificar("Rol")].valor = this.isCoordinator;

        this.planTrabajoDocenteService.get('plan_docente/'+plan.id).subscribe(resPlan => {
          this.formVerificar["GET_plan_docente"] = resPlan.Data;
          let terceroId = 0;
          if (resPlan.Data.respuesta && resPlan.Data.respuesta != "") {
            const jsonResp = JSON.parse(resPlan.Data.respuesta);
            terceroId = jsonResp.responsable_id;
            this.formVerificar.campos[this.getIndexFormVerificar("DeAcuerdo")].valor = jsonResp.concertado;
            this.formVerificar.campos[this.getIndexFormVerificar("Observaciones")].valor = jsonResp.observacion;
            const estadoPlan = this.estadosPlan.opciones.find(estado => estado._id === resPlan.Data.estado_plan_id);
            this.formVerificar.campos[this.getIndexFormVerificar("EstadoAprobado")].valor = estadoPlan;
            if (estadoPlan.codigo_abreviacion == "APR") {
              this.formVerificar.btn = this.translate.instant('ptd.editar_respuesta');
            }
          } else {
            terceroId = this.userService.getPersonaId();
          }
          this.tercerosService.get('tercero/'+terceroId).subscribe(resTerc => {
            this.formVerificar.campos[this.getIndexFormVerificar("QuienResponde")].valor = resTerc.NombreCompleto;
          }, err => {
            console.warn(err);
            this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
          });
        }, err => {
          console.warn(err);
          this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
        });

        this.vista = VIEWS.FORM;
      }, (err) => {
        this.loading = false;
        console.warn(err);
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
      }
    );
  }

  getIndexFormVerificar(nombre: String): number {
    for (let index = 0; index < this.formVerificar.campos.length; index++) {
      const element = this.formVerificar.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return -1;
  }

  validarFormVerificar(event): void {
    if (event.valid) {
      this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.dar_respuesta'), "", MODALS.QUESTION, true).then(
        async action => {
          if (action.value) {
            let putPlan = <any>UtilidadesService.hardCopy(this.formVerificar["GET_plan_docente"]);
            let respuestaJson = putPlan.respuesta ? JSON.parse(putPlan.respuesta) : {};
            respuestaJson["concertado"] = event.data.VerificarPTD.DeAcuerdo;
            respuestaJson["observacion"] = event.data.VerificarPTD.Observaciones;
            respuestaJson["responsable_id"] = this.userService.getPersonaId();
            putPlan.respuesta = JSON.stringify(respuestaJson);
            putPlan.estado_plan_id = event.data.VerificarPTD.EstadoAprobado._id;
            
            if (event.data.VerificarPTD.EstadoAprobado.codigo_abreviacion === "APR") {
              const dialogParams = new MatDialogConfig();
              dialogParams.width = '640px';
              dialogParams.height = '440px';
              dialogParams.data = {
                docenteId: putPlan.docente_id,
                responsableId: respuestaJson.responsable_id,
                vinculacionId: this.dataDocente.tipo_vinculacion_id,
                periodoId: this.periodos.select.Id,
              };
              const dialogFirma = this.dialog.open(DialogoFirmaPtdComponent, dialogParams);
              const outDialog = await dialogFirma.afterClosed().toPromise();
              if (outDialog.document) {
                putPlan.soporte_documental = outDialog.document;
                this.loading = true;
                this.planTrabajoDocenteService.put('plan_docente/'+putPlan._id, putPlan).subscribe(
                  resp => {
                    this.loading = false;
                    this.popUpManager.showSuccessAlert(this.translate.instant('ptd.respuesta_enviada'))
                  }, err => {
                    this.loading = false;
                    this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_respuesta_enviada'))
                    console.warn(err);
                  }
                );
              } else if (outDialog.error) {
                this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                                           this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + outDialog.from + '</b>.<br><br>' +
                                           this.translate.instant('ERROR.persiste_error_comunique_OAS'),
                                           MODALS.ERROR, false);
              }
            } else {
              this.loading = true;
              this.planTrabajoDocenteService.put('plan_docente/'+putPlan._id, putPlan).subscribe(
                resp => {
                  this.loading = false;
                  this.popUpManager.showSuccessAlert(this.translate.instant('ptd.respuesta_enviada'))
                }, err => {
                  this.loading = false;
                  this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_respuesta_enviada'))
                  console.warn(err);
                }
              );
            }
          }
        }
      );
    }
  }

  generarReporte(tipoCarga: string, docente?: any, vinculacion?: any) {
    this.loading = true;
    this.sgaMidService.post(`reportes/plan_trabajo_docente/${docente ? docente : this.dataDocente.docente_id}/${vinculacion ? vinculacion : this.dataDocente.tipo_vinculacion_id}/${this.periodos.select.Id}/${tipoCarga}`, {}).subscribe(
      resp => {
        this.loading = false;
        const rawFilePDF = new Uint8Array(atob(resp.Data.pdf).split('').map(char => char.charCodeAt(0)));
        const urlFilePDF = window.URL.createObjectURL(new Blob([rawFilePDF], { type: 'application/pdf' }));
        this.previewFile(urlFilePDF)
        const rawFileExcel = new Uint8Array(atob(resp.Data.excel).split('').map(char => char.charCodeAt(0)));
        const urlFileExcel = window.URL.createObjectURL(new Blob([rawFileExcel], { type: 'application/vnd.ms-excel' }));

        const html = {
          html: [
            `<label class="swal2">${this.translate.instant('ptd.formato_doc')}</label>
            <select id="formato" class="swal2-input">
            <option value="excel" >Excel</option>
            <option value="pdf" >PDF</option>
            </select>`
          ],
          ids: ["formato"],
        }
        this.popUpManager.showPopUpForm(this.translate.instant('ptd.descargar'), html, false).then((action) => {
          if (action.value) {
            if (action.value.formato === "excel") {
              const download = document.createElement("a");
              download.href = urlFileExcel;
              download.download = "Reporte_PTD.xlsx";
              document.body.appendChild(download);
              download.click();
              document.body.removeChild(download);
            }
            if (action.value.formato === "pdf") {
              const download = document.createElement("a");
              download.href = urlFilePDF;
              download.download = "Reporte_PTD.pdf";
              document.body.appendChild(download);
              download.click();
              document.body.removeChild(download);
            }
          }
        })
        
      }, err => {
        this.loading = false;
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
        console.warn(err)
      }
    )
  }

  verPTDFirmado(idDoc: number) {
    this.loading = true;
    this.GestorDocumental.get([{Id: idDoc}]).subscribe((resp: any[]) => {
      this.loading = false;
      this.previewFile(resp[0].url);
    })
  }

  previewFile(url: string) {
    const h = screen.height * 0.65;
    const w = h * 3/4;
    const left = (screen.width * 3/4) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(url, '', 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }
}
