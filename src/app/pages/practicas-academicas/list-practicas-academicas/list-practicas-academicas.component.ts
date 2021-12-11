import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PracticasAcademicasService } from '../../../@core/data/practicas_academicas.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import * as moment from 'moment';

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
        claseGrid: 'col-lg-2 col-md-2',
        nombre: 'Filter',
        claseBoton: 'btn btn-primary btn-sm',
        icono: 'fa fa-search',
        label_i18n: 'buscar',
      },
    ]
  }
  formFilter: boolean = false;
  processEncript: any;
  loading: boolean;

  constructor(
    private practicasService: PracticasAcademicasService,
    private _Activatedroute: ActivatedRoute,
    private translate: TranslateService,
    private router: Router,
  ) {
    this.loading = true;
    this.crearTabla();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.crearTabla();
    });
  }

  filterPracticas(event) {
    this.InfoPracticasAcademicas = { FechaRadicacion: '', Id: '' };
    this.datosPracticas = this.practicasService.getPracticas(event.data.Id ? event.data.Id : null, null)
  }

  crearTabla() {
    this.tablaPracticas = {
      columns: {
        Id: {
          title: this.translate.instant('solicitudes.numero'),
          width: '20%',
          editable: false,
        },
        FechaRadicacion: {
          title: this.translate.instant('solicitudes.fecha'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return moment(value, 'YYYY-MM-DD').format('DD/MM/YYYY')
          },
          editable: false,
        },
        TipoSolicitud: {
          title: this.translate.instant('solicitudes.tipo'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          editable: false,
        },
        EstadoId: {
          title: this.translate.instant('solicitudes.estado'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
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
    console.log(param);
    const endpoint = 'practicas_academicas?query=EstadoTipoSolicitudId.Id:34&fields=Id,FechaRadicacion,EstadoTipoSolicitudId';
    if (param === 'news') {
      return this.practicasService.getPracticas(endpoint, null, ['Radicada']);
    }
    if (param === 'process') {
      return this.practicasService.getPracticas(endpoint, null, ['Aprobada', 'Rechazada', 'Devuelta']);
    }
    if (param === 'invitation') {
      return this.practicasService.getPracticas(endpoint, null, ['Aprobada']);
    }
    if (param === 'report') {
      return this.practicasService.getPracticas(endpoint, null, ['Aprobada']);
    }
    if (param === 'list') {
      return this.practicasService.getPracticas(endpoint, null, null);
    }

  }

  ngOnInit() {
    this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
      const { process } = params.params;
      this.process = atob(process);
      this.processEncript = process;
      this.getPracticasAcademicas(this.process).subscribe(practicas => {
        this.datosPracticas = practicas;
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: '404',
            text: this.translate.instant('ERROR.404'),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.practicas_academicas'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        })
    });

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  verPractica(event) {
    this.router.navigate([`pages/practicas-academicas/detalle-practica-academica/${event.data['Id']}/${this.processEncript}`])
  }

}
