import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource, ViewCell } from 'ng2-smart-table';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import * as momentTimezone from 'moment-timezone';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import Swal from 'sweetalert2';
import { decrypt } from '../../../@core/utils/util-encrypt';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-solicitudes',
  templateUrl: './view-solicitudes.component.html',
  styleUrls: ['./view-solicitudes.component.scss'],
})
export class ViewSolicitudesComponent implements OnInit {
  datosSolicitudes: any[];
  estructuraTabla: any;
  solicitudes: LocalDataSource;
  solicitudSeleccionada: any;
  showTable: boolean;
  showSolicitudID: boolean;
  showSolicitudNombre: boolean;
  rol: any;
  loading: boolean;
  nuevaSolicitud: boolean;
  listaDatos = [];

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private autenticationService: ImplicitAutenticationService,
  ) {
    this.showTable = true;
    this.showSolicitudID = false;
    this.showSolicitudNombre = false;
    this.solicitudes = new LocalDataSource();
    this.loading = true;

    this.autenticationService.getRole().then((rol) => {
      this.rol = rol;
      this.loadListByRol();
      this.construirTabla();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirTabla();
      });
    })
  }

  loadListByRol(){
    if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
      this.loadList();
    } if (this.rol.includes('ESTUDIANTE')) {
      this.loadSolicitud();
    }
  }


  ngOnInit() { }

  onclick(event) {
    this.solicitudSeleccionada = event.data;
    sessionStorage.setItem('Solicitud', event.data.Numero);
    sessionStorage.setItem('TerceroSolitud', event.data.TerceroId);
    if (event.data.Tipo === 'Actualización de identificación') {
      this.showSolicitudID = true;
      this.showTable = false;
      this.showSolicitudNombre = false;
    } else {
      this.showSolicitudNombre = true;
      this.showSolicitudID = false;
      this.showTable = false;
    }
  }

  async loadList() {
    this.listaDatos = []
    for (let i = 15; i < 21; i++) {
      await this.loadSolicitudes(i);
    }
    await this.loadSolicitudes(32);
    await this.loadSolicitudes(33);

    const listaFinal = [];
    for (let i = 0; i < this.listaDatos.length; i++) {
      for (let j = 0; j < this.listaDatos[i].length; j++) {
        listaFinal.push(this.listaDatos[i][j]);
      }
    }
    this.solicitudes.load(listaFinal);
    this.solicitudes.setSort([{ field: 'Numero', direction: 'asc' }, { field: 'Fecha', direction: 'asc' }]);
    this.loading = false;
  }

  loadSolicitudes(IdEstadoTipoSolicitud: number) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.sgaMidService
        .get(
          'solicitud_evaluacion/consultar_solicitudes/' + IdEstadoTipoSolicitud,
        )
        .subscribe(
          (response: any) => {
            if (response.Response.Code === '200') {
              const data = <Array<any>>response.Response.Body[0].Data;
              const dataInfo = <Array<any>>[];
              data.forEach(element => {
                element.Fecha = momentTimezone
                  .tz(element.Fecha, 'America/Bogota')
                  .format('DD/MM/YYYY');
                dataInfo.push(element);
              });
              if (dataInfo !== undefined) {
                this.listaDatos.push(dataInfo);
              }
              resolve(dataInfo);
            } else if (response.Response.Code === '400') {
              this.loading = false;
              Swal.fire(
                this.translate.instant('GLOBAL.error'),
                this.translate.instant('solicitudes.error'),
                'info',
              )
              resolve([]);
            } else if (response.Response.Code === '404') {
              this.loading = false;
              resolve([]);
            }
          },
          error => {
            this.loading = false;
            this.popUpManager.showErrorToast(
              this.translate.instant('ERROR.general'),
            );
            reject(error);
          },
        );
    });
  }

  loadSolicitud() {
    const id = decrypt(localStorage.getItem('persona_id'));
    const IdTercero = id;
    this.sgaMidService
      .get('solicitud_evaluacion/consultar_solicitud/' + IdTercero)
      .subscribe(
        (response: any) => {
          if (response.Response.Code === '200') {
            const data = <Array<any>>response.Response.Body[0].Response;
            const dataInfo = <Array<any>>[];
            data.forEach(element => {
              element.Fecha = momentTimezone
                .tz(element.Fecha, 'America/Bogota')
                .format('DD/MM/YYYY');
              dataInfo.push(element);
            });
            this.solicitudes.load(dataInfo);
            this.solicitudes.setSort([{ field: 'Numero', direction: 'asc' }, { field: 'Fecha', direction: 'asc' }]);
            this.loading = false;
          } else if (response.Response.Code === '404') {
            this.loading = false;
            Swal.fire(
              this.translate.instant('GLOBAL.info'),
              this.translate.instant('solicitudes.no_data'),
              'warning',
            )
          } else {
            this.loading = false;
            Swal.fire(
              this.translate.instant('GLOBAL.error'),
              this.translate.instant('solicitudes.error'),
              'error',
            )
          }
        },
        error => {
          this.loading = false;
          this.popUpManager.showErrorToast(
            this.translate.instant('ERROR.general'),
          );
        },
      );
  }

  construirTabla() {
    this.estructuraTabla = {
      columns: {
        Numero: {
          title: this.translate.instant('solicitudes.numero'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Fecha: {
          title: this.translate.instant('solicitudes.fecha'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Tipo: {
          title: this.translate.instant('solicitudes.tipo'),
          width: '20%',
          editable: false,
          filter: false,
        },
        Estado: {
          title: this.translate.instant('solicitudes.estado'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Observacion: {
          title: this.translate.instant('solicitudes.observacion'),
          width: '30%',
          editable: false,
          filter: false,
        },
      },
      mode: 'external',
      filter: false,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.detalle'),
        custom: [
          {
            name: 'view',
            title:
              '<i class="nb-search" title="' +
              this.translate.instant('solicitudes.tooltip_ver_registro') +
              '"></i>',
          },
        ],
      },
    };
  }

  consultarSolicitudes() {
    this.showTable = false;
    this.solicitudes.empty().then(async e => {
      this.listaDatos = []
      this.rol = this.rol?this.rol: await this.autenticationService.getRole();
      this.loadListByRol();
    },
    )
  }

  activateTab() {
    this.nuevaSolicitud = undefined;
    this.solicitudSeleccionada = undefined
    this.showTable = true;
    this.showSolicitudID = false;
    this.showSolicitudNombre = false;
    this.nuevaSolicitud = false;
    this.loading = true;
    this.loadListByRol();

  }

  nuevoNombre() {
    const id = decrypt(localStorage.getItem('persona_id'));
    sessionStorage.setItem('TerceroSolitud', id);
    this.showSolicitudNombre = true;
    this.showSolicitudID = false;
    this.showTable = false;
    this.nuevaSolicitud = true;
  }

  nuevoID() {
    const id = decrypt(localStorage.getItem('persona_id'));
    sessionStorage.setItem('TerceroSolitud', id);
    this.showSolicitudID = true;
    this.showTable = false;
    this.showSolicitudNombre = false;
    this.nuevaSolicitud = true;
  }
}
