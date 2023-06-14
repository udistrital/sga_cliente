import { Component, OnInit } from '@angular/core';
import { ACTIONS, MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Ng2StButtonComponent } from '../../../@theme/components';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FORM_ESPACIO_ACADEMICO } from './form-espacio_academico';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { EspaciosAcademicosService } from '../../../@core/data/espacios_academicos.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { format } from 'url';
import { EstadoAprobacion, STD } from '../../../@core/data/models/espacios_academicos/estado_aprobacion';
import { EspacioAcademico } from '../../../@core/data/models/espacios_academicos/espacio_academico';

@Component({
  selector: 'creacion-espacios-academicos',
  templateUrl: './creacion-espacios-academicos.component.html',
  styleUrls: ['./creacion-espacios-academicos.component.scss']
})
export class CreacionEspaciosAcademicosComponent implements OnInit {

  loading: boolean;

  readonly VIEWS = VIEWS;
  vista: Symbol;

  tbEspaciosAcademicos: Object;
  dataEspaciosAcademicos: LocalDataSource;

  formStep1: FormGroup;
  formStep2: FormGroup;
  formStep3: FormGroup;
  formDef: any;

  niveles: any[];
  proyectos: any[];
  tipos: any[];
  clases: any[];
  enfoques: any[];
  espacios_academicos: EspacioAcademico[];
  esp_required: any[] = [];
  estados_aprobacion: EstadoAprobacion[];

  readonly horasCredito: number = 48;

  readonly ACTIONS = ACTIONS;
  crear_editar: Symbol;
  soloLectura: boolean;
  id_espacio_academico: string;

  rol: String = undefined;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private formBuilder: FormBuilder,
    private projectService: ProyectoAcademicoService,
    private parametrosService: ParametrosService,
    private espaciosAcademicosService: EspaciosAcademicosService,
    private autenticationService: ImplicitAutenticationService,
    private gestorDocumentalService: NewNuxeoService
    ) {
      this.dataEspaciosAcademicos = new LocalDataSource();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.createTable();
        this.updateLanguage();
      })
    }

  ngOnInit() {
    this.loading = false;
    this.vista = VIEWS.LIST;
    this.formDef = {...FORM_ESPACIO_ACADEMICO};
    this.manageByRole();
    this.loadSelects();
    this.createTable();
    this.buildFormEspaciosAcademicos();
    this.gestorDocumentalService.clearLocalFiles();
  }

  // * ----------
  // * Creación de tabla (lista espacios_academicos) 
  //#region
  createTable() {
    this.tbEspaciosAcademicos = {
      columns: {
        index:{
          title: '#',
          filter: false,
          valuePrepareFunction: (value,row,cell) => {
            return cell.row.index+1;
           },
          width: '2%',
        },
        nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          editable: false,
          width: '25%',
          filter: true,
        },
        codigo: {
          title: this.translate.instant('GLOBAL.codigo'),
          editable: false,
          width: '15%',
          filter: true,
        },
        estado: {
          title: this.translate.instant('GLOBAL.estado'),
          editable: false,
          width: '12.5%',
          filter: true,
        },
        gestion: {
          title: this.translate.instant('ptd.gest'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              this.editarEspacioAcad(out.value, out.rowData)
            })}
        },
        enviar: {
          title: this.translate.instant('GLOBAL.enviar'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: Ng2StButtonComponent,
          onComponentInitFunction: (instance) => {
            instance.valueChanged.subscribe((out) => {
              this.enviaraRevision(out.rowData);
            })}
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  ajustarBotonesSegunEstado(espacio: EspacioAcademico) {
    const estado = this.estados_aprobacion.find(estado => estado._id == espacio.estado_aprobacion_id);
    espacio['estado'] = estado.nombre;
    if (this.rol == ROLES.ADMIN_SGA) {
      let accion, tipo;
      if ((estado.codigo_abreviacion == STD.IS_APRV)) {
        accion = ACTIONS.VIEW;
        tipo = 'ver';
      } else {
        accion = ACTIONS.EDIT_PART;
        tipo = 'editar';
      }
      espacio['gestion'] = {value: accion, type: tipo, disabled: false};
      espacio['enviar'] = {value: undefined, type: 'enviar', disabled: true};
    } else {
      let accion, tipo;
      if ((estado.codigo_abreviacion == STD.IN_EDIT) || (estado.codigo_abreviacion == STD.NOT_APRV)) {
        accion = ACTIONS.EDIT;
        tipo = 'editar';
      } else {
        accion = ACTIONS.VIEW;
        tipo = 'ver';
      }
      espacio['gestion'] = {value: accion, type: tipo, disabled: false};
      const siEnviar = (estado.codigo_abreviacion == STD.IN_EDIT)
      espacio['enviar'] = {value: undefined, type: 'enviar', disabled: !siEnviar};
    }
  }
  //#endregion
  // * ----------

  // * ----------
  // * Constructor de formulario, buscar campo, update i18n, suscribirse a cambios
  //#region
  buildFormEspaciosAcademicos() {
    // ? primera carga del formulario: validación e idioma
    const form1 = {};
    this.formDef.campos_p1.forEach(campo => {
      form1[campo.nombre] = new FormControl('', campo.validacion);
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
    this.formStep1 = this.formBuilder.group(form1);
    const form2 = {};
    this.formDef.campos_p2.forEach(campo => {
      form2[campo.nombre] = new FormControl('', campo.validacion);
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
    this.formStep2 = this.formBuilder.group(form2);
    const form3 = {};
    this.formDef.campos_p3.forEach(campo => {
      form3[campo.nombre] = new FormControl('', campo.validacion);
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
    this.formStep3 = this.formBuilder.group(form3);

    // ? Los campos que requieren ser observados cuando cambian se suscriben
    this.formDef.campos_p1.forEach(campo => {
      if (campo.entrelazado) {
        this.formStep1.get(campo.nombre).valueChanges.subscribe(value => {
          this.myOnChanges(campo.nombre, value);
        });
      }  
    });
    this.formDef.campos_p2.forEach(campo => {
      if (campo.entrelazado) {
        this.formStep2.get(campo.nombre).valueChanges.subscribe(value => {
          this.myOnChanges(campo.nombre, value);
        });
      }  
    });
    this.formDef.campos_p3.forEach(campo => {
      if (campo.entrelazado) {
        this.formStep3.get(campo.nombre).valueChanges.subscribe(value => {
          this.myOnChanges(campo.nombre, value);
        });
      }  
    });
  }

  getIndexOf(campos: any[], label: string): number {
    return campos.findIndex(campo => campo.nombre == label);
  }

  updateLanguage() {
    this.reloadLabels(this.formDef.campos_p1);
    this.reloadLabels(this.formDef.campos_p2);
    this.reloadLabels(this.formDef.campos_p3);
  }

  reloadLabels(campos: any[]) {
    campos.forEach(campo => {
      campo.label = this.translate.instant(campo.label_i18n);
      campo.placeholder = this.translate.instant(campo.placeholder_i18n);
    });
  }

  myOnChanges(label: string, field: any) {
    if (label == 'nivel' && field) {
      let idx = this.getIndexOf(this.formDef.campos_p1, 'subnivel');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId && (nivel.NivelFormacionPadreId.Id == field.Id));
      }
      idx = this.getIndexOf(this.formDef.campos_p1, 'proyectoCurricular');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = [];
      }
    }
    if (label == 'subnivel' && field) {
      let idx = this.getIndexOf(this.formDef.campos_p1, 'proyectoCurricular');
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = this.proyectos.filter(proyecto => proyecto.NivelFormacionId && (proyecto.NivelFormacionId.Id == field.Id));
      }
    }
    if (label == 'htd' || label == 'htc' || label == 'hta' ) {
      let suma = Number(this.formStep2.get('htd').value) + Number(this.formStep2.get('htc').value) +Number(this.formStep2.get('hta').value);
      this.formStep2.patchValue({total: suma});
      this.formStep2.get('total').markAsTouched({onlySelf: true});
    }
    if (label == 'espacios_requeridos') {
      if(field){
        this.esp_required = field;
      } else {
        this.esp_required = [];
      }
    }
    if (label == 'soporte') {
      
    }
  }

  limpiarFormulario() {
    this.formStep1.reset();
    this.esp_required = [];
    this.formStep2.reset();
    const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'soporte');
    if (idx != -1) {
      this.formDef.campos_p3[idx].archivos = [];
      this.formDef.campos_p3[idx].archivosEnLinea = [];
      this.formDef.campos_p3[idx].archivosEnLineaSuprimidos = [];
    }
    this.formStep3.reset();
    this.formDef.campos_p1.forEach(campo => {
      campo.sololectura = false;
    });
    this.formDef.campos_p2.forEach(campo => {
      campo.sololectura = false;
    });
    this.formDef.campos_p3.forEach(campo => {
      campo.sololectura = false;
    });
    this.manageByRole();
  }

  bloquearEdicion(excluir?: string[]) {
    this.formDef.campos_p1.forEach(campo => {
      if (excluir) {
        campo.sololectura = !excluir.includes(campo.nombre);
      } else {
        campo.sololectura = true;
      }
    });
    this.formDef.campos_p2.forEach(campo => {
      if (excluir) {
        campo.sololectura = !excluir.includes(campo.nombre);
      } else {
        campo.sololectura = true;
      }
    });
    this.formDef.campos_p3.forEach(campo => {
      if (excluir) {
        campo.sololectura = !excluir.includes(campo.nombre);
      } else {
        campo.sololectura = true;
      }
    });
  }
  //#endregion
  // * ----------
  
  // * ----------
  // * Gestión en función del Rol 
  //#region
  manageByRole() {
    this.autenticationService.getRole().then(
      (rol: Array <String>) => {
        const r1 = rol.find(role => (role == ROLES.ASIS_PROYECTO));
        const r2 = rol.find(role => (role == ROLES.ADMIN_SGA));
        if (r1) {
          this.rol = r1;
          let idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'aprobado');
          if (idx != -1) {
            this.formDef.campos_p3[idx].requerido = false;
            this.formDef.campos_p3[idx].validacion = [];
            this.formDef.campos_p3[idx].ocultar = true;
            this.formDef.campos_p3[idx].sololectura = true;
            this.formStep3.get('aprobado').setValidators(this.formDef.campos_p3[idx].validacion);
          }
          idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'observaciones');
          if (idx != -1) {
            this.formDef.campos_p3[idx].requerido = false;
            this.formDef.campos_p3[idx].validacion = [];
            this.formDef.campos_p3[idx].sololectura = true;
            this.formStep3.get('observaciones').setValidators(this.formDef.campos_p3[idx].validacion);
          }
        } else if (r2) {
          this.rol = r2;
          // ? si el rol es admin se habilitan otros campos
          let idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'aprobado');
          if (idx != -1) {
            this.formDef.campos_p3[idx].requerido = true;
            this.formDef.campos_p3[idx].validacion = [Validators.required];
            this.formDef.campos_p3[idx].ocultar = false;
            this.formDef.campos_p3[idx].sololectura = false;
            this.formStep3.get('aprobado').setValidators(this.formDef.campos_p3[idx].validacion);
          }
          idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'observaciones');
          if (idx != -1) {
            this.formDef.campos_p3[idx].requerido = true;
            this.formDef.campos_p3[idx].validacion = [Validators.required];
            this.formDef.campos_p3[idx].sololectura = false;
            this.formStep3.get('observaciones').setValidators(this.formDef.campos_p3[idx].validacion);
          }
        } else {

        }
      });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Carga información paramétrica (selects)
  //#region
  loadNivel(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"nivel": null});
          }
        }, (err) => {
          reject({"nivel": err});
        }
      );
    });
  }

  loadProyectos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp[0]).length > 0) {
            resolve(resp);
          } else {
            reject({"proyecto": null});
          }
        }, (err) => {
          reject({"proyecto": err});
        }
      );
    });
  }

  loadTipos(): Promise<any> {
    const idTipos = 67;
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:${idTipos}&sortby=Nombre&order=asc&limit=0`).subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            reject({"tipo": null});
          }
        }, (err) => {
          reject({"tipo": err});
        }
      );
    });
  }

  loadClases(): Promise<any> {
    const idClases = 51;
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:${idClases}&sortby=Nombre&order=asc&limit=0`).subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            reject({"clase": null});
          }
        }, (err) => {
          reject({"clase": err});
        }
      );
    });
  }

  loadEnfoques(): Promise<any> {
    const idEnfoques = 68;
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:${idEnfoques}&sortby=Nombre&order=asc&limit=0`).subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            reject({"enfoque": null});
          }
        }, (err) => {
          reject({"enfoque": err});
        }
      );
    });
  }

  loadEstadosAprobacion(): Promise<EstadoAprobacion[]> {
    return new Promise<any>((resolve, reject) => {
      this.espaciosAcademicosService.get('estado-aprobacion?query=activo:true&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            reject({"estado_aprobacion": null});
          }
        }, (err) => {
          reject({"estado_aprobacion": err});
        }
      )
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Insertar info parametrica en formulario (en algunos se tiene en cuenta el rol y se pueden omitir) 
  //#region
  async loadSelects() {
    this.loading = true;
    try {
      // ? carga paralela de parametricas
      let promesas = [];
      promesas.push(this.loadNivel().then(niveles => {
        this.niveles = niveles;
        let idx = this.formDef.campos_p1.findIndex(campo => campo.nombre == 'nivel')
        if (idx != -1) {
          this.formDef.campos_p1[idx].opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId == undefined);
        }
      }));
      promesas.push(this.loadProyectos().then(proyectos => {this.proyectos = proyectos}));
      promesas.push(this.loadTipos().then(tipos => {
        this.tipos = tipos;
        const idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'tipo');
        if (idx != -1) {
          this.formDef.campos_p2[idx].opciones = this.tipos;
        }
      }));
      promesas.push(this.loadClases().then(clases => {
        this.clases = clases;
        const idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'clase');
        if (idx != -1) {
          this.formDef.campos_p2[idx].opciones = this.clases;
        }
      }));
      promesas.push(this.loadEnfoques().then(enfoques => {
        this.enfoques = enfoques;
        const idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'enfoque');
        if (idx != -1) {
          this.formDef.campos_p2[idx].opciones = this.enfoques;
        }
      }));
      await Promise.all(promesas);
      // ? carga secuencial de primero estados y luego espacios, para pasarle los estados a los espacios
      this.estados_aprobacion = await this.loadEstadosAprobacion();
      let idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'aprobado');
      if (idx != -1) {
        this.formDef.campos_p3[idx].opciones = this.estados_aprobacion;
      }
      this.espacios_academicos = await this.loadEspaciosAcademicos();
      // ? prepara datos para tabla
      this.espacios_academicos.forEach(espacio => {
        this.ajustarBotonesSegunEstado(espacio);
      });
      this.dataEspaciosAcademicos.load(this.espacios_academicos); // ? carga tabla
      idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'espacios_requeridos')
      if (idx != -1) {
        this.formDef.campos_p2[idx].opciones = this.espacios_academicos;
      }
      this.loading = false;
    } catch (error) {
      console.warn(error);
      this.loading = false;
      const falloEn = Object.keys(error)[0];
      if (falloEn == 'espacios_academicos') {
        this.popUpManager.showPopUpGeneric(this.translate.instant('espacios_academicos.consulta_espacios'),
                                           this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + this.translate.instant('espacios_academicos.espacios_academicos') + '</b>.',
                                           MODALS.WARNING, false);
      } else if (error[falloEn] == null) {
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                                           this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
                                           this.translate.instant('ERROR.persiste_error_comunique_OAS'),
                                           MODALS.ERROR, false);
      } else {
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'),
                                           this.translate.instant('ERROR.fallo_informacion_en') + ': <b>' + falloEn + '</b>.<br><br>' +
                                           this.translate.instant('ERROR.persiste_error_comunique_OAS'),
                                           MODALS.ERROR, false);
      }
    }
      
  }
  //#endregion
  // * ----------

  // * ----------
  // * Funciones relacionadas a la selección de archivos 
  //#region
  /** trigger cuando hay cambio en selección de archivos */
  onChangeSelectFiles(label: string, event: any) {
    const files = <File[]>Object.values(event.target.files);
    if (label == 'soporte') {
      const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == label);
      if (idx != -1) {
        const newFiles = files.map(f => {
          return {file: f, urlTemp: URL.createObjectURL(f), err: false}
        });
        this.formDef.campos_p3[idx].archivos = this.formDef.campos_p3[idx].archivos.concat(newFiles);
        this.passFilesToFormControl(this.formDef.campos_p3[idx].archivos, this.formDef.campos_p3[idx].archivosEnLinea);
        const errs = this.validateFiles(this.formDef.campos_p3[idx].formatos,this.formDef.campos_p3[idx].tamanoMaximo,this.formDef.campos_p3[idx].archivos);
        this.formDef.campos_p3[idx].validacionArchivos = errs;
        this.formStep3.get(label).markAsTouched({onlySelf: true});
      }
    }
  }

  /** Quitar archivo seleccionado local */
  deleteSelectedFile(label: string, fileName: string) {
    if (label == 'soporte') {
      const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == label);
      if (idx != -1) {
        const idf = this.formDef.campos_p3[idx].archivos.findIndex(f => f.file.name == fileName);
        if (idf != -1) {
          this.formDef.campos_p3[idx].archivos.splice(idf, 1);
          this.passFilesToFormControl(this.formDef.campos_p3[idx].archivos, this.formDef.campos_p3[idx].archivosEnLinea);
          const errs = this.validateFiles(this.formDef.campos_p3[idx].formatos,this.formDef.campos_p3[idx].tamanoMaximo,this.formDef.campos_p3[idx].archivos);
          this.formDef.campos_p3[idx].validacionArchivos = errs;
          this.formStep3.get(label).markAsTouched({onlySelf: true});
        }
      }
    }
  }

  deleteSelectedFileLinea(label: string, idFile: number) {
    if (label == 'soporte') {
      const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == label);
      if (idx != -1) {
        const idf = this.formDef.campos_p3[idx].archivosEnLinea.findIndex(f => f.Id == idFile);
        if (idf != -1) {
          this.formDef.campos_p3[idx].archivosEnLinea.splice(idf, 1);
          this.formDef.campos_p3[idx].archivosEnLineaSuprimidos.push(idFile);
          this.passFilesToFormControl(this.formDef.campos_p3[idx].archivos, this.formDef.campos_p3[idx].archivosEnLinea);
          const errs = this.validateFiles(this.formDef.campos_p3[idx].formatos,this.formDef.campos_p3[idx].tamanoMaximo,this.formDef.campos_p3[idx].archivos);
          this.formDef.campos_p3[idx].validacionArchivos = errs;
          this.formStep3.get(label).markAsTouched({onlySelf: true});
        }
      }
    }
  }

  /** Pasa info a un input text porque matInput no se lleva con input file */
  passFilesToFormControl(archivos: any[], archivosLinea: any[]) {
    let nameFiles = '';
    archivos.forEach((f) => {
      nameFiles += f.file.name + ', ';
    });
    archivosLinea.forEach((f) => {
      nameFiles += f.nombre + ', ';
    });
    this.formStep3.patchValue({soporte: nameFiles});
  }

  /** Valida si el archivo cumple con extensión y tamaño */
  validateFiles(formatos: string, tamanoMaximo: number, archivos: any[]) {
    let errTipo = false;
    let errTam = false;
    archivos.forEach(f => {
      if (formatos.indexOf(f.file.type.split('/')[1]) === -1) {
        f.err = true;
        errTipo = true;
      } else if (f.file.size > (tamanoMaximo * 1024000)) {
        f.err = true;
        errTam = true;
      } else {
        f.err = false;
      }
    });
    return {"errTipo": errTipo, "errTam": errTam}
  }

  /** Previsualiza archivo seleccionado local */
  previewFile(url: string) {
    const h = screen.height * 0.65;
    const w = h * 3/4;
    const left = (screen.width * 3/4) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(url, '', 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }
  //#endregion
  // * ----------

  // * ----------
  // * Funciones para carga y descarga de archivos
  //#region
  prepararArchivos(): any[]{
    const idTipoDocument = 71; // carpeta Nuxeo
    const idx = this.getIndexOf(this.formDef.campos_p3, 'soporte');
    if (idx != -1) {
      const archivos = <any[]>this.formDef.campos_p3[idx].archivos;
      return archivos.map(archivo => {
        return {
          IdDocumento: idTipoDocument,
          nombre: (archivo.file.name).split('.')[0],
          descripcion: "Soporte Espacio Academico",
          file: archivo.file
        }
      })
    }
    return [];
  }

  cargarArchivos(archivos): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.gestorDocumentalService.uploadFiles(archivos).subscribe(
        (respuesta: any[]) => {
          const listaIds = respuesta.map(f => {
            return f.res.Id;
          });
          resolve(listaIds);
        }
      );
    });
  }

  checkIfAlreadyDownloaded(idArchivos: any[]): Promise<number[]> {
    let notDonwloaded = []
    return new Promise<number[]>((resolve) => {
      if (idArchivos.length > 0) {
        idArchivos.forEach((id, i) => {
          this.gestorDocumentalService.getByIdLocal(id).subscribe(
            () => {/* Ya está */},
            () => {notDonwloaded.push(id);}
          );
          if ((i+1) == idArchivos.length) {
            resolve(notDonwloaded);
          }
        });
      } else {
        resolve(notDonwloaded);
      }
    });
  }

  descargarArchivos(idArchivos: any[]): Promise<any> {
    this.loading = true;
    return new Promise<any>((resolve, reject) => {
      this.checkIfAlreadyDownloaded(idArchivos).then(
        faltantes => {
          const limitQuery = faltantes.length;
          let idsForQuery = "";
          faltantes.forEach((id, i) => {
            idsForQuery += String(id);
            if (i < limitQuery-1) idsForQuery += '|';
          });
          if (limitQuery > 0) {
            this.gestorDocumentalService.getManyFiles('?query=Id__in:'+idsForQuery+'&limit='+limitQuery).subscribe(
              r => {
                if(!r.downloadProgress) {
                  this.loading = false;
                  resolve(true);
                }
              }, e => {
                this.loading = false;
                reject(false);
              }
            );
          } else {
            this.loading = false;
            resolve(true)
          }
      });
    });
  }

  desactivarSuprimidos(idArchivos: any[], relacion: string) {
    this.loading = true;
    if (idArchivos.length > 0) {
      idArchivos.forEach((id, i) => {
        this.gestorDocumentalService.deleteByIdDoc(id, relacion).subscribe();
        if ((i+1) == idArchivos.length) {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
  //#endregion
  // * ----------

  // * ----------
  // * Carga info general
  //#region
  loadEspaciosAcademicos(): Promise<EspacioAcademico[]> {
    return new Promise<any>((resolve, reject) => {
      this.espaciosAcademicosService.get('espacio-academico?query=activo:true&limit=0').subscribe(
        (resp) => {
          if (Object.keys(resp.Data[0]).length > 0) {
            resolve(resp.Data);
          } else {
            reject({"espacios_academicos": null});
          }
        }, (err) => {
          reject({"espacios_academicos": err});
        }
      );
    });
  }

  async recargarEspaciosAcademicos() {
    this.loading = true;
    this.loadEspaciosAcademicos().then(espacios => {
      this.espacios_academicos = espacios;
      this.espacios_academicos.forEach(espacio => {
        this.ajustarBotonesSegunEstado(espacio);
      });
      this.dataEspaciosAcademicos.load(this.espacios_academicos);
      const idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'espacios_requeridos')
      if (idx != -1) {
        this.formDef.campos_p2[idx].opciones = this.espacios_academicos;
      }
      this.loading = false;
    }).catch(err => {
      this.loading = false;
      this.popUpManager.showPopUpGeneric(this.translate.instant('espacios_academicos.consulta_espacios'),
                                           this.translate.instant('ERROR.sin_informacion_en') + ': <b>' + this.translate.instant('espacios_academicos.espacios_academicos') + '</b>.',
                                           MODALS.WARNING, false);
    })
  }
  //#endregion
  // * ----------

  // * ----------
  // * Flujo para nuevo espacio academico 
  //#region
  nuevoEspacioAcad() {
    this.limpiarFormulario();
    this.id_espacio_academico = undefined;
    const estado = this.estados_aprobacion.find(estado => estado.codigo_abreviacion == STD.IN_EDIT);
    this.formStep3.patchValue({
      aprobado: estado,
      observaciones: estado.nombre
    });
    this.crear_editar = ACTIONS.CREATE; // ? para modal confirmacion guardado si nuevo o edit
    this.soloLectura = false;
    this.vista = VIEWS.FORM;
  }

  async prepareCreate() {
    this.loading = true;
    let newEspacio_Academico = new EspacioAcademico();
    newEspacio_Academico.proyecto_academico_id = (this.formStep1.get('proyectoCurricular').value).Id;
    newEspacio_Academico.nombre = this.formStep2.get('nombre').value;
    newEspacio_Academico.codigo = this.formStep2.get('codigo').value;
    newEspacio_Academico.codigo_abreviacion = this.formStep2.get('codigo_abreviacion').value;
    newEspacio_Academico.plan_estudio_id = this.formStep2.get('plan_estudios').value;
    newEspacio_Academico.tipo_espacio_id = (this.formStep2.get('tipo').value).Id;
    newEspacio_Academico.clasificacion_espacio_id = (this.formStep2.get('clase').value).Id;
    newEspacio_Academico.enfoque_id = (this.formStep2.get('enfoque').value).Id;
    newEspacio_Academico.creditos = Number(this.formStep2.get('creditos').value);
    newEspacio_Academico.distribucion_horas = {
      HTD: Number(this.formStep2.get('htd').value),
      HTC: Number(this.formStep2.get('htc').value),
      HTA: Number(this.formStep2.get('hta').value)
    };
    newEspacio_Academico.grupo = this.formStep2.get('grupos').value;
    newEspacio_Academico.espacios_requeridos = <any[]>(this.formStep2.get('espacios_requeridos').value || []).map(espacio => espacio._id);
    const archivos = this.prepararArchivos();
    newEspacio_Academico.soporte_documental = await this.cargarArchivos(archivos);
    // que no están disponibles para primer instante, y tampoco en rol ASIS_PROYECTO
    const estado = this.estados_aprobacion.find(estado => estado.codigo_abreviacion == STD.IN_EDIT);
    newEspacio_Academico.estado_aprobacion_id = estado._id;
    newEspacio_Academico.observacion = estado.nombre;
    // que no se manejan pero requieren
    newEspacio_Academico.inscritos = 0;
    newEspacio_Academico.periodo_id = 0;
    newEspacio_Academico.docente_id = 0;
    newEspacio_Academico.horario_id = "0";
    this.loading = false;
    this.postEspacio_Academico(newEspacio_Academico);
  }

  postEspacio_Academico(espacio_academico: EspacioAcademico) {
    this.loading = true;
    this.espaciosAcademicosService.post('espacio-academico', espacio_academico).subscribe(
      resp => {
        if (resp.Status == "201") {
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('espacios_academicos.creacion_espacio_ok'));
          this.recargarEspaciosAcademicos();
          this.vista = VIEWS.LIST;
        } else {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.creacion_espacio_fallo'));
        }
      },
      err => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.creacion_espacio_fallo'));
      }
    );
  }
  //#endregion
  // * ----------

  // * ----------
  // * Flujo para editar espacio academico 
  //#region
  editarEspacioAcad(accion: Symbol, espacio_academico: EspacioAcademico) {
    this.limpiarFormulario();
    this.id_espacio_academico = espacio_academico._id;
    const proyecto = this.proyectos.find(proyecto => proyecto.Id == espacio_academico.proyecto_academico_id);
    const subnivel = this.niveles.find(nivel => nivel.Id == proyecto.NivelFormacionId.Id);
    const nivel = this.niveles.find(nivel => nivel.Id == proyecto.NivelFormacionId.NivelFormacionPadreId.Id);
    this.formStep1.patchValue({
      nivel: nivel,
      subnivel: subnivel,
      proyectoCurricular: proyecto
    })
    this.formStep2.patchValue({
      nombre: espacio_academico.nombre,
      codigo: espacio_academico.codigo,
      codigo_abreviacion: espacio_academico.codigo_abreviacion,
      plan_estudios: espacio_academico.plan_estudio_id,
      tipo: this.tipos.find(tipo => tipo.Id == espacio_academico.tipo_espacio_id),
      clase: this.clases.find(clase => clase.Id == espacio_academico.clasificacion_espacio_id),
      enfoque: this.enfoques.find(enfoque => enfoque.Id == espacio_academico.enfoque_id),
      creditos: espacio_academico.creditos,
      htd: espacio_academico.distribucion_horas["HTD"],
      htc: espacio_academico.distribucion_horas["HTC"],
      hta: espacio_academico.distribucion_horas["HTA"],
      grupos: espacio_academico.grupo,
      espacios_requeridos: this.espacios_academicos.filter(espacio => espacio_academico.espacios_requeridos.includes(espacio._id))
    });
    const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'soporte');
    let fillSoporte = '';
    this.descargarArchivos(espacio_academico.soporte_documental).then(() => {
      espacio_academico.soporte_documental.forEach((idSoporte: number) => {
        if (idx != -1) {
          this.gestorDocumentalService.getByIdLocal(idSoporte).subscribe(f => {
            this.formDef.campos_p3[idx].archivosEnLinea.push(f);
            fillSoporte += f.nombre + ', ';
            this.formStep3.patchValue({
              soporte: fillSoporte, // solo para que el campo de formulario no esté vacio y lo valide ok si no se añaden nuevos archivos
            });
          });
        }
      });
    });
    if (this.rol == ROLES.ADMIN_SGA) {
      const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'observaciones');
      if (idx != -1) {
        const texto = this.translate.instant('espacios_academicos.observacion_prev') + ': ' + espacio_academico.observacion;
        this.formDef.campos_p3[idx].placeholder = texto;
      }
      if (accion == ACTIONS.VIEW) {
        this.formStep3.patchValue({
          aprobado: this.estados_aprobacion.find(estado => estado._id == espacio_academico.estado_aprobacion_id),
          observaciones: espacio_academico.observacion
        });  
      }
    } else {
      this.formStep3.patchValue({
        aprobado: this.estados_aprobacion.find(estado => estado._id == espacio_academico.estado_aprobacion_id),
        observaciones: espacio_academico.observacion
      });
    }
    this.crear_editar = ACTIONS.EDIT; // ? para modal confirmacion guardado si nuevo o edit
    // ? bloqueo campos
    if ((accion != ACTIONS.EDIT)) { // ? no es editar total, significa que SoloLectura
      if (accion == ACTIONS.EDIT_PART) { // ? pero pueder ser edicion parcial, solo para admin
        this.bloquearEdicion(['aprobado', 'observaciones']);
        this.soloLectura = false;
      } else {
        this.bloquearEdicion();
        this.soloLectura = true;
      }
    } else { // ? aquí llega si es edit total
      this.soloLectura = false;
    }
    this.vista = VIEWS.FORM;
  }

  async prepareEdit() {
    this.loading = true;
    let editEspacio_Academico = new EspacioAcademico();
    editEspacio_Academico.proyecto_academico_id = (this.formStep1.get('proyectoCurricular').value).Id;
    editEspacio_Academico.nombre = this.formStep2.get('nombre').value;
    editEspacio_Academico.codigo = this.formStep2.get('codigo').value;
    editEspacio_Academico.codigo_abreviacion = this.formStep2.get('codigo_abreviacion').value;
    editEspacio_Academico.plan_estudio_id = this.formStep2.get('plan_estudios').value;
    editEspacio_Academico.tipo_espacio_id = (this.formStep2.get('tipo').value).Id;
    editEspacio_Academico.clasificacion_espacio_id = (this.formStep2.get('clase').value).Id;
    editEspacio_Academico.enfoque_id = (this.formStep2.get('enfoque').value).Id;
    editEspacio_Academico.creditos = Number(this.formStep2.get('creditos').value);
    editEspacio_Academico.distribucion_horas = {
      HTD: Number(this.formStep2.get('htd').value),
      HTC: Number(this.formStep2.get('htc').value),
      HTA: Number(this.formStep2.get('hta').value)
    };
    editEspacio_Academico.grupo = this.formStep2.get('grupos').value;
    editEspacio_Academico.espacios_requeridos = <any[]>(this.formStep2.get('espacios_requeridos').value || []).map(espacio => espacio._id);
    const archivosNuevos = this.prepararArchivos();
    if (archivosNuevos.length > 0) {
      editEspacio_Academico.soporte_documental = await this.cargarArchivos(archivosNuevos);
    } else {
      editEspacio_Academico.soporte_documental = [];
    }
    const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'soporte');
    if (idx != -1) {
      this.formDef.campos_p3[idx].archivosEnLinea.forEach(f => {
        editEspacio_Academico.soporte_documental.push(f.Id);
      });
    }
    if (this.rol == ROLES.ADMIN_SGA) {
      editEspacio_Academico.estado_aprobacion_id = (this.formStep3.get('aprobado').value)._id;
      editEspacio_Academico.observacion = this.formStep3.get('observaciones').value;
    } else {
      // Si no es admin no puede cambiar el estado ni poner observación
      editEspacio_Academico.estado_aprobacion_id = this.estados_aprobacion.find(estado => estado.codigo_abreviacion == STD.IN_EDIT)._id;
      editEspacio_Academico.observacion = this.formStep3.get('observaciones').value;
    }
    // que no se manejan pero requieren
    editEspacio_Academico.inscritos = 0;
    editEspacio_Academico.periodo_id = 0;
    editEspacio_Academico.docente_id = 0;
    editEspacio_Academico.horario_id = "0";
    this.loading = false;
    this.putEspacio_Academico(editEspacio_Academico);
  }

  putEspacio_Academico(espacio_academico: EspacioAcademico) {
    this.loading = true;
    this.espaciosAcademicosService.put('espacio-academico/'+this.id_espacio_academico, espacio_academico).subscribe(
      resp => {
        if (resp.Status == "200") {
          const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'soporte');
          if (idx != -1) {
            this.desactivarSuprimidos(this.formDef.campos_p3[idx].archivosEnLineaSuprimidos, this.id_espacio_academico);
          }
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('espacios_academicos.edicion_espacio_ok'));
          this.recargarEspaciosAcademicos();
          this.vista = VIEWS.LIST;
          this.id_espacio_academico = undefined;
        } else {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.edicion_espacio_fallo'));
        }
      },
      err => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.edicion_espacio_fallo'));
      }
    );
  }
  //#endregion
  // * ----------

  // * ----------
  // * Enviar espacio a revision 
  //#region
  enviaraRevision(espacio_academico: EspacioAcademico) {
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('espacios_academicos.espacios_academicos'),
      this.translate.instant('espacios_academicos.enviar_revision_pregunta'), MODALS.INFO, true).then(
      action => {
        if (action.value) {
          this.loading = true;
          espacio_academico.estado_aprobacion_id = this.estados_aprobacion.find(estado => estado.codigo_abreviacion == STD.IN_REV)._id;
          this.espaciosAcademicosService.put('espacio-academico/'+espacio_academico._id, espacio_academico).subscribe(
            resp => {
              if (resp.Status == "200") {
                this.loading = false;
                this.popUpManager.showSuccessAlert(this.translate.instant('espacios_academicos.enviar_revision_ok'));
                this.recargarEspaciosAcademicos();
                this.vista = VIEWS.LIST;
              } else {
                this.loading = false;
                this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.enviar_revision_fallo'));
              }
            },
            err => {
                this.loading = false;
                this.popUpManager.showErrorAlert(this.translate.instant('espacios_academicos.enviar_revision_fallo'));
            }
          );
        }
      }
    );
  }
  //#endregion
  // * ----------

  // * ----------
  // * Validación formulario y eleccion crear o editar
  //#region
  /** Valida si cumple con: lo requerido, la cantidad de horas, tamaño/tipo archivo */
  formularioCompleto(): boolean {
    const formsValid = this.formStep1.valid && this.formStep2.valid && this.formStep3.valid;
    const totalHoras = ((this.formStep2.get('total').value) == (this.formStep2.get('creditos').value * this.horasCredito));
    let archivosValid = false;
    const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'soporte');
    if (idx != -1) {
      archivosValid = !this.formDef.campos_p3[idx].validacionArchivos.errTipo && !this.formDef.campos_p3[idx].validacionArchivos.errTam;
    }
    return formsValid && totalHoras && archivosValid;
  }

  elegirAccion() {
    if (this.formularioCompleto()) {
      if (this.crear_editar == ACTIONS.CREATE) {
        this.popUpManager.showPopUpGeneric(
          this.translate.instant('espacios_academicos.crear_espacios'),
          this.translate.instant('espacios_academicos.crear_espacios_pregunta'), MODALS.INFO, true).then(
          action => {
            if (action.value) {
              this.prepareCreate();
            }
          }
        );
      } else if (this.crear_editar == ACTIONS.EDIT) {
        this.popUpManager.showPopUpGeneric(
          this.translate.instant('espacios_academicos.editar_espacios'),
          this.translate.instant('espacios_academicos.editar_espacios_pregunta'), MODALS.INFO, true).then(
          action => {
            if (action.value) {
              this.prepareEdit();
            }
          }
        );
      }
    } else {
      this.formStep1.markAllAsTouched();
      this.formStep2.markAllAsTouched();
      this.formStep3.markAllAsTouched();
      this.popUpManager.showPopUpGeneric(this.translate.instant('espacios_academicos.espacios_academicos'),
                                         this.translate.instant('espacios_academicos.formulario_no_completo'), MODALS.INFO, false);
    }
  }
  //#endregion
  // * ----------

}
