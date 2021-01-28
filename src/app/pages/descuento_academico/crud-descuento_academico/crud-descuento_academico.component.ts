import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { DescuentoAcademicoService } from '../../../@core/data/descuento_academico.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { FORM_DESCUENTO } from './form-descuento_academico';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { UserService } from '../../../@core/data/users.service';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';
import { SolicitudDescuento } from '../../../@core/data/models/descuento/solicitud_descuento';
import { DescuentoDependencia } from '../../../@core/data/models/descuento/descuento_dependencia';
import { TipoDescuento } from '../../../@core/data/models/descuento/tipo_descuento';
import { ListService } from '../../../@core/store/services/list.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { CoreService } from '../../../@core/data/core.service';


@Component({
  selector: 'ngx-crud-descuento-academico',
  templateUrl: './crud-descuento_academico.component.html',
  styleUrls: ['./crud-descuento_academico.component.scss'],
})
export class CrudDescuentoAcademicoComponent implements OnInit {
  config: ToasterConfig;
  descuento_academico_id: number;
  filesUp: any;
  SoporteDescuento: any;
  estado: number;
  persona: number;
  programa: number;
  periodo: number;
  inscripcion: number;

  @Input('descuento_academico_id')
  set name(descuento_academico_id: number) {
    this.descuento_academico_id = descuento_academico_id;
    this.loadDescuentoAcademico();
  }

  @Input('persona_id')
  set info(persona_id: number) {
    this.persona = persona_id;
  }

  @Input('inscripcion_id')
  set info2(inscripcion_id: number) {
    this.inscripcion = inscripcion_id;
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
        // console.info('InscripcionDes: ' + this.inscripcion);
        // this.loadOptionsTipoDescuento();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_descuento_academico: any;
  formDescuentoAcademico: any;
  regDescuentoAcademico: any;
  temp: any;
  info_temp: any;
  clean: boolean;
  loading: boolean;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private descuentoService: DescuentoAcademicoService,
    private inscripcionService: InscripcionService,
    private coreService: CoreService,
    private sgaMidService: SgaMidService,
    private store: Store<IAppState>,
    private listService: ListService,
    private nuxeoService: NuxeoService,
    // private user: UserService,
    private toasterService: ToasterService) {
    this.formDescuentoAcademico = FORM_DESCUENTO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.cargarPeriodo();
    // this.listService.findDescuentoDependencia();
    this.findDescuentoAcademico(window.sessionStorage.getItem('ProgramaAcademicoId'));
    // this.loadLists();
  }

  findDescuentoAcademico(programa: any) {
          // this.descuentoAcademicoService.get('tipo_descuento/?limit=0&query=Activo:true')
          this.sgaMidService.get('descuento_academico/descuentoAcademicoByID/'+programa)
            .subscribe(
              (result: any) => {
                const r = <any>result.Data.Body[1];
                if (result !== null && result.Data.Code == '404') {
                  this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = []
                } else{
                  this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = r.map((result: any) => {
                    return {
                      Id: result.Id,
                      Nombre: result.Id + '. ' + result.Nombre,
                    }
                  });
                }
              },
              error => {
                this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = []
              },
            );
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.coreService.get('periodo?query=Activo:true&sortby=Id&order=desc&limit=1')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.periodo = <any>res[0].Id;
          resolve(this.periodo);
        }
      },
      (error: HttpErrorResponse) => {
        reject(error);
      });
    });
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        if (list.listDescuentoDependencia[0]) {
          this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = list.listDescuentoDependencia[0]
            .map((descuentoDependencia) => {
            return {
              Id: descuentoDependencia.Id,
              Nombre: descuentoDependencia.TipoDescuentoId.Id + '. ' + descuentoDependencia.TipoDescuentoId.Nombre,
            }
          });
        }
      },
   );
  }


  construirForm() {
    // this.formDescuentoAcademico.titulo = this.translate.instant('GLOBAL.descuento_academico');
    this.formDescuentoAcademico.btn = this.translate.instant('GLOBAL.guardar');
    this.formDescuentoAcademico.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formDescuentoAcademico.campos.length; i++) {
      this.formDescuentoAcademico.campos[i].label = this.translate.instant('GLOBAL.' + this.formDescuentoAcademico.campos[i].label_i18n);
      this.formDescuentoAcademico.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formDescuentoAcademico.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formDescuentoAcademico.campos.length; index++) {
      const element = this.formDescuentoAcademico.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  // loadOptionsTipoDescuento(): void {
  //   this.inscripcionService.get('inscripcion/' + this.inscripcion)
  //     .subscribe(dato_inscripcion => {
  //       const inscripciondata = <any>dato_inscripcion;
  //       this.programa = inscripciondata.ProgramaAcademicoId;
  //       this.periodo = inscripciondata.PeriodoId;
  //       this.descuentoService.get('descuentos_dependencia/?query=DependenciaId:' + this.programa +
  //         ',PeriodoId:' + this.periodo + '&limit=0')
  //         .subscribe(descuentos => {
  //           const descuentosdependencia = <Array<any>>descuentos;
  //           const tipoDescuentoAcademico: Array<DescuentoDependencia> = [];
  //           descuentosdependencia.forEach(element => {
  //             this.descuentoService.get('tipo_descuento/' + element.TipoDescuentoId.Id)
  //               .subscribe(tipo => {
  //                 this.info_temp = <DescuentoDependencia>element;
  //                 this.info_temp.TipoDescuento = <TipoDescuento>tipo;
  //                 this.info_temp.Nombre = this.info_temp.TipoDescuento.Nombre;
  //                 tipoDescuentoAcademico.push(this.info_temp);
  //                 this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = tipoDescuentoAcademico;
  //               },
  //                 (error: HttpErrorResponse) => {
  //                   Swal({
  //                     type: 'error',
  //                     title: error.status + '',
  //                     text: this.translate.instant('ERROR.' + error.status),
  //                     footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //                       this.translate.instant('GLOBAL.tipo_descuento_matricula') + '|' +
  //                       this.translate.instant('GLOBAL.tipo_descuento_matricula'),
  //                     confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                   });
  //                 });
  //           });
  //         },
  //           (error: HttpErrorResponse) => {
  //             Swal({
  //               type: 'error',
  //               title: error.status + '',
  //               text: this.translate.instant('ERROR.' + error.status),
  //               footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //                 this.translate.instant('GLOBAL.tipo_descuento_matricula') + '|' +
  //                 this.translate.instant('GLOBAL.descuentos_dependencia'),
  //               confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //             });
  //           });
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.tipo_descuento_matricula') + '|' +
  //             this.translate.instant('GLOBAL.admision'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //     });
  // }

  public loadDescuentoAcademico(): void {
    this.loading = true;
    this.temp = {};
    this.SoporteDescuento = [];
    this.info_descuento_academico = {};
    this.filesUp = <any>{};
    if (this.descuento_academico_id !== undefined &&
      this.descuento_academico_id !== 0 &&
      this.descuento_academico_id.toString() !== '') {
        this.sgaMidService.get('descuento_academico?PersonaId=' + window.localStorage.getItem('persona_id') + '&SolicitudId=' + this.descuento_academico_id)
          .subscribe(solicitud => {
            if (solicitud !== null) {
              this.temp = <SolicitudDescuento>solicitud;
              this.info_descuento_academico = this.temp;
              const files = [];
              if (this.temp.DocumentoId + '' !== '0') {
                files.push({ Id: this.temp.DocumentoId, key: 'Documento' });
              }
              this.nuxeoService.getDocumentoById$(files, this.documentoService)
                .subscribe(response => {
                  const filesResponse = <any>response;
                  if (Object.keys(filesResponse).length === files.length) {
                    this.SoporteDescuento = this.temp.DocumentoId;
                    this.temp.Documento = filesResponse['Documento'] + '';
                    this.info_descuento_academico = this.temp;
                    // this.info_descuento_academico.DescuentoDependencia = this.temp.DescuentosDependenciaId;
                    this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].valor = (this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId && this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId.Id) ? 
                    { Id: this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId.Id, 
                      Nombre: this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId.Id + '. ' + this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId.Nombre} : 
                      { Id: 0, Nombre: 'No registrado' };
                    this.info_descuento_academico.Periodo = this.periodo;
                    this.info_descuento_academico.Documento = filesResponse['Documento'] + '';
                    this.loading = false;
                  }
                },
                  (error: HttpErrorResponse) => {
                    Swal({
                      type: 'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      footer: this.translate.instant('GLOBAL.cargar') + '-' +
                        this.translate.instant('GLOBAL.descuento_matricula') + '|' +
                        this.translate.instant('GLOBAL.soporte_documento'),
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
                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                  this.translate.instant('GLOBAL.descuento_matricula'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
    } else {
      this.temp = {};
      this.SoporteDescuento = [];
      this.filesUp = <any>{};
      this.info_descuento_academico = undefined;
      this.clean = !this.clean;
      this.loading = false;
    }
  }

  // updateDescuentoAcademico(DescuentoAcademico: any): void {
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
  //         this.info_descuento_academico = <SolicitudDescuento>DescuentoAcademico;
  //         const files = [];
  //         if (this.info_descuento_academico.Documento.file !== undefined) {
  //           files.push({ file: this.info_descuento_academico.Documento.file, documento: this.SoporteDescuento, key: 'SoporteDescuento' });
  //         }
  //         if (files.length !== 0) {
  //           this.nuxeoService.updateDocument$(files, this.documentoService)
  //             .subscribe(response => {
  //               if (Object.keys(response).length === files.length) {
  //                 const documentos_actualizados = <any>response;
  //                 this.info_descuento_academico.DocumentoId = this.SoporteDescuento;
  //                 this.info_descuento_academico.Id = this.descuento_academico_id;
  //                 this.info_descuento_academico.PeriodoId = this.periodo;
  //                 this.info_descuento_academico.PersonaId = (1 * this.persona);
  //                 this.info_descuento_academico.DescuentosDependenciaId = this.info_descuento_academico.DescuentoDependencia;
  //                 this.mid.put2('descuento_academico', this.info_descuento_academico)
  //                   .subscribe(res => {
  //                     if (documentos_actualizados['SoporteDescuento'] !== undefined) {
  //                       this.info_descuento_academico.Documento = documentos_actualizados['SoporteDescuento'].url + '';
  //                     }
  //                     this.loading = false;
  //                     this.eventChange.emit(true);
  //                     this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
  //                       this.translate.instant('GLOBAL.descuento_matricula') + ' ' +
  //                       this.translate.instant('GLOBAL.confirmarActualizar'));
  //                     this.clean = !this.clean;
  //                     this.info_descuento_academico = undefined;
  //                     this.descuento_academico_id = 0;
  //                     this.loadDescuentoAcademico();
  //                   },
  //                     (error: HttpErrorResponse) => {
  //                       Swal({
  //                         type: 'error',
  //                         title: error.status + '',
  //                         text: this.translate.instant('ERROR.' + error.status),
  //                         footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                           this.translate.instant('GLOBAL.descuento_matricula'),
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
  //                     this.translate.instant('GLOBAL.descuento_matricula') + '|' +
  //                     this.translate.instant('GLOBAL.soporte_documento'),
  //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                 });
  //               });
  //         } else {
  //           this.info_descuento_academico.DocumentoId = this.SoporteDescuento;
  //           this.info_descuento_academico.Id = this.descuento_academico_id;
  //           this.info_descuento_academico.PeriodoId = this.periodo;
  //           this.info_descuento_academico.PersonaId = (1 * this.persona);
  //           this.info_descuento_academico.DescuentosDependenciaId = this.info_descuento_academico.DescuentoDependencia;

  //           this.mid.put2('descuento_academico', this.info_descuento_academico)
  //             .subscribe(res => {
  //               this.loading = false;
  //               this.eventChange.emit(true);
  //               this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
  //                 this.translate.instant('GLOBAL.descuento_matricula') + ' ' +
  //                 this.translate.instant('GLOBAL.confirmarActualizar'));
  //               this.clean = !this.clean;
  //               this.info_descuento_academico = undefined;
  //               this.descuento_academico_id = 0;
  //               this.loadDescuentoAcademico();
  //             },
  //               (error: HttpErrorResponse) => {
  //                 this.loading = false;
  //                 Swal({
  //                   type: 'error',
  //                   title: error.status + '',
  //                   text: this.translate.instant('ERROR.' + error.status),
  //                   footer: this.translate.instant('GLOBAL.actualizar') + '-' +
  //                     this.translate.instant('GLOBAL.descuento_matricula'),
  //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                 });
  //               });
  //         }
  //       }
  //     });
  // }

  // crearNuevoDescuentoAcademico(DescuentoAcademico: any): void {
  //   this.info_descuento_academico = <SolicitudDescuento>DescuentoAcademico;
  //   // const descuentoDependencia = this.info_descuento_academico.DescuentoDependencia.Id;
  //   const tipoDescuento = this.info_descuento_academico.DescuentoDependencia.TipoDescuento.Id;
  //   let contador = 0;
  //   let contadorB = 0;
  //   this.descuentoService.get('descuentos_dependencia/?query=DependenciaId:' + this.programa +
  //     ',PeriodoId:' + this.periodo + '&limit=0')
  //     .subscribe(descuentos => {
  //       const descuentosdependencia = <Array<any>>descuentos;
  //       descuentosdependencia.forEach( element => {
  //         this.descuentoService.get('solicitud_descuento/?query=DescuentosDependenciaId:' + element.Id + ',PersonaId:' + this.persona + '&limit=0')
  //           .subscribe(solicitud => {
  //             contadorB++;
  //             if (solicitud !== null && JSON.stringify(solicitud[0]) !== '{}') {
  //               contador++;
  //             }
  //             if (contadorB >= descuentosdependencia.length) {
  //               console.info('Final: ' + contador);
  //               if (contador <= 0) {
  //                 this.createDescuentoAcademico(DescuentoAcademico);
  //               } else if (contador >= 2) {
  //                 Swal({
  //                   type: 'error',
  //                   title: this.translate.instant('GLOBAL.descuento_matricula') + '',
  //                   text: this.translate.instant('ERROR.maximo_descuentos'),
  //                   footer: this.translate.instant('GLOBAL.crear') + '-' +
  //                     this.translate.instant('GLOBAL.descuento_matricula'),
  //                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                 });
  //                 this.eventChange.emit(true);
  //               } else {
  //                   descuentosdependencia.forEach( element2 => {
  //                     this.descuentoService.get('solicitud_descuento/?query=DescuentosDependenciaId:' +
  //    element2.Id + ',PersonaId:' + this.persona + '&limit=0')
  //                       .subscribe(solicitud2 => {
  //                         if (solicitud2 !== null) {
  //                           const dato = <any>solicitud2[0];
  //                           this.descuentoService.get('descuentos_dependencia/' + dato.DescuentosDependenciaId.Id)
  //                             .subscribe(tipodes => {
  //                               const tipoDesc = <any>tipodes;
  //                               if (tipoDescuento === 1 && tipoDesc.TipoDescuentoId.Id !== 1) {
  //                                 this.createDescuentoAcademico(DescuentoAcademico);
  //                               } else if (tipoDescuento !== 1 && tipoDesc.TipoDescuentoId.Id === 1) {
  //                                 this.createDescuentoAcademico(DescuentoAcademico);
  //                               } else {
  //                                 Swal({
  //                                   type: 'error',
  //                                   title: this.translate.instant('GLOBAL.descuento_matricula') + '',
  //                                   text: this.translate.instant('ERROR.repetir_descuentos'),
  //                                   footer: this.translate.instant('GLOBAL.crear') + '-' +
  //                                     this.translate.instant('GLOBAL.descuento_matricula'),
  //                                   confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                                 });
  //                                 this.clean = !this.clean;
  //                               }
  //                         },
  //                           (error: HttpErrorResponse) => {
  //                             Swal({
  //                               type: 'error',
  //                               title: error.status + '',
  //                               text: this.translate.instant('ERROR.' + error.status),
  //                               footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //                                 this.translate.instant('GLOBAL.descuento_matricula') + '|' +
  //                                 this.translate.instant('GLOBAL.tipo_descuento_matricula'),
  //                               confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                             });
  //                           });
  //                         }
  //                       },
  //                         (error: HttpErrorResponse) => {
  //                           Swal({
  //                             type: 'error',
  //                             title: error.status + '',
  //                             text: this.translate.instant('ERROR.' + error.status),
  //                             footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //                               this.translate.instant('GLOBAL.descuento_matricula'),
  //                             confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //                           });
  //                         });
  //                   });
  //               }
  //               this.eventChange.emit(true);
  //             }
  //           },
  //             (error: HttpErrorResponse) => {
  //               Swal({
  //                 type: 'error',
  //                 title: error.status + '',
  //                 text: this.translate.instant('ERROR.' + error.status),
  //                 footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //                   this.translate.instant('GLOBAL.descuento_matricula'),
  //                 confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //               });
  //             });
  //       });
  //     },
  //       (error: HttpErrorResponse) => {
  //         Swal({
  //           type: 'error',
  //           title: error.status + '',
  //           text: this.translate.instant('ERROR.' + error.status),
  //           footer: this.translate.instant('GLOBAL.cargar') + '-' +
  //             this.translate.instant('GLOBAL.descuentos_dependencia'),
  //           confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
  //         });
  //       });
  // }

  createDescuentoAcademico(DescuentoAcademico: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('descuento_academico.seguro_continuar_registrar'),
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
          const files = [];
          this.info_descuento_academico = <SolicitudDescuento>DescuentoAcademico;
          this.info_descuento_academico.PersonaId = Number(window.localStorage.getItem('persona_id'));
          // this.info_descuento_academico.PeriodoId = this.periodo;
          this.info_descuento_academico.PeriodoId = Number(window.sessionStorage.getItem('IdPeriodo'));
          this.info_descuento_academico.DescuentoDependencia.Dependencia = Number(window.sessionStorage.getItem('ProgramaAcademicoId'));
          // this.info_descuento_academico.DescuentoDependencia.Periodo = Number(this.periodo);
          this.info_descuento_academico.DescuentoDependencia.Periodo = Number(window.sessionStorage.getItem('IdPeriodo'));
          this.info_descuento_academico.DescuentoDependencia.Activo = true;
          this.info_descuento_academico.DescuentosDependenciaId = this.info_descuento_academico.DescuentoDependencia;
          if (this.info_descuento_academico.Documento.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub, key: 'Documento',
              file: this.info_descuento_academico.Documento.file, IdDocumento: 16,
            });
          }
          this.nuxeoService.getDocumentos$(files, this.documentoService)
            .subscribe(response => {
              if (Object.keys(response).length === files.length) {
                const filesUp = <any>response;
                if (filesUp['Documento'] !== undefined) {
                  this.info_descuento_academico.DocumentoId = filesUp['Documento'].Id;
                }
                // this.info_descuento_academico.DocumentoId = 1234
                this.sgaMidService.post('descuento_academico/', this.info_descuento_academico)
                  .subscribe(res => {
                    const r = <any>res
                    if (r !== null && r.Type !== 'error') {
                      this.loading = false;
                      this.eventChange.emit(true);
                      this.showToast('info', this.translate.instant('GLOBAL.crear'),
                        this.translate.instant('descuento_academico.descuento_academico_registrado'));
                      this.descuento_academico_id = 0;
                      this.info_descuento_academico = undefined;
                      this.clean = !this.clean;
                    } else {
                      this.showToast('error', this.translate.instant('GLOBAL.error'),
                        this.translate.instant('descuento_academico.descuento_academico_no_registrado'));
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('descuento_academico.descuento_academico_no_registrado'),
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
                  footer: this.translate.instant('descuento_academico.documento_descuento_academico_no_registrado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  ngOnInit() {
    this.loadDescuentoAcademico();
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  validarForm(event) {
    if (event.valid) {
      // if (this.info_descuento_academico === undefined) {
      //   // this.crearNuevoDescuentoAcademico(event.data.SolicitudDescuento);
      // } else {
      //   // this.updateDescuentoAcademico(event.data.SolicitudDescuento);
      // }
      this.createDescuentoAcademico(event.data.SolicitudDescuento);
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
