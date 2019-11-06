import { Lugar } from './../../../@core/data/models/lugar';
import { InfoCaracteristica } from './../../../@core/data/models/info_caracteristica';
import { InfoCaracteristicaGet } from './../../../@core/data/models/info_caracteristica_get';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { FORM_INFO_CARACTERISTICA } from './form-info_caracteristica';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';

@Component({
  selector: 'ngx-crud-info-caracteristica',
  templateUrl: './crud-info_caracteristica.component.html',
  styleUrls: ['./crud-info_caracteristica.component.scss'],
})
export class CrudInfoCaracteristicaComponent implements OnInit {
  config: ToasterConfig;
  info_caracteristica_id: number;

  @Input('info_caracteristica_id')
  set name(info_caracteristica_id: number) {
    this.info_caracteristica_id = info_caracteristica_id;
    if (this.info_caracteristica_id !== undefined && this.info_caracteristica_id !== 0 &&
      this.info_caracteristica_id.toString() !== '') {
      this.loadInfoCaracteristica();
    }
  }

  @Output() eventChange = new EventEmitter();
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_info_caracteristica: InfoCaracteristica;
  datosGet: InfoCaracteristicaGet;
  formInfoCaracteristica: any;
  regInfoCaracteristica: any;
  paisSeleccionado: any;
  departamentoSeleccionado: any;
  clean: boolean;
  denied_acces: boolean = false;
  loading: boolean;

  constructor(
    private translate: TranslateService,
    private campusMidService: CampusMidService,
    private ubicacionesService: UbicacionService,
    private store: Store<IAppState>,
    private listService: ListService,
    private toasterService: ToasterService) {
    this.formInfoCaracteristica = FORM_INFO_CARACTERISTICA;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findPais();
    this.listService.findGrupoEtnico();
    this.listService.findTipoDiscapacidad();
    this.loadLists();
    this.loading = false;
  }

  construirForm() {
    // this.formInfoCaracteristica.titulo = this.translate.instant('GLOBAL.info_caracteristica');
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
    }
  }

  loadOptionsDepartamentoNacimiento(): void {
    let consultaHijos: Array<any> = [];
    const departamentoNacimiento: Array<any> = [];
    if (this.paisSeleccionado) {
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadre.Id:' + this.paisSeleccionado.Id + ',LugarHijo.Activo:true&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              departamentoNacimiento.push(consultaHijos[i].LugarHijo);
            }
          }
          this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].opciones = departamentoNacimiento;
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica') + '|' +
                this.translate.instant('GLOBAL.departamento_nacimiento'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  loadOptionsCiudadNacimiento(): void {
    let consultaHijos: Array<any> = [];
    const ciudadNacimiento: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadre.Id:' + this.departamentoSeleccionado.Id + ',LugarHijo.Activo:true&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              ciudadNacimiento.push(consultaHijos[i].LugarHijo);
            }
          }
          this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].opciones = ciudadNacimiento;
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

  public loadInfoCaracteristica(): void {
    this.loading = true;
    if (this.info_caracteristica_id !== undefined && this.info_caracteristica_id !== 0 &&
      this.info_caracteristica_id.toString() !== '') {
      this.denied_acces = false;
      this.campusMidService.get('persona/consultar_complementarios/' + this.info_caracteristica_id)
        .subscribe(res => {
          if (res !== null) {
            this.datosGet = <InfoCaracteristicaGet>res;
            this.info_info_caracteristica = <InfoCaracteristica>res;
            this.info_info_caracteristica.Ente = (1 * this.info_caracteristica_id);
            this.info_info_caracteristica.GrupoSanguineo = <any>{ Id: this.info_info_caracteristica.GrupoSanguineo };
            this.info_info_caracteristica.Rh = <any>{ Id: this.info_info_caracteristica.Rh };
            this.info_info_caracteristica.TipoRelacionUbicacionEnte = 1;
            this.info_info_caracteristica.IdLugarEnte = this.datosGet.Lugar.Id;
            this.info_info_caracteristica.PaisNacimiento = this.datosGet.Lugar.Lugar.PAIS;
            this.info_info_caracteristica.DepartamentoNacimiento = this.datosGet.Lugar.Lugar.DEPARTAMENTO;
            this.info_info_caracteristica.Lugar = this.datosGet.Lugar.Lugar.CIUDAD;
            this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].opciones[0] = this.info_info_caracteristica.DepartamentoNacimiento;
            this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].opciones[0] = this.info_info_caracteristica.Lugar;
            this.loading = false;
          }
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.info_info_caracteristica = undefined;
      this.clean = !this.clean;
      this.denied_acces = false; // no muestra el formulario a menos que se le pase un id del ente info_caracteristica_id
      this.loading = false;
    }
  }

  updateInfoCaracteristica(infoCaracteristica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('GLOBAL.actualizar') + '?',
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
          this.info_info_caracteristica = <InfoCaracteristica>infoCaracteristica;
          this.campusMidService.put('persona/actualizar_complementarios', this.info_info_caracteristica)
            .subscribe(res => {
              this.loadInfoCaracteristica();
              this.loading = false;
              this.eventChange.emit(true);
              this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                this.translate.instant('GLOBAL.info_caracteristica') + ' ' +
                this.translate.instant('GLOBAL.confirmarActualizar'));
            },
              (error: HttpErrorResponse) => {
                this.loading = false;
                Swal({
                  type: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                    this.translate.instant('GLOBAL.info_caracteristica'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  createInfoCaracteristica(infoCaracteristica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('GLOBAL.crear') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          const info_info_caracteristica_post = <any>infoCaracteristica;
          info_info_caracteristica_post.TipoRelacionUbicacionEnte = 1;
          info_info_caracteristica_post.Ente = (1 * this.info_caracteristica_id);
          info_info_caracteristica_post.Persona = (1 * this.info_caracteristica_id);
          info_info_caracteristica_post.LugarAnt = info_info_caracteristica_post.Lugar;
          info_info_caracteristica_post.Lugar = {
            Lugar: info_info_caracteristica_post.LugarAnt,
          };
          console.info(JSON.stringify(info_info_caracteristica_post));
          this.campusMidService.post('persona/guardar_complementarios', info_info_caracteristica_post)
            .subscribe(res => {
              if (res !== null) {
                this.info_info_caracteristica = <InfoCaracteristica>infoCaracteristica;
                this.loading = false;
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.crear'),
                  this.translate.instant('GLOBAL.info_caracteristica') + ' ' +
                  this.translate.instant('GLOBAL.confirmarCrear'));
              }
            },
              (error: HttpErrorResponse) => {
                Swal({
                  type: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.crear') + '-' +
                    this.translate.instant('GLOBAL.info_caracteristica'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  ngOnInit() {
    this.loadInfoCaracteristica();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_info_caracteristica === undefined && !this.denied_acces) {
        this.createInfoCaracteristica(event.data.InfoCaracteristica);
      } else {
        this.updateInfoCaracteristica(event.data.InfoCaracteristica);
      }
    }
  }

  setPercentage(event) {
    this.result.emit(event);
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
        this.formInfoCaracteristica.campos[this.getIndexForm('GrupoEtnico')].opciones = list.listGrupoEtnico[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].opciones = list.listTipoDiscapacidad[0];
      },
    );
  }

}
