import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from '../../../managers/popUpManager';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { SoporteDocumentoAux } from '../../../@core/data/models/documento/soporte_documento_aux';
import { Documento } from '../../../@core/data/models/documento/documento';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import Swal from 'sweetalert2';
import { BodyOutputType, Toast, ToasterConfig, ToasterService } from 'angular2-toaster';

@Component({
  selector: 'ngx-list-documento-programa',
  templateUrl: './list-documento_programa.component.html',
  styleUrls: ['./list-documento_programa.component.scss'],
})
export class ListDocumentoProgramaComponent implements OnInit {
  uid: number;
  persona: number;
  programa: number;
  periodo: number;
  inscripcion: number;
  cambiotab: boolean = false;
  contador: number;
  settings: any;
  tipo_documentos: any[];
  data: any;
  info_data: any;
  programaDocumento: any;
  tipoProgramaDocumento: any;
  soporteDocumento: SoporteDocumentoAux[];
  soporteId: number;
  source: LocalDataSource = new LocalDataSource();
  tipoInscripcion: number;
  listAlreadyUploaded: number[] = [];

  @Input('persona_id')
  set info(info: number) {
    this.persona = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion = info2;
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {

    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,
    private utilidades: UtilidadesService,
    private toasterService: ToasterService
  ) {
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loading = false;
    this.percentage = 0;
  }

  cargarCampos() {
    this.settings = {
      columns: {
        TipoDocumento: {
          title: this.translate.instant('GLOBAL.tipo_documento_programa'),
          width: '30%',
          editable: false,
        },
        EstadoObservacion: {
          title: this.translate.instant('admision.estado'),
          width: '20%',
          editable: false,
        },
        Observacion: {
          title: this.translate.instant('admision.observacion'),
          width: '40%',
          editable: false,
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        add: true,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'open',
            title: '<i class="nb-compose" title="' + this.translate.instant('GLOBAL.tooltip_ver_registro') + '"></i>',
          },
          {
            name: 'edit',
            title: '<i class="nb-edit" title="' + this.translate.instant('GLOBAL.tooltip_editar_registro') + '"></i>',
          },
          {
            name: 'delete',
            title: '<i class="nb-trash" title="' + this.translate.instant('GLOBAL.eliminar') + '"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="nb-plus" title="' + this.translate.instant('documento_programa.tooltip_crear') + '"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
    };
  }

  async loadData() {
    this.loading = true;
    this.soporteDocumento = [];
    this.percentage = 0;
    this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' +
      this.inscripcion + ',DocumentoProgramaId.ProgramaId:' + this.programa + ',DocumentoProgramaId.TipoInscripcionId:' + this.tipoInscripcion + ',DocumentoProgramaId.PeriodoId:' + parseInt(sessionStorage.getItem('IdPeriodo'), 10)  + ',DocumentoProgramaId.Activo:true&limit=0').subscribe(
        (response: any[]) => {
          if (Object.keys(response[0]).length > 0) {
            response.forEach(async soporte => {
              const documento: SoporteDocumentoAux = new SoporteDocumentoAux();
              documento.TipoDocumentoId = soporte['DocumentoProgramaId']['TipoDocumentoProgramaId']['Id'];
              this.listAlreadyUploaded.push(documento.TipoDocumentoId);
              documento.TipoDocumento = soporte['DocumentoProgramaId']['TipoDocumentoProgramaId']['Nombre'];
              documento.DocumentoId = soporte['DocumentoId'];
              documento.SoporteDocumentoId = soporte['Id'];
              await this.cargarEstadoDocumento(documento).then((estado: any) => {
                documento.EstadoObservacion = estado.estadoObservacion;
                documento.Observacion = estado.observacion;
                documento["Aprobado"] = estado.aprobado;
              });
              this.soporteDocumento.push(documento);
              this.source.load(this.soporteDocumento);
              if (<boolean>soporte['DocumentoProgramaId']['Obligatorio'] == true){
                //if (documento.EstadoObservacion !== 'No aprobado') {
                  this.getPercentage((1 / this.tipo_documentos.length * 100));
                //}
              }
            });
          } else {
            this.source.load([]);
            this.getPercentage(0);
            this.popUpManager.showAlert('', this.translate.instant('documento_programa.no_documentos'));
          }
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.' + error.status));
        },
      );
  }

  cargarEstadoDocumento(documento: SoporteDocumentoAux) {
    return new Promise((resolve) => {
      this.documentoService.get('documento/' + documento.DocumentoId).subscribe(
        (doc: Documento) => {
          let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
          resolve(estadoDoc)
        });
    });

  }

  ngOnInit() {
    this.uid = 0;
    this.soporteDocumento = [];
    this.inscripcion = parseInt(sessionStorage.getItem('IdInscripcion'), 10);
    this.programa = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10);
    this.periodo = parseInt(sessionStorage.getItem('IdPeriodo'), 10);
    this.tipoInscripcion = parseInt(sessionStorage.getItem('IdTipoInscripcion'), 10);
    
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
      this.loadData();
    }
    this.loadLists();
  }

  public loadLists() {
    this.inscripcionService.get('documento_programa?query=Activo:true,PeriodoId:' + this.periodo + ',ProgramaId:' + this.programa + ',TipoInscripcionId:' + this.tipoInscripcion + ',Obligatorio:true&limit=0').subscribe(
      (response: Object[]) => {
        if(response === undefined || response === null){
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
        else if (response.length == 1 && !response[0].hasOwnProperty('TipoDocumentoProgramaId')){
        }
        else{
          this.tipo_documentos = <any[]>response;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  onOpen(event) {
    const filesToGet = [
      {
        Id: event.data.DocumentoId,
        key: event.data.DocumentoId,
      },
    ];
    this.newNuxeoService.get(filesToGet).subscribe(
      response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          filesToGet.forEach((file: any) => {
            const url = filesResponse[0].url;
            window.open(url);
          });
        }
      },
        error => {
          this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
        },
      );
  }

  onEdit(event): void {
    if(event.data.Aprobado != true) {
      this.uid = event.data.TipoDocumentoId;
      this.soporteId = event.data.SoporteDocumentoId;
      this.activetab();
    } else {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('inscripcion.no_edit_doc_aprobado'),
      )
    }
  }

  onCreate(event): void {
    this.uid = 0;
    this.activetab();
  }

  onDelete(event): void {
    let estado: string = event.data.EstadoObservacion;
    let esAprobado: boolean = estado === "Aprobado";

    if (esAprobado) {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('documento_programa.no_permite_borrar'),
        icon: 'info',
        dangerMode: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar')
      };
      Swal.fire(opt);
    } else {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('documento_programa.seguro_borrar'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt)
        .then((willDelete) => {
          this.loading = true;
          if (willDelete.value) {
            this.inscripcionService.delete('soporte_documento_programa', event.data).subscribe(res => {
              if (res !== null) {
                this.loadData();
                this.showToast('info', this.translate.instant('GLOBAL.eliminar'),
                  this.translate.instant('GLOBAL.descuento_matricula') + ' ' +
                  this.translate.instant('GLOBAL.confirmarEliminar'));
              }
              this.loading = false;
            }, (error: HttpErrorResponse) => {
                this.loading = false;
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                    this.translate.instant('GLOBAL.descuento_matricula'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
          }
          this.loading = false;
        });
    }
  }

  onAction(event): void {
    switch (event.action) {
      case 'open':
        this.onOpen(event);
        break;
      case 'edit':
        this.onEdit(event);
        break;
      case 'delete':
        this.onDelete(event);
        break;
    }
  }

  onChange(event) {
    if (event === true) {
      this.uid = 0;
      this.loadData();
      this.cambiotab = false;
    } /*else {
      // this.getPercentage(this.soporteDocumento.length / event)
      this.getPercentage(event)
    }*/
  }

  getPercentage(event) {
    if (event !== undefined) {
      this.percentage += event;
      //this.percentage = Number(this.percentage.toFixed(0))
    }

    if (this.percentage > 100) {
      this.result.emit(1);
    } else {
      this.result.emit(this.percentage / 100);
    }
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  private showToast(type: string, title: string, body: string) {
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
