import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { InstitucionEnfasis } from '../../../@core/data/models/proyecto_academico/institucion_enfasis';
import { LinkDownloadNuxeoComponent } from '../../../@theme/components/link-download-nuxeo/link-download-nuxeo.component';
import { CustomizeButtonComponent } from '../../../@theme/components';

@Component({
  selector: 'consultar-solicitudes',
  templateUrl: './consultar-solicitudes.component.html',
  styleUrls: ['./consultar-solicitudes.component.scss'],
})
export class ConsultarSolicitudesDerechosPecuniarios {

  dataSource: LocalDataSource;
  data: any[] = [];
  solicitudData: any = null;
  userResponse = {
    Nombre: 'Maria Casquito',
    Rol: 'Coordinador'
  }

  formularioSolicitud  = {
      tipo_formulario: 'mini',
      btn: 'Enviar respuesta',
      alertas: true,
      modelo: 'data',
      customPadding: '0' ,
      campos: [
      {
          etiqueta: 'textarea',
          claseGrid: 'col-12',
          nombre: 'Observaciones',
          label_i18n: 'observaciones',
          placeholder_i18n: 'observaciones',
          requerido: true,
          tipo: 'text',
      },
      {
          etiqueta: 'file',
          claseGrid: 'col-12',
          nombre: 'File',
          label_i18n: 'adjuntar',
          placeholder_i18n: 'adjuntar',
          requerido: true,
          tipo: 'text',
      }
    ]
  }

  arr_proyecto: InstitucionEnfasis[] = [];
  source_emphasys: LocalDataSource = new LocalDataSource();
  proyectos = [];
  gestion = false;
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  settings: any;
  

  constructor(
    private translate: TranslateService,) {
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
      this.updateLanguage();
    });
    this.loadInfoPersona();
    this.createTable();
  }

  return() {
    sessionStorage.setItem('EstadoRecibo', 'false');
  }

  public async loadInfoPersona(): Promise<void> {

  }

  updateLanguage(){
    this.formularioSolicitud.campos.forEach((field: any)=> {
      field.label = this.translate.instant('GLOBAL.' + field.label_i18n);
      field.placeholder = this.translate.instant('GLOBAL.' + field.placeholder_i18n);
    })
  }

  createTable() {
    this.settings = {
      actions: false,
      columns: {
        Id: {
          title: this.translate.instant('derechos_pecuniarios.id'),
          editable: false,
          width: '5%',
          filter: false,
        },
        FechaCreacion: {
          title: this.translate.instant('derechos_pecuniarios.fecha_generacion'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Codigo: {
          title: this.translate.instant('derechos_pecuniarios.codigo'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Nombre: {
          title: this.translate.instant('derechos_pecuniarios.nombre'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Identificacion: {
          title: this.translate.instant('derechos_pecuniarios.identificacion'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Estado: {
          title: this.translate.instant('derechos_pecuniarios.estado'),
          width: '10%',
          editable: false,
          filter: false,
          position: 'center',
        },
        VerSoporte: {
          title: this.translate.instant('derechos_pecuniarios.ver_recibo'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: LinkDownloadNuxeoComponent,
          type: 'custom',
          // onComponentInitFunction: (instance) => {
          //   instance.save.subscribe((data) => this.descargarReciboPago(data))
          // },
        },
        Gestionar: {
          title: this.translate.instant('derechos_pecuniarios.gestionar'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => {
              console.log(data);
              this.solicitudData = data;
              this.gestion = true;

            })
          },
        },
      },
      mode: 'external',
    }
    this.loadInfoRecibos();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.updateLanguage();
  }

  async loadInfoRecibos() {
    this.dataSource.load([{
      Periodo: 10,
      Id: 12,
      FechaCreacion: '12-01-01',
      Codigo: "XXXXXX",
      Nombre: 'Nombre y apellidos',
      Identificacion: "CC, TI, CE",
      Estado: 'Pendiente pago',
      VerSoporte: 140837,
      Gestionar: {
        icon: 'fa fa-pencil fa-2x',
        label: 'Gestionar',
        class: "btn btn-primary"
      }
    }]);
  }


  enviarSolicitud(event) {
    console.log(event);
  }


}
