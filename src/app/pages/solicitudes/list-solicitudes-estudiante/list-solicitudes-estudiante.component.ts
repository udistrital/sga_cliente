import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'list-solicitudes-estudiante',
  templateUrl: './list-solicitudes-estudiante.component.html',
  styleUrls: ['../solicitudes.component.scss']
})
export class ListSolicitudesEstudianteComponent implements OnInit {

  datosSolicitudes: any[];
  estructuraTabla: any;
  solicitudes: LocalDataSource;

  constructor(
    private translate: TranslateService
  ) {
    this.solicitudes = new LocalDataSource();
    this.construirTabla()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirTabla();
    });
  }

  ngOnInit() {
    this.datosSolicitudes = [
      {
        Numero: 5,
        Fecha: '06-01-2021',
        Tipo: 'Actualizacion de datos',
        Estado: 'Radicada',
      },
    ]
    this.solicitudes.load(this.datosSolicitudes);
  }

  onclick(event) {
    console.log(event.data)
  }

  construirTabla() {
    this.estructuraTabla = {
      columns: {
        Numero: {
          title: this.translate.instant('solicitudes.numero'),
          width: '20%',
          editable: false,
        },
        Fecha: {
          title: this.translate.instant('solicitudes.fecha'),
          width: '20%',
          editable: false,
        },
        Tipo: {
          title: this.translate.instant('solicitudes.tipo'),
          width: '20%',
          editable: false,
        },
        Estado: {
          title: this.translate.instant('solicitudes.estado'),
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',
      filter: false,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'view',
            title: '<i class="fa fa-eye"></i>'
          }
        ]
      }
    }
  }

}
