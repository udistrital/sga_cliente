import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { UserService } from '../../../@core/data/users.service';
import { PersonaService } from '../../../@core/data/persona.service';
import { ProduccionAcademicaPost } from '../../../@core/data/models/produccion_academica/produccion_academica';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { FORM_proyecto_academico } from './form-proyecto_academico';
import { OikosService } from '../../../@core/data/oikos.service';
import { CoreService } from '../../../@core/data/core.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {FormBuilder, Validators, FormControl} from '@angular/forms';
import {ProyectoAcademicoPost} from '../../../@core/data/models/proyecto_academico/proyecto_academico_post'



import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalDataSource } from 'ng2-smart-table';
import { UnidadTiempoService } from '../../../@core/data/unidad_tiempo.service';
import { MatDatepickerInputEvent } from '@angular/material';
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


@Component({
  selector: 'ngx-crud-proyecto-academico',
  templateUrl: './crud-proyecto_academico.component.html',
  styleUrls: ['./crud-proyecto_academico.component.scss'],
})
export class CrudProyectoAcademicoComponent implements OnInit {
  config: ToasterConfig;
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
  unidad= [];
  enfasis = [];
  nivel = [];
  metodo = [];
  fecha_creacion: Date;
  fecha_vigencia: Date;
  proyecto_academicoPost: ProyectoAcademicoPost;
  proyecto_academico: ProyectoAcademicoInstitucion;
  tipo_titulacion: TipoTitulacion;
  metodologia: Metodologia;
  nivel_formacion: NivelFormacion;
  registro_califacado_acreditacion: RegistroCalificadoAcreditacion;
  tipo_registro: TipoRegistro;
  enfasis_proyecto: InstitucionEnfasis;
  enfasis_basico: Enfasis;
  titulacion_proyecto_snies: Titulacion;
  titulacion_proyecto_mujer: Titulacion;
  titulacion_proyecto_hombre: Titulacion;


  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  Campo3Control = new FormControl('', [Validators.required]);
  Campo4Control = new FormControl('', [Validators.required]);
  Campo5Control = new FormControl('', [Validators.required]);
  Campo6Control = new FormControl('', [Validators.required]);
  CampoCorreoControl = new FormControl('', [Validators.required, Validators.email]);
  CampoCreditosControl = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  selectFormControl = new FormControl('', Validators.required);
  @Output() eventChange = new EventEmitter();

  constructor(private translate: TranslateService,
    private toasterService: ToasterService,
    private oikosService: OikosService,
    private coreService: CoreService,
    private proyectoacademicoService: ProyectoAcademicoService,
    private unidadtiempoService: UnidadTiempoService,
    private formBuilder: FormBuilder) {
      this.basicform = formBuilder.group({
        codigo_snies: ['', Validators.required],
        nombre_proyecto: ['', Validators.required],
        abreviacion_proyecto: ['', Validators.required],
        correo_proyecto: ['', [Validators.required, Validators.email]],
        numero_proyecto: ['', Validators.required],
        creditos_proyecto: ['', [Validators.required, Validators.maxLength(4)]],
        duracion_proyecto: ['', Validators.required],
     })
     this.resoluform = formBuilder.group({
      resolucion: ['', Validators.required],
      ano_resolucion: ['', [Validators.required, Validators.maxLength(4)]],
      fecha_creacion: ['', Validators.required],
      fecha_vigencia: ['', Validators.required],
     })
     this.actoform = formBuilder.group({
      acto: ['', Validators.required],
      ano_acto: ['', Validators.required],
     })
     this.compleform = formBuilder.group({
       titulacion_snies: ['', Validators.required],
       titulacion_mujer: ['', Validators.required],
       titulacion_hombre: ['', Validators.required],
       competencias: ['', Validators.required],
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
  }

  loadfacultad() {
    console.info('Entro')
    this.oikosService.get('dependencia_tipo_dependencia/?query=TipoDependenciaId:2')
    .subscribe((res: any) => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.facultad = res.map((data: any) => (data.DependenciaId));
      }
    },
    (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }
  loadarea() {
    console.info('Entro')
    this.coreService.get('area_conocimiento')
    .subscribe(res => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.area = <any>res;
      }
    },
    (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }
  loadnucleo() {
    console.info('Entro')
    this.coreService.get('nucleo_basico_conocimiento')
    .subscribe(res => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.nucleo = <any>res;
      }
    },
    (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }
  loadunidadtiempo() {
    this.unidadtiempoService.get('unidad_tiempo')
    .subscribe(res => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.unidad = <any>res;
      }
    },
    (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
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
        console.info(this.enfasis)
      }
    },
    (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
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
        console.info(this.nivel)
      }
    },
    (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
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
        console.info(this.metodo)
      }
    },
    (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }
  submit() {
    console.info(this.fecha_creacion)
    console.info(this.fecha_vigencia)
  }
  registroproyecto() {
    if (this.basicform.valid) {
    this.metodologia = {
      Id: this.opcionSeleccionadoMeto['Id'],
    }
    this.nivel_formacion = {
      Id: this.opcionSeleccionadoNivel['Id'],
    }
    this.proyecto_academico = {
      Id : 0,
      Codigo : '0',
      Nombre : this.basicform.value.nombre_proyecto,
      CodigoSnies: this.basicform.value.codigo_snies,
      Duracion: this.basicform.value.duracion_proyecto,
      NumeroCreditos: this.basicform.value.numero_proyecto,
      CorreoElectronico: this.basicform.value.correo_proyecto,
      CiclosPropedeuticos: this.checkciclos,
      NumeroActoAdministrativo: this.actoform.value.acto,
      EnlaceActoAdministrativo: 'Pruebalinkdocumento.udistrital.edu.co',
      Competencias: this.compleform.value.competencias,
      CodigoAbreviacion: this.basicform.value.abreviacion_proyecto,
      Activo: this.checkofrece,
      UnidadTiempoId: this.opcionSeleccionadoUnidad['Id'],
      AnoActoAdministrativoId: this.actoform.value.ano_acto,
      DependenciaId: this.opcionSeleccionadoFacultad['Id'],
      AreaConocimientoId: this.opcionSeleccionadoArea['Id'],
      NucleoBaseId: this.opcionSeleccionadoNucleo['Id'],
      MetodologiaId: this.metodologia,
      NivelFormacionId: this.nivel_formacion,

    }
    this.registro_califacado_acreditacion = {
      Id: 0,
      AnoActoAdministrativoId: this.resoluform.value.ano_resolucion,
      NumeroActoAdministrativo: this.resoluform.value.resolucion,
      FechaCreacionActoAdministrativo: this.fecha_creacion,
      VigenciaActoAdministrativo: this.fecha_vigencia.toString(),
      VencimientoActoAdministrativo: this.fecha_vigencia,
      EnlaceActo: 'Ejemploenalce.udistrital.edu.co',
      Activo: true,
      ProyectoAcademicoInstitucionId: this.proyecto_academico,
      TipoRegistroId: this.tipo_registro = {
        Id: 1,
      },
    }
    this.enfasis_proyecto = {
      Activo: true,
      ProyectoAcademicoInstitucionId: this.proyecto_academico,
      EnfasisId: this.enfasis_basico = {
        Id: +this.opcionSeleccionadoEnfasis['Id'],
      },
    }
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
        Id: 1,
      },
      ProyectoAcademicoInstitucionId: this.proyecto_academico,
    }
    this.titulacion_proyecto_hombre = {
      Id: 0,
      Nombre: this.compleform.value.titulacion_hombre,
      Activo: true,
      TipoTitulacionId: this.tipo_titulacion = {
        Id: 1,
      },
      ProyectoAcademicoInstitucionId: this.proyecto_academico,
    }
    this.proyecto_academicoPost = {
      ProyectoAcademicoInstitucion: this.proyecto_academico,
      Registro: [this.registro_califacado_acreditacion],
      Enfasis: [this.enfasis_proyecto],
      Titulaciones: [this.titulacion_proyecto_snies, this.titulacion_proyecto_mujer, this.titulacion_proyecto_hombre],
    }
    console.info(this.proyecto_academicoPost)
  } else {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('proyecto.error_datos'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    }; Swal(opt1)
    .then((willDelete) => {
      if (willDelete.value) {

      }
    });
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
