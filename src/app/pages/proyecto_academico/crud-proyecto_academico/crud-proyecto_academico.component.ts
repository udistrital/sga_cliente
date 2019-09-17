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
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {FormBuilder, Validators, FormControl} from '@angular/forms'

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
  basicform: any;


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
    private produccionAcademicaService: ProduccionAcademicaService,
    private user: UserService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private personaService: PersonaService,
    private toasterService: ToasterService,
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
     });
    }



  useLanguage(language: string) {
    this.translate.use(language);
  }
  ngOnInit() {
  }
  submit() {
    if (this.basicform.valid) {
      console.log(this.basicform.value)
    } else {
      alert('FILL ALL FIELDS')
    }
  }
}
