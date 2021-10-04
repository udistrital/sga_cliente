import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Periodo } from '../../../@core/data/models/periodo/periodo';
import { FORM_SOLICITUD_PRACTICAS, FORM_SOPORTES_DOCUMENTALES } from '../form-solicitud-practica';

@Component({
  selector: 'ngx-nueva-solicitud',
  templateUrl: './nueva-solicitud.component.html',
  styleUrls: ['../practicas-academicas.component.scss'],
})
export class NuevaSolicitudComponent implements OnInit {

  InfoPracticasAcademicas: any;
  FormPracticasAcademicas: any;
  periodos: any[];
  proyectos: any[];
  espaciosAcademicos: any;
  tiposVehiculo: any;
  limpiar: boolean = true;
  FormSoporteDocumentales: any;
  constructor(
    private translate: TranslateService,
  ) {
    this.FormSoporteDocumentales = FORM_SOPORTES_DOCUMENTALES;
    console.log(this.FormSoporteDocumentales);
    this.FormPracticasAcademicas = FORM_SOLICITUD_PRACTICAS;
    this.inicializiarDatos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.construirForm();
  }

  inicializiarDatos() {
    this.periodos = [{ Nombre: '2021-1', Id: 1 }];
    this.proyectos = [{ Nombre: 'Ingeniería Industrial', Id: 1 }];
    this.espaciosAcademicos = [{ Nombre: '123 - Calculo Integral', Id: 1 }];
    this.tiposVehiculo = [
      { Nombre: 'Colectivo', Id: 1 },
      { Nombre: 'Buseta', Id: 2 },
      { Nombre: 'Bus', Id: 3 },
      { Nombre: 'Otro', Id: 4 },
    ]
    this.InfoPracticasAcademicas = null;
  }

  construirForm() {
    this.FormPracticasAcademicas.titulo = this.translate.instant('practicas_academicas.datos');
    this.FormPracticasAcademicas.btn = this.translate.instant('solicitudes.enviar')
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
      campo.deshabilitar = false;
    });

    this.FormSoporteDocumentales.titulo = this.translate.instant('practicas_academicas.datos');
    this.FormSoporteDocumentales.btn = this.translate.instant('solicitudes.enviar')

    this.FormSoporteDocumentales.campos = this.FormSoporteDocumentales.campos.map(campo => {
      return {
        ...campo,
        ...{
          label: this.translate.instant('practicas_academicas.' + campo.label_i18n),
          deshabilitar: false,
        }
      }
    });
  }

  enviarSolicitud(event) {
    console.log(event)
  }

}
