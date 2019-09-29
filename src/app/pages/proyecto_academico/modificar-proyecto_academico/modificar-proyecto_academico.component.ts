import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import * as moment from 'moment';


@Component({
  selector: 'ngx-modificar-proyecto-academico',
  templateUrl: './modificar-proyecto_academico.component.html',
  styleUrls: ['./modificar-proyecto_academico.component.scss'],
  })
export class ModificarProyectoAcademicoComponent implements OnInit {
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
  unidad= [];
  enfasis = [];
  nivel = [];
  metodo = [];
  fecha_creacion: Date;
  fecha_vencimiento: string;
  fecha_vigencia: string;
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
  tipo_dependencia: TipoDependencia;
  dependencia_tipo_dependencia: DependenciaTipoDependencia;
  dependencia: Dependencia;



  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  Campo3Control = new FormControl('', [Validators.required]);
  Campo4Control = new FormControl('', [Validators.required]);
  Campo5Control = new FormControl('', [Validators.required]);
  Campo6Control = new FormControl('', [Validators.required]);
  Campo7Control = new FormControl('', [Validators.required]);
  Campo8Control = new FormControl('', [Validators.required]);
  Campo9Control = new FormControl('', [Validators.required]);
  Campo10Control = new FormControl('', [Validators.required]);
  Campo11Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo12Control = new FormControl('', [Validators.required]);
  Campo13Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo14Control = new FormControl('', [Validators.required]);
  Campo16Control = new FormControl('', [Validators.required]);
  Campo17Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo18Control = new FormControl('', [Validators.required]);
  Campo19Control = new FormControl('', [Validators.required]);
  Campo20Control = new FormControl('', [Validators.required]);
  Campo21Control = new FormControl('', [Validators.required]);
  Campo22Control = new FormControl('', [Validators.required, Validators.maxLength(2)]);
  Campo23Control = new FormControl('', [Validators.required, Validators.maxLength(1)]);
  CampoCorreoControl = new FormControl('', [Validators.required, Validators.email]);
  CampoCreditosControl = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  selectFormControl = new FormControl('', Validators.required);
  @Output() eventChange = new EventEmitter();

  constructor(private translate: TranslateService,
    private toasterService: ToasterService,
    private oikosService: OikosService,
    private coreService: CoreService,
    private proyectoacademicoService: ProyectoAcademicoService,
    private sgamidService: SgaMidService,
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
      mes_vigencia: ['', [Validators.required, Validators.maxLength(2)]],
      ano_vigencia: ['', [Validators.required, Validators.maxLength(1)]],
     })
     this.actoform = formBuilder.group({
      acto: ['', Validators.required],
      ano_acto: ['', [Validators.required, Validators.maxLength(4)]],
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
    this.basicform = this.formBuilder.group({
      codigo_snies: ['', Validators.required],
      facultad: ['', Validators.required],
      nivel_proyecto: ['', Validators.required],
      metodologia_proyecto: ['', Validators.required],
      nombre_proyecto: ['', Validators.required],
      abreviacion_proyecto: ['', Validators.required],
      correo_proyecto: ['', [Validators.required, Validators.email]],
      numero_proyecto: ['', Validators.required],
      creditos_proyecto: ['', [Validators.required, Validators.maxLength(4)]],
      duracion_proyecto: ['', Validators.required],
      tipo_duracion_proyecto: ['', Validators.required],
      ciclos_proyecto: ['', Validators.required],
      ofrece_proyecto: ['', Validators.required],
      enfasis_proyecto: ['', Validators.required],
   })

  }



}
