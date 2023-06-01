import { Component, OnInit } from '@angular/core';
import { MODALS, ROLES, VIEWS } from '../../../@core/data/models/diccionario/diccionario';
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
  espacios_academicos: any[];
  esp_required: any[];

  readonly horasCredito: number = 48;

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
    const data = [
      {
        nombre: 'x',
        codigo: '123',
        estado: 'por definir',
        gestion: {value: undefined, type: 'editar', disabled: false},
        enviar: {value: undefined, type: 'enviar', disabled: false},
      }
    ]
    this.dataEspaciosAcademicos.load(data)
  }

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
              this.vista = VIEWS.FORM;
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
              console.log("enviar:", out);
            })}
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('GLOBAL.table_no_data_found')
    };
  }

  buildFormEspaciosAcademicos() {
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
    }
    if (label == 'espacios_requeridos') {
      this.esp_required = field;
    }
    if (label == 'soporte') {
      
    }
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

  manageByRole() {
    this.autenticationService.getRole().then(
      (rol: Array <String>) => {
        const r1 = rol.find(role => (role == ROLES.ASIS_PROYECTO));
        const r2 = rol.find(role => (role == ROLES.ADMIN_SGA));
        if (r1) {
          
        } else if (r2) {
          let idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == 'aprobado');
          if (idx != -1) {
            this.formDef.campos_p3[idx].requerido = true;
            this.formDef.campos_p3[idx].validacion = [Validators.required];
            this.formDef.campos_p3[idx].ocultar = false;
            this.formDef.campos_p3[idx].opciones = [
              {Id: 1, Nombre: 'En Edición'},
              {Id: 2, Nombre: 'Enviado a revisión'},
              {Id: 3, Nombre: 'Aprobado'},
              {Id: 4, Nombre: 'No aprobado'}
            ];
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

  loadNivel(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion?query=Activo:true&sortby=Id&order=asc&limit=0').subscribe(
        (resp) => {
          resolve(resp);
        }, (err) => {
          reject(err);
        }
      );
    });
  }

  loadProyectos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion?query=Activo:true&sortby=Nombre&order=asc&limit=0').subscribe(
        (resp) => {
          resolve(resp);
        }, (err) => {
          reject(err);
        }
      );
    });
  }

  loadTipos(): Promise<any> {
    const idTipos = 67;
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:${idTipos}&sortby=Nombre&order=asc&limit=0`).subscribe(
        (resp) => {
          resolve(resp.Data);
        }, (err) => {
          reject(err);
        }
      );
    });
  }

  loadClases(): Promise<any> {
    const idClases = 51;
    return new Promise<any>((resolve, reject) => {
      this.parametrosService.get(`parametro?query=Activo:true,TipoParametroId:${idClases}&sortby=Nombre&order=asc&limit=0`).subscribe(
        (resp) => {
          resolve(resp.Data);
        }, (err) => {
          reject(err);
        }
      );
    });
  }

  loadEspaciosAcademicos(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.espaciosAcademicosService.get('espacio-academico').subscribe(
        (resp) => {
          resolve(resp.Data);
        }, (err) => {
          reject(err);
        }
      );
    });
  }

  async loadSelects() {
    this.loading = true;
      this.niveles = await this.loadNivel();
      this.proyectos = await this.loadProyectos();
      let idx = this.formDef.campos_p1.findIndex(campo => campo.nombre == 'nivel')
      if (idx != -1) {
        this.formDef.campos_p1[idx].opciones = this.niveles.filter(nivel => nivel.NivelFormacionPadreId == undefined);
      }
      const tipos = await this.loadTipos();
      idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'tipo')
      if (idx != -1) {
        this.formDef.campos_p2[idx].opciones = tipos;
      }
      const clases = await this.loadClases();
      idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'clase')
      if (idx != -1) {
        this.formDef.campos_p2[idx].opciones = clases;
      }
      this.espacios_academicos = await this.loadEspaciosAcademicos();
      this.espacios_academicos.forEach(espacio => {
        espacio['estado'] = 'En Edición';        
        espacio['gestion'] = {value: undefined, type: 'editar', disabled: false};
        espacio['enviar'] = {value: undefined, type: 'enviar', disabled: false};
      });
      this.dataEspaciosAcademicos.load(this.espacios_academicos);
      idx = this.formDef.campos_p2.findIndex(campo => campo.nombre == 'espacios_requeridos')
      if (idx != -1) {
        this.formDef.campos_p2[idx].opciones = this.espacios_academicos;
      }
    this.loading = false;
  }

  onChangeSelectFiles(label: string, event: any) {
    const files = <File[]>Object.values(event.target.files);
    if (label == 'soporte') {
      const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == label);
      if (idx != -1) {
        const newFiles = files.map(f => {
          return {file: f, urlTemp: URL.createObjectURL(f), err: false}
        });
        this.formDef.campos_p3[idx].archivos = this.formDef.campos_p3[idx].archivos.concat(newFiles);
        this.passFilesToFormControl(this.formDef.campos_p3[idx].archivos);
        const errs = this.validateFiles(this.formDef.campos_p3[idx].formatos,this.formDef.campos_p3[idx].tamanoMaximo,this.formDef.campos_p3[idx].archivos);
        this.formDef.campos_p3[idx].validacionArchivos = errs;
        this.formStep3.get(label).markAsTouched({onlySelf: true});
      }
    }
  }

  deleteSelectedFile(label: string, fileName: string) {
    if (label == 'soporte') {
      const idx = this.formDef.campos_p3.findIndex(campo => campo.nombre == label);
      if (idx != -1) {
        const idf = this.formDef.campos_p3[idx].archivos.findIndex(f => f.file.name == fileName);
        if (idf != -1) {
          this.formDef.campos_p3[idx].archivos.splice(idf, 1);
          this.passFilesToFormControl(this.formDef.campos_p3[idx].archivos);
          const errs = this.validateFiles(this.formDef.campos_p3[idx].formatos,this.formDef.campos_p3[idx].tamanoMaximo,this.formDef.campos_p3[idx].archivos);
          this.formDef.campos_p3[idx].validacionArchivos = errs;
        }
      }
    }
  }

  passFilesToFormControl(archivos: any[]) {
    let nameFiles = '';
    archivos.forEach((f) => {
      nameFiles += f.file.name + ', ';
    });
    this.formStep3.patchValue({soporte: nameFiles});
  }

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

  prepararEnvioData() {
    this.popUpManager.showPopUpGeneric(this.translate.instant('espacios_academicos.crear_espacios'),this.translate.instant('espacios_academicos.crear_espacios_pregunta'), MODALS.QUESTION, true).then(
      action => {
        if (action.value) {
          console.log(this.formStep1.value)
          console.log(this.formStep2.value)
          console.log(this.formStep3.value)
        }
      }
    )
  }

}
