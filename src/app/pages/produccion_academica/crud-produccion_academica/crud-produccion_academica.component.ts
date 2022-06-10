import { TipoProduccionAcademica } from './../../../@core/data/models/produccion_academica/tipo_produccion_academica';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { EstadoAutorProduccion } from './../../../@core/data/models/produccion_academica/estado_autor_produccion';
import { SubTipoProduccionAcademica } from './../../../@core/data/models/produccion_academica/subtipo_produccion_academica';
import { UserService } from '../../../@core/data/users.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { ProduccionAcademicaPost } from './../../../@core/data/models/produccion_academica/produccion_academica';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProduccionAcademicaService } from '../../../@core/data/produccion_academica.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { FORM_produccion_academica } from './form-produccion_academica';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { NUEVO_AUTOR } from './form_new_autor';
import { TipoContribuyente } from '../../../@core/data/models/terceros/tipo_contribuyente';
import { TipoDocumento } from '../../../@core/data/models/documento/tipo_documento'
import { ListService } from '../../../@core/store/services/list.service';

import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MetadatoSubtipoProduccion } from '../../../@core/data/models/produccion_academica/metadato_subtipo_produccion';
import { Tercero } from '../../../@core/data/models/terceros/tercero';
import { LocalDataSource } from 'ng2-smart-table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-crud-produccion-academica',
  templateUrl: './crud-produccion_academica.component.html',
  styleUrls: ['./crud-produccion_academica.component.scss'],
})
export class CrudProduccionAcademicaComponent implements OnInit {
  config: ToasterConfig;
  produccion_academica_selected: ProduccionAcademicaPost;
  tipoProduccionAcademica: TipoProduccionAcademica;
  SubtipoProduccionId: SubTipoProduccionAcademica;

  listaTipoContibuyente: TipoContribuyente[];
  listaTipoDocumento: TipoDocumento[];

  @Input('produccion_academica_selected')
  set name(produccion_academica_selected: ProduccionAcademicaPost) {
    this.produccion_academica_selected = produccion_academica_selected;
    this.loadProduccionAcademica();
  }

  @Output()
  eventChange = new EventEmitter();

  @Output()
  updateList = new EventEmitter<void>();

  @Output('result')
  result: EventEmitter<any> = new EventEmitter();

  info_produccion_academica: ProduccionAcademicaPost;
  tiposProduccionAcademica: Array<TipoProduccionAcademica>;
  estadosAutor: Array<EstadoAutorProduccion>;
  subtiposProduccionAcademica: Array<SubTipoProduccionAcademica>;
  subtiposProduccionAcademicaFiltrados: Array<SubTipoProduccionAcademica>;
  personas: Array<Tercero>;
  source_authors: Array<any> = [];
  userData: Tercero;
  nuevoAutor: boolean = false;
  formInfoNuevoAutor: any;
  autorSeleccionado: Tercero;
  formProduccionAcademica: any;
  regProduccionAcademica: any;
  clean: boolean;
  formConstruido: boolean;
  creandoAutor: boolean;
  editando: boolean;
  settings_authors: any;
  DatosAdicionales: any;
  source: LocalDataSource = new LocalDataSource();
  Metadatos: any[];
  percentage: number;
  formAutor = new FormGroup({
    autorSeleccionadoV2: new FormControl(''),
  });

  constructor(
    private translate: TranslateService,
    private produccionAcademicaService: ProduccionAcademicaService,
    private popUpManager: PopUpManager,
    private user: UserService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private tercerosService: TercerosService,
    private listService: ListService,
    private store: Store<IAppState>,
    private toasterService: ToasterService,
    private http: HttpClient,
    private sgaMidService: SgaMidService) {
    this.formProduccionAcademica = JSON.parse(JSON.stringify(FORM_produccion_academica));
    this.formInfoNuevoAutor = NUEVO_AUTOR;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptions();
    this.settings_authors = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      actions: {
        edit: false,
        position: 'right',
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('produccion_academica.nombre_autor'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '60%',
        },
        EstadoAutorProduccionId: {
          title: this.translate.instant('produccion_academica.estado_autor'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          width: '30%',
        },
      },
    };
    this.listService.findTipoDocumento();
    this.listService.findTipoContribuyente();
    this.loadLists();
  }

  construirForm() {
    this.formProduccionAcademica.titulo = this.translate.instant('produccion_academica.produccion_academica');
    this.formProduccionAcademica.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formProduccionAcademica.campos.length; i++) {
      this.formProduccionAcademica.campos[i].label = this.translate.instant('produccion_academica.' + this.formProduccionAcademica.campos[i].label_i18n);
      this.formProduccionAcademica.campos[i].placeholder =
        this.translate.instant('produccion_academica.placeholder_' + this.formProduccionAcademica.campos[i].label_i18n);
    }

    this.formInfoNuevoAutor.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoNuevoAutor.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoNuevoAutor.campos.length; i++) {
      this.formInfoNuevoAutor.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoNuevoAutor.campos[i].label_i18n);
      this.formInfoNuevoAutor.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoNuevoAutor.campos[i].placeholder_i18n);
    }
  }

  setPercentage(event) {
    setTimeout(() => {
      this.percentage = event;
      this.result.emit(this.percentage);
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptions(): void {
    this.loadEstadosAutor()
      .then(() => {
        Promise.all([
          // this.loadEstadosAutor(),
          this.loadOptionsTipoProduccionAcademica(),
          this.loadOptionsSubTipoProduccionAcademica(),
          //this.loadAutores(),
          this.loadUserData(),
        ]).
          then(() => {

          })
          .catch(error => {
            if (!error.status) {
              error.status = 409;
            }
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
      })
      .catch(error => {
        if (!error.status) {
          error.status = 409;
        }
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  loadUserData(): Promise<any> {
    this.source_authors = [];
    this.source.load(this.source_authors);
    return new Promise((resolve, reject) => {
      this.tercerosService.get('tercero?query=Id:' + (this.user.getPersonaId() || 1))
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.userData = <Tercero>res[0];
            this.userData['PuedeBorrar'] = false;
            /*
            this.userData['EstadoAutorProduccion'] = {
              Id: 1,
              Nombre: 'Autor principal',
            };
            */
            this.userData['Nombre'] = this.userData.NombreCompleto;
            this.autorSeleccionado = JSON.parse(JSON.stringify(this.userData));
            this.agregarAutor(false, 1);
            // this.source_authors.push(this.userData);
            // this.source.load(this.source_authors);
            this.autorSeleccionado = undefined;
            resolve(true);
          } else {
            this.tiposProduccionAcademica = [];
            reject({ status: 404 });
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  // getFullAuthorName(p: Persona): string {
  //   return p.PrimerNombre + ' ' + p.SegundoNombre + ' ' + p.PrimerApellido + ' ' + p.SegundoApellido;
  // }

  loadAutores(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tercerosService.get('tercero/?query=TipoContribuyenteId.Id:1&limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.personas = <Array<Tercero>>res;
            this.personas.forEach((persona: Tercero) => {
              // persona['Nombre'] = this.getFullAuthorName(persona);
              persona['Nombre'] = persona.NombreCompleto;
              persona['PersonaId'] = persona.Id;
            });
            resolve(true);
          } else {
            this.personas = [];
            reject({ status: 404 });
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  loadEstadosAutor(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.produccionAcademicaService.get('estado_autor_produccion/?limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.estadosAutor = <Array<EstadoAutorProduccion>>res;
            resolve(true);
          } else {
            this.estadosAutor = [];
            reject({ status: 404 });
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  loadOptionsTipoProduccionAcademica(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.produccionAcademicaService.get('tipo_produccion/?limit=0')
        .subscribe(res => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.tiposProduccionAcademica = <Array<TipoProduccionAcademica>>res;
            resolve(true);
          } else {
            this.tiposProduccionAcademica = [];
            reject({ status: 404 });
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  loadOptionsSubTipoProduccionAcademica(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.produccionAcademicaService.get('subtipo_produccion/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            this.subtiposProduccionAcademica = <Array<SubTipoProduccionAcademica>>res;
            resolve(true);
          } else {
            this.subtiposProduccionAcademica = [];
            reject({ status: 404 });
          }
        }, (error: HttpErrorResponse) => {
          reject(error);
        });
    });
  }

  filterSubTypes(tipoProduccionAcademica: TipoProduccionAcademica) {
    this.SubtipoProduccionId = undefined;
    this.formConstruido = false;
    this.subtiposProduccionAcademicaFiltrados = this.subtiposProduccionAcademica.filter(subTipo => subTipo.TipoProduccionId.Id === tipoProduccionAcademica.Id);
  }

  loadSubTipoFormFields(subtipoProduccionAcademica: SubTipoProduccionAcademica, callback: Function) {
    this.formProduccionAcademica = JSON.parse(JSON.stringify(FORM_produccion_academica));
    this.construirForm();
    this.formConstruido = false;
    const query = `query=SubtipoProduccionId:${subtipoProduccionAcademica.Id}`;
    this.produccionAcademicaService.get(`metadato_subtipo_produccion/?limit=0&${query}`)
      .subscribe(res => {
        if (res !== null) {
          (<Array<MetadatoSubtipoProduccion>>res).forEach(metadato => {
            if (Object.keys(metadato).length > 0) {
              const field = JSON.parse(metadato.TipoMetadatoId.FormDefinition);
              field.nombre = metadato.Id;
              this.formProduccionAcademica.campos.push(field);
            }
          });
          if (callback !== undefined) {
            callback(this.formProduccionAcademica.campos, this.info_produccion_academica.Metadatos, this.nuxeoService, this.documentoService);
          }
          this.construirForm();
          this.formConstruido = true;
        }
      }, (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  /*
  loadOptionsCiudadPublicacion(): void {
    let ciudadPublicacion: Array<any> = [];
      this.ubicacionesService.get('lugar/?query=TipoLugar.Id:2')
        .subscribe(res => {
          if (res !== null) {
            ciudadPublicacion = <Array<Lugar>>res;
          }
          this.formProduccionAcademica.campos[this.getIndexForm('Ubicacion')].opciones = ciudadPublicacion;
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon:'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }
  */

  /*
  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formProduccionAcademica.campos.length; index++) {
      const element = this.formProduccionAcademica.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }
  */

  public loadProduccionAcademica(): void {
    if (this.produccion_academica_selected !== undefined) {

      /*this.produccionAcademicaService.get('produccion_academica?query=id:' + this.produccion_academica_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_produccion_academica = <ProduccionAcademicaPost>res[0];
          }
        });*/
      this.DatosAdicionales = this.produccion_academica_selected
      this.info_produccion_academica = JSON.parse(JSON.stringify(this.produccion_academica_selected));
      this.source_authors = this.info_produccion_academica.Autores;
      this.source.load(this.source_authors);
      this.Metadatos = [];
      // this.formProduccionAcademica = JSON.parse(JSON.stringify(FORM_produccion_academica));
      const fillForm = function (campos, Metadatos, nuxeoService, documentoService) {
        const filesToGet = [];
        campos.forEach(campo => {
          Metadatos.forEach(metadato => {
            // const field = JSON.parse(datoAdicional.DatoAdicionalSubtipoProduccion.TipoDatoAdicional.FormDefiniton);
            if (campo.nombre === metadato.MetadatoSubtipoProduccionId.Id) {
              campo.valor = metadato.Valor;
              if (metadato.MetadatoSubtipoProduccionId.TipoMetadatoId.Id === 39 || metadato.MetadatoSubtipoProduccionId.TipoMetadatoId.Id === 45) {
                const seleccion = metadato.MetadatoSubtipoProduccionId.TipoMetadatoId.FormDefinition
                campo.valor = JSON.parse(seleccion).opciones[parseInt(metadato.Valor) - 1]
              }
              if (campo.etiqueta === 'file') {
                campo.idFile = parseInt(metadato.Valor, 10);
                filesToGet.push({ Id: campo.idFile, key: campo.nombre });
              }
            };
          });
        });
        if (filesToGet.length !== 0) {
          nuxeoService.getDocumentoById$(filesToGet, documentoService)
            .subscribe(response => {
              const filesResponse = <any>response;
              if (Object.keys(filesResponse).length === filesToGet.length) {
                campos.forEach(campo => {
                  if (campo.etiqueta === 'file') {
                    campo.url = filesResponse[campo.nombre] + '';
                    campo.urlTemp = filesResponse[campo.nombre] + '';
                  }
                });
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      }
      this.loadSubTipoFormFields(this.info_produccion_academica.SubtipoProduccionId, fillForm);
      this.construirForm();
      this.formConstruido = true;
      this.editando = true;
    } else {
      this.info_produccion_academica = new ProduccionAcademicaPost();
      this.clean = !this.clean;
      this.editando = false;
      this.formConstruido = false;
      this.loadUserData();
      this.Metadatos = [];
    }
  }

  updateProduccionAcademica(ProduccionAcademica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('produccion_academica.seguro_continuar_actualizar_produccion'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_produccion_academica = <ProduccionAcademicaPost>ProduccionAcademica;
          this.sgaMidService.put('produccion_academica', this.info_produccion_academica)
            .subscribe((res: any) => {
              if (res !== null) {
                this.info_produccion_academica = <ProduccionAcademicaPost>res;
                // this.showToast('info', this.translate.instant('GLOBAL.actualizar'), this.translate.instant('produccion_academica.produccion_actualizada'));
                this.popUpManager.showInfoToast(this.translate.instant('produccion_academica.produccion_actualizada'));
                this.updateList.emit();
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('produccion_academica.produccion_no_actualizada'));
              }
            });
        }
      });
  }

  createProduccionAcademica(ProduccionAcademica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('produccion_academica.seguro_continuar_registrar_produccion'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willCreate) => {
        if (willCreate.value) {
          this.info_produccion_academica = <ProduccionAcademicaPost>ProduccionAcademica;
          this.sgaMidService.post('produccion_academica', this.info_produccion_academica)
            .subscribe((res: any) => {
              if (res !== null) {
                this.info_produccion_academica = <ProduccionAcademicaPost>res;
                //this.showToast('info', this.translate.instant('GLOBAL.crear'), this.translate.instant('produccion_academica.produccion_creada'));
                this.popUpManager.showInfoToast(this.translate.instant('produccion_academica.produccion_creada'));
                this.updateList.emit();
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('produccion_academica.produccion_no_creada'));
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('informacion_academica.informacion_academica_no_registrada'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  agregarAutor(mostrarError: boolean, estadoAutor: number): void {
    if (this.source_authors.find(author => author.PersonaId === this.autorSeleccionado.Id)) {
      if (mostrarError) {
        Swal.fire({
          icon: 'error',
          title: 'ERROR',
          text: this.translate.instant('produccion_academica.error_autor_ya_existe'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      }
    } else {
      if (this.estadosAutor != undefined) {
        console.log(this.autorSeleccionado, this.estadosAutor)
        this.source_authors.push({
          // Nombre: this.getFullAuthorName(this.autorSeleccionado),
          Nombre: this.autorSeleccionado.NombreCompleto,
          PersonaId: this.autorSeleccionado.Id,
          // EstadoAutorProduccion: this.estadosAutor.filter(estado => estado.Id === 3)[0],
          EstadoAutorProduccionId: this.estadosAutor.filter(estado => estado.Id === estadoAutor)[0],
          // PuedeBorrar: true,
          PuedeBorrar: estadoAutor !== 1,
        });
        this.autorSeleccionado = undefined;
        this.creandoAutor = false;
        this.source.load(this.source_authors);
      }
    }
  }

  ngOnInit() {
    this.loadProduccionAcademica();
    this.formAutor.controls.autorSeleccionadoV2.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(1000),
        switchMap(value => this.http.get(environment.TERCEROS_SERVICE + 'tercero?query=NombreCompleto__icontains:' + value + ',TipoContribuyenteId.Id:1&fields=Id,NombreCompleto&limit=50'))
      ).subscribe((data: any) => {
        console.log(data);
        this.personas = <Array<Tercero>>data;
        this.personas.forEach((persona: Tercero) => {
          persona['Nombre'] = persona.NombreCompleto;
          persona['PersonaId'] = persona.Id;
        });
      });
  }

  onSelected(event) {
    console.log("onselect:",event)
    this.formAutor.patchValue({
      autorSeleccionadoV2: event.option.value.Nombre,
    })
    this.autorSeleccionado = event.option.value;
  }

  onDeleteAuthor(event): void {
    if (event.data.PuedeBorrar) {
      this.source_authors.splice(this.source_authors.indexOf(event.data), this.source_authors.indexOf(event.data));
      this.source.load(this.source_authors);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('produccion_academica.error_autor_borrar'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  uploadFilesToMetadaData(files, metadatos) {
    return new Promise((resolve, reject) => {
      files.forEach((file) => {
        file.Id = file.nombre,
          file.nombre = 'soporte_' + file.Id + '_prod_' + this.userData.Id;
        file.key = file.Id;
      });
      this.nuxeoService.getDocumentos$(files, this.documentoService)
        .subscribe(response => {
          if (Object.keys(response).length === files.length) {
            files.forEach((file) => {
              metadatos.push({
                MetadatoSubtipoProduccionId: file.Id,
                Valor: response[file.Id].Id + '', // Se castea el valor del string
              });
            });
            resolve(true);
          }
        }, error => {
          reject(error);
        });
    });
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_produccion_academica.Titulo === undefined ||
        this.info_produccion_academica.Fecha === undefined ||
        this.info_produccion_academica.Resumen === undefined) {
        Swal.fire({
          icon: 'warning',
          title: 'ERROR',
          text: this.translate.instant('produccion_academica.alerta_llenar_campos_datos_basicos'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      } else {
        const promises = [];
        if (event.data.ProduccionAcademica) {
          // Subir archivos y verificar los
          // console.log(event.data.ProduccionAcademica);
          // const tempMetadatos = JSON.parse(JSON.stringify(event.data.ProduccionAcademica));
          const tempMetadatos = event.data.ProduccionAcademica;
          const keys = Object.keys(tempMetadatos);
          const metadatos = [];
          const filesToUpload = [];
          for (let i = 0; i < keys.length; i++) {
            if (tempMetadatos[keys[i]].nombre) {
              // Archivo se debe subir a nuxeo
              if (tempMetadatos[keys[i]].file !== undefined) {
                filesToUpload.push(tempMetadatos[keys[i]]);
              }
            } else {
              metadatos.push({
                MetadatoSubtipoProduccionId: parseInt(keys[i], 10),
                Valor: tempMetadatos[keys[i]],
              });
            }
          }
          if (filesToUpload.length > 0) {
            promises.push(this.uploadFilesToMetadaData(filesToUpload, metadatos));
          }
          this.info_produccion_academica.Metadatos = metadatos;
        } else {
          this.info_produccion_academica.Metadatos = [];
        }
        this.info_produccion_academica.Autores = JSON.parse(JSON.stringify(this.source_authors));
        Promise.all(promises)
          .then(() => {
            // console.log("promesas cumplidas subir produccion");
            // console.log("metadatos", this.info_produccion_academica.Metadatos);
            if (this.produccion_academica_selected === undefined) {
              this.createProduccionAcademica(this.info_produccion_academica);
              this.result.emit(event);
            } else {
              this.updateProduccionAcademica(this.info_produccion_academica);
              this.result.emit(event);
            }
          })
          .catch(error => {
            // console.log("error subiendo archivos", error);
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: this.translate.instant('ERROR.error_subir_documento'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
      }
    }
  }

  onCreateAuthor(event): void {
    if (!this.editando) {
      //this.loadAutores();
      this.creandoAutor = !this.creandoAutor;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('produccion_academica.error_no_puede_editar_autores'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  getIndexFormNew(nombre: String): number {
    for (let index = 0; index < this.formInfoNuevoAutor.campos.length; index++) {
      const element = this.formInfoNuevoAutor.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }

  NuevoAutor() {
    this.nuevoAutor = !this.nuevoAutor;
  }

  createInfoAutor(infoTercero: any) {
    return new Promise((resolve, reject) => {
      const opt: any = {
        title: this.translate.instant('GLOBAL.crear'),
        text: this.translate.instant('produccion_academica.seguro_continuar_registrar'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt)
        .then((willMake) => {
          if (willMake.value) {
            infoTercero.Activo = false;
            console.log(infoTercero);

            this.sgaMidService.post("persona/guardar_autor", infoTercero).subscribe((res) => {
              if (res.Type !== 'error') {
                this.showToast('info', this.translate.instant('GLOBAL.registrar'), this.translate.instant('produccion_academia.autor_creado'))
                resolve(res);
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('produccion_academia.autor_no_creado'));
                reject();
              }
            }, () => {
              this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('produccion_academia.autor_no_creado'));
              reject();
            });
          }
        });
    });
  }

  validarFormNuevoAutor(event) {
    if (event.valid) {
      const formData = event.data.Autor;
      this.createInfoAutor(formData).then(newAutor => {
        console.log(newAutor)
        let d: any = newAutor
        this.autorSeleccionado = d;
        this.agregarAutor(true, 3);
        this.NuevoAutor()
      });
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.listaTipoContibuyente = list.listTipoContribuyente;
        this.formInfoNuevoAutor.campos[this.getIndexFormNew('TipoContribuyenteId')].opciones = this.listaTipoContibuyente[0];

        this.listaTipoDocumento = list.listTipoDocumento;
        this.formInfoNuevoAutor.campos[this.getIndexFormNew('TipoDocumentoId')].opciones = this.listaTipoDocumento[0];
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
