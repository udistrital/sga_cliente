import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-list-practicas-academicas',
  templateUrl: './list-practicas-academicas.component.html',
  styleUrls: ['../practicas-academicas.component.scss']
})
export class ListPracticasAcademicasComponent implements OnInit {

  tablaPracticas: any;
  datosPracticas: any

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
        }
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
            title: '<i class="fa fa-eye"></i>',
          }
        ]
      },
      noDataMessage: this.translate.instant('practicas_academicas.no_data'),
    }
  }

  ngOnInit() {
    this.datosPracticas = [{
      Numero: 123,
      FechaSolicitud: '05/03/2021',
      TipoSolicitud: 'Prácticas académicas',
      EstadoSolicitud: 'Radicada',
    }]
  }

  verPractica(event) {
    this.router.navigate(['../detalle-practica-academica', {Id: event.data['Numero']}], { relativeTo: this.route })
  }

}
