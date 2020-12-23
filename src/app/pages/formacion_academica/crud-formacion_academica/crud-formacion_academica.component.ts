import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_FORMACION_ACADEMICA } from './form-formacion_academica';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { ListService } from '../../../@core/store/services/list.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { PopUpManager } from '../../../managers/popUpManager';
import { InfoPersona } from '../../../@core/data/models/informacion/info_persona';

@Component({
  selector: 'ngx-crud-formacion-academica',
  templateUrl: './crud-formacion_academica.component.html',
  styleUrls: ['./crud-formacion_academica.component.scss'],
})
export class CrudFormacionAcademicaComponent implements OnInit {
  config: ToasterConfig;
  info_formacion_academica_id: number;
  organizacion: any;
  persona_id: number;
  SoporteDocumento: any;
  filesUp: any;

  @Input('info_formacion_academica_id')
  set name(info_formacion_academica_id: number) {
    this.info_formacion_academica_id = info_formacion_academica_id;
    // this.loadInfoFormacionAcademica();
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_formacion_academica: any;
  formInfoFormacionAcademica: any;
  regInfoFormacionAcademica: any;
  temp_info_academica: any;
  clean: boolean;
  percentage: number;
  paisSelecccionado: any;
  infoComplementariaUniversidadId: number = 1;
  universidadConsultada: any;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private ubicacionesService: UbicacionService,
    private sgaMidService: SgaMidService,
    private programaService: ProyectoAcademicoService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private users: UserService,
    private store: Store<IAppState>,
    private listService: ListService,
    private toasterService: ToasterService) {
    this.formInfoFormacionAcademica = FORM_FORMACION_ACADEMICA;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.persona_id = this.users.getPersonaId();
    this.listService.findPais();
    this.listService.findProgramaAcademico();
    this.loadLists();
  }

  construirForm() {
    // this.formInfoFormacionAcademica.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formInfoFormacionAcademica.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoFormacionAcademica.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoFormacionAcademica.campos.length; i++) {
      this.formInfoFormacionAcademica.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoFormacionAcademica.campos[i].label_i18n);
      this.formInfoFormacionAcademica.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoFormacionAcademica.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getPais(event) {}
  // getPais(event) {
  //   this.paisSelecccionado = event.valor;
  //   // this.loadOptionsPaisUniversidad();
  // }

  // loadInfoPostgrados(institucion) {
  //   this.programaService.get('/programa_academico/?query=Institucion:' + institucion + '&limit=0')
  //     .subscribe(res => {
  //       if (res !== null) {
  //         const r = <ProgramaAcademico>res;
  //         this.formInfoFormacionAcademica.campos[this.getIndexForm('ProgramaAcademico')].opciones = r;
  //       }
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.formacion_academica') + '|' +
  //             this.translate.instant('GLOBAL.programa_academico'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  // loadOptionsPaisUniversidad(): void {
  //   let consultaHijos: Array<any> = [];
  //   const ciudadUniversidad: Array<any> = [];
  //   if (this.paisSelecccionado) {
  //     this.ubicacionesService.get('relacion_lugares/?query=LugarPadre.Id:' + this.paisSelecccionado.Id + ',LugarHijo.Activo:true&limit=0')
  //       .subscribe(res => {
  //         if (res !== null) {
  //           consultaHijos = <Array<Lugar>>res;
  //           for (let i = 0; i < consultaHijos.length; i++) {
  //             ciudadUniversidad.push(consultaHijos[i].LugarHijo);
  //           }
  //         }
  //         this.formInfoFormacionAcademica.campos[this.getIndexForm('CiudadUniversidad')].opciones = ciudadUniversidad;
  //       },
  //         (error: HttpErrorResponse) => {
  //           Swal({
  //             type: 'error',
  //             title: error.status + '',
  //             text: this.translate.instant('ERROR.' + error.status),
  //             footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //               this.translate.instant('GLOBAL.formacion_academica') + '|' +
  //               this.translate.instant('GLOBAL.pais_universidad'),
  //             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //           });
  //         });
  //   }
  // }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoFormacionAcademica.campos.length; index++) {
      const element = this.formInfoFormacionAcademica.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  // addUbicacionOrganizacion(ubicacion: any): void {
  //   this.campusMidService.post('persona/RegistrarUbicaciones', ubicacion).subscribe(res => {
  //     const r = res as any;
  //     if (res !== null && r.Type === 'error') {
  //       this.showToast('error', 'error',
  //         'Ocurrio un error agregando la ubicación');
  //     }
  //   },
  //     (error: HttpErrorResponse) => {
  //       Swal({
  //         type: 'error',
  //         title: error.status + '',
  //         text: this.translate.instant('ERROR.' + error.status),
  //         footer: this.translate.instant('GLOBAL.crear') + '-' +
  //           this.translate.instant('GLOBAL.formacion_academica') + '|' +
  //           this.translate.instant('GLOBAL.pais_universidad'),
  //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //       });
  //     });
  // }

  // createOrganizacion(org: any, exp: any): void {
  //   this.campusMidService.post('organizacion', org).subscribe(res => {
  //     const identificacion = <any>res;
  //     if (identificacion !== null && identificacion.Type !== 'error') {
  //       exp.Organizacion = identificacion.Body.Ente.Id;
  //       const ubicacion = {
  //         Ente: identificacion.Body.Ente.Id,
  //         Lugar: org.Pais,
  //         TipoRelacionUbicacionEnte: 3,
  //         Atributos: [{
  //           AtributoUbicacion: 1,
  //           Valor: org.Direccion,
  //         }],
  //       };
  //       this.addUbicacionOrganizacion(ubicacion);
  //       if (this.info_formacion_academica === undefined) {
  //         this.createInfoFormacionAcademica(exp);
  //       } else {
  //         this.updateInfoFormacionAcademica(exp);
  //       }
  //     }
  //   },
  //     (error: HttpErrorResponse) => {
  //       Swal({
  //         type: 'error',
  //         title: error.status + '',
  //         text: this.translate.instant('ERROR.' + error.status),
  //         footer: this.translate.instant('GLOBAL.crear') + '-' +
  //           this.translate.instant('GLOBAL.formacion_academica') + '|' +
  //           this.translate.instant('GLOBAL.nombre_universidad'),
  //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //       });
  //     });
  // }

  searchNit(nit: string){
    const init = this.getIndexForm('Nit');
    const inombre = this.getIndexForm('NombreUniversidad');
    const idir = this.getIndexForm('Direccion');
    const itel = this.getIndexForm('Telefono');
    const icorreo = this.getIndexForm('Correo');
    const iPais = this.getIndexForm('Pais');
    this.sgaMidService.get('formacion_academica/info_universidad/?Id='+nit)
      .subscribe((res: any) => {
        this.universidadConsultada = res;
        this.formInfoFormacionAcademica.campos[init].valor = res.NumeroIdentificacion;
        this.formInfoFormacionAcademica.campos[inombre].valor = res.NombreCompleto;
        this.formInfoFormacionAcademica.campos[idir].valor = (res.Direccion) ? res.Direccion : 'No registrado';
        this.formInfoFormacionAcademica.campos[itel].valor = (res.Telefono) ? res.Telefono : 'No registrado';
        this.formInfoFormacionAcademica.campos[icorreo].valor = (res.Correo) ? res.Correo : 'No registrado';
        this.formInfoFormacionAcademica.campos[iPais].valor = (res.Ubicacion && res.Ubicacion.Id) ? res.Ubicacion : {Id: 0, Nombre: 'No registrado'};
        [this.formInfoFormacionAcademica.campos[inombre],
        this.formInfoFormacionAcademica.campos[idir],
        this.formInfoFormacionAcademica.campos[icorreo],
        this.formInfoFormacionAcademica.campos[iPais],
        this.formInfoFormacionAcademica.campos[itel]]
          .forEach(element => {
            element.deshabilitar = element.valor ? true : false
          });
      },
      (error: HttpErrorResponse) => {
        if (error.status === 404) {
          [this.formInfoFormacionAcademica.campos[inombre],
          this.formInfoFormacionAcademica.campos[idir],
          this.formInfoFormacionAcademica.campos[icorreo],
          this.formInfoFormacionAcademica.campos[iPais],
          this.formInfoFormacionAcademica.campos[itel]]
            .forEach(element => {
              element.deshabilitar = false;
            });
        }
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('informacion_academica.error_cargar_universidad'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  searchDoc(data) {
    const init = this.getIndexForm('Nit');
    const inombre = this.getIndexForm('NombreUniversidad');
    const idir = this.getIndexForm('Direccion');
    const itel = this.getIndexForm('Telefono');
    const icorreo = this.getIndexForm('Correo');
    const iPais = this.getIndexForm('Pais');
    const regex = /^[0-9]*$/;
    const nit = typeof data === 'string' ? data : data.data.Nit;
    console.info(nit)
    console.info(typeof(inombre))
    if (regex.test(nit) === true){
      console.info("es int");
      this.searchNit(nit);
    } else {
      console.info("es string");
      [this.formInfoFormacionAcademica.campos[inombre],
       this.formInfoFormacionAcademica.campos[idir],
       this.formInfoFormacionAcademica.campos[icorreo],
       this.formInfoFormacionAcademica.campos[iPais],
       this.formInfoFormacionAcademica.campos[itel]]
        .forEach(element => {
          element.deshabilitar = false;
        });
      //this.listService.findUniversidad(inombre);
    }
  }

 /* loadListUniversidades(nombre: string): void{
    let consultaUniversidades: Array<any> = []; 
    const ciudadNacimiento: Array<any> = [];
    
    this.sgaMidService.get('formacion_academica/info_universidad_nombre/?nombre='+ nombre)
      .subscribe(res => {
        if (res !== null) {
          consultaUniversidades = <Array<InfoPersona>>res;
          for (let i = 0; i < consultaUniversidades.length; i++) {
            ciudadNacimiento.push(consultaUniversidades[i].LugarHijoId);
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
    
  }*/

  public loadInfoFormacionAcademica(): void {
    this.temp_info_academica = {};
    this.SoporteDocumento = [];
    this.info_formacion_academica = {};
    this.filesUp = <any>{};
    // if (this.info_formacion_academica_id !== undefined &&
    //   this.info_formacion_academica_id !== 0 &&
    //   this.info_formacion_academica_id.toString() !== '') {
    if (this.persona_id) {
      // this.sgaMidService.get('formacion_academica' + this.info_formacion_academica_id)
      this.sgaMidService.get('formacion_academica/by_tercero/' + this.persona_id)
        .subscribe(res => {
          if (res !== null) {
            this.temp_info_academica = <any>res[0];
            const files = []
            if (this.temp_info_academica.Documento + '' !== '0') {
              files.push({ Id: this.temp_info_academica.Documento, key: 'Documento' });
            }
            this.nuxeoService.getDocumentoById$(files, this.documentoService)
              .subscribe(response => {
                const filesResponse = <any>response;
                if (Object.keys(filesResponse).length === files.length) {
                  this.info_formacion_academica = {
                    Nit: this.temp_info_academica.Institucion.Nit,
                    NombreUniversidad: this.temp_info_academica.Institucion.NombreUniversidad,
                    Pais: this.temp_info_academica.Institucion.Pais,
                    Direccion: this.temp_info_academica.Institucion.Direccion,
                    Correo: this.temp_info_academica.Institucion.Correo,
                    Telefono: this.temp_info_academica.Institucion.Telefono,
                    ProgramaAcademico: this.temp_info_academica.Titulacion,
                    FechaInicio: this.temp_info_academica.FechaInicio,
                    FechaFinalizacion: this.temp_info_academica.FechaFinalizacion,
                    TituloTrabajoGrado: this.temp_info_academica.TituloTrabajoGrado,
                    DescripcionTrabajoGrado: this.temp_info_academica.DescripcionTrabajoGrado,
                    // Documento: filesResponse['Documento'],
                  }
                  // this.formInfoFormacionAcademica.campos[this.getIndexForm('Documento')].url = filesResponse['Documento'] + '';
                  this.formInfoFormacionAcademica.campos[this.getIndexForm('Documento')].urlTemp = filesResponse['Documento'] + '';
                  // this.programaService.get('programa_academico/?query=id:' + this.temp.Titulacion.Id)
                  //   .subscribe(programa => {
                  //     if (programa !== null) {
                  //       const programa_info = <ProgramaAcademico>programa[0];
                  //       this.campusMidService.get('organizacion/' + programa_info.Institucion)
                  //         .subscribe(organizacion => {
                  //           if (organizacion !== null) {
                  //             const organizacion_info = <any>organizacion;
                  //             this.searchDoc(organizacion_info.NumeroIdentificacion);
                  //             this.SoporteDocumento = this.temp.Documento;
                  //             this.temp.Documento = filesResponse['Documento'] + '';
                  //             this.temp.Titulacion = programa_info;
                  //             this.temp.ProgramaAcademico = programa_info;
                  //             this.info_formacion_academica = this.temp;
                  //             this.formInfoFormacionAcademica.campos[this.getIndexForm('ProgramaAcademico')].opciones.push(programa_info);
                  //             this.loading = false;
                  //           }
                  //         },
                  //           (error: HttpErrorResponse) => {
                  //             Swal({
                  //               type: 'error',
                  //               title: error.status + '',
                  //               text: this.translate.instant('ERROR.' + error.status),
                  //               footer: this.translate.instant('GLOBAL.cargar') + '-' +
                  //                 this.translate.instant('GLOBAL.formacion_academica') + '|' +
                  //                 this.translate.instant('GLOBAL.nombre_universidad'),
                  //               confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  //             });
                  //           });
                  //     }
                  //   },
                  //     (error: HttpErrorResponse) => {
                  //       Swal({
                  //         type: 'error',
                  //         title: error.status + '',
                  //         text: this.translate.instant('ERROR.' + error.status),
                  //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
                  //           this.translate.instant('GLOBAL.formacion_academica') + '|' +
                  //           this.translate.instant('GLOBAL.programa_academico'),
                  //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  //       });
                  //     });
                }
              },
                (error: HttpErrorResponse) => {
                  this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
                });
          }
        },
          (error: HttpErrorResponse) => {
            this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
          });
    } else {
      this.temp_info_academica = {};
      this.SoporteDocumento = [];
      this.filesUp = <any>{};
      this.info_formacion_academica = undefined
      this.clean = !this.clean;
    }
  }

  // updateInfoFormacionAcademica(infoFormacionAcademica: any): void {
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
  //         this.info_formacion_academica = <any>infoFormacionAcademica;
  //         const files = [];
  //         if (this.info_formacion_academica.Documento.file !== undefined) {
  //           files.push({ file: this.info_formacion_academica.Documento.file, documento: this.SoporteDocumento, key: 'Documento' });
  //         }
  //         if (files.length !== 0) {
  //           this.nuxeoService.updateDocument$(files, this.documentoService)
  //             .subscribe(response => {
  //               if (Object.keys(response).length === files.length) {
  //                 const documentos_actualizados = <any>response;
  //                 this.info_formacion_academica.Documento = this.SoporteDocumento;
  //                 this.info_formacion_academica.Id = this.info_formacion_academica_id;
  //                 this.campusMidService.put2('formacion_academica', this.info_formacion_academica)
  //                   .subscribe(res => {
  //                     if (documentos_actualizados['Documento'] !== undefined) {
  //                       this.info_formacion_academica.Documento = documentos_actualizados['Documento'].url + '';
  //                     }
  //                     this.loading = false;
  //                     this.eventChange.emit(true);
  //                     this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
  //                       this.translate.instant('GLOBAL.formacion_academica') + ' ' +
  //                       this.translate.instant('GLOBAL.confirmarActualizar'));
  //                     this.clean = !this.clean;
  //                     this.info_formacion_academica = undefined;
  //                     this.info_formacion_academica_id = 0;
  //                     this.loadInfoFormacionAcademica();
  //                   },
  //                     (error: HttpErrorResponse) => {
  //                       Swal({
  //                         type: 'error',
  //                         title: error.status + '',
  //                         text: this.translate.instant('ERROR.' + error.status),
  //                         footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                           this.translate.instant('GLOBAL.formacion_academica'),
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
  //                     this.translate.instant('GLOBAL.formacion_academica') + '|' +
  //                     this.translate.instant('GLOBAL.soporte_documento'),
  //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                 });
  //               });
  //         } else {
  //           this.info_formacion_academica.Documento = this.SoporteDocumento;
  //           this.info_formacion_academica.Id = this.info_formacion_academica_id;
  //           this.campusMidService.put2('formacion_academica', this.info_formacion_academica)
  //             .subscribe(res => {
  //               this.loading = false;
  //               this.eventChange.emit(true);
  //               this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
  //                 this.translate.instant('GLOBAL.formacion_academica') + ' ' +
  //                 this.translate.instant('GLOBAL.confirmarActualizar'));
  //               this.clean = !this.clean;
  //               this.info_formacion_academica = undefined;
  //               this.info_formacion_academica_id = 0;
  //               this.loadInfoFormacionAcademica();
  //             },
  //               (error: HttpErrorResponse) => {
  //                 this.loading = false;
  //                 Swal({
  //                   type: 'error',
  //                   title: error.status + '',
  //                   text: this.translate.instant('ERROR.' + error.status),
  //                   footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                     this.translate.instant('GLOBAL.formacion_academica'),
  //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                 });
  //               });
  //         }
  //       }
  //     });
  // }

  createInfoFormacionAcademica(infoFormacionAcademica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('informacion_academica.seguro_continuar_registrar'),
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
          const files = [];
          this.info_formacion_academica = <any>infoFormacionAcademica;
          if (this.info_formacion_academica.FormacionAcademica.Documento.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub, key: 'Documento',
              file: this.info_formacion_academica.FormacionAcademica.Documento.file, IdDocumento: 3,
            });
          }
          this.nuxeoService.getDocumentos$(files, this.documentoService)
            .subscribe(response => {
              if (Object.keys(response).length === files.length) {
                this.filesUp = <any>response;
                if (this.filesUp['Documento'] !== undefined) {
                  this.info_formacion_academica.FormacionAcademica.Documento = this.filesUp['Documento'].Id;
                }
                // console.info('data post', JSON.stringify(this.info_formacion_academica));
                this.sgaMidService.post('formacion_academica/', this.info_formacion_academica)
                  .subscribe(res => {
                    const r = <any>res;
                    if (r !== null && r.Type !== 'error') {
                      this.eventChange.emit(true);
                      this.showToast('info', this.translate.instant('GLOBAL.crear'),
                        this.translate.instant('informacion_academica.informacion_academica_registrada'));
                      this.info_formacion_academica_id = 0;
                      this.info_formacion_academica = undefined;
                      this.clean = !this.clean;
                    } else {
                      this.showToast('error', this.translate.instant('GLOBAL.error'),
                        this.translate.instant('informacion_academica.informacion_academica_no_registrada'));
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('informacion_academica.informacion_academica_no_registrada'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
              }
            },
              (error: HttpErrorResponse) => {
                Swal({
                  type: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('informacion_academica.documento_informacion_academica_no_registrado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  ngOnInit() {
    this.loadInfoFormacionAcademica();
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  validarForm(event) {
    if (event.valid) {
      const formData = event.data.InfoFormacionAcademica;
      const universidadData = {
        UniversidadConsultada: this.universidadConsultada,
        Validada: (this.universidadConsultada) ? true : false,
        Nit: formData.Nit,
        NombreUniversidad: formData.NombreUniversidad,
        Pais: formData.Pais,
        Direccion: formData.Direccion,
        Correo: formData.Correo,
        Telefono: formData.Telefono,
      };
      const tercero = {
        Id: this.persona_id, // se debe cambiar solo por persona id
      }
      const postData = {
        InfoComplementariaTercero: [
          {
            // Información de la universidad
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: this.infoComplementariaUniversidadId, // Completar id faltante
            },
            Dato: JSON.stringify(universidadData),
            Activo: true,
          },
        ],
        FormacionAcademica: {
          Persona: this.persona_id,
          Titulacion: formData.ProgramaAcademico,
          FechaInicio: formData.FechaInicio,
          FechaFinalizacion: formData.FechaFinalizacion,
          Documento: formData.Documento,
          TituloTrabajoGrado: formData.TituloTrabajoGrado,
          DescripcionTrabajoGrado: formData.DescripcionTrabajoGrado,
        },
      }
      this.createInfoFormacionAcademica(postData);
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

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
       this.formInfoFormacionAcademica.campos[this.getIndexForm('Pais')].opciones = list.listPais[0];
       this.formInfoFormacionAcademica.campos[this.getIndexForm('ProgramaAcademico')].opciones = list.listProgramaAcademico[0];
      },
   );
 }
}
