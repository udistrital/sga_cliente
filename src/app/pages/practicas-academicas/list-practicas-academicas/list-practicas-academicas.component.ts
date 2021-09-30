import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-list-practicas-academicas',
  templateUrl: './list-practicas-academicas.component.html',
  styleUrls: ['../practicas-academicas.component.scss'],
})
export class ListPracticasAcademicasComponent implements OnInit {

  tablaPracticas: any;
  datosPracticas: any
  process: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.crearTabla();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.crearTabla();
    });
  }

  crearTabla() {
    this.tablaPracticas = {
      columns: {
        Numero: {
          title: this.translate.instant('solicitudes.numero'),
          width: '20%',
          editable: false,
        },
        FechaSolicitud: {
          title: this.translate.instant('solicitudes.fecha'),
          width: '20%',
          editable: false,
        },
        TipoSolicitud: {
          title: this.translate.instant('solicitudes.tipo'),
          width: '20%',
          editable: false,
        },
        EstadoSolicitud: {
          title: this.translate.instant('solicitudes.estado'),
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',
      hideSubHeader: true,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'view',
            title:
              '<i class="nb-search" title="' +
              this.translate.instant(
                'practicas_academicas.tooltip_ver_registro',
              ) +
              '"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant('practicas_academicas.no_data'),
    };
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.process = params['process'];
      this.datosPracticas = [{
        Numero: 123,
        FechaSolicitud: '05/03/2021',
        TipoSolicitud: 'Prácticas académicas 1',
        EstadoSolicitud: 'Radicada',
      },{
        Numero: 456,
        FechaSolicitud: '05/03/2021',
        TipoSolicitud: 'Prácticas académicas 2',
        EstadoSolicitud: 'Aprobada',
      },{
        Numero: 789,
        FechaSolicitud: '05/03/2021',
        TipoSolicitud: 'Prácticas académicas 3',
        EstadoSolicitud: 'Rechazada',
      },{
        Numero: 101,
        FechaSolicitud: '05/03/2021',
        TipoSolicitud: 'Prácticas académicas 4',
        EstadoSolicitud: 'Devuelta',
      }]
    });

  }

  verPractica(event) {
    this.router.navigate(['../detalle-practica-academica', {Id: event.data['Numero']}], { relativeTo: this.route })
  }

}
