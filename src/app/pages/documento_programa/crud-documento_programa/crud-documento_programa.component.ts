import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SoporteDocumentoPrograma } from './../../../@core/data/models/documento/soporte_documento_programa';
import { FORM_DOCUMENTO_PROGRAMA } from './form-documento_programa';
import { PopUpManager } from '../../../managers/popUpManager'
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { UserService } from '../../../@core/data/users.service';

@Component({
  selector: 'ngx-crud-documento-programa',
  templateUrl: './crud-documento_programa.component.html',
  styleUrls: ['./crud-documento_programa.component.scss'],
})
export class CrudDocumentoProgramaComponent implements OnInit {
  documento_programa_id: number;
  filesUp: any;
  Documento: any;
  persona: number;
  programa: number;
  periodo: number;
  inscripcion: number;
  soporteId: number;
  tipoInscripcion: number;

  @Input('documento_programa_id')
  set name(documento_programa_id: number) {
    this.documento_programa_id = documento_programa_id;
    if (this.documento_programa_id !== undefined && this.documento_programa_id !== null &&
      this.documento_programa_id !== 0 && this.documento_programa_id.toString() !== '') {
      this.loadDocumentoPrograma();
    }
  }

  @Input('persona_id')
  set info(persona_id: number) {
    this.persona = persona_id;
  }

  @Input('inscripcion_id')
  set info2(inscripcion_id: number) {
    this.inscripcion = inscripcion_id;
  }

  @Input('soporte_id')
  set info3(soporte_id: number) {
    this.soporteId = soporte_id;
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename

  tipo_documentos: any[];
  info_documento_programa: any;
  documentoTemp: any;
  formDocumentoPrograma: any;
  regDocumentoPrograma: any;
  temp: any;
  programaDocumento: any;
  tipoProgramaDocumento: any;
  clean: boolean;
  loading: boolean;
  valido: boolean;
  percentage: number;
  sin_docs: boolean = false;

  constructor(
    private translate: TranslateService,
    private documentoService: DocumentoService,
    private inscripcionService: InscripcionService,
    private nuxeoService: NuxeoService,
    private popUpManager: PopUpManager,
    private userService: UserService,
  ) {
    this.formDocumentoPrograma = FORM_DOCUMENTO_PROGRAMA;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.programa = parseInt(sessionStorage.getItem('ProgramaAcademicoId'), 10) // this.userService.getPrograma();
    this.periodo = parseInt(sessionStorage.getItem('IdPeriodo'), 10) // this.userService.getPeriodo();
    this.tipoInscripcion = parseInt(sessionStorage.getItem('IdTipoInscripcion'), 10);
    this.sin_docs = false;
    this.loadLists();
  }

  public loadLists() {
    this.tipo_documentos = undefined;
    this.sin_docs = false;
    this.inscripcionService.get('documento_programa?query=Activo:true,PeriodoId:' + this.periodo + ',ProgramaId:' + this.programa + ',TipoInscripcionId:' + this.tipoInscripcion + '&limit=0').subscribe(
      (response: Object[]) => {
        if(response === undefined || response === null){
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
        else if (response.length == 1 && !response[0].hasOwnProperty('TipoDocumentoProgramaId')){
          this.popUpManager.showErrorAlert(this.translate.instant('documento_programa.no_documentos'));
          this.tipo_documentos = [{TipoDocumentoProgramaId: {Id: 1, Nombre: "-"}}];
          this.sin_docs = true;
        }
        else{
          this.tipo_documentos = <any[]>response;
          this.sin_docs = false;
        }
          this.eventChange.emit(this.tipo_documentos.length);
          this.construirForm();
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  construirForm() {
    if(this.sin_docs){
      this.formDocumentoPrograma.btn = false;
      this.formDocumentoPrograma.btnLimpiar = false;
    }
    else{
      this.formDocumentoPrograma.btn = this.translate.instant('GLOBAL.guardar');
      this.formDocumentoPrograma.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    }
    this.formDocumentoPrograma.campos.forEach(campo => {
      campo.label = this.translate.instant('GLOBAL.' + campo.label_i18n);
      campo.placeholder = this.translate.instant('GLOBAL.placeholder_' + campo.label_i18n);
      campo.deshabilitar = this.sin_docs;
      if (campo.etiqueta === 'select') {
        this.tipo_documentos.map(tipo => {
          if (<boolean>tipo['Obligatorio'] == true){
            tipo['TipoDocumentoProgramaId']["Nombre"] = tipo['TipoDocumentoProgramaId']["Nombre"]+" *"
          }
        })
        console.log(this.tipo_documentos)
        campo.opciones = this.tipo_documentos.map(tipo => tipo['TipoDocumentoProgramaId']);
      }
    });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formDocumentoPrograma.campos.length; index++) {
      const element = this.formDocumentoPrograma.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_documento_programa === undefined) {
        this.createDocumentoPrograma(event.data.DocumentoPrograma)
      } else {
        this.updateDocumentoPrograma(event.data.DocumentoPrograma);
      }
    }
  }

  public loadDocumentoPrograma(): void {
    this.info_documento_programa = new SoporteDocumentoPrograma();
    this.info_documento_programa.DocumentoProgramaId = { Id: this.documento_programa_id }
    this.popUpManager.showAlert(
      this.translate.instant('GLOBAL.info'),
      this.translate.instant('documento_programa.documento_cambiar'),
    );
  }

  createDocumentoPrograma(documentoPrograma: any): void {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('documento_programa.seguro_continuar_registrar'),
      this.translate.instant('GLOBAL.crear'),
    ).then((ok) => {
      if (ok.value) {
        this.loading = true;
        this.info_documento_programa = <SoporteDocumentoPrograma>documentoPrograma;
        this.info_documento_programa.PersonaId = Number(this.persona) || 1;
        this.info_documento_programa.DocumentoProgramaId = this.info_documento_programa.DocumentoProgramaId;
        const file = {
          file: this.info_documento_programa.Documento.file,
          IdDocumento: 6,
        }
        this.uploadFile(file).then(
          fileId => {
            const soporteDocumentoPrograma = new SoporteDocumentoPrograma();
            soporteDocumentoPrograma.DocumentoId = fileId;
            soporteDocumentoPrograma.DocumentoProgramaId = {
              Id: this.tipo_documentos.filter(
                obj => obj.TipoDocumentoProgramaId.Id === this.info_documento_programa.DocumentoProgramaId.Id,
              )[0].Id,
            };
            soporteDocumentoPrograma.InscripcionId = { Id: Number(this.inscripcion) };
            this.inscripcionService.post('soporte_documento_programa', soporteDocumentoPrograma).subscribe(
              response => {
                this.loading = false;
                this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.documento_programa_registrado'));
                this.documento_programa_id = 0;
                this.info_documento_programa = undefined;
                this.clean = !this.clean;
                this.eventChange.emit(true);
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('documento_programa.documento_programa_no_registrado'));
                this.loading = false;
              },
            )
          },
        ).catch(
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
            this.loading = false;
          },
        );
      }
    });
  }

  updateDocumentoPrograma(documentoPrograma: any) {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('documento_programa.seguro_continuar_registrar'),
      this.translate.instant('GLOBAL.actualizar'),
    ).then((ok) => {
      if (ok.value) {
        this.loading = true;
        this.inscripcionService.get('soporte_documento_programa/' + this.soporteId).subscribe(
          response => {
            const soporte = <SoporteDocumentoPrograma>response;
            this.info_documento_programa = <SoporteDocumentoPrograma>documentoPrograma;
            this.info_documento_programa.PersonaId = Number(this.persona) || 1;
            const file = {
              file: this.info_documento_programa.Documento.file,
              IdDocumento: 6,
            }
            this.uploadFile(file).then(
              fileId => {
                soporte.DocumentoId = fileId;
                this.inscripcionService.put('soporte_documento_programa', soporte).subscribe(
                  (response: any) => {
                    this.loading = false;
                    this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.documento_programa_registrado'));
                    this.documento_programa_id = 0;
                    this.info_documento_programa = undefined;
                    this.clean = !this.clean;
                    this.eventChange.emit(true);
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('documento_programa.documento_programa_no_registrado'));
                    this.loading = false;
                  },
                )
              },
            ).catch(
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
                this.loading = false;
              },
            );
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
            this.loading = false;
          },
        );
      }
    });
  }

  uploadFile(file): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nuxeoService.getDocumentos$([file], this.documentoService)
        .subscribe(response => {
          resolve(response['undefined'].Id); // desempacar el response, puede dejar de llamarse 'undefined'
        }, error => {
          reject(error);
        });
    });
  }

}
