import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { UserService } from '../../../@core/data/users.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import * as momentTimezone from 'moment-timezone';
import { FORMULARIO_SOLICITUD } from "./form-solicitud";
import { InstitucionEnfasis } from '../../../@core/data/models/proyecto_academico/institucion_enfasis';
import { LinkDownloadNuxeoComponent } from '../../../@theme/components/link-download-nuxeo/link-download-nuxeo.component';
import { CustomizeButtonComponent } from '../../../@theme/components';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'consultar-solicitudes',
  templateUrl: './consultar-solicitudes.component.html',
  styleUrls: ['./consultar-solicitudes.component.scss'],
})
export class ConsultarSolicitudesDerechosPecuniarios {

  dataSource: LocalDataSource;
  data: any[] = [];
  solicitudData: any = null;
  userResponse: any;
  loading: boolean;

  formularioSolicitud = FORMULARIO_SOLICITUD

  InfoDocumentos: any;
  arr_proyecto: InstitucionEnfasis[] = [];
  source_emphasys: LocalDataSource = new LocalDataSource();
  proyectos = [];
  gestion = false;
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  settings: any;
  Respuesta: any;

  formatterPeso = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  })

  constructor(
    private userService: UserService,
    private popUpManager: PopUpManager,
    private nuxeo: NewNuxeoService,
    private sgaMidService: SgaMidService,
    private translate: TranslateService,) {
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
      this.updateLanguage();
    });

    this.userService.tercero$.subscribe((user) => {
      this.userResponse = user;
      this.userResponse.Rol = 'Coordinador'
    })

    this.loadInfoPersona();
    this.createTable();
  }

  return() {
    sessionStorage.setItem('EstadoRecibo', 'false');
  }

  public async loadInfoPersona(): Promise<void> {

  }

  updateLanguage() {
    this.formularioSolicitud.campos.forEach((field: any) => {
      field.label = this.translate.instant('GLOBAL.' + field.label_i18n);
      field.placeholder = this.translate.instant('GLOBAL.' + field.placeholder_i18n);
    })
  }

  createTable() {
    this.settings = {
      actions: false,
      columns: {
        Id: {
          title: this.translate.instant('derechos_pecuniarios.id'),
          editable: false,
          width: '5%',
          filter: false,
        },
        FechaCreacion: {
          title: this.translate.instant('derechos_pecuniarios.fecha_generacion'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Codigo: {
          title: this.translate.instant('derechos_pecuniarios.codigo'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Nombre: {
          title: this.translate.instant('derechos_pecuniarios.nombre'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Identificacion: {
          title: this.translate.instant('derechos_pecuniarios.identificacion'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Estado: {
          title: this.translate.instant('derechos_pecuniarios.estado'),
          width: '10%',
          editable: false,
          filter: false,
          position: 'center',
        },
        VerSoporte: {
          title: this.translate.instant('derechos_pecuniarios.ver_recibo'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: LinkDownloadNuxeoComponent,
          type: 'custom',
        },
        Gestionar: {
          title: this.translate.instant('derechos_pecuniarios.gestionar'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => {
              this.solicitudData = data;
              this.gestion = true;
            })
          },
        },
      },
      mode: 'external',
    }
    this.loadInfoRecibos();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.updateLanguage();
  }

  async loadInfoRecibos() {
    this.loading = true;
    this.sgaMidService.get('derechos_pecuniarios/solicitudes').subscribe(
      (response: any) => {
        if (response !== null && response.Code === '400') {
          this.popUpManager.showErrorToast(this.translate.instant('derechos_pecuniarios.error'));
          this.dataSource.load([]);
        } else if (response != null && response.Code === '404' || response.Data[0] === null) {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('derechos_pecuniarios.no_recibo'));
          this.dataSource.load([]);
        } else {
          const data = <Array<any>>response.Data;
          const dataInfo = <Array<any>>[];
          data.forEach(element => {
            element.FechaCreacion = momentTimezone.tz(element.FechaCreacion, 'America/Bogota').format('YYYY-MM-DD');

            element.Gestionar = {
              icon: 'fa fa-pencil fa-2x',
              label: 'Gestionar',
              class: "btn btn-primary"
            }

            dataInfo.push(element);
          })

          this.dataSource.load(dataInfo);
          this.dataSource.setSort([{ field: 'Id', direction: 'desc' }]);

          this.loading = false;
        }
      }, error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  async enviarSolicitud(event) {
    if (event.valid) {
      let files: Array<any> = [];
      const element = event.data.RespuestaSolicitudDerechos.DocRespuesta;
      if (typeof element.file !== 'undefined' && element.file !== null) {
        this.loading = true;
        const file = {
          file: await this.nuxeo.fileToBase64(element.file),
          IdTipoDocumento: element.IdDocumento,
          metadatos: {
            NombreArchivo: element.nombre,
            Tipo: "Archivo",
            Observaciones: element.nombre,
            "dc:title": element.nombre,
          },
          descripcion: element.nombre,
          nombre: element.nombre,
          key: 'Documento',
        }
        files.push(file);
      }
      this.Respuesta = event.data.RespuestaSolicitudDerechos;

      this.Respuesta.DocRespuesta = files
      const hoy = new Date();
      this.Respuesta.FechaRespuesta = momentTimezone.tz(hoy.getFullYear() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getDate(), 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');

      this.Respuesta.TerceroResponasble = { Id: this.userResponse.Id };
      this.sgaMidService.post('derechos_pecuniarios/respuesta_solicitud/' + this.solicitudData.Id, this.Respuesta).subscribe(
        (res: any) => {
          if (res !== null && res.Response.Code === '200') {
            this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_estado') + ' ' +
              this.translate.instant('GLOBAL.operacion_exitosa'));
            this.loadInfoRecibos();
            this.loading = false;
            this.gestion = false;
          } else {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_practicas_academicas'));
          }
        }, error => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

}
