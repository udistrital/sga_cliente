import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource, ViewCell } from 'ng2-smart-table';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import * as momentTimezone from 'moment-timezone';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'list-solicitudes-estudiante',
  templateUrl: './list-solicitudes-estudiante.component.html',
  styleUrls: ['../solicitudes.component.scss'],
})
export class ListSolicitudesEstudianteComponent implements OnInit {
  datosSolicitudes: any[];
  estructuraTabla: any;
  solicitudes: LocalDataSource;
  showTable: boolean;
  showSolicitudID: boolean;
  showSolicitudNombre: boolean;
  rol: any;
  loading: boolean;
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

    this.autenticationService.getRole().then((rol)=> {
      this.rol = rol;
      if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
        this.loadList();
      } if (this.rol.includes('ESTUDIANTE')) {
        this.loadSolicitud();
      }
      this.construirTabla();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirTabla();
      });
    });
  }

  ngOnInit() {}

  onclick(event) {
    console.log(event.data);
    sessionStorage.setItem('TerceroSolitud', event.data.TerceroId);
    sessionStorage.setItem('Solicitud', event.data.Numero);
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
    for (let i = 15; i < 21; i++) {
      await this.loadSolicitudes(i);
      if (i === 20) {
        await this.loadSolicitudes(32);
        await this.loadSolicitudes(33);
      }
    }
    const listaFinal = [];
    for (let i = 0; i < this.listaDatos.length; i++) {
      listaFinal[i] = this.listaDatos[i][0];
    }
    this.solicitudes.load(listaFinal);
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
              this.loading = false;
              resolve(dataInfo);
            } else if (response.Response.Code === '400') {
              this.loading = false;
              this.popUpManager.showToast(
                'info',
                this.translate.instant('solicitudes.error'),
                this.translate.instant('GLOBAL.error'),
              );
              resolve([]);
            } else if (response.Response.Code === '404') {
              this.loading = false;
              resolve([]);
              // this.popUpManager.showToast('info', this.translate.instant('solicitudes.no_data'),this.translate.instant('GLOBAL.info'));
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
    const IdTercero = localStorage.getItem('persona_id');
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
            this.loading = false;
          } else if (response.Response.Code === '404') {
            this.loading = false;
            this.popUpManager.showToast(
              'info',
              this.translate.instant('solicitudes.no_data'),
              this.translate.instant('GLOBAL.info'),
            );
          } else {
            this.loading = false;
            this.popUpManager.showToast(
              'info',
              this.translate.instant('solicitudes.error'),
              this.translate.instant('GLOBAL.error'),
            );
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
        columnTitle: this.translate.instant('GLOBAL.acciones'),
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

  activateTab() {
    this.showTable = true;
    this.showSolicitudID = false;
    this.showSolicitudNombre = false;
  }
}
