import { UserService } from '../../../@core/data/users.service';
import { SgaMidService } from './../../../@core/data/sga_mid.service';
import { Organizacion } from './../../../@core/data/models/ente/organizacion';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_EXPERIENCIA_LABORAL } from './form-experiencia_laboral';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { OrganizacionService } from '../../../@core/data/organizacion.service';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { InfoPersona } from '../../../@core/data/models/informacion/info_persona';
import { ExperienciaService } from '../../../@core/data/experiencia.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ListService } from '../../../@core/store/services/list.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-crud-experiencia-laboral',
  templateUrl: './crud-experiencia_laboral.component.html',
  styleUrls: ['./crud-experiencia_laboral.component.scss'],
})
export class CrudExperienciaLaboralComponent implements OnInit {
  config: ToasterConfig;
  info_experiencia_laboral_id: number;
  organizacion: Organizacion;
  ente_id: number;
  soporte: any;
  detalleExp: any;
  indexSelect: number;
  nuevoForm: boolean = false;

  @Input('info_experiencia_laboral_id')
  set name(info_experiencia_laboral_id: number) {
    this.info_experiencia_laboral_id = info_experiencia_laboral_id;
    // this.loadInfoExperienciaLaboral();
  }

  @Input('ente_id')
  set ente_experiencia(ente_id: any) {
    this.ente_id = Number(ente_id);
  }


  @Input('index_select')
  set index_select(index_select: any) {
    this.indexSelect = Number(index_select);
  }

  @Input('detalle_experiencia_laboral')
  set detalleExperienciaLaboral(detalle_experiencia_laboral: any) {
    this.detalleExp = detalle_experiencia_laboral;
    if (this.detalleExp != null) {
      this.loadInfoExperienciaLaboral();
    }
  }


  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_experiencia_laboral: any;
  formInfoExperienciaLaboral: any;
  regInfoExperienciaLaboral: any;
  temp: any;
  clean: boolean;
  percentage: number;
  persona_id: number;
  loading: boolean = false;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private toasterService: ToasterService,
    private organizacionService: OrganizacionService,
    private sgaMidService: SgaMidService,
    private ubicacionesService: UbicacionService,
    private experienciaService: ExperienciaService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private store: Store<IAppState>,
    private listService: ListService,
    private tercerosService: TercerosService,
    private users: UserService) {
    this.formInfoExperienciaLaboral = FORM_EXPERIENCIA_LABORAL;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.persona_id = this.users.getPersonaId();
    this.listService.findPais();
    this.listService.findTipoDedicacion();
    this.listService.findTipoVinculacion();
    this.listService.findCargo();
    this.loadLists();
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('Pais')].opciones = list.listPais[0];
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoOrganizacion')].opciones = list.listTipoOrganizacion[0];
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoDedicacion')].opciones = list.listTipoDedicacion[0];
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoVinculacion')].opciones = list.listTipoVinculacion[0];
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('Cargo')].opciones = list.listCargo[0];
      },
    );
  }

  construirForm() {
    // this.formInfoExperienciaLaboral.titulo = this.translate.instant('GLOBAL.experiencia_laboral');
    this.formInfoExperienciaLaboral.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoExperienciaLaboral.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoExperienciaLaboral.campos.length; i++) {
      this.formInfoExperienciaLaboral.campos[i].label = this.translate.instant('GLOBAL.' +
        this.formInfoExperienciaLaboral.campos[i].label_i18n);
      this.formInfoExperienciaLaboral.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoExperienciaLaboral.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoExperienciaLaboral.campos.length; index++) {
      const element = this.formInfoExperienciaLaboral.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadInfoExperienciaLaboral(): void {
    const init = this.getIndexForm('Nit');
    const inombre = this.getIndexForm('NombreEmpresa');
    const itipo = this.getIndexForm('TipoOrganizacion');
    const idir = this.getIndexForm('Direccion');
    const itel = this.getIndexForm('Telefono');
    const icorreo = this.getIndexForm('Correo');
    const ipais = this.getIndexForm('Pais');
    const ifechaInicio = this.getIndexForm('FechaInicio');
    const ifechaFin = this.getIndexForm('FechaFinalizacion');
    const itipoDedicacion = this.getIndexForm('TipoDedicacion');
    const itipoVinculacion = this.getIndexForm('TipoVinculacion');
    const icargo = this.getIndexForm('Cargo');
    const iactividades = this.getIndexForm('Actividades');
    const isoporte = this.getIndexForm('Soporte');

    this.formInfoExperienciaLaboral.campos[init].valor = this.detalleExp.Nit;
    this.formInfoExperienciaLaboral.campos[inombre].valor = (this.detalleExp.NombreEmpresa && this.detalleExp.NombreEmpresa.Id) ? this.detalleExp.NombreEmpresa : { Id: 0, NombreCompleto: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[idir].valor = (this.detalleExp.Direccion) ? this.detalleExp.Direccion : 'No registrado';
    this.formInfoExperienciaLaboral.campos[itel].valor = (this.detalleExp.Telefono) ? this.detalleExp.Telefono : 'No registrado';
    this.formInfoExperienciaLaboral.campos[icorreo].valor = (this.detalleExp.Correo) ? this.detalleExp.Correo : 'No registrado';
    this.formInfoExperienciaLaboral.campos[ipais].valor = (this.detalleExp.Ubicacion && this.detalleExp.Ubicacion.Id) ? this.detalleExp.Ubicacion : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[itipo].valor = (this.detalleExp.TipoTerceroId && this.detalleExp.TipoTerceroId.Id) ? this.detalleExp.TipoTerceroId : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[ifechaInicio].valor = (this.detalleExp.FechaInicio);
    this.formInfoExperienciaLaboral.campos[ifechaFin].valor = (this.detalleExp.FechaFinalizacion);
    this.formInfoExperienciaLaboral.campos[itipoDedicacion].valor = (this.detalleExp.TipoDedicacion && this.detalleExp.TipoDedicacion.Id) ? this.detalleExp.TipoDedicacion : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[itipoVinculacion].valor = (this.detalleExp.TipoVinculacion && this.detalleExp.TipoVinculacion.Id) ? this.detalleExp.TipoVinculacion : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[icargo].valor = (this.detalleExp.Cargo && this.detalleExp.Cargo.Id) ? this.detalleExp.Cargo : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[iactividades].valor = (this.detalleExp.Actividades);
    // this.formInfoExperienciaLaboral.campos[init].deshabilitar = true;
    const files = [
      {
        Id: this.detalleExp.Soporte,
        key: this.detalleExp.Soporte,
      },
    ];
    this.nuxeoService.getDocumentoById$(files, this.documentoService)
      .subscribe(response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === files.length) {
          files.forEach((file: any) => {
            const url = filesResponse[file.Id];
            this.formInfoExperienciaLaboral.campos[isoporte].urlTemp = url
            // this.formInfoExperienciaLaboral.campos[isoporte].url = url
            this.formInfoExperienciaLaboral.campos[isoporte].valor = 'pdf'
          });
          // this.formInfoExperienciaLaboral.campos[isoporte].valor = filesResponse['Soporte'] + '';
          [
            this.formInfoExperienciaLaboral.campos[ifechaInicio],
            this.formInfoExperienciaLaboral.campos[ifechaFin],
            this.formInfoExperienciaLaboral.campos[itipoDedicacion],
            this.formInfoExperienciaLaboral.campos[itipoVinculacion],
            this.formInfoExperienciaLaboral.campos[icargo],
            this.formInfoExperienciaLaboral.campos[iactividades],
            this.formInfoExperienciaLaboral.campos[isoporte]]
            .forEach(element => {
              element.deshabilitar = false
            });
        }
      },
      (error: HttpErrorResponse) => {
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
            this.translate.instant('GLOBAL.soporte_documento'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  searchNit(data) {
    const init = this.getIndexForm('Nit');
    const inombre = this.getIndexForm('NombreEmpresa');
    const itipo = this.getIndexForm('TipoOrganizacion');
    const idir = this.getIndexForm('Direccion');
    const itel = this.getIndexForm('Telefono');
    const icorreo = this.getIndexForm('Correo');
    const ipais = this.getIndexForm('Pais');
    const regex = /^[0-9]*$/;
    const nit = typeof data === 'string' ? data : data.data.Nit;

    if (regex.test(nit) === true) {
      // this.formInfoExperienciaLaboral.campos[inombre].deshabilitar = true;
      this.searchOrganizacion(nit);
    }
    else {
      this.clean = !this.clean;
      this.formInfoExperienciaLaboral.campos[inombre].deshabilitar = false;
      this.loadListEmpresa(nit);
      this.formInfoExperienciaLaboral.campos[inombre].valor = nit;
    }
  }

  getSeleccion(event) {
    var IdEmpresa;
    if (event.nombre === 'NombreEmpresa') {
      IdEmpresa = this.formInfoExperienciaLaboral.campos[this.getIndexForm('NombreEmpresa')].valor.Id;
      this.tercerosService.get('datos_identificacion?query=TerceroId__Id:' + IdEmpresa).subscribe(
        (res: any) => {
          this.searchOrganizacion(res[0]["Numero"])
        },
        (error: HttpErrorResponse) => {

        }
      )
    }
  }

  loadListEmpresa(nombre: string): void {
    let consultaEmpresa: Array<any> = [];
    const empresa: Array<any> = [];
    this.sgaMidService.get('formacion_academica/info_universidad_nombre?nombre=' + nombre)
      .subscribe(res => {
        if (res !== null) {
          consultaEmpresa = <Array<InfoPersona>>res;
          for (let i = 0; i < consultaEmpresa.length; i++) {
            empresa.push(consultaEmpresa[i]);
          }
        }
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('NombreEmpresa')].opciones = empresa;
      },
      (error: HttpErrorResponse) => {
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.info_caracteristica') + '|' +
            this.translate.instant('GLOBAL.ciudad_nacimiento'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }


  searchOrganizacion(nit: string): void {
    this.loading = true;
    const init = this.getIndexForm('Nit');
    const inombre = this.getIndexForm('NombreEmpresa');
    const itipo = this.getIndexForm('TipoOrganizacion');
    const idir = this.getIndexForm('Direccion');
    const itel = this.getIndexForm('Telefono');
    const icorreo = this.getIndexForm('Correo');
    const ipais = this.getIndexForm('Pais');
    this.sgaMidService.get('experiencia_laboral/informacion_empresa?Id=' + nit)
      .subscribe((res: any) => {
        this.formInfoExperienciaLaboral.campos[init].valor = res.NumeroIdentificacion;
        this.formInfoExperienciaLaboral.campos[inombre].valor = (res.NombreCompleto && res.NombreCompleto.Id) ? res.NombreCompleto : { Id: 0, NombreCompleto: 'No registrado' };
        this.formInfoExperienciaLaboral.campos[idir].valor = (res.Direccion) ? res.Direccion : 'No registrado';
        this.formInfoExperienciaLaboral.campos[itel].valor = (res.Telefono) ? res.Telefono : 'No registrado';
        this.formInfoExperienciaLaboral.campos[icorreo].valor = (res.Correo) ? res.Correo : 'No registrado';
        this.formInfoExperienciaLaboral.campos[ipais].valor = (res.Ubicacion && res.Ubicacion.Id) ? res.Ubicacion : { Id: 0, Nombre: 'No registrado' };
        this.formInfoExperienciaLaboral.campos[itipo].valor = (res.TipoTerceroId && res.TipoTerceroId.Id) ? res.TipoTerceroId : { Id: 0, Nombre: 'No registrado' };
        [
          this.formInfoExperienciaLaboral.campos[inombre],
          this.formInfoExperienciaLaboral.campos[idir],
          this.formInfoExperienciaLaboral.campos[icorreo],
          this.formInfoExperienciaLaboral.campos[ipais],
          this.formInfoExperienciaLaboral.campos[itipo],
          this.formInfoExperienciaLaboral.campos[itel]]
          .forEach(element => {
            element.deshabilitar = element.valor ? true : false
          });
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.clean = !this.clean;
          [this.formInfoExperienciaLaboral.campos[inombre],
          this.formInfoExperienciaLaboral.campos[idir],
          this.formInfoExperienciaLaboral.campos[icorreo],
          this.formInfoExperienciaLaboral.campos[ipais],
          this.formInfoExperienciaLaboral.campos[itipo],
          this.formInfoExperienciaLaboral.campos[itel]]
            .forEach(element => {
              element.deshabilitar = false;
            });
        }
        this.loading = false;
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('experiencia_laboral.empresa_no_encontrada'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  createInfoExperienciaLaboral(infoExperienciaLaboral: any): void {
    if (this.detalleExp != null && this.indexSelect != null && !Number.isNaN(this.indexSelect)) {
      this.putExperiencia(infoExperienciaLaboral);
    } else {
      const opt: any = {
        title: this.translate.instant('GLOBAL.crear'),
        text: this.translate.instant('experiencia_laboral.seguro_continuar_registrar'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal(opt)
        .then((willDelete) => {
          if (willDelete.value) {
            this.loading = true;
            this.info_experiencia_laboral = <any>infoExperienciaLaboral;
            const files = [];
            if (this.info_experiencia_laboral.Experiencia.Soporte.file !== undefined) {
              files.push({
                nombre: this.autenticationService.getPayload().sub, key: 'Documento',
                file: this.info_experiencia_laboral.Experiencia.Soporte.file, IdDocumento: 16
              });
            }

            this.uploadResolutionFile(files);
          }
        });
    }
  }

  putExperiencia(infoExperienciaLaboral: any) {
    const opt: any = {
      title: this.translate.instant('inscripcion.update'),
      // text: this.translate.instant('experiencia_laboral.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_experiencia_laboral = <any>infoExperienciaLaboral;
            const files = [];
            if (this.info_experiencia_laboral.Experiencia.Soporte.file !== undefined) {
              files.push({
                nombre: this.autenticationService.getPayload().sub, key: 'Documento',
                file: this.info_experiencia_laboral.Experiencia.Soporte.file, IdDocumento: 16
              });
            }
            this.uploadResolutionFile(files);
        }
      });
  }

  uploadResolutionFile(file) {
    return new Promise((resolve, reject) => {
      this.nuxeoService.getDocumentos$(file, this.documentoService)
        .subscribe(response => {
          // resolve(response['undefined'].Id); // desempacar el response, puede dejar de llamarse 'undefined'
          if (Object.keys(response).length === file.length) {
            const filesUp = <any>response;
            if (filesUp['Documento'] !== undefined) {
              this.info_experiencia_laboral.Experiencia.DocumentoId = filesUp['Documento'].Id;
              this.info_experiencia_laboral.Experiencia.EnlaceDocumento = filesUp['Documento'].Enlace;
              if (this.detalleExp != null && this.indexSelect != null && !Number.isNaN(this.indexSelect)) {
                this.info_experiencia_laboral.indexSelect = this.indexSelect;
                this.info_experiencia_laboral.terceroID = this.persona_id;
                this.putExperianciaLaboral();
              } else{
                this.postExperianciaLaboral();
              }
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
          }
        }, error => {
          this.loading = false;
          reject(error);
        });
    });
  }

  putExperianciaLaboral() {
    this.loading = true;
    this.sgaMidService.put('experiencia_laboral/', this.info_experiencia_laboral)
      .subscribe(res => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.eventChange.emit(true);
          this.showToast('info', this.translate.instant('GLOBAL.crear'),
            this.translate.instant('experiencia_laboral.experiencia_laboral_registrada'));
          this.info_experiencia_laboral_id = 0;
          this.info_experiencia_laboral = undefined;
          this.indexSelect = NaN;
          this.detalleExp = undefined;
          this.clean = !this.clean;
        } else {
          this.showToast('error', this.translate.instant('GLOBAL.error'),
            this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'));
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  postExperianciaLaboral() {
    this.loading = true;
    this.sgaMidService.post('experiencia_laboral/', this.info_experiencia_laboral)
      .subscribe(res => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.eventChange.emit(true);
          this.showToast('info', this.translate.instant('GLOBAL.crear'),
          this.translate.instant('experiencia_laboral.experiencia_laboral_registrada'));
          this.info_experiencia_laboral_id = 0;
          this.info_experiencia_laboral = undefined;
          this.indexSelect = NaN;
          this.detalleExp = undefined;
          this.clean = !this.clean;
          // this.result.emit(event);
        } else {
          this.showToast('error', this.translate.instant('GLOBAL.error'),
            this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'));
        }
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  ngOnInit() {
    // this.loadInfoExperienciaLaboral();
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  validarForm(event) {
    if (event.valid) {
      const formData = event.data.InfoExperienciaLaboral;
      const organizacionData = {
        NumeroIdentificacion: formData.Nit,
        Direccion: formData.Direccion,
        Pais: formData.Pais,
        Nombre: formData.NombreEmpresa,
        TipoOrganizacion: formData.TipoOrganizacion,
        Telefono: formData.Telefono,
        Correo: formData.Correo,
      };
      const tercero = {
        Id: this.persona_id || 1, // se debe cambiar solo por persona id
      }
      const postData = {
        InfoComplementariaTercero: [
          {
            // Información de la universidad
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: 1, // Completar id faltante
            },
            Dato: JSON.stringify(organizacionData),
            Activo: true,
          },
        ],
        Experiencia: {
          Persona: this.persona_id || 1,
          Actividades: formData.Actividades,
          FechaInicio: formData.FechaInicio,
          FechaFinalizacion: formData.FechaFinalizacion,
          Organizacion: 0,
          TipoDedicacion: formData.TipoDedicacion,
          Cargo: formData.Cargo,
          TipoVinculacion: formData.TipoVinculacion,
          Soporte: formData.Soporte,
        },
      }
      this.createInfoExperienciaLaboral(postData);
      this.result.emit(event);
    }
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }
}
