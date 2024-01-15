import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { FORM_INFO_DOCENTE } from '../forms/form-info_docente';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';

@Component({
  selector: 'asignar-ptd-multiple',
  templateUrl: './asignar-ptd-multiple.component.html',
  styleUrls: ['./asignar-ptd-multiple.component.scss']
})
export class AsignarPtdMultipleComponent implements OnInit {
  loading: boolean;

  readonly VIEWS = VIEWS;
  readonly MODALS = MODALS;
  readonly ACTIONS = ACTIONS;
  vista: Symbol;

  coordinador = false;
  formDocente: any;
  //dataDocente: any;
  rolIs: String = undefined;
  canEdit: Symbol = ACTIONS.VIEW;
  asignaturaAdd: any = undefined;
  //detalleAsignacion: any = undefined;
  detallesAsignaciones: any[] = [];

  //periodosAnteriores: any[] = [];
  periodoCopia: any;
  readonly tipo = { carga_lectiva: 1, actividades: 2 };

  detalleAsignacionRespaldo: any = undefined;
  detalleAsignacionDescartar: any[] = [];

  verReportes: boolean = false;

  @Input() dataDocente: any;
  @Input() detalleAsignacion: any = undefined;
  @Input() periodosAnteriores: any[] = [];
  @Input() soloLectura: boolean = false;
  @Output() OutDetalleChanged: EventEmitter<any> = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
    private GestorDocumental: NewNuxeoService,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.buildFormDocente();
    })
    this.autenticationService.getRole().then(
      (rol: Array<String>) => {
        let r = rol.find(role => (role == ROLES.DOCENTE || role == ROLES.ADMIN_DOCENCIA || role == ROLES.COORDINADOR));
        this.coordinador = rol.find(role => (role == 'COORDINADOR' || role == 'ADMIN_DOCENCIA')) ? true : false
        if (r) {
          this.rolIs = r;
          this.canEdit = ACTIONS.EDIT;
        }
      }
    );
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formDocente = UtilidadesService.hardCopy(FORM_INFO_DOCENTE);
    this.buildFormDocente();
  }

  buildFormDocente() {
    this.formDocente.titulo = this.translate.instant(this.formDocente.titulo_i18n);
    this.formDocente.campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  copy_ptd() {
    const NombrePeriodo = this.periodoCopia.Nombre;
    if (this.rolIs == ROLES.DOCENTE) {
      this.popUpManager.showPopUpGeneric('', this.translate.instant('ptd.copiar_plan_ver_coordinador_p1') + NombrePeriodo + '.<br>' +
        this.translate.instant('ptd.copiar_plan_ver_docente_p1') + '<br><br>' +
        this.translate.instant('ptd.copiar_plan_ver_docente_p2') + '.<br>' +
        this.translate.instant('ptd.copiar_plan_ver_docente_p3') + '.<br>' +
        this.translate.instant('ptd.copiar_plan_ver_docente_p4') + '.', MODALS.QUESTION, true)
        .then(action => {
          if (action.value) {
            this.loading = true;
            this.detalleAsignacionRespaldo = UtilidadesService.hardCopy(this.detalleAsignacion);
            const justCargaLectiva = this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].filter(item => !(item.actividad_id));
            this.detalleAsignacionDescartar = this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].filter(item => (item.actividad_id));
            this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion] = justCargaLectiva;
            this.detalleAsignacion = undefined;
            this.sgaMidService.get(`plan_trabajo_docente/copiar_plan/${this.dataDocente.docente_id}/${this.periodoCopia.Id}/${this.dataDocente.periodo_id}/${this.dataDocente.tipo_vinculacion_id}/${this.tipo.actividades}`).subscribe(resp => {
              this.loading = false;
              this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].push(...resp.Data.carga)
              this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
              this.detalleAsignacion.descartar = this.detalleAsignacionDescartar;
              this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.copy_ptd'), this.translate.instant('ptd.revisar_solapamiento_carga'), MODALS.WARNING, false)
            }, err => {
              this.loading = false;
              this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].push(...this.detalleAsignacionDescartar)
              this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
              this.detalleAsignacion.descartar = [];
              this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.copy_ptd'), this.translate.instant('ptd.no_info_copia_actividades'), MODALS.ERROR, false)
              console.warn(err)
            })
          }
        });
    }
    if (this.rolIs == ROLES.ADMIN_DOCENCIA || this.rolIs == ROLES.COORDINADOR) {
      this.popUpManager.showPopUpGeneric('', this.translate.instant('ptd.copiar_plan_ver_coordinador_p1') + NombrePeriodo + '.<br>' +
        this.translate.instant('ptd.copiar_plan_ver_coordinador_p2') + '.', MODALS.QUESTION, true)
        .then(action => {
          if (action.value) {
            this.loading = true;
            this.detalleAsignacionRespaldo = UtilidadesService.hardCopy(this.detalleAsignacion);
            const justActividades = this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].filter(item => !(item.espacio_academico_id));
            this.detalleAsignacionDescartar = this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].filter(item => (item.espacio_academico_id));
            this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion] = justActividades;
            this.detalleAsignacion = undefined;
            this.sgaMidService.get(`plan_trabajo_docente/copiar_plan/${this.dataDocente.docente_id}/${this.periodoCopia.Id}/${this.dataDocente.periodo_id}/${this.dataDocente.tipo_vinculacion_id}/${this.tipo.carga_lectiva}`).subscribe(resp => {
              this.loading = false;
              this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].push(...resp.Data.carga)
              this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
              this.detalleAsignacion.descartar = this.detalleAsignacionDescartar;
              let textPopUp = []
              let no_requeridos = <any[]>resp.Data.espacios_academicos.no_requeridos;
              if (no_requeridos.length > 0) {
                let nombreEspacios = "";
                no_requeridos.forEach(espacioAcad => {
                  nombreEspacios += "<b>" + espacioAcad.nombre + "</b><br>";
                })
                textPopUp.push(this.translate.instant('ptd.espacios_no_requeridos') + "<br>" + nombreEspacios);
              }
              let sin_carga = <any[]>resp.Data.espacios_academicos.sin_carga;
              if (sin_carga.length > 0) {
                let nombreEspacios = "";
                sin_carga.forEach(preasignEsp => {
                  nombreEspacios += "<b>" + preasignEsp.nombre + "</b><br>";
                })
                textPopUp.push(this.translate.instant('ptd.espacios_sin_asignar') + "<br>" + nombreEspacios);
              }
              this.popUpManager.showManyPopUp(this.translate.instant('ptd.copy_ptd'), textPopUp, MODALS.INFO)
            }, err => {
              this.loading = false;
              this.detalleAsignacionRespaldo.carga[this.detalleAsignacionRespaldo.seleccion].push(...this.detalleAsignacionDescartar)
              this.detalleAsignacion = UtilidadesService.hardCopy(this.detalleAsignacionRespaldo);
              this.detalleAsignacion.descartar = [];
              this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.copy_ptd'), this.translate.instant('ptd.no_info_copia_carga_lectiva'), MODALS.ERROR, false)
              console.warn(err)
            })
          }
        });
    }
  }

  generarReporte(tipoCarga: string) {
    this.loading = true;
    this.sgaMidService.post(`reportes/plan_trabajo_docente/${this.dataDocente.docente_id}/${this.dataDocente.tipo_vinculacion_id}/${this.dataDocente.periodo_id}/${tipoCarga}`, {}).subscribe(
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

  verPTDFirmado(idDoc) {
    this.loading = true;
    this.GestorDocumental.get([{ Id: idDoc }]).subscribe((resp: any[]) => {
      this.loading = false;
      this.previewFile(resp[0].url);
    })
  }

  previewFile(url: string) {
    const h = screen.height * 0.65;
    const w = h * 3 / 4;
    const left = (screen.width * 3 / 4) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(url, '', 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }

  doReload(event) {
    this.loading=event;
  }

  whatChanged(event) {
    console.log("what changed is ", event)
    this.OutDetalleChanged.emit({"carga": event, "docente": this.dataDocente.docente_id})
  }

}
