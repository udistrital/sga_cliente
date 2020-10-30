import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'detalle-calendario',
  templateUrl: './detalle-calendario.component.html',
  styleUrls: ['./detalle-calendario.component.scss']
})
export class DetalleCalendarioComponent implements OnInit {

  dataSource: any;
  displayedColumns = ['actividad', 'fecha_inicio', 'fecha_fin', 'responsable']
  data: any;

  constructor() { }

  ngOnInit() {
    this.data = [
      {
        actividad: 'Inscripcion de aspirantes',
        fecha_inicio: '23/09/2020',
        fecha_fin: '20/01/2021',
        responsable: 'COMUNIDAD EN GENERAL'
      },
      {
        actividad: 'Entrevistas',
        fecha_inicio: '23/09/2020',
        fecha_fin: '20/01/2021',
        responsable: 'COORDINADORES'
      },
      {
        actividad: 'Publicación de admitidos',
        fecha_inicio: '23/09/2020',
        fecha_fin: '20/01/2021',
        responsable: 'COORDINADORES'
      },
    ]

    this.dataSource = new MatTableDataSource(this.data);

  }

}
