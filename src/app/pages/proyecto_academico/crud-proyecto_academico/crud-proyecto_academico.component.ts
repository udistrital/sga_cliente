import { TipoProduccionAcademica } from '../../../@core/data/models/produccion_academica/tipo_produccion_academica';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { EstadoAutorProduccion } from '../../../@core/data/models/produccion_academica/estado_autor_produccion';
import { SubTipoProduccionAcademica } from '../../../@core/data/models/produccion_academica/subtipo_produccion_academica';
import { UserService } from '../../../@core/data/users.service';
import { PersonaService } from '../../../@core/data/persona.service';
import { ProduccionAcademicaPost } from '../../../@core/data/models/produccion_academica/produccion_academica';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProduccionAcademicaService } from '../../../@core/data/produccion_academica.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { FORM_proyecto_academico } from './form-proyecto_academico';
import { OikosService } from '../../../@core/data/oikos.service';
import { CoreService } from '../../../@core/data/core.service';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {FormBuilder, Validators, FormControl} from '@angular/forms';


import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';
import { MetadatoSubtipoProduccion } from '../../../@core/data/models/produccion_academica/metadato_subtipo_produccion';
import { Persona } from '../../../@core/data/models/persona';
// import { p } from '@angular/core/src/render3';
import { LocalDataSource } from 'ng2-smart-table';






export interface Facultad {
  name: string;
}


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
  checkenfasis: boolean;
  nucleo = [];


  facultadControl = new FormControl('', [Validators.required]);
  selectFormControl = new FormControl('', Validators.required);
  facultades: Facultad[] = [
    {name: 'Ingenieria'},
    {name: 'Artes'},
    {name: 'Técnologica'},
    {name: 'Bosa'},
  ];



  @Output() eventChange = new EventEmitter();




  constructor(private translate: TranslateService,
    private toasterService: ToasterService,
    private oikosService: OikosService,
    private coreService: CoreService,
    private formBuilder: FormBuilder) {
      this.basicform = formBuilder.group({
        codigo_snies: ['', Validators.required],
        nombre_proyecto: ['', Validators.required],
        nivel_proyecto: ['', Validators.required],
        metodologia_proyecto: ['', Validators.required],
        abreviacion_proyecto: ['', Validators.required],
        correo_proyecto: ['', [Validators.required, Validators.email]],
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
  }
  loadfacultad() {
    console.info('Entro')
    this.oikosService.get('dependencia_tipo_dependencia/?query=TipoDependenciaId:2')
    .subscribe((res: any) => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        this.facultad = res.map((data: any) => (data.DependenciaId));
        console.info(this.facultad)
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
        console.info(this.area)
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
        console.info(this.nucleo)
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
    if (this.basicform.valid) {
      console.info(this.basicform.value)
    } else {
      alert('FILL ALL FIELDS')
      console.info(this.opcionSeleccionadoFacultad['Id'])
    }
  }
  prueba() {
      console.info(this.opcionSeleccionadoFacultad['Id'])
      console.info('imprime');
      console.info(this.checkenfasis)
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
