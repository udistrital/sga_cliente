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
  info_persona_id: number;
  persiona_id: number;
  denied_acces: boolean = false;



  @Input('info_persona_id')
  set inscripcion(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
    this.loadInfoFormacionAcademica();
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
  tipocolegio: Number;
  datosPost: any;
  id_inscripcion: Number;
  departamentoSeleccionado: any;
  datosGet: any;

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
    this.loadLists();
    this.listService.findTipoICFES();
    this.listService.findLocalidadesBogota();
    this.listService.findTipoColegio();
    this.listService.findSemestresSinEstudiar();
    this.construirForm();
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
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor = null;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor = null;
        this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
        this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].entrelazado = true;
      }if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
      (event.valor.Nombre.toString().toLowerCase() !== 'cundinamarca' ||
        event.valor.Nombre.toString().toLowerCase() !== 'cundinamarca')) {
        this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].entrelazado = true;
        this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
        // this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = true;
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
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
         this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
         this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
         this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;
         this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
        this.construirForm();
      } else  if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
      (this.paisSeleccionado.Nombre.toString().toLowerCase() !== 'bogotá' ||
      this.paisSeleccionado.Nombre.toString().toLowerCase() !== 'bogota')) {
       this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
       this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
       this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
      //  this.formIcfes.campos[this.getIndexForm('Colegio')].valor = 0;
      this.construirForm();
    } else {
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
        // this.formIcfes.campos[this.getIndexForm('Colegio')].valor = 0;
        this.construirForm();
      }

    }else if (event.nombre === 'Tipo') {
      this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
      this.tipoSeleccionado = event.valor;
      if ( String(this.tipoSeleccionado['Id']).toLowerCase() === 'oficial' &&
      (String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogotá' ||
      String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogota'))  {
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.construirForm();
        this.loadOptionscolegiooficial();
      }else if (String(this.tipoSeleccionado.Id).toLowerCase() === 'privado' &&
      (String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogotá' ||
      String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogota'))  {
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.construirForm();
        this.loadOptionscolegioprivado();
      }else if ( String(this.tipoSeleccionado['Id']).toLowerCase() === 'oficial') {
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        this.tipocolegio = 7;
      }else if ( String(this.tipoSeleccionado['Id']).toLowerCase() === 'privado') {
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        this.tipocolegio = 12;
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
      this.terceroService.get('tercero_tipo_tercero/?query=TipoTerceroId.Id:7' + ',TerceroId.Activo:true&limit=0')
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
      this.terceroService.get('tercero_tipo_tercero/?query=TipoTerceroId.Id:12' + ',TerceroId.Activo:true&limit=0')
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
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadre.Id:' + this.ciudadSeleccionada.Id + ',LugarHijo.Activo:true&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              localidadResidencia.push(consultaHijos[i].LugarHijo);
            }
          }
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

  public loadInfoFormacionAcademica(): void {
    this.loading = true;
    if (this.info_persona_id !== undefined && this.info_persona_id !== 0 &&
      this.info_persona_id.toString() !== '') {
      this.denied_acces = false;

      this.sgaMidService.get('persona/consultar_formacion_pregrado/' + this.info_persona_id)
        .subscribe(res => {
          if (res !== null) {
            this.datosGet = <any>res;
            this.formIcfes.campos[this.getIndexForm('TipoIcfes')].valor = res['TipoIcfes']
            this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor = res['NúmeroRegistroIcfes']
            this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfesConfirmar')].valor = res['NúmeroRegistroIcfes']
            if (res['Valido'] === true) {
            this.formIcfes.campos[this.getIndexForm('Valido')].valor = {'Id': 'Si'}
            } else if (res['Valido'] === false) {
              this.formIcfes.campos[this.getIndexForm('Valido')].valor = {'Id': 'No'}
            } else {
              this.formIcfes.campos[this.getIndexForm('Valido')].valor = 0
            }
            this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor = res['numeroSemestres']['InfoComplementariaId']
            this.formIcfes.campos[this.getIndexForm('PaisResidencia')].valor = res ['Lugar']['PAIS']
            this.ciudadSeleccionada =  res ['Lugar']['CIUDAD'];
            if ((this.ciudadSeleccionada.Nombre.toString().toLowerCase() === 'bogotá' ||
              this.ciudadSeleccionada.Nombre.toString().toLowerCase() === 'bogota')) {
                this.formIcfes.campos[this.getIndexForm('DepartamentoResidencia')].valor =  {
                  'Activo': true,
                  'FechaCreacion': '2019-12-11 16:13:10.710536 +0000 UTC',
                  'FechaModificacion': '2019-12-11 16:13:10.710536 +0000 UTC',
                  'Id': 824,
                  'Nombre': 'Cundinamarca',
                  'TipoLugar': {
                    'Activo': true,
                    'CodigoAbreviacion': 'C',
                    'Descripcion': 'Ciudad',
                    'FechaCreacion': '2019-12-11 15:33:18.168012 +0000 UTC',
                    'FechaModificacion': '2019-12-11 15:33:18.168012 +0000 UTC',
                    'Id': 2,
                    'Nombre': 'CIUDAD',
                    'NumeroOrden': 2,
                  },
                }
                this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor = res ['Lugar']['CIUDAD']
          }else {
            this.formIcfes.campos[this.getIndexForm('DepartamentoResidencia')].valor = res ['Lugar']['DEPARTAMENTO']
            this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor = res ['Lugar']['CIUDAD']
          }
          if (res['TipoColegio'] === 7) {
            this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
            this.formIcfes.campos[this.getIndexForm('Tipo')].valor = {'Id': 'Oficial'}
            this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
            this.formIcfes.campos[this.getIndexForm('Colegio')].valor = res['Colegio']
          } else if (res['TipoColegio'] === 12) {
            this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
            this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
            this.formIcfes.campos[this.getIndexForm('Tipo')].valor = {'Id': 'Privado'}
            this.formIcfes.campos[this.getIndexForm('Colegio')].valor = res['Colegio']
          } else {
            this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = true;
            this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
            this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
            this.formIcfes.campos[this.getIndexForm('Colegio')].valor = 0;
          }

            // this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].opciones[0] =
            // this.info_info_caracteristica.DepartamentoNacimiento;
            // this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].opciones[0] = this.info_info_caracteristica.Lugar;
            // this.formInfoCaracteristica.campos[this.getIndexForm('NumeroHermanos')].valor = res['NumeroHermanos']
            // this.formInfoCaracteristica.campos[this.getIndexForm('PuntajeSisbe')].valor = res['PuntajeSisben']
            // this.formInfoCaracteristica.campos[this.getIndexForm('EPS')].valor = res['EPS']['TerceroEntidadId']
            // this.formInfoCaracteristica.campos[this.getIndexForm('FechaVinculacion')].valor = res['EPS']['FechaInicioVinculacion']
            this.loading = false;
          }
        },
          (error: HttpErrorResponse) => {
 /*            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            }); */
          });
    } else {
      this.clean = !this.clean;
      this.denied_acces = false; // no muestra el formulario a menos que se le pase un id del ente info_caracteristica_id
      this.loading = false;
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
    this.persiona_id =  Number(this.info_persona_id);
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
          this.id_inscripcion = Number(localStorage.getItem('IdInscripcion'));
           const inscripcion = {
        Id: this.id_inscripcion, // se debe cambiar solo por inscripcion
      }
           this.datosPost = {
             'Tercero': {
              'TerceroId': {
               'Id': this.persiona_id ,
             },
            },
            'InscripcionPregrado': {
                  Id: 0,
                  InscripcionId: inscripcion,
                  TipoIcfesId: this.formIcfes.campos[this.getIndexForm('TipoIcfes')].valor,
                  CodigoIcfes: this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor,
                  TipoDocumentoIcfes: 1,
                  NumeroIdentificacionIcfes: 1,
                  AnoIcfes: Number(this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor.substr(0, 4)),
                  Activo: true,
                  Valido: (this.formIcfes.campos[this.getIndexForm('Valido')].valor.Id === 'Si') ? true : false,
              },
                'InfoComplementariaTercero': {
            // Semestres sin estudiar
            'Id': 0,
            'TerceroId': {
              'Id': this.persiona_id,
            },
            InfoComplementariaId: this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor,
            Dato: JSON.stringify(this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor.Nombre),
            Activo: true,
          },
             'TerceroColegio': {
              'NombreCompleto': String(this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor),
              'TipoContribuyenteId': {
                'Id': 2,
              },
              'Activo': false,
             },
             'TipoColegio': {
              'TerceroId': {
                'Id': this.persiona_id,
              },
              'TipoTerceroId': {
                'Id': this.tipocolegio,
              },
              'Activo': true,
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
                'Id': 89,
              },
              'Dato': JSON.stringify(this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor.Id),
              'Activo': true,
             },
           };
           this.sgaMidService.post('inscripciones/post_info_icfes_colegio_nuevo', this.datosPost)
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

  validarForm(event) {
    if ( String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogotá' ||
    String(this.ciudadSeleccionada.Nombre).toLowerCase() === 'bogota') {
      this.persiona_id =  Number(this.info_persona_id);
      this.id_inscripcion = Number(localStorage.getItem('IdInscripcion'));
      const inscripcion = {
        Id:  this.id_inscripcion, // se debe cambiar solo por inscripcion
      }
      const dataIcfesColegio = {
        'Tercero': {
          'TerceroId': {
           'Id': this.persiona_id ,
         },
        },
        InscripcionPregrado: {
          Id: 0,
          InscripcionId: inscripcion,
          TipoIcfesId: this.formIcfes.campos[this.getIndexForm('TipoIcfes')].valor,
          CodigoIcfes: this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor,
          TipoDocumentoIcfes: 1,
          NumeroIdentificacionIcfes: 1,
          AnoIcfes: Number(this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor.substr(0, 4)),
          Activo: true,
          Valido: (this.formIcfes.campos[this.getIndexForm('Valido')].valor.Id === 'Si') ? true : false,
        },
        InfoComplementariaTercero: [

          {
            // Semestres sin estudiar
            'Id': 0,
            'TerceroId': {
              'Id': this.persiona_id,
            },
            InfoComplementariaId: this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor,
            Dato: JSON.stringify(this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor.Nombre),
            Activo: true,
          },
        ],
        dataColegio: this.formIcfes.campos[this.getIndexForm('Colegio')].valor,
      }
      this.createIcfesColegio(dataIcfesColegio);
      this.result.emit(event);
    }else {
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
