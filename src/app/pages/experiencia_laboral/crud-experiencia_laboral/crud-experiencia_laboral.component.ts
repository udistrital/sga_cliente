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
import { Lugar } from '../../../@core/data/models/lugar/lugar';
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

  @Input('info_experiencia_laboral_id')
  set name(info_experiencia_laboral_id: number) {
    this.info_experiencia_laboral_id = info_experiencia_laboral_id;
    // this.loadInfoExperienciaLaboral();
  }

  @Input('ente_id')
  set ente_experiencia(ente_id: any) {
    this.ente_id = Number(ente_id);
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
    private users: UserService) {
    this.formInfoExperienciaLaboral = FORM_EXPERIENCIA_LABORAL;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    // this.loadOptionsTipoOrganizacion();
    // this.loadOptionsPais();
    // this.loadOptionsCargo();
    // this.loadOptionsTipoDedicacion();
    // this.loadOptionsTipoVinculacion();
    this.persona_id = this.users.getPersonaId();
    this.listService.findPais();
    // this.listService.findTipoOrganizacion();
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
    this.temp = {};
    this.info_experiencia_laboral = {};
    this.soporte = [];
    if (this.info_experiencia_laboral_id !== undefined &&
      this.info_experiencia_laboral_id !== 0 &&
      this.info_experiencia_laboral_id.toString() !== '') {
      this.sgaMidService.get('experiencia_laboral/' + this.info_experiencia_laboral_id)
        .subscribe(res => {
          if (res !== null) {
            this.temp = <any>res;
            const files = [];
            if (this.temp.Documento + '' !== '0') {
              files.push({ Id: this.temp.Documento, key: 'Soporte' });
              this.nuxeoService.getDocumentoById$(files, this.documentoService)
                .subscribe(response => {
                  const filesResponse = <any>response;
                  if (Object.keys(filesResponse).length === files.length) {
                    this.info_experiencia_laboral = <any>res;
                    this.soporte = this.info_experiencia_laboral.Soporte;
                    this.info_experiencia_laboral.Soporte = filesResponse['Soporte'] + '';
                    this.info_experiencia_laboral.Nit = this.info_experiencia_laboral.Organizacion.NumeroIdentificacion;
                    this.info_experiencia_laboral.NombreEmpresa = this.info_experiencia_laboral.Organizacion.Nombre;
                    this.info_experiencia_laboral.TipoOrganizacion = this.info_experiencia_laboral.Organizacion.TipoOrganizacion;
                    this.info_experiencia_laboral.Direccion = this.info_experiencia_laboral.Organizacion.Direccion;
                    this.info_experiencia_laboral.Telefono = this.info_experiencia_laboral.Organizacion.Telefono;
                    this.info_experiencia_laboral.Correo = this.info_experiencia_laboral.Organizacion.Correo;
                    this.info_experiencia_laboral.Pais = this.info_experiencia_laboral.Organizacion.Pais;
                    // this.enteService.get('identificacion/?query=Ente.Id:' +
                    //   this.info_experiencia_laboral.Organizacion + ',TipoIdentificacion.Id:5').subscribe(r => {
                    //     if (r !== null) {
                    //       this.searchOrganizacion(r[0].NumeroIdentificacion);
                    //       this.loading = false;
                    //     }
                    //   },
                    //     (error: HttpErrorResponse) => {
                    //       Swal({
                    //         type: 'error',
                    //         title: error.status + '',
                    //         text: this.translate.instant('ERROR.' + error.status),
                    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    //           this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
                    //           this.translate.instant('GLOBAL.nombre_empresa'),
                    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    //       });
                    //     });
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
                  })
            }
            //   } else {
            //     this.info_experiencia_laboral = <any>res;
            //     this.enteService.get('identificacion/?query=Ente.Id:' +
            //       this.info_experiencia_laboral.Organizacion + ',TipoIdentificacion.Id:5').subscribe(r => {
            //         if (r !== null) {
            //           this.searchOrganizacion(r[0].NumeroIdentificacion);
            //         }
            //       },
            //         (error: HttpErrorResponse) => {
            //           Swal({
            //             type: 'error',
            //             title: error.status + '',
            //             text: this.translate.instant('ERROR.' + error.status),
            //             footer: this.translate.instant('GLOBAL.cargar') + '-' +
            //               this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
            //               this.translate.instant('GLOBAL.nombre_empresa'),
            //             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            //           });
            //         });
            //   }
          }
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.experiencia_laboral'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.soporte = [];
      this.temp = {};
      this.info_experiencia_laboral = undefined
      this.clean = !this.clean;
    }
  }

  // updateInfoExperienciaLaboral(infoExperienciaLaboral: any): void {
  //   const opt: any = {
  //     title: this.translate.instant('GLOBAL.actualizar'),
  //     text: this.translate.instant('GLOBAL.actualizar') + '?',
  //     icon: 'warning',
  //     buttons: true,
  //     dangerMode: true,
  //     showCancelButton: true,
  //     confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //     cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
  //   };
  //   Swal(opt)
  //     .then((willDelete) => {
  //       if (willDelete.value) {
  //         this.loading = true;
  //         this.info_experiencia_laboral = <any>infoExperienciaLaboral;
  //         this.info_experiencia_laboral.Id = this.info_experiencia_laboral_id;
  //         const files = [];
  //         if (this.info_experiencia_laboral.Soporte.file !== undefined) {
  //           files.push({ file: this.info_experiencia_laboral.Soporte.file, documento: this.soporte, key: 'Soporte' });
  //         }
  //         if (files.length !== 0) {
  //           this.nuxeoService.updateDocument$(files, this.documentoService)
  //             .subscribe(response => {
  //               if (Object.keys(response).length === files.length) {
  //                 const documentos_actualizados = <any>response;
  //                 this.info_experiencia_laboral.Documento = this.soporte;
  //                 this.experienciaService.put('experiencia_laboral', this.info_experiencia_laboral)
  //                   .subscribe(res => {
  //                     if (documentos_actualizados['Soporte'] !== undefined) {
  //                       this.info_experiencia_laboral.Soporte = documentos_actualizados['Soporte'].url + '';
  //                     }
  //                     this.loading = false;
  //                     this.eventChange.emit(true);
  //                     this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
  //                       this.translate.instant('GLOBAL.experiencia_laboral') + ' ' +
  //                       this.translate.instant('GLOBAL.confirmarActualizar'));
  //                     this.clean = !this.clean;
  //                     this.info_experiencia_laboral = undefined;
  //                     this.info_experiencia_laboral_id = 0;
  //                     this.loadInfoExperienciaLaboral();
  //                   },
  //                     (error: HttpErrorResponse) => {
  //                       Swal({
  //                         type: 'error',
  //                         title: error.status + '',
  //                         text: this.translate.instant('ERROR.' + error.status),
  //                         footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                           this.translate.instant('GLOBAL.experiencia_laboral'),
  //                         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                       });
  //                     });
  //               }
  //             },
  //               (error: HttpErrorResponse) => {
  //                 this.loading = false;
  //                 Swal({
  //                   type: 'error',
  //                   title: error.status + '',
  //                   text: this.translate.instant('ERROR.' + error.status),
  //                   footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                     this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
  //                     this.translate.instant('GLOBAL.soporte_documento'),
  //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                 });
  //               });
  //         } else {
  //           this.experienciaService.put('experiencia_laboral', this.info_experiencia_laboral)
  //             .subscribe(res => {
  //               this.loading = false;
  //               this.eventChange.emit(true);
  //               this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
  //                 this.translate.instant('GLOBAL.experiencia_laboral') + ' ' +
  //                 this.translate.instant('GLOBAL.confirmarActualizar'));
  //               this.clean = !this.clean;
  //               this.info_experiencia_laboral = undefined;
  //               this.info_experiencia_laboral_id = 0;
  //               this.loadInfoExperienciaLaboral();
  //             },
  //               (error: HttpErrorResponse) => {
  //                 this.loading = false;
  //                 Swal({
  //                   type: 'error',
  //                   title: error.status + '',
  //                   text: this.translate.instant('ERROR.' + error.status),
  //                   footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                     this.translate.instant('GLOBAL.experiencia_laboral'),
  //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                 });
  //               });
  //         }
  //       }
  //     });
  // }

  // loadOptionsTipoOrganizacion(): void {
  //   let tipoOrganizacion: Array<any> = [];
  //   this.organizacionService.get('tipo_organizacion/?limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         tipoOrganizacion = <Array<any>>res;
  //       }
  //       this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoOrganizacion')].opciones = tipoOrganizacion;
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
  //             this.translate.instant('GLOBAL.tipo_empresa'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  // loadOptionsPais(): void {
  //   let paisNacimiento: Array<any> = [];
  //   this.ubicacionesService.get('lugar/?query=TipoLugar.Nombre:PAIS&limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         paisNacimiento = <Array<Lugar>>res;
  //       }
  //       this.formInfoExperienciaLaboral.campos[this.getIndexForm('Pais')].opciones = paisNacimiento;
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
  //             this.translate.instant('GLOBAL.pais_empresa'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  // loadOptionsCargo(): void {
  //   let cargo: Array<any> = [];
  //   this.experienciaService.get('cargo/?limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         cargo = <Array<any>>res;
  //       }
  //       this.formInfoExperienciaLaboral.campos[this.getIndexForm('Cargo')].opciones = cargo;
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
  //             this.translate.instant('GLOBAL.cargo'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  // loadOptionsTipoVinculacion(): void {
  //   let tipoVinculacion: Array<any> = [];
  //   this.experienciaService.get('tipo_vinculacion/?limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         tipoVinculacion = <Array<any>>res;
  //       }
  //       this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoVinculacion')].opciones = tipoVinculacion;
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
  //             this.translate.instant('GLOBAL.tipo_vinculacion'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  // loadOptionsTipoDedicacion(): void {
  //   let dedicacion: Array<any> = [];
  //   this.experienciaService.get('tipo_dedicacion/?limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         dedicacion = <Array<any>>res;
  //       }
  //       this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoDedicacion')].opciones = dedicacion;
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
  //             this.translate.instant('GLOBAL.tipo_dedicacion'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }



  searchOrganizacion(data: any): void {
    const nit = typeof data === 'string' ? data : data.data.Nit;
    const init = this.getIndexForm('Nit');
    const inombre = this.getIndexForm('NombreEmpresa');
    const itipo = this.getIndexForm('TipoOrganizacion');
    const idir = this.getIndexForm('Direccion');
    const itel = this.getIndexForm('Telefono');
    const icorreo = this.getIndexForm('Correo');
    const ipais = this.getIndexForm('Pais');
    this.sgaMidService.get('experiencia_laboral/informacion_empresa/?Id=' + nit)
      .subscribe((res: any) => {
        this.formInfoExperienciaLaboral.campos[init].valor = res.NumeroIdentificacion;
        this.formInfoExperienciaLaboral.campos[inombre].valor = res.NombreCompleto["Nombre"];
        this.formInfoExperienciaLaboral.campos[idir].valor = (res.Direccion) ? res.Direccion : 'No registrado';
        this.formInfoExperienciaLaboral.campos[itel].valor = (res.Telefono) ? res.Telefono : 'No registrado';
        this.formInfoExperienciaLaboral.campos[icorreo].valor = (res.Correo) ? res.Correo : 'No registrado';
        this.formInfoExperienciaLaboral.campos[ipais].valor = (res.Ubicacion && res.Ubicacion.Id) ? res.Ubicacion : { Id: 0, Nombre: 'No registrado' };
        this.formInfoExperienciaLaboral.campos[itipo].valor = (res.TipoTerceroId && res.TipoTerceroId.Id) ? res.TipoTerceroId : { Id: 0, Nombre: 'No registrado' };
        [this.formInfoExperienciaLaboral.campos[inombre],
        this.formInfoExperienciaLaboral.campos[idir],
        this.formInfoExperienciaLaboral.campos[icorreo],
        this.formInfoExperienciaLaboral.campos[ipais],
        this.formInfoExperienciaLaboral.campos[itipo],
        this.formInfoExperienciaLaboral.campos[itel]]
          .forEach(element => {
            element.deshabilitar = element.valor ? true : false
          });
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
    console.info(file);
    return new Promise((resolve, reject) => {
      this.nuxeoService.getDocumentos$(file, this.documentoService)
        .subscribe(response => {
          // resolve(response['undefined'].Id); // desempacar el response, puede dejar de llamarse 'undefined'
          if (Object.keys(response).length === file.length) {
            const filesUp = <any>response;
            if (filesUp['Documento'] !== undefined) {
              this.info_experiencia_laboral.Experiencia.DocumentoId = filesUp['Documento'].Id;
              this.info_experiencia_laboral.Experiencia.EnlaceDocumento = filesUp['Documento'].Enlace;
              this.postExperianciaLaboral();
            }
          }
        }, error => {
          reject(error);
        });
    });
  }

  postExperianciaLaboral() {
    this.sgaMidService.post('experiencia_laboral/', this.info_experiencia_laboral)
      .subscribe(res => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.eventChange.emit(true);
          this.showToast('info', this.translate.instant('GLOBAL.crear'),
            this.translate.instant('experiencia_laboral.experiencia_laboral_registrada'));
          this.info_experiencia_laboral_id = 0;
          this.info_experiencia_laboral = undefined;
          this.clean = !this.clean;
        } else {
          this.showToast('error', this.translate.instant('GLOBAL.error'),
            this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'));
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  // addUbicacionOrganizacion(ubicacion: any): void {
  //   this.campusMidService.post('organizacion/registar_ubicacion', ubicacion)
  //     .subscribe(res => {
  //       const r = res as any;
  //       if (res !== null && r.Type === 'error') {
  //         this.showToast('info', this.translate.instant('GLOBAL.crear'),
  //           this.translate.instant('GLOBAL.nombre_empresa') + ' ' +
  //           this.translate.instant('GLOBAL.confirmarCrear'));
  //       }
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.crear') + '-' +
  //             this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
  //             this.translate.instant('GLOBAL.pais_empresa'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  // createOrganizacion(org: any, exp: any): void {
  //   console.info(JSON.stringify(org));
  //   this.campusMidService.post('organizacion/', org).subscribe(res => {
  //     const identificacion = <any>res;
  //     if (identificacion !== null && identificacion.Type !== 'error') {
  //       exp.Organizacion = identificacion.Ente ? identificacion.Id : null;
  //       const ubicacion = {
  //         Ente: identificacion.Ente ? identificacion.Id : null,
  //         Lugar: org.Pais,
  //         TipoRelacionUbicacionEnte: 3,
  //         Atributos: [{
  //           AtributoUbicacion: {Id: 1},
  //           Valor: org.Direccion,
  //         }],
  //       };
  //       this.addUbicacionOrganizacion(ubicacion);
  //       if (this.info_experiencia_laboral === undefined) {
  //         this.createInfoExperienciaLaboral(exp);
  //       } else {
  //         this.updateInfoExperienciaLaboral(exp);
  //       }
  //     }
  //   },
  //     (error: HttpErrorResponse) => {
  //       Swal({
  //         type: 'error',
  //         title: error.status + '',
  //         text: this.translate.instant('ERROR.' + error.status),
  //         footer: this.translate.instant('GLOBAL.crear') + '-' +
  //           this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
  //           this.translate.instant('GLOBAL.nombre_empresa'),
  //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //       });
  //     });
  // }

  ngOnInit() {
    // this.loadInfoExperienciaLaboral();
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  // validarForm(event) {
  //   if (event.valid) {
  //     const experiencia = {
  //       Persona: this.ente_id,
  //       Actividades: event.data.InfoExperienciaLaboral.Actividades,
  //       FechaInicio: event.data.InfoExperienciaLaboral.FechaInicio,
  //       FechaFinalizacion: event.data.InfoExperienciaLaboral.FechaFinalizacion,
  //       Organizacion: this.organizacion.Ente ? this.organizacion.Id : null,
  //       TipoDedicacion: event.data.InfoExperienciaLaboral.TipoDedicacion,
  //       Cargo: event.data.InfoExperienciaLaboral.Cargo,
  //       TipoVinculacion: event.data.InfoExperienciaLaboral.TipoVinculacion,
  //       Soporte: event.data.InfoExperienciaLaboral.Soporte,
  //     }
  //     const org = {
  //       NumeroIdentificacion: event.data.InfoExperienciaLaboral.Nit,
  //       Direccion: event.data.InfoExperienciaLaboral.Direccion,
  //       Pais: event.data.InfoExperienciaLaboral.Pais,
  //       // LugarExpedicion: ,
  //       Nombre: event.data.InfoExperienciaLaboral.NombreEmpresa,
  //       TipoOrganizacion: event.data.InfoExperienciaLaboral.TipoOrganizacion,
  //       TipoIdentificacion: {
  //         Id: 5, // tipo nit
  //       },
  //       Contacto: [],
  //       // "FechaExpedicion": "string"
  //     }

  //     if (event.data.InfoExperienciaLaboral.Telefono) {
  //       org.Contacto.push({
  //         TipoContacto: { Id: 1 }, // corresponde al tipo telefono
  //         Valor: event.data.InfoExperienciaLaboral.Telefono,
  //       });
  //     }
  //     if (event.data.InfoExperienciaLaboral.Correo) {
  //       org.Contacto.push({
  //         TipoContacto: { Id: 3 }, // corresponde al tipo correo
  //         Valor: event.data.InfoExperienciaLaboral.Correo,
  //       });
  //     }

  //     if (this.info_experiencia_laboral === undefined) {
  //       if (experiencia.Organizacion !== null) {
  //         // this.createInfoExperienciaLaboral(experiencia);
  //       } else {
  //         // this.createOrganizacion(org, experiencia);
  //       }
  //     } else {
  //       if (this.organizacion.Ente) {
  //         // this.updateInfoExperienciaLaboral(experiencia);
  //       } else {
  //         // this.createOrganizacion(org, experiencia);
  //       }
  //     }
  //     this.result.emit(event);
  //   }
  // }

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
