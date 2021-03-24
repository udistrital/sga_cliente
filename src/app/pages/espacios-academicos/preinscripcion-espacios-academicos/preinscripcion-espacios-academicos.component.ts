import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CheckboxAssistanceComponent } from '../../../@theme/components/checkbox-assistance/checkbox-assistance.component';

@Component({
  selector: 'ngx-preinscripcion-espacios-academicos',
  templateUrl: './preinscripcion-espacios-academicos.component.html',
  styleUrls: ['../espacios-academicos.component.scss'],
})
export class PreinscripcionEspaciosAcademicosComponent implements OnInit {

  /*
   * Estos datos se deben cargar de una API que contenga los datos del plan de estudios
  */
  espacios_academicos = [
    {
      semestre: 1,
      asignaturas: [
        {
          Codigo: "12340",
          Nombre: "Introducción a la bioingenieria",
          Creditos: 4,
          Clasificacion: 'OB'
        },
        {
          Codigo: "12341",
          Nombre: "Procesamiento de señales biologicas",
          Creditos: 4,
          Clasificacion: 'OB'
        },
        {
          Codigo: "12342",
          Nombre: "Biomecánica, simulación y modelamiento",
          Creditos: 4,
          Clasificacion: 'OB'
        },
        {
          Codigo: "12343",
          Nombre: "Ingeniería Clinica I",
          Creditos: 2,
          Clasificacion: 'OB'
        },
      ]
    },
    {
      semestre: 2,
      asignaturas: [
        {
          Codigo: "12344",
          Nombre: "Bioinstrumentación",
          Creditos: 4,
          Clasificacion: 'OB'
        },
        {
          Codigo: "12345",
          Nombre: "Legislación biomédica",
          Creditos: 2,
          Clasificacion: 'OB'
        },
        {
          Codigo: "12346",
          Nombre: "Ingeniería clinica II",
          Creditos: 4,
          Clasificacion: 'OB'
        },
        {
          Codigo: "12347",
          Nombre: "Electiva profesional",
          Creditos: 4,
          Clasificacion: 'EI'
        },
      ]
    }
  ]

  settings = {
    columns: {
      Codigo: {
        title: this.translate.instant('solicitudes.codigo'),
        editable: false,
        width: '20%',
      },
      Nombre: {
        title: this.translate.instant('GLOBAL.nombre'),
        editable: false,
        width: '20%',
      },
      Creditos: {
        title: this.translate.instant('GLOBAL.creditos'),
        editable: false,
        width: '20%',
      },
      Clasificacion: {
        title: this.translate.instant('GLOBAL.clasificacion'),
        editable: false,
        width: '20%',
      },
      Adicionar: {
        title: this.translate.instant('espacios_academicos.adicionar'),
        width: '20%',
        type: 'custom',
        renderComponent: CheckboxAssistanceComponent,
        onComponentInitFunction: (instance) => {
          instance.row.subscribe(data => {
            this.preinscritos.push(data);
          });
        }   
      },
    },
    actions: false,
    hideSubHeader: true,
    mode: 'inline',
  }

  preinscritos: any[];

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.preinscritos = [];
  }

  preinscribir() {
    // Guardar datos de preinscripciones en la API correspondiente
    this.router.navigate(['../', {data: this.preinscritos } ], {relativeTo: this.route});
  }

}
