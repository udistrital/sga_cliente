import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import * as momentTimezone from 'moment-timezone';

@Component({
  selector: 'list-solicitudes-estudiante',
  templateUrl: './list-solicitudes-estudiante.component.html',
  styleUrls: ['../solicitudes.component.scss']
})
export class ListSolicitudesEstudianteComponent implements OnInit {

  datosSolicitudes: any[];
  estructuraTabla: any;
  solicitudes: LocalDataSource;
  showTable: boolean;
  showSolicitudID: boolean;
  showSolicitudNombre: boolean;

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
  ) {
    this.showTable = true;
    this.showSolicitudID = false;
    this.showSolicitudNombre = false;
    this.solicitudes = new LocalDataSource();
    this.loadSolicitud();
    this.construirTabla();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirTabla();
    });
  }

  ngOnInit() {
  }

  onclick(event) {
    if (event.data.Tipo === "Actualizar ID"){
      this.showSolicitudID = true;
      this.showTable = false;
      this.showSolicitudNombre = false;
    } else {
      this.showSolicitudNombre = true;
      this.showSolicitudID = false;
      this.showTable = false;
    }
  }

  loadSolicitud(){
    var IdTercero = localStorage.getItem('persona_id');
    this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/'+IdTercero).subscribe(
      (response: any) => {
        if (response.Response.Code === "200"){
          console.info(response.Response.Body[0].Response)
          const data = <Array<any>>response.Response.Body[0].Response;
          const dataInfo = <Array<any>>[];
          data.forEach(element => {
            element.Fecha = momentTimezone.tz(element.Fecha, 'America/Bogota').format('DD/MM/YYYY');
            dataInfo.push(element)
          });
          this.solicitudes.load(dataInfo);
        } else if (response.Response.Code === "404"){
          this.popUpManager.showToast('info', this.translate.instant('solicitudes.no_data'),this.translate.instant('GLOBAL.info'));
        } else {
          this.popUpManager.showToast('info', this.translate.instant('solicitudes.error'),this.translate.instant('GLOBAL.error'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
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
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'view',
            title: '<i class="fa fa-eye"></i>'
          }
        ],
        position: 'right'
      }
    }
  }

  activateTab(){
    this.showTable = true;
    this.showSolicitudID = false;
    this.showSolicitudNombre = false;
  }

}
