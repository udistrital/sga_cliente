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
  rol: any;
  loading: boolean;
  listaDatos = [];

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
  ) {
    this.showTable = true;
    this.showSolicitudID = false;
    this.showSolicitudNombre = false;
    this.solicitudes = new LocalDataSource();
    this.loading = true;
    //ROL 9759 || 9813: Estudiante
    //ROL 94: Admin
    this.rol = parseInt(localStorage.getItem('persona_id'));
    if (this.rol === 9759 || this.rol === 9813){
      this.loadSolicitud();
    } else if (this.rol === 94){
      this.loadList(); 
    } 
    this.construirTabla();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirTabla();
    });
  }

  ngOnInit() {
  }

  onclick(event) {
    if (event.data.Tipo === "Actualización de identificación"){
      this.showSolicitudID = true;
      this.showTable = false;
      this.showSolicitudNombre = false;
    } else {
      this.showSolicitudNombre = true;
      this.showSolicitudID = false;
      this.showTable = false;
    }
  }

  async loadList(){
    for (var i = 15; i < 21; i++){
      await this.loadSolicitudes(i);
    }
    var listaFinal = [];
    for (var i = 0; i < this.listaDatos.length; i++){
      listaFinal[i] = this.listaDatos[i][0];
    }
    this.solicitudes.load(listaFinal);
  }

  loadSolicitudes(IdEstadoTipoSolicitud: number){
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.sgaMidService.get('solicitud_evaluacion/consultar_solicitudes/'+IdEstadoTipoSolicitud).subscribe(
        (response: any) => {
          if (response.Response.Code === "200"){
            const data = <Array<any>>response.Response.Body[0].Data;
            const dataInfo = <Array<any>>[];
            data.forEach(element => {
              element.Fecha = momentTimezone.tz(element.Fecha, 'America/Bogota').format('DD/MM/YYYY');
              dataInfo.push(element)
            });
            if (dataInfo !== undefined){
              this.listaDatos.push(dataInfo)
            }
            this.loading = false;
            resolve(dataInfo)
          } else if (response.Response.Code === "400"){
            this.loading = false;
            this.popUpManager.showToast('info', this.translate.instant('solicitudes.error'),this.translate.instant('GLOBAL.error'));          
            resolve([]);
          } else if (response.Response.Code === "404"){
            this.loading = false;
            resolve([])
            //this.popUpManager.showToast('info', this.translate.instant('solicitudes.no_data'),this.translate.instant('GLOBAL.info'));
          }
        },
        error => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error);
        }
      );
    });
  }

  loadSolicitud(){
    var IdTercero = localStorage.getItem('persona_id');
    this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/'+IdTercero).subscribe(
      (response: any) => {
        if (response.Response.Code === "200"){
          const data = <Array<any>>response.Response.Body[0].Response;
          const dataInfo = <Array<any>>[];
          data.forEach(element => {
            element.Fecha = momentTimezone.tz(element.Fecha, 'America/Bogota').format('DD/MM/YYYY');
            dataInfo.push(element)
          });
          this.solicitudes.load(dataInfo);
          this.loading = false;
        } else if (response.Response.Code === "404"){
          this.loading = false;
          this.popUpManager.showToast('info', this.translate.instant('solicitudes.no_data'),this.translate.instant('GLOBAL.info'));
        } else {
          this.loading = false;
          this.popUpManager.showToast('info', this.translate.instant('solicitudes.error'),this.translate.instant('GLOBAL.error'));
        }
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );    
  }

  itemselec(event) {
    sessionStorage.setItem('Solicitud', event.data["Numero"]);
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
