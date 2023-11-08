import { Component, OnInit } from '@angular/core';
import { MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { FORM_CONSOLIDADO, FORM_RESPUESTA_DEC } from '../forms/form-consolidado';
import { PlanTrabajoDocenteService } from '../../../@core/data/plan_trabajo_docente.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';

@Component({
  selector: 'consolidado',
  templateUrl: './consolidado.component.html',
  styleUrls: ['./consolidado.component.scss']
})
export class ConsolidadoComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbConsolidados: Object;
  dataConsolidados: LocalDataSource;

  formNewEditConsolidado: any;
  dataNewEditConsolidado: any;
  newEditConsolidado: boolean;

  formRespuestaConsolidado: any;
  dataRespuestaConsolidado: any;
  respuestaConsolidado: boolean;

  consolidadoInfo: any = undefined;

  periodos: {select: any, opciones?: any[]} = {select: null};
  proyectos: {select: any, opciones?: any[]} = {select: null};
  estadosConsolidado: {select: any, opciones?: any[]} = {select: null};

  isCoordinator: String = undefined;
  listaPlanesConsolidado: any = undefined;
  
  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private planTrabajoDocenteService: PlanTrabajoDocenteService,
    private sgaMidService: SgaMidService,
    private userService: UserService,
    private tercerosService: TercerosService,
    private autenticationService: ImplicitAutenticationService,
    private GestorDocumental: NewNuxeoService,
    ) {
      this.dataConsolidados = new LocalDataSource();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
        this.buildFormNewEditConsolidado();
        this.buildFormRespuestaConsolidado();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formNewEditConsolidado = {...FORM_CONSOLIDADO};
    this.formRespuestaConsolidado = {...FORM_RESPUESTA_DEC};
    this.buildFormNewEditConsolidado();
    this.buildFormRespuestaConsolidado();
    this.createTable();
    this.loadSelects();
    this.dataConsolidados.load([]);
    this.autenticationService.getRole().then(
      (rol: Array<String>) => {
        this.isCoordinator = rol.find(role => (role == ROLES.ADMIN_DOCENCIA || role == ROLES.COORDINADOR));
      }
    );
  }

  createTable() {
    this.tbConsolidados = {
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '2%',
        },
        proyecto_curricular: {
          title: this.translate.instant('GLOBAL.proyecto_academico'),
          editable: false,
          width: '25%',
          filter: true,
        },
        codigo: {
          title: this.translate.instant('GLOBAL.codigo'),
          editable: false,
          width: '15%',
          filter: true,
        },
        fecha_radicado: {
          title: this.translate.instant('ptd.fecha_radicado'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        periodo_academico: {
          title: this.translate.instant('calendario.periodo'),
          editable: false,
          width: '10%',
          filter: true,
        },
        revision_decanatura: {
          title: this.translate.instant('ptd.revision_decanatura'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              this.verRevDecano(out.rowData.ConsolidadoJson);
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
              const readonly = out.rowData.gestion.type === 'ver';
              this.nuevoEditarConsolidado(out.rowData.ConsolidadoJson, readonly);
            })}
        },
        estado: {
          title: this.translate.instant('GLOBAL.estado'),
          editable: false,
          width: '12.5%',
          filter: true,
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
              let putPlan = <any>UtilidadesService.hardCopy(out.rowData.ConsolidadoJson);
              const estado = this.estadosConsolidado.opciones.find(estado => estado.codigo_abreviacion === "ENV");
              putPlan.estado_consolidado_id = estado._id;
              this.loading = true;
              this.planTrabajoDocenteService.put('consolidado_docente/'+putPlan._id, putPlan).subscribe(
                resp => {
                  this.loading = false;
                  this.popUpManager.showSuccessAlert(this.translate.instant('ptd.actualizar_consolidado_ok'))
                  this.listarConsolidados();
                }, err => {
                  this.loading = false;
                  console.warn(err);
                  this.popUpManager.showErrorAlert(this.translate.instant('ptd.fallo_actualizar_consolidado'))
                }
              );
            })}
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  buildFormNewEditConsolidado() {
    this.formNewEditConsolidado.btn = this.translate.instant('GLOBAL.guardar');
    this.formNewEditConsolidado.titulo = this.translate.instant(this.formNewEditConsolidado.titulo_i18n);
    this.formNewEditConsolidado.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  getIndexFormNewEditConsolidado(nombre: String): number {
    for (let index = 0; index < this.formNewEditConsolidado.campos.length; index++) {
      const element = this.formNewEditConsolidado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return -1;
  }

  buildFormRespuestaConsolidado() {
    //this.formRespuestaConsolidado.btn = this.translate.instant('GLOBAL.aceptar');
    //this.formRespuestaConsolidado.titulo = this.translate.instant(this.formNewEditConsolidado.titulo_i18n);
    this.formRespuestaConsolidado.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  getIndexFormRespuestaConsolidado(nombre: String): number {
    for (let index = 0; index < this.formRespuestaConsolidado.campos.length; index++) {
      const element = this.formRespuestaConsolidado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return -1;
  }

  regresar() {
    this.vista = VIEWS.LIST;
    this.newEditConsolidado = false;
    this.respuestaConsolidado = false;
    this.listarConsolidados();
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

  cargarEstadosConsolidado(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.planTrabajoDocenteService.get('estado_consolidado?query=activo:true&limit=0').subscribe(res => {
        if (res.Data.length > 0) {
          resolve(res.Data)
        } else {
          reject({"estado_consolidado": null})
        }
      }, err => {
        reject({"estado_consolidado": err})
      })
    });
  }
  //#endregion
  // * ----------


  async loadSelects() {
    this.loading = true;
    try {
      // ? carga paralela de parametricas
      let promesas = [];
      promesas.push(this.loadPeriodo().then(periodos => {this.periodos.opciones = periodos}));
      promesas.push(this.loadProyectos().then(proyectos => {this.proyectos.opciones = proyectos;}));
      promesas.push(this.cargarEstadosConsolidado().then(estadosConsolidado => {this.estadosConsolidado.opciones = estadosConsolidado;}));
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

  listarConsolidados() {
    if (this.periodos.select) {
      let proyecto = ""
      if (this.proyectos.select) {
        proyecto = ",proyecto_academico_id:"+this.proyectos.select.Id;
      }
      this.loading = true;
      this.planTrabajoDocenteService.get(`consolidado_docente?query=activo:true,periodo_id:${this.periodos.select.Id}${proyecto}&limit=0`).subscribe((resp) => {
        this.loading = false;
        let rawlistarConsolidados = <any[]>resp.Data;
        const idEstadosFiltro = this.estadosConsolidado.opciones
          .filter(estado => ["DEF","ENV","APR","N_APR"].includes(estado.codigo_abreviacion))
          .map(estado => estado._id);
        rawlistarConsolidados = rawlistarConsolidados.filter(consolidado => idEstadosFiltro.includes(consolidado.estado_consolidado_id));
        let formatedData = [];
        rawlistarConsolidados.forEach(consolidado => {
          const estadoConsolidado = this.estadosConsolidado.opciones.find(estado => estado._id == consolidado.estado_consolidado_id);
          const proyecto = this.proyectos.opciones.find(proyecto => proyecto.Id == consolidado.proyecto_academico_id);
          const periodo = this.periodos.opciones.find(periodo => periodo.Id == consolidado.periodo_id);
          let opcionGestion = "ver"
          if ((estadoConsolidado && (estadoConsolidado.codigo_abreviacion == "DEF" || estadoConsolidado.codigo_abreviacion == "N_APR")) && (this.isCoordinator)) {
            opcionGestion = "editar"
          }
          formatedData.push({
            "proyecto_curricular": proyecto ? proyecto.Nombre : "",
            "codigo": proyecto ? proyecto.Codigo : "",
            "fecha_radicado": this.formatoFecha(consolidado.fecha_creacion),
            "periodo_academico": periodo ? periodo.Nombre : "",
            "revision_decanatura": {value: undefined, type: 'ver', disabled: false},
            "gestion": {value: undefined, type: opcionGestion, disabled: !this.isCoordinator},
            "estado": estadoConsolidado ? estadoConsolidado.nombre : consolidado.estado_consolidado_id,
            "enviar": {value: undefined, type: 'enviar', disabled: (!this.isCoordinator) || (estadoConsolidado.codigo_abreviacion != "DEF")},
            "ConsolidadoJson": consolidado
          })
        })
        this.dataConsolidados.load(formatedData);

      }, (err) => {
        this.loading = false;
        console.warn(err);
      });
    }
  }

  formatoFecha(fechaHora: string): string {
    return new Date(fechaHora).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  }

  nuevoEditarConsolidado(consolidado: any, readonly?: boolean) {
    this.vista = VIEWS.FORM;
    this.newEditConsolidado = true;
    this.formNewEditConsolidado.campos[this.getIndexFormNewEditConsolidado("Rol")].valor = this.isCoordinator;
    this.listaPlanesConsolidado = "";
    let terceroId = 0;
    if (consolidado) {
      this.consolidadoInfo = consolidado;
      const consolidado_coordinacion = JSON.parse(this.consolidadoInfo.consolidado_coordinacion);
      terceroId = consolidado_coordinacion.responsable_id;
      this.loading = true;
      this.GestorDocumental.get([{Id: consolidado_coordinacion.documento_id, ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}]).subscribe(
        (resp: any[])  => {
          this.loading = false;
          this.formNewEditConsolidado.campos[this.getIndexFormNewEditConsolidado("ArchivoSoporte")].urlTemp = resp[0].url;
          this.formNewEditConsolidado.campos[this.getIndexFormNewEditConsolidado("ArchivoSoporte")].valor = resp[0].url;
        }
      );
    } else {
      this.consolidadoInfo = undefined;
      terceroId = this.userService.getPersonaId();
    }
    this.tercerosService.get('tercero/'+terceroId).subscribe(resTerc => {
      this.formNewEditConsolidado.campos[this.getIndexFormNewEditConsolidado("QuienEnvia")].valor = resTerc.NombreCompleto;
    }, err => {
      console.warn(err);
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
    });
    if (readonly ? readonly : false) {
      this.formNewEditConsolidado.btn = "";
    } else {
      this.formNewEditConsolidado.btn = this.translate.instant('GLOBAL.guardar');
    }
  }

  async validarFormNewEdit(event) {
    if (this.periodos.select && this.proyectos.select) {
      if (event.valid) {
        if (this.consolidadoInfo == undefined) {
          if (this.listaPlanesConsolidado == "") {
            this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.diligenciar_consolidado'), this.translate.instant('ptd.please_descargue_consolidado'), MODALS.INFO, false)
          } else {
            this.loading = true;
            this.GestorDocumental.uploadFiles([event.data.Consolidado.ArchivoSoporte]).subscribe(
              (resp: any[]) => {
                const consolidado = {
                  "documento_id": resp[0].res.Id,
                  "responsable_id": this.userService.getPersonaId(),
                }
                const prepareData = {
                  "plan_docente_id": JSON.stringify(this.listaPlanesConsolidado),
                  "periodo_id": `${this.periodos.select.Id}`,
                  "proyecto_academico_id": `${this.proyectos.select.Id}`,
                  "estado_consolidado_id": `${this.estadosConsolidado.opciones.find(estado => estado.codigo_abreviacion == "DEF")._id}`,
                  "respuesta_decanatura": JSON.stringify({sec: {}, dec: {}}),
                  "consolidado_coordinacion": JSON.stringify(consolidado),
                  "cumple_normativa": false,
                  "aprobado": false,
                  "activo": true
                }
                
                this.planTrabajoDocenteService.post('consolidado_docente', prepareData).subscribe((resp) => {
                  this.loading = false;
                  this.popUpManager.showSuccessAlert(this.translate.instant('ptd.crear_consolidado_ok'));
                }, (err) => {
                  this.loading = false;
                  console.warn(err);
                  this.popUpManager.showErrorAlert(this.translate.instant('ptd.fallo_crear_consolidado'));
                });
              }
            )
          }
        } else {
          const verifyNewDoc = new Promise(resolve => {
            if (event.data.Consolidado.ArchivoSoporte.file != undefined) {
              this.GestorDocumental.uploadFiles([event.data.Consolidado.ArchivoSoporte]).subscribe(
                (resp: any[]) => {
                  resolve(resp[0].res.Id)
                });
            } else {
              resolve(JSON.parse(this.consolidadoInfo.consolidado_coordinacion).documento_id)
            }
          })
          const consolidado = {
            "documento_id": await verifyNewDoc,
            "responsable_id": this.userService.getPersonaId(),
          }
          if (this.listaPlanesConsolidado != "") {
            this.consolidadoInfo.plan_docente_id = JSON.stringify(this.listaPlanesConsolidado);
          }
          this.consolidadoInfo.periodo_id = `${this.periodos.select.Id}`;
          this.consolidadoInfo.proyecto_academico_id = `${this.proyectos.select.Id}`;
          this.consolidadoInfo.estado_consolidado_id = `${this.estadosConsolidado.opciones.find(estado => estado.codigo_abreviacion == "DEF")._id}`;
          this.consolidadoInfo.consolidado_coordinacion = JSON.stringify(consolidado);
          this.loading = true;
          this.planTrabajoDocenteService.put('consolidado_docente/'+this.consolidadoInfo._id, this.consolidadoInfo).subscribe((resp) => {
            this.loading = false;
            this.popUpManager.showSuccessAlert(this.translate.instant('ptd.actualizar_consolidado_ok'));
          }, (err) => {
            this.loading = false;
            console.warn(err);
            this.popUpManager.showErrorAlert(this.translate.instant('ptd.fallo_actualizar_consolidado'));
          });
        }
      }
    } else {
      this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.diligenciar_consolidado'), this.translate.instant('ptd.select_periodo_proyecto'), MODALS.INFO, false)
    }
  }

  obtenerDocConsolidado() {
  if (this.periodos.select) {
    this.loading = true;
    this.sgaMidService.post(`reportes/verif_cump_ptd/${this.periodos.select.Id}/${this.proyectos.select ? this.proyectos.select.Id : 0}`,{}).subscribe((resp) =>  {
      this.loading = false;
      this.listaPlanesConsolidado = resp.Data.listaIdPlanes;
      const rawFilePDF = new Uint8Array(atob(resp.Data.pdf).split('').map(char => char.charCodeAt(0)));
      const urlFilePDF = window.URL.createObjectURL(new Blob([rawFilePDF], { type: 'application/pdf' }));
      this.previewFile(urlFilePDF);
      const rawFileExcel = new Uint8Array(atob(resp.Data.excel).split('').map(char => char.charCodeAt(0)));
      const urlFileExcel = window.URL.createObjectURL(new Blob([rawFileExcel], { type: 'application/vnd.ms-excel' }));
      const download = document.createElement("a");
      download.href = urlFileExcel;
      download.download = "Consolidado.xlsx";
      document.body.appendChild(download);
      download.click();
      document.body.removeChild(download);
    }, (err) => {
      this.loading = false;
      this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
      console.warn(err)
    });
  }
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

  verRevDecano(consolidado: any) {
    const respuesta_decanatura = JSON.parse(consolidado.respuesta_decanatura);
    const estado = this.estadosConsolidado.opciones.find(estado => estado._id == consolidado.estado_consolidado_id);
    this.formRespuestaConsolidado.campos[this.getIndexFormRespuestaConsolidado('Respuesta')].valor = estado ? estado.nombre : "Sin Definir";
    let Observaciones = "";
    if (Object.keys(respuesta_decanatura.sec).length > 0) {
      Observaciones += "Secretaría Decanatura:\n" + respuesta_decanatura.sec.observacion + "\n\n";
    }
    if (Object.keys(respuesta_decanatura.dec).length > 0) {
      Observaciones += "Decanatura:\n" + respuesta_decanatura.dec.observacion + "\n";
    }
    this.formRespuestaConsolidado.campos[this.getIndexFormRespuestaConsolidado('Observaciones')].valor = Observaciones;
    this.vista = VIEWS.FORM;
    this.respuestaConsolidado = true;
  }
}
