import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


@Component({
  selector: 'ngx-detalle-calendario',
  templateUrl: './detalle-calendario.component.html',
  styleUrls: ['./detalle-calendario.component.scss'],
})
export class DetalleCalendarioComponent implements OnInit {

  dataSource: any;
  data: any;

  periodos: any;

  processSettings: any;
  activitiesSettings: any;

  idDetalle: any

  constructor(
    private sgaMidService: SgaMidService,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private route: ActivatedRoute,
    private matIconRegistry: MatIconRegistry,
  ) {
    this.createActivitiesTable();
  }

  loadSelects(id: any) {
    this.sgaMidService.get('consulta_calendario_academico/'+id).subscribe(res => {
      this.periodos = res;
    });
  }

  ngOnInit() {
 
    this.route.paramMap.subscribe(params => {
      this.idDetalle = params.get('Id');
    });
    this.loadSelects(this.idDetalle)

  }

  cambiarCalendario(id: any){
    this.loadSelects(id)
  }

  createActivitiesTable() {
    this.activitiesSettings = {
      columns: {
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          witdh: '30%',
          editable: false,
          filter: false,
        },
        FechaInicio: {
          title: this.translate.instant('calendario.fecha_inicio'),
          witdh: '20%',
          editable: false,
          filter: false,
        },
        FechaFin: {
          title: this.translate.instant('calendario.fecha_fin'),
          witdh: '20%',
          editable: false,
          filter: false,
        },
        Responsable: {
          title: this.translate.instant('calendario.responsable'),
          witdh: '30%',
          editable: false,
          filter: false,
        },
      },
      actions: false,
      mode: 'external',
      noDataMessage: this.translate.instant('calendario.sin_actividades'),
    }
  }

  downloadFile(id_documento: any) {
    const filesToGet = [
      {
        Id: id_documento,
        key: id_documento,
      },
    ];
    this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService)
      .subscribe(response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          // console.log("files", filesResponse);
          filesToGet.forEach((file: any) => {
            const url = filesResponse[file.Id];
            window.open(url);
          });
        }
      },
      (error: HttpErrorResponse) => {
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

}
