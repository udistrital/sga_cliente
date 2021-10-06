import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PracticasAcademicasService } from '../../../@core/data/practicas_academicas.service';

@Component({
  selector: 'ngx-list-practicas-academicas',
  templateUrl: './list-practicas-academicas.component.html',
  styleUrls: ['../practicas-academicas.component.scss'],
})
export class ListPracticasAcademicasComponent implements OnInit {

  tablaPracticas: any;
  datosPracticas: any
  process: string;
  sub: any;
  InfoPracticasAcademicas: any = {};
  filterListado = {
    tipo_formulario: 'mini',
    alertas: true,
    hidefield: true,
    btn: false,
    btnLimpiar: false,
    modelo: 'InfoPracticasAcademicas',
    campos: [
      {
        etiqueta: 'input',
        tipo: 'number',
        nombre: 'Numero',
        claseGrid: 'col-12 col-sm-5',
        label: this.translate.instant('GLOBAL.numero'),
        requerido: false,
        minimo: 0,
        deshabilitar: false,
      },
      {
        etiqueta: 'input',
        tipo: 'datetime-local',
        nombre: 'FechaSolicitud',
        claseGrid: 'col-12 col-sm-5',
        label: this.translate.instant('GLOBAL.fecha'),
        requerido: false,
        deshabilitar: false,
      },
      {
        etiqueta: 'button',
        claseGrid: 'col-lg-2 col-md-24',
        nombre: 'Filter',
        claseBoton: 'btn btn-primary btn-sm',
        icono: 'fa fa-search',
        label_i18n: 'buscar',
      },
    ]
  }
  formFilter: boolean = false;
  processEncript: any;



  constructor(
    private practicasService: PracticasAcademicasService,
    private _Activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.crearTabla();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.crearTabla();
    });
  }

  filterPracticas(event) {
    console.log(event);
    this.InfoPracticasAcademicas = { FechaSolicitud: '', Numero: '' };
    this.datosPracticas = this.practicasService.getPracticas(event.data.Numero ? event.data.Numero : null, null)
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

  getPracticasAcademicas(param) {
    if (param === 'news') {
      return this.practicasService.getPracticas(null, ['Radicada']);
    }
    if (param === 'process') {
      return this.practicasService.getPracticas(null, ['Aprobada', 'Rechazada', 'Devuelta']);
    }
    if (param === 'invitation') {
      return this.practicasService.getPracticas(null, ['Aprobada']);
    }
    if (param === 'list') {
      return this.practicasService.getPracticas(null, null);
    }

  }

  ngOnInit() {
    this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
      const { process } = params.params;
      this.process = atob(process);
      this.processEncript = process;
      this.datosPracticas = this.getPracticasAcademicas(this.process)
    });

  }

  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  verPractica(event) {
    console.log(`pages/practicas-academicas/detalle-practica-academica/${event.data['Numero']}/${this.processEncript}`)
    this.router.navigate([`pages/practicas-academicas/detalle-practica-academica/${event.data['Numero']}/${this.processEncript}`])
  }

}
