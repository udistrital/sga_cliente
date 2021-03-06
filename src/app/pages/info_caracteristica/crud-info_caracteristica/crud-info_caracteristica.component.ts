import { Lugar } from './../../../@core/data/models/lugar/lugar';
import { InfoCaracteristica } from './../../../@core/data/models/informacion/info_caracteristica';
import { InfoPersona } from './../../../@core/data/models/informacion/info_persona';
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
        //this.loadInfoCaracteristica();
      }
    }

  @Output() eventChange = new EventEmitter();
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
  clean: boolean;
  denied_acces: boolean = false;
  loading: boolean = true;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private userService: UserService,
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
    this.listService.findFactorRh();
    this.listService.findGrupoSanguineo();
    this.loadInfoCaracteristica();
  }

  construirForm() {
    //this.formInfoCaracteristica.titulo = this.translate.instant('GLOBAL.info_caracteristica');
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
    }
  }

  loadOptionsDepartamentoNacimiento(): void {
    this.loading = true;
    let consultaHijos: Array<any> = [];
    const departamentoNacimiento: Array<any> = [];
    if (this.paisSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadre__Id:' + this.paisSeleccionado.Id + ',LugarHijo__Activo:true&limit=0').subscribe(
        res => {
           if (res !== null) {
              consultaHijos = <Array<Lugar>>res;
              for (let i = 0; i < consultaHijos.length; i++) {
                departamentoNacimiento.push(consultaHijos[i].LugarHijo);
              }
            }
            this.loading = false;
            this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].opciones = departamentoNacimiento;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon:'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.info_caracteristica') + '|' +
            this.translate.instant('GLOBAL.departamento_nacimiento'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    } else{
      this.loading = false;
    }
  }

  loadOptionsCiudadNacimiento(): void {
    this.loading = true;
    let consultaHijos: Array<any> = [];
    const ciudadNacimiento: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadre__Id:' + this.departamentoSeleccionado.Id + ',LugarHijo__Activo:true&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              ciudadNacimiento.push(consultaHijos[i].LugarHijo);
            }
          }
          this.loading = false;
          this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].opciones = ciudadNacimiento;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon:'error',
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

   public loadInfoCaracteristica(): void {
    this.loadLists();
    this.loading = true;
    if (this.info_persona_id !== undefined && this.info_persona_id !== 0 &&
      this.info_persona_id.toString() !== '') {
      this.denied_acces = false;
      this.sgamidService.get('persona/consultar_complementarios/' + this.info_persona_id)
        .subscribe(res => {
          if (res !== null) {
            this.datosGet = <InfoCaracteristicaGet>res;
            this.info_info_caracteristica = <InfoCaracteristica>res;
            this.info_info_caracteristica.Ente = (1 * this.info_caracteristica_id);
            this.info_info_caracteristica.TipoRelacionUbicacionEnte = 1;
            this.info_info_caracteristica.IdLugarEnte = this.datosGet.Lugar.Id;
            this.info_info_caracteristica.PaisNacimiento = this.datosGet.Lugar.Lugar.PAIS;
            this.info_info_caracteristica.DepartamentoNacimiento = this.datosGet.Lugar.Lugar.DEPARTAMENTO;
            this.info_info_caracteristica.Lugar = this.datosGet.Lugar.Lugar.CIUDAD;
            this.formInfoCaracteristica.campos[this.getIndexForm('PaisNacimiento')].opciones = [this.info_info_caracteristica.PaisNacimiento];
            this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].opciones = [this.info_info_caracteristica.DepartamentoNacimiento];
            this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].opciones = [this.info_info_caracteristica.Lugar];
            this.loading = false;
            this.result.emit(1);
          } else{
            this.loading = false;
            this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_info'));
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
          this.sgamidService.put('persona/actualizar_complementarios', this.info_info_caracteristica)
            .subscribe(res => {
              this.loading = false;
              this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
              this.translate.instant('GLOBAL.info_caracteristica') + ' ' +
              this.translate.instant('GLOBAL.confirmarActualizar'));
              this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
              this.loadInfoCaracteristica();
              this.popUpManager.showToast('info', this.translate.instant('inscripcion.cambiar_tab'));
            },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon:'error',
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
          info_info_caracteristica_post.Ente = (1 * this.info_caracteristica_id);
          info_info_caracteristica_post.Persona = (1 * this.info_caracteristica_id);
          info_info_caracteristica_post.LugarAnt = info_info_caracteristica_post.Lugar;
          info_info_caracteristica_post.Lugar = {
            Lugar: info_info_caracteristica_post.LugarAnt,
          };
          info_info_caracteristica_post.Tercero = this.info_persona_id;
          this.sgamidService.post('persona/guardar_complementarios', info_info_caracteristica_post)
            .subscribe(res => {
              if (res !== null) {
                this.info_info_caracteristica = <InfoCaracteristica>infoCaracteristica;
                this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.guardar'));
                this.popUpManager.showToast('info', this.translate.instant('inscripcion.cambiar_tab'));
              }
              this.loading = false;
            },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon:'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
              });
            });
        } else{
          this.loading = false;
        }
    });
  }

  ngOnInit() {
    //this.loadInfoCaracteristica();
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
    setTimeout(()=>{
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
      this.formInfoCaracteristica.campos[this.getIndexForm('PaisNacimiento')].opciones = list.listPais[0];
      this.formInfoCaracteristica.campos[this.getIndexForm('GrupoEtnico')].opciones = list.listGrupoEtnico[0];
      this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].opciones = list.listTipoDiscapacidad[0];
      this.formInfoCaracteristica.campos[this.getIndexForm('GrupoSanguineo')].opciones = list.listGrupoSanguineo[0];
      this.formInfoCaracteristica.campos[this.getIndexForm('Rh')].opciones = list.listFactorRh[0];
    },
   );
  }

}
