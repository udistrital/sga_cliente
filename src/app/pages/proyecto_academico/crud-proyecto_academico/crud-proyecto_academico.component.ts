import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { OikosService } from '../../../@core/data/oikos.service';
import { CoreService } from '../../../@core/data/core.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ProyectoAcademicoPost } from '../../../@core/data/models/proyecto_academico/proyecto_academico_post'
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalDataSource } from 'ng2-smart-table';
import { ProyectoAcademicoInstitucion } from '../../../@core/data/models/proyecto_academico/proyecto_academico_institucion';
import { TipoTitulacion } from '../../../@core/data/models/proyecto_academico/tipo_titulacion';
import { Metodologia } from '../../../@core/data/models/proyecto_academico/metodologia';
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
import { RegistroCalificadoAcreditacion } from '../../../@core/data/models/proyecto_academico/registro_calificado_acreditacion';
import { TipoRegistro } from '../../../@core/data/models/proyecto_academico/tipo_registro';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { InstitucionEnfasis } from '../../../@core/data/models/proyecto_academico/institucion_enfasis';
import { Enfasis } from '../../../@core/data/models/proyecto_academico/enfasis';
import { Titulacion } from '../../../@core/data/models/proyecto_academico/titulacion';
import { TipoDependencia } from '../../../@core/data/models/oikos/tipo_dependencia';
import { DependenciaTipoDependencia } from '../../../@core/data/models/oikos/dependencia_tipo_dependencia';
import { Dependencia } from '../../../@core/data/models/oikos/dependencia';
import { TrDependenciaPadre } from '../../../@core/data/models/oikos/tr_dependencia_padre';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import * as moment from 'moment';
import { NbDialogService } from '@nebular/theme';
import { ListEnfasisComponent } from '../../enfasis/list-enfasis/list-enfasis.component';
import { ListEnfasisService } from '../../../@core/data/list_enfasis.service';
import { Subscription } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'ngx-crud-proyecto-academico',
  templateUrl: './crud-proyecto_academico.component.html',
  styleUrls: ['./crud-proyecto_academico.component.scss'],
})

export class CrudProyectoAcademicoComponent implements OnInit, OnDestroy {

  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  isLinear = true;
  checkregistro = false;
  config: ToasterConfig;
  settings: any;
  basicform: any;
  resoluform: any;
  actoform: any;
  compleform: any;
  facultad = [];
  area = [];
  opcionSeleccionadoFacultad: any;
  opcionSeleccionadoUnidad: any;
  opcionSeleccionadoArea: any;
  opcionSeleccionadoNucleo: any;
  opcionSeleccionadoEnfasis: any;
  opcionSeleccionadoNivel: any;
  opcionSeleccionadoMeto: any;
  checkenfasis: boolean = false;
  checkciclos: boolean = false;
  checkofrece: boolean = false;
  nucleo = [];
  unidad = [];
  enfasis = [];
  nivel = [];
  metodo = [];
  fecha_creacion: Date;
  fecha_vencimiento: string;
  fecha_vencimiento_mostrar: string;
  fecha_vigencia: string;
  proyecto_academicoPost: ProyectoAcademicoPost;
  proyecto_academico: ProyectoAcademicoInstitucion;
  tipo_titulacion: TipoTitulacion;
  metodologia: Metodologia;
  nivel_formacion: NivelFormacion;
  registro_califacado_acreditacion: RegistroCalificadoAcreditacion;
  tipo_registro: TipoRegistro;
  enfasis_proyecto: InstitucionEnfasis[];
  enfasis_basico: Enfasis;
  titulacion_proyecto_snies: Titulacion;
  titulacion_proyecto_mujer: Titulacion;
  titulacion_proyecto_hombre: Titulacion;
  tipo_dependencia: TipoDependencia;
  dependencia_tipo_dependencia: DependenciaTipoDependencia;
  dependencia: Dependencia;
  fecha_calculada_vencimiento: string
  fileResolucion: any;
  fileActoAdministrativo: any;
  uidResolucion: string;
  uidActoAdministrativo: string;
  idDocumentoAdministrativo: number;
  disable: boolean = true;
  idDocumentoResolucion: number;
  proyecto_padre_id: ProyectoAcademicoInstitucion;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  Campo3Control = new FormControl('', [Validators.required]);
  Campo4Control = new FormControl('', [Validators.required]);
  Campo5Control = new FormControl('', [Validators.required]);
  Campo6Control = new FormControl('', [Validators.required]);
  Campo7Control = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern('^[0-9]*$')]);
  Campo8Control = new FormControl('', [Validators.required]);
  Campo9Control = new FormControl('', [Validators.required]);
  Campo10Control = new FormControl('', [Validators.required]);
  Campo11Control = new FormControl('', [Validators.required, Validators.maxLength(4), Validators.pattern('^[0-9]*$')]);
  Campo12Control = new FormControl('', [Validators.required]);
  Campo13Control = new FormControl('', [Validators.required, Validators.maxLength(4), Validators.pattern('^[0-9]*$')]);
  Campo14Control = new FormControl('', [Validators.required]);
  Campo16Control = new FormControl('', [Validators.required]);
  Campo17Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo18Control = new FormControl('', [Validators.required]);
  Campo19Control = new FormControl('', [Validators.required]);
  Campo20Control = new FormControl('', [Validators.required]);
  Campo21Control = new FormControl('', [Validators.required]);
  Campo22Control = new FormControl('', [Validators.required, Validators.maxLength(2), Validators.pattern('^[0-9]*$'), Validators.max(12)]);
  Campo23Control = new FormControl('', [Validators.required, Validators.maxLength(1), Validators.pattern('^[0-9]*$')]);
  Campo24Control = new FormControl('', [Validators.required]);
  CampoCorreoControl = new FormControl('', [Validators.required, Validators.email]);
  CampoCreditosControl = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  selectFormControl = new FormControl('', Validators.required);
  @Output() eventChange = new EventEmitter();

  subscription: Subscription;
  source_emphasys: LocalDataSource = new LocalDataSource();
  arr_enfasis_proyecto: InstitucionEnfasis[] = [];
  settings_emphasys: any;

  dpDayPickerConfig: any;

  constructor(private translate: TranslateService,
    private toasterService: ToasterService,
    private oikosService: OikosService,
    private routerService: Router,
    private _ngZone: NgZone,
    private coreService: CoreService,
    private proyectoacademicoService: ProyectoAcademicoService,
    private sgamidService: SgaMidService,
    private dialogService: NbDialogService,
    private activatedRoute: ActivatedRoute,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private listEnfasisService: ListEnfasisService,
    private newNuxeoService: NewNuxeoService,
    private formBuilder: FormBuilder) {

    this.dpDayPickerConfig = {
      locale: 'es',
      format: 'YYYY-MM-DD HH:mm',
      showTwentyFourHours: false,
      showSeconds: false,
      returnedValueicon: 'String',
    }
    this.basicform = formBuilder.group({
      codigo_snies: ['', Validators.required],
      codigo_interno: ['', Validators.required],
      nombre_proyecto: ['', Validators.required],
      abreviacion_proyecto: ['', Validators.required],
      correo_proyecto: ['', [Validators.required, Validators.email]],
      numero_proyecto: ['', Validators.required],
      creditos_proyecto: ['', [Validators.required, Validators.maxLength(4)]],
      duracion_proyecto: ['', Validators.required],
      selector: [''],
    })
    this.resoluform = formBuilder.group({
      resolucion: ['', [Validators.required, Validators.maxLength(4), Validators.pattern('^[0-9]*$')]],
      ano_resolucion: ['', [Validators.required, Validators.maxLength(4), Validators.pattern('^[0-9]*$')]],
      fecha_creacion: ['', Validators.required],
      mes_vigencia: ['', [Validators.required, Validators.maxLength(2), Validators.pattern('^[0-9]*$'), Validators.max(12)]],
      ano_vigencia: ['', [Validators.required, Validators.maxLength(1), Validators.pattern('^[0-9]*$')]],
      documento: ['', Validators.required],
      Campo4Control: [{ value: '', disabled: true }, Validators.required],
    })
    this.actoform = formBuilder.group({
      acto: ['', Validators.required],
      ano_acto: ['', [Validators.required, Validators.maxLength(4)]],
      documento: ['', Validators.required],
    })
    this.compleform = formBuilder.group({
      titulacion_snies: ['', Validators.required],
      titulacion_mujer: ['', Validators.required],
      titulacion_hombre: ['', Validators.required],
      competencias: ['', Validators.required],
    });

    this.subscription = this.listEnfasisService.getListEnfasis().subscribe(listEnfasis => {
      if (listEnfasis) {
        this.enfasis = listEnfasis;
      } else {
        // clear messages when empty message received
        // do not do anything on error
      }
    });

    this.settings_emphasys = {
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      actions: {
        edit: false,
        add: false,
        position: 'right',
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          // icon: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '80%',
        },
      },
    };
  }

  onCreateEmphasys(event: any) {
    const emphasys = event.value;
    if (!this.arr_enfasis_proyecto.find((enfasis: any) => emphasys.Id === enfasis.Id) && emphasys.Id) {
      this.arr_enfasis_proyecto.push(emphasys);
      this.source_emphasys.load(this.arr_enfasis_proyecto);
      const matSelect: MatSelect = event.source;
      matSelect.writeValue(null);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('enfasis.error_enfasis_ya_existe'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  onDeleteEmphasys(event: any) {
    const findInArray = (value, array, attr) => {
      for (let i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return i;
        }
      }
      return -1;
    }
    this.arr_enfasis_proyecto.splice(findInArray(event.data.Id, this.arr_enfasis_proyecto, 'Id'), 1);
    this.source_emphasys.load(this.arr_enfasis_proyecto);
  }

  mostrarfecha() {
    this.calculateEndDateMostrar(this.fecha_creacion, this.resoluform.value.ano_vigencia, this.resoluform.value.mes_vigencia, 0)
    this.fecha_calculada_vencimiento = this.fecha_vencimiento_mostrar
  }

  calculateEndDateMostrar(date: Date, years: number, months: number, days: number): Date {
    const convertDate = moment(date).add(years, 'year').add(months, 'month').add(days, 'day').format('YYYY-MM-DD');
    this.fecha_vencimiento_mostrar = convertDate
    return new Date(convertDate);
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  openListEnfasisComponent() {
    this.dialogService.open(ListEnfasisComponent, {
      context: {
        asDialog: true,
      },
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.loadfacultad();
    this.loadarea();
    this.loadnucleo();
    this.loadunidadtiempo();
    this.loadenfasis();
    this.loadnivel();
    this.loadmetodologia();

    // cargar data del proyecto que se clonara
    this.activatedRoute.paramMap.subscribe(params => {
      const clone_project_id = params.get('proyecto_id');
      if (clone_project_id) {
        this.loadCloneData(clone_project_id);
      }
    });
  }

  onSelectionChanged({ value }) {
    this.resoluform.enable();
  }

  loadCloneData(id: any): void {
    this.Campo2Control.setValidators([Validators.nullValidator]);
    this.sgamidService.get('consulta_proyecto_academico/' + id)
      .subscribe((res: any) => {
        if (res.Type !== 'error' && res[0].ProyectoAcademico.Id) {
          const proyecto_a_clonar = res[0];
          this.proyecto_padre_id = proyecto_a_clonar.ProyectoAcademico;
          // enfasis
          this.arr_enfasis_proyecto = proyecto_a_clonar.Enfasis.map((enfasis: any) => enfasis.EnfasisId);
          this.source_emphasys.load(this.arr_enfasis_proyecto);
          // checks
          this.checkciclos = proyecto_a_clonar.ProyectoAcademico.CiclosPropedeuticos;
          this.checkofrece = proyecto_a_clonar.ProyectoAcademico.Oferta;
          // selects
          // unidad de tiempo
          this.opcionSeleccionadoUnidad = this.unidad.find((unidad_temp: any) => unidad_temp.Id === proyecto_a_clonar.ProyectoAcademico.UnidadTiempoId);
          this.opcionSeleccionadoNivel = this.nivel.find((nivel_temp: any) => nivel_temp.Id === proyecto_a_clonar.ProyectoAcademico.NivelFormacionId.Id);
          this.opcionSeleccionadoMeto = this.metodo.find((metodologia_temp: any) => metodologia_temp.Id === proyecto_a_clonar.ProyectoAcademico.MetodologiaId.Id);
          this.opcionSeleccionadoFacultad = this.facultad.find((facultad_temp: any) => facultad_temp.Id === proyecto_a_clonar.IdDependenciaFacultad);
          this.opcionSeleccionadoArea = this.area.find((area_temp: any) => area_temp.Id === proyecto_a_clonar.ProyectoAcademico.AreaConocimientoId);
          this.opcionSeleccionadoNucleo = this.nucleo.find((nucleo_temp: any) => nucleo_temp.Id === proyecto_a_clonar.ProyectoAcademico.NucleoBaseId);
          // info basica
          this.basicform = this.formBuilder.group({
            codigo_snies: ['', Validators.required],
            codigo_interno: ['', Validators.required],
            nombre_proyecto: ['', Validators.required],
            abreviacion_proyecto: [proyecto_a_clonar.ProyectoAcademico.CodigoAbreviacion, Validators.required],
            correo_proyecto: [proyecto_a_clonar.ProyectoAcademico.CorreoElectronico, [Validators.required, Validators.email]],
            numero_proyecto: [proyecto_a_clonar.TelefonoDependencia, Validators.required],
            creditos_proyecto: [proyecto_a_clonar.ProyectoAcademico.NumeroCreditos, [Validators.required, Validators.maxLength(4)]],
            duracion_proyecto: [proyecto_a_clonar.ProyectoAcademico.Duracion, Validators.required],
            selector: [''],
          })
          // acto administrativo
          this.actoform = this.formBuilder.group({
            acto: ['', Validators.required],
            ano_acto: ['', [Validators.required, Validators.maxLength(4)]],
            documento: ['', Validators.required],
          })

          this.compleform = this.formBuilder.group({
            titulacion_snies: [proyecto_a_clonar.Titulaciones.find((titulacion: any) => titulacion.TipoTitulacionId.Id === 1).Nombre, Validators.required],
            titulacion_mujer: [proyecto_a_clonar.Titulaciones.find((titulacion: any) => titulacion.TipoTitulacionId.Id === 3).Nombre, Validators.required],
            titulacion_hombre: [proyecto_a_clonar.Titulaciones.find((titulacion: any) => titulacion.TipoTitulacionId.Id === 2).Nombre, Validators.required],
            competencias: [proyecto_a_clonar.ProyectoAcademico.Competencias, Validators.required],
          });
        } else {
          this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('proyecto.proyecto_no_cargado'));
        }
      }, () => {
        this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('proyecto.proyecto_no_cargado'));
      });
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  onInputFileResolucion(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
        file.url = this.cleanURL(file.urlTemp);
        file.IdDocumento = 9;
        file.file = event.target.files[0];
        this.fileResolucion = file;
      } else {
        this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.formato_documento_pdf'));
      }
    }
  }

  onInputFileActo(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
        file.url = this.cleanURL(file.urlTemp);
        file.IdDocumento = 10;
        file.file = event.target.files[0];
        this.fileActoAdministrativo = file;
      } else {
        this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.formato_documento_pdf'));
      }
    }
  }

  uploadFilesCreacionProyecto(files) {
    return new Promise((resolve, reject) => {
      files.forEach((file) => {
        file.Id = file.nombre,
          file.nombre = 'soporte_' + file.IdDocumento + '_creacion_proyecto_curricular_'
          + this.basicform.value.codigo_snies + '_' + this.basicform.value.nombre_proyecto;
        // file.key = file.Id;
        file.key = 'soporte_' + file.IdDocumento;
      });
      this.newNuxeoService.uploadFiles(files).subscribe(
        (responseNux: any[]) => {
          if (Object.keys(responseNux).length === files.length) {
            files.forEach((file) => {
              if (file.IdDocumento === 9) {
                this.uidResolucion = file.uid;
                let f = responseNux.find((res) => res.res.Nombre == file.nombre);
                this.idDocumentoResolucion = f.res.Id;
              } else if (file.IdDocumento === 10) {
                this.uidActoAdministrativo = file.uid;
                let f = responseNux.find((res) => res.res.Nombre == file.nombre);
                this.idDocumentoAdministrativo = f.res.Id;
              }
            });
            resolve(true);
          }
        }, error => {
          reject(error);
        });
    });
  }

  loadfacultad() {
    this.oikosService.get('dependencia_tipo_dependencia/?query=TipoDependenciaId:2')
      .subscribe((res: any) => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.facultad = res.map((data: any) => (data.DependenciaId));
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

  loadarea() {
    this.coreService.get('area_conocimiento')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.area = <any>res;
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

  loadnucleo() {
    this.coreService.get('nucleo_basico_conocimiento')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.nucleo = <any>res;
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

  loadunidadtiempo() {
    this.coreService.get('unidad_tiempo')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.unidad = <any>res;
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

  loadenfasis() {
    this.proyectoacademicoService.get('enfasis')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.enfasis = <any>res;
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

  loadnivel() {
    this.proyectoacademicoService.get('nivel_formacion')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.nivel = <any>res;
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

  loadmetodologia() {
    this.proyectoacademicoService.get('metodologia')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.metodo = <any>res;
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

  calculateEndDate(date: Date, years: number, months: number, days: number): Date {
    const convertDate = moment(date).add(years, 'year').add(months, 'month').add(days, 'day').format('YYYY-MM-DDTHH:mm:ss');
    this.fecha_vencimiento = convertDate
    return new Date(convertDate);
  }

  openlist(): void {
    this.routerService.navigateByUrl(`pages/proyecto_academico/list-proyecto_academico`);
  }

  registroproyecto() {
    try {
      if (this.basicform.valid & this.resoluform.valid & this.compleform.valid & this.actoform.valid && this.arr_enfasis_proyecto.length > 0
        && this.fileActoAdministrativo) {
        this.metodologia = {
          Id: this.opcionSeleccionadoMeto['Id'],
        }
        this.nivel_formacion = <NivelFormacion>{
          Id: this.opcionSeleccionadoNivel['Id'],
        }
        this.proyecto_academico = {
          Id: 0,
          Nombre: this.basicform.value.nombre_proyecto,
          CodigoSnies: this.basicform.value.codigo_snies,
          Codigo: this.basicform.value.codigo_interno,
          Duracion: Number(this.basicform.value.duracion_proyecto),
          NumeroCreditos: Number(this.basicform.value.creditos_proyecto),
          CorreoElectronico: this.basicform.value.correo_proyecto,
          CiclosPropedeuticos: this.checkciclos,
          NumeroActoAdministrativo: Number(this.actoform.value.acto),
          EnlaceActoAdministrativo: 'Pruebalinkdocumento.udistrital.edu.co',
          Competencias: this.compleform.value.competencias,
          CodigoAbreviacion: this.basicform.value.abreviacion_proyecto,
          Activo: true,
          Oferta: this.checkofrece,
          UnidadTiempoId: this.opcionSeleccionadoUnidad['Id'],
          AnoActoAdministrativoId: this.actoform.value.ano_acto,
          DependenciaId: 0,
          FacultadId: this.opcionSeleccionadoFacultad['Id'],
          AreaConocimientoId: this.opcionSeleccionadoArea['Id'],
          NucleoBaseId: this.opcionSeleccionadoNucleo['Id'],
          MetodologiaId: this.metodologia,
          NivelFormacionId: this.nivel_formacion,
          AnoActoAdministrativo: this.actoform.value.ano_acto,
          ProyectoPadreId: this.proyecto_padre_id,
        }

        this.calculateEndDate(this.fecha_creacion, this.resoluform.value.ano_vigencia, this.resoluform.value.mes_vigencia, 0)
        this.registro_califacado_acreditacion = {
          Id: 0,
          AnoActoAdministrativoId: this.resoluform.value.ano_resolucion,
          NumeroActoAdministrativo: Number(this.resoluform.value.resolucion),
          FechaCreacionActoAdministrativo: moment(this.fecha_creacion).format('YYYY-MM-DDTHH:mm') + ':00',
          VigenciaActoAdministrativo: 'Meses:' + this.resoluform.value.mes_vigencia + 'Años:' + this.resoluform.value.ano_vigencia,
          VencimientoActoAdministrativo: this.fecha_vencimiento + '',
          EnlaceActo: 'Ejemploenalce.udistrital.edu.co',
          Activo: true,
          ProyectoAcademicoInstitucionId: this.proyecto_academico,
          TipoRegistroId: this.tipo_registro = {
            Id: 1,
          },
        }

        this.enfasis_proyecto = [];
        this.arr_enfasis_proyecto.forEach(enfasis => {
          this.enfasis_proyecto.push({
            Activo: true,
            ProyectoAcademicoInstitucionId: this.proyecto_academico,
            EnfasisId: {
              Id: enfasis['Id'],
            },
          });
        });

        this.titulacion_proyecto_snies = {
          Id: 0,
          Nombre: this.compleform.value.titulacion_snies,
          Activo: true,
          TipoTitulacionId: this.tipo_titulacion = {
            Id: 1,
          },
          ProyectoAcademicoInstitucionId: this.proyecto_academico,
        }
        this.titulacion_proyecto_mujer = {
          Id: 0,
          Nombre: this.compleform.value.titulacion_mujer,
          Activo: true,
          TipoTitulacionId: this.tipo_titulacion = {
            Id: 3,
          },
          ProyectoAcademicoInstitucionId: this.proyecto_academico,
        }
        this.titulacion_proyecto_hombre = {
          Id: 0,
          Nombre: this.compleform.value.titulacion_hombre,
          Activo: true,
          TipoTitulacionId: this.tipo_titulacion = {
            Id: 2,
          },
          ProyectoAcademicoInstitucionId: this.proyecto_academico,
        }
        this.tipo_dependencia = {
          Id: 2,
        }
        this.dependencia_tipo_dependencia = {
          Id: 0,
          TipoDependenciaId: this.tipo_dependencia,
        }
        this.dependencia = {
          Id: 0,
          Nombre: this.basicform.value.nombre_proyecto,
          TelefonoDependencia: this.basicform.value.numero_proyecto,
          CorreoElectronico: this.basicform.value.correo_proyecto,
          DependenciaTipoDependencia: [this.dependencia_tipo_dependencia],
        }
        const tr_dependencia_padre_post: TrDependenciaPadre = {
          PadreId: {
            Id: this.opcionSeleccionadoFacultad['Id'],
            Nombre: undefined,
            TelefonoDependencia: undefined,
            CorreoElectronico: undefined,
            DependenciaTipoDependencia: undefined,
          },
          HijaId: this.dependencia,
        }
        this.proyecto_academicoPost = {
          ProyectoAcademicoInstitucion: this.proyecto_academico,
          Registro: [this.registro_califacado_acreditacion],
          Enfasis: this.enfasis_proyecto,
          Titulaciones: [this.titulacion_proyecto_snies, this.titulacion_proyecto_mujer, this.titulacion_proyecto_hombre],
          Oikos: tr_dependencia_padre_post,
          // Oikos: this.dependencia,
        }
        const opt: any = {
          title: this.translate.instant('GLOBAL.registrar'),
          text: this.translate.instant('proyecto.seguro_continuar_registrar_proyecto'),
          icon: 'warning',
          buttons: true,
          dangerMode: true,
          showCancelButton: true,
        };
        Swal.fire(opt)
          .then(async (willCreate) => {
            if (willCreate.value) {
              // Subir archivos
              Swal.fire({
                title: 'Creando proyecto académico ...',
                html: `<b></b>`,
                timerProgressBar: true,
                onOpen: () => {
                  Swal.showLoading();
                },
              });
              let content = Swal.getHtmlContainer()
              if (content) {
                const b: any = content.querySelector('b')
                if (b) {
                  b.textContent = 'Subiendo Documentos ...'
                }
              }
              await this.uploadFilesCreacionProyecto([this.fileResolucion, this.fileActoAdministrativo]);
              content = Swal.getHtmlContainer()
              if (content) {
                const b: any = content.querySelector('b')
                if (b) {
                  b.textContent = 'Almacenando información ...'
                }
              }

              this.registro_califacado_acreditacion.EnlaceActo = this.idDocumentoResolucion + '';
              this.proyecto_academico.EnlaceActoAdministrativo = this.idDocumentoAdministrativo + '';
              this.sgamidService.post('proyecto_academico', this.proyecto_academicoPost)
                .subscribe((res: any) => {
                  if (res.Type === 'error') {
                    Swal.fire({
                      icon: 'error',
                      title: res.Code,
                      text: this.translate.instant('ERROR.' + res.Code),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                    this.showToast('error', 'error', this.translate.instant('proyecto.proyecto_no_creado'));
                    Swal.close();
                  } else {
                    Swal.close();
                    const opt1: any = {
                      title: this.translate.instant('proyecto.creado'),
                      text: this.translate.instant('proyecto.proyecto_creado'),
                      icon: 'success',
                      buttons: true,
                      dangerMode: true,
                      showCancelButton: true,
                    }; Swal.fire(opt1)
                      .then((willDelete) => {
                        if (willDelete.value) {
                          this.checkregistro = true;
                          this.openlist();
                        }
                      });
                  }
                }, (error) => {
                  Swal.close();
                });
            }
          });
      } else {
        const opt1: any = {
          title: this.translate.instant('GLOBAL.atencion'),
          text: this.translate.instant('proyecto.error_datos'),
          icon: 'warning',
          buttons: true,
          dangerMode: true,
          showCancelButton: true,
        }; Swal.fire(opt1)
          .then((willDelete) => {
            if (willDelete.value) {

            }
          });
      }
    } catch (err) {
      const opt2: any = {
        title: this.translate.instant('GLOBAL.error'),
        text: this.translate.instant('ERROR.error_subir_documento'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
      }; Swal.fire(opt2)
    }
  }

  private showToast(icon: string, title: string, body: string) {
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
      type: icon, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }
}
