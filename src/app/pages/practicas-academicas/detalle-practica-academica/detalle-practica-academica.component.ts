import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { FORM_SOLICITUD_PRACTICAS } from '../form-solicitud-practica';

@Component({
  selector: 'ngx-detalle-practica-academica',
  templateUrl: './detalle-practica-academica.component.html',
  styleUrls: ['../practicas-academicas.component.scss'],
})
export class DetallePracticaAcademicaComponent implements OnInit {

  formDocente: FormGroup;
  InfoPracticasAcademicas: any;
  FormPracticasAcademicas: any;
  periodos: any[];
  proyectos: any[];
  espaciosAcademicos: any;
  tiposVehiculo: any;

  constructor(
    private builder: FormBuilder,
    private translate: TranslateService
  ) {
    this.formDocente = this.builder.group({
      NombreDocente: [{ value: '', disabled: true }],
      NumeroDocumento: [{ value: '', disabled: true }],
      EstadoDocente: [{ value: '', disabled: true }],
    });
    this.FormPracticasAcademicas = FORM_SOLICITUD_PRACTICAS;
    this.inicializiarDatos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.formDocente.setValue({
      NombreDocente: 'Docente de prueba',
      NumeroDocumento: '123456789',
      EstadoDocente: 'Autor principal',
    });
    this.construirForm();
  }

  inicializiarDatos() {
    const files = [
      { id: 1, path: "assets/pdf7politicasUD.pdf", name: "name file1" },
      { id: 2, path: "assets/pdf7politicasUD.pdf", name: "name file1" },
      { id: 3, path: "assets/pdf7politicasUD.pdf", name: "name file1" },
      { id: 4, path: "assets/pdf7politicasUD.pdf", name: "name file1" },
      { id: 5, path: "assets/pdf7politicasUD.pdf", name: "name file1" },
      { id: 6, path: "assets/pdf7politicasUD.pdf", name: "name file1" },
    ]
    this.periodos = [{ Nombre: '2021-1', Id: 1 }];
    this.proyectos = [{ Nombre: 'Ingeniería Industrial', Id: 1 }];
    this.espaciosAcademicos = [{ Nombre: '123 - Calculo Integral', Id: 1 }];
    this.tiposVehiculo = [
      { Nombre: 'Colectivo', Id: 1 },
      { Nombre: 'Buseta', Id: 2 },
      { Nombre: 'Bus', Id: 3 },
      { Nombre: 'Otro', Id: 4 },
    ]
    this.InfoPracticasAcademicas = {
      Periodo: { Id: 1 },
      Proyecto: { Id: 1 },
      EspacioAcademico: { Id: 1 },
      Semestre: 2,
      NumeroEstudiantes: 40,
      NumeroGrupos: 2,
      FechaHoraSalida: '',
      FechaHoraRegreso: '',
      Duracion: 2,
      NumeroVehiculos: 1,
      TipoVehiculo: { Id: 1 }
    }
  }

  construirForm() {
    this.FormPracticasAcademicas.titulo = this.translate.instant('practicas_academicas.datos');
    this.FormPracticasAcademicas.btn = ''
    this.FormPracticasAcademicas.campos.forEach(campo => {
      if (campo.etiqueta === 'select') {
        switch (campo.nombre) {
          case 'Periodo':
            campo.opciones = this.periodos;
            break;
          case 'Proyecto':
            campo.opciones = this.proyectos;
            break;
          case 'EspacioAcademico':
            campo.opciones = this.espaciosAcademicos;
            break;
          case 'TipoVehiculo':
            campo.opciones = this.tiposVehiculo;
            break;
        }
      }
      campo.label = this.translate.instant('practicas_academicas.' + campo.label_i18n);
      campo.deshabilitar = true;
    });
  }

}
