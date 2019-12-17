import { Lugar } from './../../../@core/data/models/lugar/lugar';
import { InformacionContacto } from './../../../@core/data/models/informacion/informacion_contacto';
import { InfoContactoGet } from './../../../@core/data/models/ente/info_contacto_get';
import { InfoContactoPut } from './../../../@core/data/models/ente/info_contacto_put';
import { TipoParentesco } from './../../../@core/data/models/terceros/tipo_parentesco';
import { Tercero } from './../../../@core/data/models/terceros/tercero';
import { TrPostInformacionFamiliar } from './../../../@core/data/models/terceros/tercero_familiar';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FORM_INFORMACION_FAMILIAR } from './form-informacion_familiar';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { FormacionAcademicaRoutingModule } from '../../formacion_academica/formacion_academica-routing.module';
// import { IAppState } from '../../../@core/store/app.state';
// import { ListService } from '../../../@core/store/services/list.service';
// import { Store } from '@ngrx/store';

@Component({
  selector: 'ngx-crud-informacion-familiar',
  templateUrl: './crud-informacion_familiar.component.html',
  styleUrls: ['./crud-informacion_familiar.component.scss'],
})
export class CrudInformacionFamiliarComponent implements OnInit {
  config: ToasterConfig;
  informacion_contacto_id: number;
  info_persona_id: number;
  info_info_familiar: any;
  tempcorreoPrincipal: any;
  tempcorreoAlterno: any;
  temptelefonoPrincipal: any;
  tempdireccionPrincipal: any;
  tempdireccionAlterno: any;
  temptelefonoAlterno: any;

  @Input('info_persona_id')
  set persona(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
    this.loadInfoPersona();
    console.info('ID_Persona_Familiar: ' + info_persona_id);
  }


  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_informacion_contacto: InformacionContacto;
  formInformacionFamiliar: any;
  regInformacionContacto: any;
  clean: boolean;
  denied_acces: boolean = false;
  paisSeleccionado: any;
  departamentoSeleccionado: any;
  ciudadSeleccionada: any;
  datosPost: any;
  datosGet: any;
  datosPut: any;
  loading: boolean;

  constructor(
    private translate: TranslateService,
    private campusMidService: CampusMidService,
    private sgaMidService: SgaMidService,
    private ubicacionesService: UbicacionService,
    private tercerosService: TercerosService,
    // private store: Store<IAppState>,
    // private listService: ListService,
    private toasterService: ToasterService) {
    this.formInformacionFamiliar = FORM_INFORMACION_FAMILIAR;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    // this.listService.findPais();
    // this.loadLists();
    this.loadOptionsParentesco();
    this.loading = false;
  }

  construirForm() {
    // this.formInformacionContacto.titulo = this.translate.instant('GLOBAL.informacion_contacto');
    this.formInformacionFamiliar.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInformacionFamiliar.campos.length; i++) {
      this.formInformacionFamiliar.campos[i].label = this.translate.instant('GLOBAL.' + this.formInformacionFamiliar.campos[i].label_i18n);
      this.formInformacionFamiliar.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInformacionFamiliar.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInformacionFamiliar.campos.length; index++) {
      const element = this.formInformacionFamiliar.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  ngOnInit() {

  }

  public loadInfoPersona(): void {
    console.info('Ojoooooo cargar')
    this.loading = true;
    if (this.info_persona_id !== undefined && this.info_persona_id !== 0 &&
      this.info_persona_id.toString() !== '') {
        this.sgaMidService.get('persona/consultar_familiar/' + this.info_persona_id)
        .subscribe(res => {
          console.info(res)
          if (res !== null) {
            this.datosGet = res;
            this.tempcorreoPrincipal = JSON.parse(this.datosGet['Correos'][0]['Dato'])
            this.tempcorreoAlterno = JSON.parse(this.datosGet['Correos'][1]['Dato'])
            this.temptelefonoPrincipal = JSON.parse(this.datosGet['Numeros'][0]['Dato'])
            this.temptelefonoAlterno = JSON.parse(this.datosGet['Numeros'][1]['Dato'])
            this.tempdireccionPrincipal = JSON.parse(this.datosGet['Direcciones'][0]['Dato'])
            this.tempdireccionAlterno = JSON.parse(this.datosGet['Direcciones'][1]['Dato'])
            this.info_info_familiar = res;
            this.formInformacionFamiliar.campos[this.getIndexForm('NombreFamiliarPrincipal')].valor = this.datosGet['Principal']['TerceroFamiliarId']
            ['NombreCompleto']
            this.formInformacionFamiliar.campos[this.getIndexForm('Parentesco')].valor = this.datosGet['Relaciones'][0]
            this.formInformacionFamiliar.campos[this.getIndexForm('ParentescoAlterno')].valor = this.datosGet['Relaciones'][1]
            this.formInformacionFamiliar.campos[this.getIndexForm('CorreoElectronico')].valor =  this.tempcorreoPrincipal.value
            this.formInformacionFamiliar.campos[this.getIndexForm('CorreoElectronicoAlterno')].valor = this.tempcorreoAlterno.value
            this.formInformacionFamiliar.campos[this.getIndexForm('Telefono')].valor = this.temptelefonoPrincipal.value
            this.formInformacionFamiliar.campos[this.getIndexForm('TelefonoAlterno')].valor = this.temptelefonoAlterno.value
            this.formInformacionFamiliar.campos[this.getIndexForm('DireccionResidencia')].valor = this.tempdireccionPrincipal.value
            this.formInformacionFamiliar.campos[this.getIndexForm('DireccionResidenciaAlterno')].valor = this.tempdireccionAlterno.value
            this.formInformacionFamiliar.campos[this.getIndexForm('NombreFamiliarAlterno')].valor = this.datosGet['Alterno']['TerceroFamiliarId']
            ['NombreCompleto']
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
      this.info_info_familiar = undefined;
      this.clean = !this.clean;
      this.denied_acces = false; // no muestra el formulario a menos que se le pase un id del ente info_caracteristica_id
      this.loading = false;
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
    // this.store.select((state) => state).subscribe(
    //   (list) => {
    //     this.formInformacionContacto.campos[this.getIndexForm('PaisResidencia')].opciones = list.listPais[0];
    //   },
    // );
  }

  loadOptionsParentesco(): void {
    let parentescos: Array<any> = [];
    this.tercerosService.get('tipo_parentesco/?limit=0&query=Activo:true')
      .subscribe(res => {
        if (res !== null) {
          parentescos = <Array<TipoParentesco>>res;
        }
        this.formInformacionFamiliar.campos[ this.getIndexForm('Parentesco') ].opciones = parentescos;
        this.formInformacionFamiliar.campos[ this.getIndexForm('ParentescoAlterno') ].opciones = parentescos;
      });
  }

  public validarForm(event: any) {
    // console.log(event.data);
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('informacion_familiar.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        const formData = event.data.InformacionFamiliar;
        const tercero: Tercero = {
          Id: Number(this.info_persona_id),
          NombreCompleto: undefined,
          TipoContribuyenteId: {
            Id: 1,
            Nombre: undefined,
          },
        }
        const informacionFamiliarPost: TrPostInformacionFamiliar = {
          Tercero_Familiar: tercero,
          Familiares: [
            {
              Familiar: {
                Id: 0,
                TerceroId: tercero,
                TerceroFamiliarId: {
                  Id: 0,
                  NombreCompleto: formData.NombreFamiliarPrincipal,
                  TipoContribuyenteId: {
                    Id: 1,
                    Nombre: undefined,
                  },
                },
                TipoParentescoId: formData.Parentesco,
                CodigoAbreviacion: 'CONTPRIN',
              },
              InformacionContacto: [
                {
                  // telefono
                  Id: 0,
                  TerceroId: tercero,
                  InfoComplementariaId: {
                    Id: 51,
                    Nombre: undefined,
                    CodigoAbreviacion: undefined,
                    Activo: undefined,
                    GrupoInfoComplementariaId: undefined,
                  },
                  Dato: JSON.stringify({value: formData.Telefono, Nombre: formData.CorreoElectronico }),
                  Activo: true,
                },
                {
                  // correo
                  Id: 0,
                  TerceroId: tercero,
                  InfoComplementariaId: {
                    Id: 53,
                    Nombre: undefined,
                    CodigoAbreviacion: undefined,
                    Activo: undefined,
                    GrupoInfoComplementariaId: undefined,
                  },
                  Dato: JSON.stringify({value: formData.CorreoElectronico}),
                  Activo: true,
                },
                {
                  // dirección
                  Id: 0,
                  TerceroId: tercero,
                  InfoComplementariaId: {
                    Id: 54,
                    Nombre: undefined,
                    CodigoAbreviacion: undefined,
                    Activo: undefined,
                    GrupoInfoComplementariaId: undefined,
                  },
                  Dato: JSON.stringify({value: formData.DireccionResidencia}),
                  Activo: true,
                },
              ],
            },
            {
              Familiar: {
                Id: 0,
                TerceroId: tercero,
                TerceroFamiliarId: {
                  Id: 0,
                  NombreCompleto: formData.NombreFamiliarAlterno,
                  TipoContribuyenteId: {
                    Id: 1,
                    Nombre: undefined,
                  },
                },
                TipoParentescoId: formData.ParentescoAlterno,
                CodigoAbreviacion: 'CONTALT',
              },
              InformacionContacto: [
                {
                  // telefono
                  Id: 0,
                  TerceroId: tercero,
                  InfoComplementariaId: {
                    Id: 51,
                    Nombre: undefined,
                    CodigoAbreviacion: undefined,
                    Activo: undefined,
                    GrupoInfoComplementariaId: undefined,
                  },
                  Dato: JSON.stringify({value: formData.TelefonoAlterno}),
                  Activo: true,
                },
                {
                  // correo
                  Id: 0,
                  TerceroId: tercero,
                  InfoComplementariaId: {
                    Id: 53,
                    Nombre: undefined,
                    CodigoAbreviacion: undefined,
                    Activo: undefined,
                    GrupoInfoComplementariaId: undefined,
                  },
                  Dato: JSON.stringify({value: formData.CorreoElectronicoAlterno}),
                  Activo: true,
                },
                {
                  // dirección
                  Id: 0,
                  TerceroId: tercero,
                  InfoComplementariaId: {
                    Id: 54,
                    Nombre: undefined,
                    CodigoAbreviacion: undefined,
                    Activo: undefined,
                    GrupoInfoComplementariaId: undefined,
                  },
                  Dato: JSON.stringify({value: formData.DireccionResidenciaAlterno}),
                  Activo: true,
                },
              ],
            },
          ],
        }
        console.info(informacionFamiliarPost)
        this.sgaMidService.post('inscripciones/post_informacion_familiar', informacionFamiliarPost)
            .subscribe((res: any) => {
              if (res.Type === 'error') {
                Swal({
                  type: 'error',
                  title: res.Code,
                  text: this.translate.instant('ERROR.' + res.Code),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
                this.showToast('error', 'Error', this.translate.instant('informacion_familiar.informacion_familiar_no_actualizada'));
              } else {
                this.showToast('success', this.translate.instant('GLOBAL.actualizar'),
                    this.translate.instant('informacion_familiar.informacion_familiar_actualizada'));
              }
            }, () => {
                this.showToast('error', 'Error', this.translate.instant('informacion_familiar.informacion_familiar_no_actualizada'));
            });
      }
    });
  }

}
