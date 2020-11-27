import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'list-derechos-pecuniarios',
  templateUrl: './list-derechos-pecuniarios.component.html',
  styleUrls: ['../derechos-pecuniarios.component.scss']
})
export class ListDerechosPecuniariosComponent implements OnInit {

  datosCargados: any[] = [];

  constructor() { }

  ngOnInit() {
    this.datosCargados = [
      {
        Codigo: 8672,
        Nombre: 'Inscripción Pregrado',
        Factor: 3,
      },
      {
        Codigo: 12,
        Nombre: 'Inscripción Postgrado',
        Factor: 4,
      },
      {
        Codigo: 40,
        Nombre: 'Certificado de notas',
        Factor: 0.5,
      },
      {
        Codigo: 8672,
        Nombre: 'Inscripción Pregrado',
        Factor: 3,
      },
      {
        Codigo: 12,
        Nombre: 'Inscripción Postgrado',
        Factor: 4,
      },
      {
        Codigo: 40,
        Nombre: 'Certificado de notas',
        Factor: 0.5,
      },
      {
        Codigo: 8672,
        Nombre: 'Inscripción Pregrado',
        Factor: 3,
      },
      {
        Codigo: 12,
        Nombre: 'Inscripción Postgrado',
        Factor: 4,
      },
      {
        Codigo: 40,
        Nombre: 'Certificado de notas',
        Factor: 0.5,
      },
      {
        Codigo: 8672,
        Nombre: 'Inscripción Pregrado',
        Factor: 3,
      },
      {
        Codigo: 12,
        Nombre: 'Inscripción Postgrado',
        Factor: 4,
      },
      {
        Codigo: 40,
        Nombre: 'Certificado de notas',
        Factor: 0.5,
      },
    ]
  }

}
