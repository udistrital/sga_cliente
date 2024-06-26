import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PracticasAcademicasService } from '../../../@core/data/practicas_academicas.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { UserService } from '../../../@core/data/users.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';

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
        etiqueta: 'mat-date',
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
    private autenticationService: ImplicitAutenticationService,
    private userService: UserService,
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
    this.InfoPracticasAcademicas = { FechaRadicacion: event.data.FechaSolicitud ? moment(event.data.FechaSolicitud, 'YYYY-MM-DD').format('DD/MM/YYYY') : null, Id: event.data.Numero ? event.data.Numero : null };
    if (this.InfoPracticasAcademicas.Id === null && this.InfoPracticasAcademicas.FechaRadicacion === null) {
      this.InfoPracticasAcademicas = null;
    }
    const endpoint = 'practicas_academicas?query=EstadoTipoSolicitudId.TipoSolicitud.Id:23&fields=Id,FechaRadicacion,EstadoTipoSolicitudId';
    this.practicasService.getPracticas(endpoint, this.InfoPracticasAcademicas, null).subscribe(practicas => {
      this.datosPracticas = practicas;
    });
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

  getPracticasAcademicas(param, endpoint) {
    if (param === 'news') {
      return this.practicasService.getPracticas(endpoint, null, ['Radicada']);
    }
    if (param === 'process') {
      return this.practicasService.getPracticas(endpoint, null, ['Radicada', 'Rectificar', 'En consejo curricular', 'Acta aprobada', 'Rechazada', 'Requiere modificación']);
    }
    if (param === 'invitation') {
      return this.practicasService.getPracticas(endpoint, null, ['Acta aprobada']);
    }
    if (param === 'report') {
      return this.practicasService.getPracticas(endpoint, null, ['Acta aprobada']);
    }
    if (param === 'list') {
      return this.practicasService.getPracticas(endpoint, null, null);
    }

  }

  ngOnInit() {
    this.loading = true;
    this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
      const { process } = params.params;
      this.process = atob(process);
      this.processEncript = process;

      this.autenticationService.getRole().then((rol: Array<String>) => {
        let endpoint;
        if (rol.includes('COORDINADOR') || rol.includes('COORDINADOR_PREGADO') || rol.includes('COORDINADOR_POSGRADO')) {
          endpoint = 'practicas_academicas?query=SolicitudId.EstadoTipoSolicitudId.TipoSolicitud.Id:23';
        } else {
          endpoint = 'practicas_academicas?query=SolicitudId.EstadoTipoSolicitudId.TipoSolicitud.Id:23,TerceroId:' + this.userService.getPersonaId();
        }

        this.getPracticasAcademicas(this.process, endpoint).subscribe(practicas => {
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
      })
    });

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  verPractica(event) {
    if (event.data.EstadoId.Nombre == 'Requiere modificación' && this.process == 'process') {
      this.router.navigate([`pages/practicas-academicas/nueva-solicitud/${event.data['Id']}/${this.processEncript}`])
    } else {
      this.router.navigate([`pages/practicas-academicas/detalle-practica-academica/${event.data['Id']}/${this.processEncript}`])
    }
  }

}
