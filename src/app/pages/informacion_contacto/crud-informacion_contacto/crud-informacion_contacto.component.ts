import { Lugar } from './../../../@core/data/models/lugar/lugar';
import { InformacionContacto } from './../../../@core/data/models/informacion/informacion_contacto';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { UserService } from '../../../@core/data/users.service';
import { FORM_INFORMACION_CONTACTO } from './form-informacion_contacto';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { Store } from '@ngrx/store';
import { PopUpManager } from '../../../managers/popUpManager';
import { InfoContactoGet } from '../../../@core/data/models/ente/info_contacto_get';
import { InfoPersona } from './../../../@core/data/models/informacion/info_persona';

@Component({
  selector: 'ngx-crud-informacion-contacto',
  templateUrl: './crud-informacion_contacto.component.html',
  styleUrls: ['./crud-informacion_contacto.component.scss'],
})
export class CrudInformacionContactoComponent implements OnInit {
  config: ToasterConfig;
  persona_id: number;
  informacion_contacto_id: number;
  info_informacion_contacto: any;

  @Input('informacion_contacto_id')
  set name(informacion_contacto_id: number) {
    this.informacion_contacto_id = informacion_contacto_id;
    if (this.informacion_contacto_id !== undefined && this.informacion_contacto_id !== 0 &&
      this.informacion_contacto_id.toString() !== '') {
      // this.loadInformacionContacto();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  formInformacionContacto: any;
  clean: boolean;
  paisSeleccionado: any;
  departamentoSeleccionado: any;
  denied_acces: boolean = false;
  loading: boolean;
  info_persona_id: number;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private ubicacionesService: UbicacionService,
    private store: Store<IAppState>,
    private listService: ListService,
    private userService: UserService,
    private sgaMidService: SgaMidService,
    private toasterService: ToasterService) {
    this.formInformacionContacto = FORM_INFORMACION_CONTACTO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findPais();
    this.loadLists();
    this.persona_id = this.userService.getPersonaId();
    this.loadInformacionContacto();
  }

  construirForm() {
    // this.formInformacionContacto.titulo = this.translate.instant('GLOBAL.informacion_contacto');
    this.info_persona_id = this.userService.getPersonaId();
    this.formInformacionContacto.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInformacionContacto.campos.length; i++) {
      this.formInformacionContacto.campos[i].label = this.translate.instant('GLOBAL.' + this.formInformacionContacto.campos[i].label_i18n);
      this.formInformacionContacto.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInformacionContacto.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getSeleccion(event) {
    if (event.nombre === 'PaisResidencia') {
      if (this.paisSeleccionado !== event.valor) {
        this.paisSeleccionado = event.valor;
        this.loadOptionsDepartamentoResidencia(event.valor);
      }
    } else if (event.nombre === 'DepartamentoResidencia') {
      if (this.departamentoSeleccionado !== event.valor) {
        this.departamentoSeleccionado = event.valor;
        this.loadOptionsCiudadResidencia();
      }
    }
  }

  loadOptionsDepartamentoResidencia(paisSeleccionado): void {
    this.loading = true;
    let consultaHijos: Array<any> = [];
    const departamentoResidencia: Array<any> = [];
    if (paisSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadreId.Id:' + paisSeleccionado.Id + ',LugarHijoId.Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              departamentoResidencia.push(consultaHijos[i].LugarHijoId);
            }
          }
          this.loading = false;
          this.formInformacionContacto.campos[this.getIndexForm('DepartamentoResidencia')].opciones = departamentoResidencia;
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.departamento_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  loadOptionsCiudadResidencia(): void {
    this.loading = true;
    let consultaHijos: Array<any> = [];
    const ciudadResidencia: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadreId.Id:' + this.departamentoSeleccionado.Id +
        ',LugarHijoId.Activo:true,TipoRelacionLugarId.Id:2&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              ciudadResidencia.push(consultaHijos[i].LugarHijoId);
            }
          }
          this.loading = false;
          this.formInformacionContacto.campos[this.getIndexForm('CiudadResidencia')].opciones = ciudadResidencia;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.informacion_contacto') + '|' +
              this.translate.instant('GLOBAL.ciudad_residencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInformacionContacto.campos.length; index++) {
      const element = this.formInformacionContacto.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  ngOnInit() {
  }

  loadInformacionContacto() {
    if (this.persona_id) {
      this.sgaMidService.get('inscripciones/info_complementaria_tercero/' + this.persona_id)
      .subscribe(res => {
        if (res !== null) {
          this.info_informacion_contacto = <InformacionContacto>res;
          if (this.info_informacion_contacto.PaisResidencia !== null && this.info_informacion_contacto.DepartamentoResidencia !== null
            && this.info_informacion_contacto.CiudadResidencia != null) {
            this.formInformacionContacto.campos[this.getIndexForm('PaisResidencia')].opciones = [this.info_informacion_contacto.PaisResidencia];
            this.formInformacionContacto.campos[this.getIndexForm('DepartamentoResidencia')].opciones = [this.info_informacion_contacto.DepartamentoResidencia];
            this.formInformacionContacto.campos[this.getIndexForm('CiudadResidencia')].opciones = [this.info_informacion_contacto.CiudadResidencia];
          }
          this.loading = false;
        } else {
          this.loading = false;
          this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_info'));
        }
      },
        (error: HttpErrorResponse) => {
          this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_info'));
          this.info_informacion_contacto = undefined;
          this.loading = false;
        });
    }
  }

  validarForm(event) {
    if (event.valid) {
      const formData = event.data.InfoInformacionContacto;
      const tercero = {
        Id: this.persona_id  || 1, // se debe cambiar solo por persona id
      }
      const dataInfoContacto = {
        InfoComplementariaTercero: [
          {
            // Estrato
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: 41,
            },
            Dato: JSON.stringify({value: formData.EstratoResidencia}),
            Activo: true,
          },
          {
            // CodigoPostal
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: 55,
            },
            Dato: JSON.stringify({value: formData.CodigoPostal}),
            Activo: true,
          },
          {
            // Telefono
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: 51,
            },
            Dato: JSON.stringify({
              principal: formData.Telefono,
              alterno: formData.TelefonoAlterno,
            }),
            Activo: true,
          },
          {
            // Dirección
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: 54,
            },
            Dato: JSON.stringify({
              country: formData.PaisResidencia,
              department: formData.DepartamentoResidencia,
              city: formData.CiudadResidencia,
              address: formData.DireccionResidencia,
            }),
            Activo: true,
          },
        ],
      }
      if (this.info_informacion_contacto === undefined && !this.denied_acces) {
        this.createInfoContacto(dataInfoContacto);
      } else {
        this.updateInfoContacto(dataInfoContacto);
      }
    }
  }

  updateInfoContacto(info_contacto: any): void {
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
          this.info_informacion_contacto = <InformacionContacto>info_contacto;
          this.info_informacion_contacto.Ente = this.info_persona_id;
          this.sgaMidService.put('inscripciones/info_contacto', this.info_informacion_contacto).subscribe(
            (res: any) => {
              if (res !== null && res.Response.Code == '404') {
                this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_data'));
              } else if (res !== null && res.Response.Code == '400') {
                this.popUpManager.showAlert('', this.translate.instant('inscripcion.error_update'));
              } else if (res !== null && res.Response.Code == '200') {
                this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                this.translate.instant('GLOBAL.info_contacto') + ' ' +
                this.translate.instant('GLOBAL.confirmarActualizar'));
                this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
                this.loadInformacionContacto();
              }
              this.loading = false;
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
            },
          );
        }
        // this.loading = false;
      });
  }

  createInfoContacto(info_contacto: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('informacion_contacto_posgrado.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        this.loading = true;
        this.info_informacion_contacto = true;
        if (willDelete.value) {
          this.info_informacion_contacto = <any>info_contacto;
          this.sgaMidService.post('inscripciones/info_complementaria_tercero', this.info_informacion_contacto)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.Type !== 'error') {
                this.popUpManager.showSuccessAlert(this.translate.instant('informacion_contacto_posgrado.informacion_contacto_registrada'));
                this.showToast('info', this.translate.instant('GLOBAL.registrar'),
                this.translate.instant('informacion_contacto_posgrado.informacion_contacto_registrada'));
                this.clean = !this.clean;
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'),
                this.translate.instant('informacion_contacto_posgrado.informacion_contacto_no_registrada'));
              }
              this.loading = false;
            },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('informacion_contacto_posgrado.informacion_contacto_no_registrada'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
              this.showToast('error', this.translate.instant('GLOBAL.error'),
                this.translate.instant('informacion_contacto_posgrado.informacion_contacto_no_registrada'));
            });
        }
      });
  }

  setPercentage(event) {
    setTimeout(() => {
      this.result.emit(event);
    });
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
        this.formInformacionContacto.campos[this.getIndexForm('PaisResidencia')].opciones = list.listPais[0];
      },
    );
  }

}
