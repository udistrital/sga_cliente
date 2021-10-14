import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as momentTimezone from 'moment-timezone';
import { Inject } from '@angular/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { ConsultaProyectoAcademicoComponent } from '../consulta-proyecto_academico/consulta-proyecto_academico.component';
import { RegistroProyectoAcademicoComponent } from '../registro-proyecto_academico/registro-proyecto_academico.component';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';

@Component({
  selector: 'ngx-list-registro-proyecto-academico',
  templateUrl: './list-registro_proyecto_academico.component.html',
  styleUrls: ['./list-registro_proyecto_academico.component.scss'],
})
export class ListRegistroProyectoAcademicoComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  dataSource: any;
  index: any;
  idproyecto: any;
  displayedColumns = ['Id', 'Registro', 'Vigencia', 'Tipo de registro', 'Documento', 'Tiempo de vigencia', 'Activo',
    'Fecha Inicio Registro', 'Fecha Vencimiento Registro'];

  source: LocalDataSource = new LocalDataSource();
  listaDatos = [];
  proyectoJson: any;

  constructor(private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConsultaProyectoAcademicoComponent>,
    private sgamidService: SgaMidService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    public dialog: MatDialog,
    private toasterService: ToasterService) {
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
    this.settings = {
      columns: {
        Id: {
          title: this.translate.instant('consultaproyecto.id'),
          width: '5%',
        },
        NumeroActoAdministrativo: {
          title: this.translate.instant('historial_registro.registro'),
          width: '5%',
        },
        AnoActoAdministrativoId: {
          title: this.translate.instant('historial_registro.vigencia'),
          width: '5%',
        },
        TipoRegistroIdNombre: {
          title: this.translate.instant('historial_registro.tipo_registro'),
          width: '25%',
        },
        VigenciaActoAdministrativo: {
          title: this.translate.instant('historial_registro.tiempo'),
          width: '10%',
        },
        ActivoLetra: {
          title: this.translate.instant('historial_registro.activo'),
          width: '5%',
        },
        FechaCreacionActoAdministrativo: {
          title: this.translate.instant('historial_registro.fecha_inicio'),
          width: '15%',
        },
        VencimientoActoAdministrativo: {
          title: this.translate.instant('historial_registro.fecha_vencimiento'),
          width: '18%',
        },
      },
      mode: 'external',
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('historial_registro.documento'),
        custom: [
          {
            name: 'Documento',
            title: '<i class="fa fa-cloud-download" title="' +
              this.translate.instant('GLOBAL.tooltip_descargar') +
              '"></i>',
          },
        ],
      },
    };
    //this.source.load(this.listaDatos);
  }

  loadData(): void {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('oferta.evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    }
    this.sgamidService.get('consulta_proyecto_academico/get_registro/' + this.data.Id)
      .subscribe(res => {
        if (res !== null && res[0] !== 'error') {
          const data = <Array<any>>res;
          data.forEach(element => {
            element.TipoRegistroIdNombre = element.TipoRegistroId.Nombre
            element.FechaCreacionActoAdministrativo = momentTimezone.tz(element.FechaCreacionActoAdministrativo, 'America/Bogota').format('DD-MM-YYYY')
            element.VencimientoActoAdministrativo = momentTimezone.tz(element.VencimientoActoAdministrativo, 'America/Bogota').format('DD-MM-YYYY')
            this.source.load(data)
          });
        } else {
          Swal.fire(opt1)
            .then((willDelete) => {
              if (willDelete.value) {
              }
            });
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  onAction(event) {
    console.log("Se llamo al botón")

    this.highlight(event)
    console.log(event)
    switch (event.action) {
      case 'Documento':
        this.downloadFile(event);
        break;
    }
  }

  downloadFile(id_documento: any) {
    console.log("Se llamo a download")
    let filesToGet = [
      {
        Id: id_documento.data.EnlaceActo,
        key: id_documento.data.EnlaceActo,
      },
    ];
    this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService)
      .subscribe(response => {
        console.log(response)
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          // console.log("files", filesResponse);
          filesToGet.forEach((file: any) => {
            console.log("--", file)
            const url = filesResponse[file.Id];
            window.open(url);
          });
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
  }

  onclick(): void {
    this.dialogRef.close();
  }

  highlight(row): void {
    this.idproyecto = row.data.ProyectoAcademicoInstitucionId.Id;
  }

  OpenRegistroCalificado(): void {
    const dialogRef = this.dialog.open(RegistroProyectoAcademicoComponent, {
      width: '550px',
      height: '750px',
      data: { IdProyecto: this.data.Id, endpoint: 'registro_calificado', tipo_registro: 1 },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

  OpenRegistroAlta(): void {
    const dialogRef = this.dialog.open(RegistroProyectoAcademicoComponent, {
      width: '550px',
      height: '750px',
      data: { IdProyecto: this.data.Id, endpoint: 'registro_alta_calidad', tipo_registro: 2 },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadData();
    });
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }
}
