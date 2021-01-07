import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_FORMACION_ACADEMICA } from './form-formacion_academica';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { TercerosService } from '../../../@core/data/terceros.service';
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
import * as moment from 'moment';

@Component({
  selector: 'ngx-crud-formacion-academica',
  templateUrl: './crud-formacion_academica.component.html',
  styleUrls: ['./crud-formacion_academica.component.scss'],
})
export class CrudFormacionAcademicaComponent implements OnInit {
  config: ToasterConfig;
  info_formacion_academica_id: number;
  info_proyecto_id: number;
  organizacion: any;
  persona_id: number;
  SoporteDocumento: any;
  filesUp: any;

  @Input('info_formacion_academica_id')
  set name(info_formacion_academica_id: number) {
    this.info_formacion_academica_id = info_formacion_academica_id;
      this.loadInfoFormacionAcademica();
  }

  @Input('info_proyecto_id')
  set name_(info_proyecto_id: number) {
    this.info_proyecto_id = info_proyecto_id;
      this.loadInfoFormacionAcademica();
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
    private tercerosService: TercerosService,
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
 
  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoFormacionAcademica.campos.length; index++) {
      const element = this.formInfoFormacionAcademica.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  searchNit(nit: string){
    const init = this.getIndexForm('Nit');
    const inombre = this.getIndexForm('NombreUniversidad');
    const idir = this.getIndexForm('Direccion');
    const itel = this.getIndexForm('Telefono');
    const icorreo = this.getIndexForm('Correo');
    const iPais = this.getIndexForm('Pais');
    this.sgaMidService.get('formacion_academica/info_universidad?Id='+nit)
      .subscribe((res: any) => {
        this.universidadConsultada = res;
        this.formInfoFormacionAcademica.campos[init].valor = res.NumeroIdentificacion;
        this.formInfoFormacionAcademica.campos[inombre].valor = (res.NombreCompleto && res.NombreCompleto.Id) ? res.NombreCompleto : {Id: 0, Nombre: 'No registrado'}; //res.NombreCompleto;
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
    var IdUniversidad;
    
    if (regex.test(nit) === true){
      //console.info("es int");
      this.searchNit(nit);
    } else {
      if (Object.entries(this.formInfoFormacionAcademica.campos[inombre].valor).length !=0){
        //console.info("hay algo")
        IdUniversidad = this.formInfoFormacionAcademica.campos[this.getIndexForm('NombreUniversidad')].valor.Id;
        this.tercerosService.get('datos_identificacion?query=TerceroId__Id:'+IdUniversidad).subscribe(
          (res: any) => {
            this.searchNit(res[0]["Numero"])
          },
          (error: HttpErrorResponse) => {

          }
        )
      } else {
        [//this.formInfoFormacionAcademica.campos[inombre],
         this.formInfoFormacionAcademica.campos[idir],
         this.formInfoFormacionAcademica.campos[icorreo],
         this.formInfoFormacionAcademica.campos[iPais],
         this.formInfoFormacionAcademica.campos[itel]]
          .forEach(element => {
            element.deshabilitar = false;
          });
        this.loadListUniversidades(nit);
        this.formInfoFormacionAcademica.campos[inombre].valor = nit;
      }
      
    }
  }

  loadListUniversidades(nombre: string): void{
    let consultaUniversidades: Array<any> = []; 
    const universidad: Array<any> = [];
    
    this.sgaMidService.get('formacion_academica/info_universidad_nombre?nombre='+ nombre)
      .subscribe(res => {
        if (res !== null) {
          consultaUniversidades = <Array<InfoPersona>>res;
          for (let i = 0; i < consultaUniversidades.length; i++) {
            universidad.push(consultaUniversidades[i]);
          }
        }
        this.formInfoFormacionAcademica.campos[this.getIndexForm('NombreUniversidad')].opciones = universidad;
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

  public loadInfoFormacionAcademica(): void {
    
    if(this.info_formacion_academica_id !== 0 && this.info_proyecto_id !== 0 && this.persona_id !== 0){
      this.temp_info_academica = {};
      this.SoporteDocumento = [];
      this.sgaMidService.get('formacion_academica/info_complementaria?IdTercero='+this.persona_id+'&IdProyecto='+this.info_proyecto_id+'&Nit='+this.info_formacion_academica_id)
        .subscribe((response: any) => {
          this.temp_info_academica = <any>response;
          if(response !== null && response !== undefined){
            this.temp_info_academica = <any>response;
            const files = []
            if (this.temp_info_academica.Documento + '' !== '0') {
              files.push({ Id: this.temp_info_academica.Documento, key: 'Documento' });
            }
            if (this.temp_info_academica.Documento !== undefined && this.temp_info_academica.Documento !== null && this.temp_info_academica.Documento !== 0){
              this.nuxeoService.getDocumentoById$(files, this.documentoService)
              .subscribe(res => {
                const filesResponse = <any>res;
                if (Object.keys(filesResponse).length === files.length) {
                  var FechaI = moment(this.temp_info_academica.FechaInicio, "DD-MM-YYYY").toDate();
                  var FechaF = moment(this.temp_info_academica.FechaFinalizacion, "DD-MM-YYYY").toDate();
                  this.info_formacion_academica = {
                    Nit: this.temp_info_academica.Nit,
                    ProgramaAcademico: this.temp_info_academica.ProgramaAcademico,
                    FechaInicio: FechaI,
                    FechaFinalizacion: FechaF,
                    TituloTrabajoGrado: this.temp_info_academica.TituloTrabajoGrado,
                    DescripcionTrabajoGrado: this.temp_info_academica.DescripcionTrabajoGrado,
                  }
                  this.searchNit(this.temp_info_academica.Nit)
                  this.formInfoFormacionAcademica.campos[this.getIndexForm('Documento')].urlTemp = filesResponse['Documento'] + '';
                }
              },
              (error: HttpErrorResponse) => {
                this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
              });
            }
          }
          },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.formacion_academica') + '|' +
            this.translate.instant('GLOBAL.nombre_universidad'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
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
          if (this.info_formacion_academica.DocumentoId.file !== undefined) {
            files.push({
              nombre: this.autenticationService.getPayload().sub, key: 'Documento',
              file: this.info_formacion_academica.DocumentoId.file, IdDocumento: 16
            });
          }
          this.nuxeoService.getDocumentos$(files, this.documentoService)
            .subscribe(response => {
              if (Object.keys(response).length === files.length) {
                this.filesUp = <any>response;
                if (this.filesUp['Documento'] !== undefined) {
                  this.info_formacion_academica.DocumentoId = this.filesUp['Documento'].Id;
                }
                this.sgaMidService.post('formacion_academica/', this.info_formacion_academica)
                  .subscribe(res => {
                    const r = <any>res;
                    if (r !== null && r.Type !== 'error') {
                      const inombre = this.getIndexForm('NombreUniversidad');
                      this.eventChange.emit(true);
                      this.showToast('info', this.translate.instant('GLOBAL.crear'),
                      this.translate.instant('informacion_academica.informacion_academica_registrada'));
                      this.formInfoFormacionAcademica.campos[inombre].valor = '';
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
    setTimeout(()=>{
      this.percentage = event;
      this.result.emit(this.percentage);     
    });
  }

  validarForm(event) {
    if (event.valid) {
      const formData = event.data.InfoFormacionAcademica;
      const InfoFormacionAcademica = {
        TerceroId: this.persona_id,
        ProgramaAcademicoId: formData.ProgramaAcademico.Id,
        FechaInicio: moment(formData.FechaInicio).format('DDMMYYYYY'),
        FechaFinalizacion: moment(formData.FechaFinalizacion).format('DDMMYYYYY'),
        TituloTrabajoGrado: formData.TituloTrabajoGrado,
        DescripcionTrabajoGrado: formData.DescripcionTrabajoGrado,
        DocumentoId: formData.Documento,
        NitUniversidad: formData.Nit,
      };
      this.createInfoFormacionAcademica(InfoFormacionAcademica);
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
