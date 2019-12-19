import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_ICFES} from './form-icfes';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { Lugar } from './../../../@core/data/models/lugar/lugar';
import { UserService } from '../../../@core/data/users.service';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { TercerosService} from '../../../@core/data/terceros.service';
import { ListService } from '../../../@core/store/services/list.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';

@Component({
  selector: 'ngx-crud-icfes',
  templateUrl: './crud-icfes.component.html',
  styleUrls: ['./crud-icfes.component.scss'],
})
export class CrudIcfesComponent implements OnInit {
  config: ToasterConfig;
  info_formacion_academica_id: number;
  inscripcion_id: number;
  persiona_id: number;



  @Input('inscripcion_id')
  set inscripcion(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    console.info('ID_FormacionAcademica_Pregrado' + this.inscripcion_id)
    // this.loadInfoFormacionAcademica();
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_icfes: any;
  formIcfes: any;
  temp: any;
  clean: boolean;
  loading: boolean;
  paisSeleccionado: any;
  percentage: number;
  ciudadSeleccionada: any;
  tipoSeleccionado: any;
  datosPost: any;
  departamentoSeleccionado: any;

  constructor(
    private translate: TranslateService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private ubicacionesService: UbicacionService,
    private terceroService: TercerosService,
    private sgaMidService: SgaMidService,
    private users: UserService,
    private store: Store<IAppState>,
    private listService: ListService,
    private toasterService: ToasterService) {
    this.formIcfes = FORM_ICFES;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findTipoICFES();
    this.listService.findLocalidadesBogota();
    this.listService.findTipoColegio();
    this.listService.findSemestresSinEstudiar();
    // this.loadOptionsPais();
    this.persiona_id = this.users.getPersonaId();
    this.loadLists();
  }

  construirForm() {
    // this.formIcfes.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formIcfes.btn = this.translate.instant('GLOBAL.guardar');
    this.formIcfes.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formIcfes.campos.length; i++) {
      this.formIcfes.campos[i].label = this.translate.instant('GLOBAL.' + this.formIcfes.campos[i].label_i18n);
      this.formIcfes.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formIcfes.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {

  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }
  getSeleccion(event) {

    if (event.nombre === 'PaisResidencia') {
      this.paisSeleccionado = event.valor;
      this.loadOptionsDepartamentoResidencia();
    } else if (event.nombre === 'DepartamentoResidencia') {
      this.departamentoSeleccionado = event.valor;
      this.loadOptionsCiudadResidencia();
      if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
        (event.valor.Nombre.toString().toLowerCase() === 'cundinamarca' ||
          event.valor.Nombre.toString().toLowerCase() === 'cundinamarca')) {
        // this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
        // this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;
        // this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor = null;
        // this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor = null;
        this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].entrelazado = true;
        // this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
      }if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
      (event.valor.Nombre.toString().toLowerCase() !== 'cundinamarca' ||
        event.valor.Nombre.toString().toLowerCase() !== 'cundinamarca')) {
        this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].entrelazado = true;
        // this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
        // this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = true;
        // this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
        // this.formIcfes.campos[this.getIndexForm('Colegio')].valor = 0;
        // this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
        // this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor = null;
        // this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;
        // this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor = null;
      }
    } else if (event.nombre === 'CiudadResidencia') {
      this.ciudadSeleccionada = event.valor;
      if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
        (event.valor.Nombre.toString().toLowerCase() === 'bogotá' ||
          event.valor.Nombre.toString().toLowerCase() === 'bogota')) {
        console.info('Bogotaaaaaaaa')
         this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        //  this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
        //  this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;
        this.construirForm();
      } else  if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
      (this.paisSeleccionado.Nombre.toString().toLowerCase() !== 'bogotá' ||
      this.paisSeleccionado.Nombre.toString().toLowerCase() !== 'bogota')) {
       this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
       this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
      this.construirForm();
    } else {
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        // this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
        this.formIcfes.campos[this.getIndexForm('Colegio')].valor = 0;
        this.construirForm();
        console.info('otroooooooooo con cundinamarca')
      }

    }else if (event.nombre === 'Tipo') {
      console.info('select tipo')
      this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
      this.tipoSeleccionado = event.valor;
      if ( String(this.tipoSeleccionado['Id']).toLowerCase() === 'oficial' &&
      (String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogotá' ||
      String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogota'))  {
        console.info('ojo consulta oficial')
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.construirForm();
        this.loadOptionscolegiooficial();
      }else if (String(this.tipoSeleccionado.Id).toLowerCase() === 'privado' &&
      (String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogotá' ||
      String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogota'))  {
        console.info('ojo consulta privado')
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.construirForm();
        this.loadOptionscolegioprivado();
      }else if ( String(this.tipoSeleccionado['Id']).toLowerCase() === 'oficial') {
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        console.info('bien ')
      }else if ( String(this.tipoSeleccionado['Id']).toLowerCase() === 'privado') {
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        console.info('bien ')
      }

    }else {
      // this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = true;
      // this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
      // this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
    }
  }

  loadOptionscolegiooficial():  void {
    let consultaColegio: Array<any> = [];
    const colegiosoficiales: Array<any> = [];
      this.terceroService.get('tercero_tipo_tercero/?query=TipoTerceroId.Id:7' + ',TerceroId.Activo:true&limit=-1')
        .subscribe(res => {
          if (res !== null) {
            consultaColegio = <Array<any>>res;
            for (let i = 0; i < consultaColegio.length; i++) {
              colegiosoficiales.push(consultaColegio[i].TerceroId);
            }
          }
          this.formIcfes.campos[this.getIndexForm('Colegio')].opciones = colegiosoficiales;
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.departamento_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }


  loadOptionscolegioprivado():  void {
    let consultaColegio: Array<any> = [];
    const colegiosprivado: Array<any> = [];
      this.terceroService.get('tercero_tipo_tercero/?query=TipoTerceroId.Id:12' + ',TerceroId.Activo:true&limit=-1')
        .subscribe(res => {
          if (res !== null) {
            consultaColegio = <Array<any>>res;
            for (let i = 0; i < consultaColegio.length; i++) {
              colegiosprivado.push(consultaColegio[i].TerceroId);
            }
          }
          this.formIcfes.campos[this.getIndexForm('Colegio')].opciones = colegiosprivado;
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.departamento_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
        }


  loadOptionsDepartamentoResidencia(): void {
    let consultaHijos: Array<any> = [];
    const departamentoResidencia: Array<any> = [];
    if (this.paisSeleccionado) {
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadre.Id:' + this.paisSeleccionado.Id +
      ',LugarHijo.TipoLugar.CodigoAbreviacion:D,LugarHijo.Activo:true&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              departamentoResidencia.push(consultaHijos[i].LugarHijo);
            }
          }
          this.formIcfes.campos[this.getIndexForm('DepartamentoResidencia')].opciones = departamentoResidencia;
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
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
    let consultaHijos: Array<any> = [];
    const ciudadResidencia: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadre.Id:' + this.departamentoSeleccionado.Id + ',LugarHijo.Activo:true&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              ciudadResidencia.push(consultaHijos[i].LugarHijo);
            }
          }
          this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].opciones = ciudadResidencia;
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
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

  loadOptionsLocalidadResidencia(): void {
    let consultaHijos: Array<any> = [];
    const localidadResidencia: Array<any> = [];
    if (this.departamentoSeleccionado) {
      console.info('ID ciudad')
      console.info(this.ciudadSeleccionada.Id)
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadre.Id:' + this.ciudadSeleccionada.Id + ',LugarHijo.Activo:true&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              localidadResidencia.push(consultaHijos[i].LugarHijo);
            }
          }
          console.info(localidadResidencia)
          this.formIcfes.campos[this.getIndexForm('LocalidadResidencia')].opciones = localidadResidencia;
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.localidad_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  createIcfesColegio(infoIcfes: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('icfes_colegio.seguro_continuar_registrar'),
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
          this.info_icfes = <any>infoIcfes;
          this.sgaMidService.post('inscripciones/post_info_icfes_colegio', this.info_icfes)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.Type !== 'error') {
                this.loading = false;
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.registrar'),
                  this.translate.instant('icfes_colegio.icfes_colegio_registrado'));
                this.clean = !this.clean;
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'));
              }
            },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
              this.showToast('error', this.translate.instant('GLOBAL.error'),
                this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'));
            });
          }
      });
  }

  createColegioeIcfesColegio() {
    this.persiona_id =  Number(this.inscripcion_id);
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
           this.datosPost = {
             'TerceroColegio': {
              'NombreCompleto': String(this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor),
              'TipoContribuyenteId': {
                'Id': 2,
              },
              'Activo': false,
             },
             'DireccionColegio': {
                  'InfoComplementariaId': {
                    'Id': 54,
                  }, 
                  'Dato': JSON.stringify(this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor),
                  'Activo': true,
             },
             'UbicacionColegio': {
              'InfoComplementariaId': {
                'Id': 92,
              },
              'Dato': JSON.stringify(this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor.Id),
              'Activo': true,
             },
           };
           console.info(JSON.stringify(this.datosPost));
           this.sgaMidService.post('persona/guardar_datos_contacto_iojhiohioh/', this.datosPost)
             .subscribe(res => {
               if (res !== null) {
                 // this.info_informacion_contacto = <InformacionContacto>res;
                 this.loading = false;
                 this.eventChange.emit(true);
                 this.showToast('info', this.translate.instant('GLOBAL.crear'),
                   this.translate.instant('GLOBAL.informacion_contacto') + ' ' +
                   this.translate.instant('GLOBAL.confirmarCrear'));
               }
             },
               (error: HttpErrorResponse) => {
                 Swal({
                   type: 'error',
                   title: error.status + '',
                   text: this.translate.instant('ERROR.' + error.status),
                   footer: this.translate.instant('GLOBAL.crear') + '-' +
                     this.translate.instant('GLOBAL.informacion_contacto'),
                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                 });
               });
         }
       }); 
  }

  validarForm(event) {
    if (event.valid && String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogotá' ||
    String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogota') {
      console.info('No crear colegio')
      // const formData = event.data.InfoIcfes;
      // const tercero = {
      //   Id: this.persiona_id  || 1, // se debe cambiar solo por persona id
      // }
      // const inscripcion = {
      //   Id: this.inscripcion_id || 1, // se debe cambiar solo por inscripcion
      // }
      // const dataIcfesColegio = {
      //   InscripcionPregrado: {
      //     Id: 0,
      //     InscripcionId: inscripcion,
      //     TipoIcfesId: formData.TipoIcfes,
      //     CodigoIcfes: formData.NúmeroRegistroIcfes,
      //     TipoDocumentoIcfes: 1,
      //     NumeroIdentificacionIcfes: 1,
      //     AnoIcfes: Number(formData.NúmeroRegistroIcfes.substr(0, 4)),
      //     Activo: true,
      //     Valido: (formData.Valido.Id === 'Si') ? true : false,
      //   },
      //   InfoComplementariaTercero: [
      //     {
      //       // Localidad colegio
      //       Id: 0,
      //       TerceroId: tercero,
      //       InfoComplementariaId: formData.LocalidadColegio,
      //       Dato: JSON.stringify(formData.LocalidadColegio),
      //       Activo: true,
      //     },
      //     {
      //       // Tipo Colegio
      //       Id: 0,
      //       TerceroId: tercero,
      //       InfoComplementariaId: formData.TipoColegio,
      //       Dato: JSON.stringify(formData.TipoColegio),
      //       Activo: true,
      //     },
      //     {
      //       // Semestres sin estudiar
      //       Id: 0,
      //       TerceroId: tercero,
      //       InfoComplementariaId: formData.numeroSemestres,
      //       Dato: JSON.stringify(formData.numeroSemestres),
      //       Activo: true,
      //     },
      //   ],
      // }
      // this.createIcfesColegio(dataIcfesColegio);
      this.result.emit(event);
    }else {
      console.info('crear colegio')
      console.info(this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor.Id)
        this.createColegioeIcfesColegio();    
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formIcfes.campos.length; index++) {
      const element = this.formIcfes.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formIcfes.campos[this.getIndexForm('PaisResidencia')].opciones = list.listPais[0];
       this.formIcfes.campos[this.getIndexForm('LocalidadColegio')].opciones = list.listLocalidadesBogota[0];
      //  this.formIcfes.campos[this.getIndexForm('TipoColegio')].opciones = list.listTipoColegio[0];
       this.formIcfes.campos[this.getIndexForm('numeroSemestres')].opciones = list.listSemestresSinEstudiar[0];
       this.formIcfes.campos[this.getIndexForm('TipoIcfes')].opciones = list.listICFES[0];
      },
   );
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
