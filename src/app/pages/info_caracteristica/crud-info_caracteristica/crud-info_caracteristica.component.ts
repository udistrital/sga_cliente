import { Lugar } from './../../../@core/data/models/lugar/lugar';
import { InfoCaracteristica } from './../../../@core/data/models/informacion/info_caracteristica';
import { InfoCaracteristicaGet } from './../../../@core/data/models/informacion/info_caracteristica_get';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { FORM_INFO_CARACTERISTICA } from './form-info_caracteristica';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { PopUpManager } from '../../../managers/popUpManager';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';

@Component({
  selector: 'ngx-crud-info-caracteristica',
  templateUrl: './crud-info_caracteristica.component.html',
  styleUrls: ['./crud-info_caracteristica.component.scss'],
})
export class CrudInfoCaracteristicaComponent implements OnInit {
  config: ToasterConfig;
  info_caracteristica_id: number;
  porcentaje: number;

  @Input('info_caracteristica_id')
  set name(info_caracteristica_id: number) {
    this.info_caracteristica_id = info_caracteristica_id;
  }

  @Input('porcentaje')
  set valPorcentaje(porcentaje: number) {
    this.porcentaje = porcentaje / 100 * 2;
  }

  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_info_caracteristica: InfoCaracteristica;
  info_persona_id: number;
  info_info_persona: any;
  datosGet: InfoCaracteristicaGet;
  formInfoCaracteristica: any;
  regInfoCaracteristica: any;
  paisSeleccionado: any;
  departamentoSeleccionado: any;
  mensaje_discapcidades: boolean = false;
  mensaje_poblacion: boolean = false;
  mensaje_poblacion_discapcidades: boolean = false;
  clean: boolean;
  denied_acces: boolean = false;
  loading: boolean;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private userService: UserService,
    private ubicacionesService: UbicacionService,
    private store: Store<IAppState>,
    private listService: ListService,
    private nuxeo: NuxeoService,
    private newNuxeoService: NewNuxeoService,
    private toasterService: ToasterService,
    private utilidades: UtilidadesService) {
    this.formInfoCaracteristica = FORM_INFO_CARACTERISTICA;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loading = true;
    this.listService.findPais();
    this.listService.findTipoPoblacion();
    this.listService.findTipoDiscapacidad();
    this.listService.findFactorRh();
    this.listService.findGrupoSanguineo();
    this.loadLists();
    // this.loadInfoCaracteristica();
  }

  construirForm() {
    this.info_persona_id = this.userService.getPersonaId();
    this.formInfoCaracteristica.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInfoCaracteristica.campos.length; i++) {
      this.formInfoCaracteristica.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoCaracteristica.campos[i].label_i18n);
      this.formInfoCaracteristica.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInfoCaracteristica.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getSeleccion(event) {
    if (event.nombre === 'PaisNacimiento') {
      this.paisSeleccionado = event.valor;
      this.loadOptionsDepartamentoNacimiento();
    } else if (event.nombre === 'DepartamentoNacimiento') {
      this.departamentoSeleccionado = event.valor;
      this.loadOptionsCiudadNacimiento();
    } else if (event.nombre === 'TipoDiscapacidad') {
      let NoAplicaDisc = !((event.valor.filter(data => data.Nombre !== 'NO APLICA')).length > 0);
      this.formInfoCaracteristica.campos[this.getIndexForm('ComprobanteDiscapacidad')].ocultar = NoAplicaDisc;
      
      if (!NoAplicaDisc) {
        this.mensaje_discapcidades = true;
      } else {
        this.mensaje_discapcidades = false;
      }

      this.mensaje_poblacion_discapcidades = this.mensaje_discapcidades && this.mensaje_poblacion;

      if (this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor.length === 0) {
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor = this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].opciones.filter(data => data.Nombre === 'NO APLICA');
      } else if (this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor.length > 1) {
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor = this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor.filter(data => data.Nombre !== 'NO APLICA');
      }
    } else if (event.nombre === 'TipoPoblacion') {
      let NoAplicaPob = !((event.valor.filter(data => data.Nombre !== 'NO APLICA')).length > 0);
      this.formInfoCaracteristica.campos[this.getIndexForm('ComprobantePoblacion')].ocultar = NoAplicaPob;

      if (!NoAplicaPob) {
        this.mensaje_poblacion = true;
      } else {
        this.mensaje_poblacion = false;
      }

      this.mensaje_poblacion_discapcidades = this.mensaje_discapcidades && this.mensaje_poblacion;

      if (this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor.length === 0) {
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor = this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].opciones.filter(data => data.Nombre === 'NO APLICA');
      } else if (this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor.length > 1) {
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor = this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor.filter(data => data.Nombre !== 'NO APLICA');
      }
    }
  }

  loadOptionsDepartamentoNacimiento(): void {
    this.loading = true;
    let consultaHijos: Array<any> = [];
    const departamentoNacimiento: Array<any> = [];
    if (this.paisSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadreId__Id:' + this.paisSeleccionado.Id +
        ',LugarHijoId__Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre').subscribe(
          res => {
            if (res !== null) {
              consultaHijos = <Array<Lugar>>res;
              for (let i = 0; i < consultaHijos.length; i++) {
                departamentoNacimiento.push(consultaHijos[i].LugarHijoId);
              }
            }
            this.loading = false;
            this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].opciones = departamentoNacimiento;
          },
          (error: HttpErrorResponse) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica') + '|' +
                this.translate.instant('GLOBAL.departamento_nacimiento'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.loading = false;
    }
  }

  loadOptionsCiudadNacimiento(): void {
    this.loading = true;
    let consultaHijos: Array<any> = [];
    const ciudadNacimiento: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadreId__Id:' + this.departamentoSeleccionado.Id
        + ',LugarHijoId__Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              ciudadNacimiento.push(consultaHijos[i].LugarHijoId);
            }
          }
          this.loading = false;
          this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].opciones = ciudadNacimiento;
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica') + '|' +
                this.translate.instant('GLOBAL.ciudad_nacimiento'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.loading = false;
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoCaracteristica.campos.length; index++) {
      const element = this.formInfoCaracteristica.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  cargarDocs(files) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      files.forEach((file) => {
        const filesll = []
        filesll.push(file)
        this.newNuxeoService.get(filesll).subscribe(
          response => {
            this.loading = true;
            const filesResponse = <Array<any>>response;
            if (Object.keys(filesResponse).length === filesll.length) {
              filesResponse.forEach(fileR => {
                if (fileR['Id'] === this.formInfoCaracteristica.ComprobantePoblacion) {
                  //this.formInfoCaracteristica.campos[this.getIndexForm('ComprobantePoblacion')].urlTemp = fileR.url;
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobantePoblacion')].valor = fileR.url;
                  let estadoDoc = this.utilidades.getEvaluacionDocumento(fileR.Metadatos);
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobantePoblacion')].estadoDoc = estadoDoc;
                } else if (fileR['Id'] === this.formInfoCaracteristica.ComprobanteDiscapacidad) {
                  //this.formInfoCaracteristica.campos[this.getIndexForm('ComprobanteDiscapacidad')].urlTemp = fileR.url;
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobanteDiscapacidad')].valor = fileR.url;
                  let estadoDoc = this.utilidades.getEvaluacionDocumento(fileR.Metadatos);
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobanteDiscapacidad')].estadoDoc = estadoDoc;
                }
              })
              this.loading = false;
            }
          },
            (error: HttpErrorResponse) => {
              reject(error);
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                  this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
                  this.translate.instant('GLOBAL.soporte_documento'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
      });
      resolve(true);
    });
  }

  public loadInfoCaracteristica(): void {
    this.loading = true;
    if (this.info_persona_id !== undefined && this.info_persona_id !== 0 &&
      this.info_persona_id.toString() !== '') {
      this.denied_acces = false;
      this.sgamidService.get('persona/consultar_complementarios/' + this.info_persona_id)
        .subscribe(async res => {
          if (res !== null && res.Response.Code !== '404') {
            this.datosGet = <InfoCaracteristicaGet>res.Response.Body[0].Data;
            this.info_info_caracteristica = <InfoCaracteristica>res.Response.Body[0].Data;
            this.info_info_caracteristica.Ente = (1 * this.info_caracteristica_id);
            this.info_info_caracteristica.TipoRelacionUbicacionEnte = 1;
            this.info_info_caracteristica.IdLugarEnte = this.datosGet.Lugar.Id;
            this.info_info_caracteristica.PaisNacimiento = this.datosGet.Lugar.Lugar.PAIS;
            if (this.datosGet.Lugar.Lugar.DEPARTAMENTO === undefined) {
              this.info_info_caracteristica.DepartamentoNacimiento = this.datosGet.Lugar.Lugar.CIUDAD;
              this.info_info_caracteristica.Lugar = this.datosGet.Lugar.Lugar.LOCALIDAD;
            } else {
              this.info_info_caracteristica.DepartamentoNacimiento = this.datosGet.Lugar.Lugar.DEPARTAMENTO;
              this.info_info_caracteristica.Lugar = this.datosGet.Lugar.Lugar.CIUDAD;
            }
            if (this.info_info_caracteristica.TipoPoblacion.length == 0) {
              this.info_info_caracteristica.TipoPoblacion =
                [this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].opciones.filter(data => data.Nombre === 'NO APLICA')];
            }

            if (this.info_info_caracteristica.TipoDiscapacidad.length == 0) {
              this.info_info_caracteristica.TipoDiscapacidad =
                [this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].opciones.filter(data => data.Nombre === 'NO APLICA')];
            }

            this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].opciones = [this.info_info_caracteristica.DepartamentoNacimiento];
            this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].opciones = [this.info_info_caracteristica.Lugar];

            this.formInfoCaracteristica.ComprobantePoblacion = this.datosGet.IdDocumentoPoblacion;
            this.formInfoCaracteristica.ComprobanteDiscapacidad = this.datosGet.IdDocumentoDiscapacidad;
            const files = []
            if (this.formInfoCaracteristica.ComprobantePoblacion + '' !== '0' && this.formInfoCaracteristica.ComprobantePoblacion !== undefined) {
              files.push({ Id: this.formInfoCaracteristica.ComprobantePoblacion });
            }
            if (this.formInfoCaracteristica.ComprobanteDiscapacidad + '' !== '0' && this.formInfoCaracteristica.ComprobanteDiscapacidad !== undefined) {
              files.push({ Id: this.formInfoCaracteristica.ComprobanteDiscapacidad });
            }

            let carga = await this.cargarDocs(files);

          } else {
            this.loading = false;
            this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_info'));
            this.datosGet = undefined;
          }
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_info'));
          });
    } else {
      this.info_info_caracteristica = undefined;
      this.clean = !this.clean;
      this.denied_acces = false; // no muestra el formulario a menos que se le pase un id del ente info_caracteristica_id
      this.loading = false;
    }
  }

  updateInfoCaracteristica(infoCaracteristica: any): void {
    this.loading = false;
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('inscripcion.update'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.loading = true;
          this.info_info_caracteristica = <InfoCaracteristica>infoCaracteristica;
          this.info_info_caracteristica.Ente = this.info_persona_id;
          //console.log("put: ", this.info_info_caracteristica); this.loading = false;
          this.sgamidService.put('persona/actualizar_complementarios', this.info_info_caracteristica)
            .subscribe(res => {
              this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                this.translate.instant('GLOBAL.info_caracteristica') + ' ' +
                this.translate.instant('GLOBAL.confirmarActualizar'));
              this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar')).then(() => {
                this.loadInfoCaracteristica();
              });
              this.popUpManager.showToast('info', this.translate.instant('inscripcion.cambiar_tab'));
            },
              (error: HttpErrorResponse) => {
                this.loading = false;
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                    this.translate.instant('GLOBAL.info_caracteristica'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        } else {
          this.loading = false;
        }
      });
  }

  createInfoCaracteristica(infoCaracteristica: any): void {
    this.loading = false;
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('inscripcion.crear'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.loading = true;
          const info_info_caracteristica_post = <any>infoCaracteristica;
          info_info_caracteristica_post.TipoRelacionUbicacionEnte = 1;
          info_info_caracteristica_post.Tercero = this.info_persona_id;
          this.sgamidService.post('persona/guardar_complementarios', info_info_caracteristica_post)
            .subscribe(res => {
              if (res !== null) {
                this.info_info_caracteristica = <InfoCaracteristica>infoCaracteristica;
                this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.guardar')).then(() => {
                  this.loadInfoCaracteristica();
                });
                this.popUpManager.showToast('info', this.translate.instant('inscripcion.cambiar_tab'));
              }
              this.loading = false;
            },
              (error: HttpErrorResponse) => {
                this.loading = false;
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                });
              });
        } else {
          this.loading = false;
        }
      });
  }

  ngOnInit() {
    this.loadInfoCaracteristica();
  }

  validarForm(event) {
    if (event.valid) {
      if (typeof event.data.InfoCaracteristica.ComprobantePoblacion.file !== 'undefined' && event.data.InfoCaracteristica.ComprobantePoblacion.file !== null) {
        this.loading = true;
        const file = [{
          IdDocumento: 64,
          nombre: 'Comprobante_Poblacion',
          file: event.data.InfoCaracteristica.ComprobantePoblacion.file,
        }]
        this.newNuxeoService.uploadFiles(file).subscribe(
          (responseNux: any[]) => {
            if(responseNux[0].Status == "200"){

              event.data.InfoCaracteristica.ComprobantePoblacion.Id = responseNux[0].res.Id;
              
              if (typeof event.data.InfoCaracteristica.ComprobanteDiscapacidad.file !== 'undefined' && event.data.InfoCaracteristica.ComprobanteDiscapacidad.file !== null) {
                const file = [{
                  IdDocumento: 64,
                  nombre: 'Comprobante_Discapacidad',
                  file: event.data.InfoCaracteristica.ComprobanteDiscapacidad.file,
                }]
                this.newNuxeoService.uploadFiles(file).subscribe(
                  (responseNux: any[]) => {
                    event.data.InfoCaracteristica.ComprobanteDiscapacidad.Id = responseNux[0].res.Id;

                    if (this.info_info_caracteristica === undefined && !this.denied_acces) {
                      this.createInfoCaracteristica(event.data.InfoCaracteristica);
                    } else {
                      this.updateInfoCaracteristica(event.data.InfoCaracteristica);
                    }
                  })

              } else {
                if(this.datosGet !== undefined){
                if (this.datosGet.IdDocumentoDiscapacidad !== undefined && event.data.InfoCaracteristica.TipoDiscapacidad[0].Nombre !== 'NO APLICA') {
                  event.data.InfoCaracteristica.ComprobanteDiscapacidad.Id = this.datosGet.IdDocumentoDiscapacidad;
                }}

                if (this.info_info_caracteristica === undefined && !this.denied_acces) {
                  this.createInfoCaracteristica(event.data.InfoCaracteristica);
                } else {
                  this.updateInfoCaracteristica(event.data.InfoCaracteristica);
                }
              }
            }
          });

      } else {
        if(this.datosGet !== undefined){
        if (this.datosGet.IdDocumentoPoblacion !== undefined && event.data.InfoCaracteristica.TipoPoblacion[0].Nombre !== 'NO APLICA') {
          event.data.InfoCaracteristica.ComprobantePoblacion.Id = this.datosGet.IdDocumentoPoblacion;
        }}

        if (typeof event.data.InfoCaracteristica.ComprobanteDiscapacidad.file !== 'undefined' && event.data.InfoCaracteristica.ComprobanteDiscapacidad.file !== null) {
          const file = [{
            IdDocumento: 64,
            nombre: 'Comprobante_Discapacidad',
            file: event.data.InfoCaracteristica.ComprobanteDiscapacidad.file,
          }]
          this.newNuxeoService.uploadFiles(file).subscribe(
            (responseNux: any[]) => {
              if(responseNux[0].Status == "200"){

                event.data.InfoCaracteristica.ComprobanteDiscapacidad.Id = responseNux[0].res.Id;

                if (this.info_info_caracteristica === undefined && !this.denied_acces) {
                  this.createInfoCaracteristica(event.data.InfoCaracteristica);
                } else {
                  this.updateInfoCaracteristica(event.data.InfoCaracteristica);
                }
              }
            })
        } else {
          if(this.datosGet !== undefined){
          if (this.datosGet.IdDocumentoDiscapacidad !== undefined && event.data.InfoCaracteristica.TipoDiscapacidad[0].Nombre !== 'NO APLICA') {
            event.data.InfoCaracteristica.ComprobanteDiscapacidad.Id = this.datosGet.IdDocumentoDiscapacidad;
          }}

          if (this.info_info_caracteristica === undefined && !this.denied_acces) {
            this.createInfoCaracteristica(event.data.InfoCaracteristica);
          } else {
            this.updateInfoCaracteristica(event.data.InfoCaracteristica);
          }
        }
      }
    }
  }

  setPercentage(event) {
    if (event > 1 || this.porcentaje > 1) {
      setTimeout(() => {
        this.result.emit(1);
      });
    } else if (event < this.porcentaje) {
      setTimeout(() => {
        this.result.emit(this.porcentaje);
      });
    } else {
      setTimeout(() => {
        this.result.emit(event);
      });
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

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formInfoCaracteristica.campos[this.getIndexForm('PaisNacimiento')].opciones = list.listPais[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].opciones = list.listTipoPoblacion[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].opciones = list.listTipoDiscapacidad[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('GrupoSanguineo')].opciones = list.listGrupoSanguineo[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('Rh')].opciones = list.listFactorRh[0];
      },
    );
  }

}
