import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SoporteDocumentoPrograma } from './../../../@core/data/models/documento/soporte_documento_programa';
import { DocumentoProgramaService } from '../../../@core/data/documento_programa.service';
import { FORM_DOCUMENTO_PROGRAMA } from './form-documento_programa';
import Swal from 'sweetalert2';
import { PopUpManager } from '../../../managers/popUpManager'
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { ListService } from '../../../@core/store/services/list.service';
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

  @Input('documento_programa_id')
  set name(documento_programa_id: number) {
    this.documento_programa_id = documento_programa_id;
    //this.loadDocumentoPrograma();
  }

  @Input('persona_id')
  set info(persona_id: number) {
    this.persona = persona_id;
  }

  @Input('inscripcion_id')
  set info2(inscripcion_id: number) {
    this.inscripcion = inscripcion_id;
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
        // this.loadOptionsTipodocumentoprograma();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

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

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private inscripcionService: InscripcionService,
    private documentoProgramaService: DocumentoProgramaService,
    private nuxeoService: NuxeoService,
    private listService: ListService,
    private popUpManager: PopUpManager,
    private userService: UserService,
  ) {
    this.formDocumentoPrograma = FORM_DOCUMENTO_PROGRAMA;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findDocumentoPrograma();
  }

  ngOnInit() {
    this.programa = this.userService.getPrograma();
    this.periodo = this.userService.getPeriodo();
    this.loadLists();
  }

  public loadLists() {
    this.inscripcionService.get('documento_programa?query=ProgramaId:'+this.programa).subscribe(
      response => {
        this.tipo_documentos = <any[]>response;
        console.log(this.tipo_documentos)
        this.construirForm();
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  construirForm() {
    this.formDocumentoPrograma.btn = this.translate.instant('GLOBAL.guardar');
    this.formDocumentoPrograma.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    this.formDocumentoPrograma.campos.forEach(campo => {
      campo.label = this.translate.instant('GLOBAL.' + campo.label_i18n);
      campo.placeholder = this.translate.instant('GLOBAL.placeholder_' + campo.label_i18n);
      if (campo.etiqueta === 'select') {
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
      // if (this.info_documento_programa === undefined) {
      // this.crearNuevoDocumentoPrograma(event.data.DocumentoPrograma);
      // } else {
      // this.updateDocumentoPrograma(event.data.DocumentoPrograma);
      // }
      this.createDocumentoPrograma(event.data.DocumentoPrograma);
    }
  }

  public loadDocumentoPrograma(): void {
    this.loading = true;
    this.temp = {};
    this.Documento = [];
    this.info_documento_programa = {};
    this.filesUp = <any>{};
    if (this.documento_programa_id !== undefined &&
      this.documento_programa_id !== 0 &&
      this.documento_programa_id.toString() !== '') {
        this.documentoProgramaService.get('soporte_documento_programa/' + this.documento_programa_id)
          .subscribe(res => {
            if (res !== null) {
              this.temp = <SoporteDocumentoPrograma>res;
              const files = [];
              this.documentoProgramaService.get('documento_programa/' + this.temp.DocumentoProgramaId.Id)
                .subscribe(documentoPrograma => {
                  if (documentoPrograma !== null) {
                    this.programaDocumento =  <Array<any>>documentoPrograma;
                    this.temp.DocumentoPrograma = this.programaDocumento;
                    this.documentoProgramaService.get('tipo_documento_programa/' +
                      this.programaDocumento.TipoDocumentoProgramaId.Id)
                      .subscribe(tipoDocumentoPrograma => {
                        if (tipoDocumentoPrograma !== null) {
                          this.tipoProgramaDocumento =  <Array<any>>tipoDocumentoPrograma;
                          this.temp.DocumentoPrograma.TipoDocumentoPrograma = this.tipoProgramaDocumento;
                          this.temp.DocumentoPrograma.Nombre = this.tipoProgramaDocumento.Nombre;
                        }
                        if (this.temp.DocumentoId + '' !== '0') {
                          files.push({ Id: this.temp.DocumentoId, key: 'SoporteDocumentoPrograma' });
                        }
                        this.nuxeoService.getDocumentoById$(files, this.documentoService)
                          .subscribe(response => {
                            const filesResponse = <any>response;
                            if (Object.keys(filesResponse).length === files.length) {
                              this.Documento = this.temp.DocumentoId;
                              this.temp.Documento = filesResponse['SoporteDocumentoPrograma'] + '';
                              this.info_documento_programa = this.temp;
                              this.info_documento_programa.Documento = filesResponse['SoporteDocumentoPrograma'] + '';
                              this.loading = false;
                            }
                          },
                            (error: HttpErrorResponse) => {
                              Swal({
                                type: 'error',
                                title: error.status + '',
                                text: this.translate.instant('ERROR.' + error.status),
                                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                  this.translate.instant('GLOBAL.documento_programa') + '|' +
                                  this.translate.instant('GLOBAL.soporte_documento'),
                                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                              });
                            });
                      },
                        (error: HttpErrorResponse) => {
                          Swal({
                            type: 'error',
                            title: error.status + '',
                            text: this.translate.instant('ERROR.' + error.status),
                            footer: this.translate.instant('GLOBAL.cargar') + '-' +
                              this.translate.instant('GLOBAL.tipo_documento_programa'),
                            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                          });
                        });
                      }
                },
                  (error: HttpErrorResponse) => {
                    Swal({
                      type: 'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      footer: this.translate.instant('GLOBAL.cargar') + '-' +
                        this.translate.instant('GLOBAL.documento_programa'),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                  });
            }
          },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                  this.translate.instant('GLOBAL.documento_programa'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
    } else {
      this.temp = {};
      this.Documento = [];
      this.filesUp = <any>{};
      this.info_documento_programa = undefined;
      this.clean = !this.clean;
      this.loading = false;
    }
  }

  createDocumentoPrograma(documentoPrograma: any): void {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('documento_programa.seguro_continuar_registrar'),
      this.translate.instant('GLOBAL.crear')
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
            const soporteDocumentoPrograma = {
              DocumentoId: fileId,
              DocumentoProgramaId: {
                Id: this.tipo_documentos.filter(
                  obj => obj.TipoDocumentoProgramaId.Id === this.info_documento_programa.DocumentoProgramaId.Id
                )[0].Id,
              },
              InscripcionId: {Id: Number(this.inscripcion)},
            }
            this.inscripcionService.post('soporte_documento_programa', soporteDocumentoPrograma).subscribe(
              response => {
                this.loading = false;
                this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.documento_programa_registrado'));
                this.documento_programa_id = 0;
                this.info_documento_programa = undefined;
                this.clean = !this.clean;
                this.eventChange.emit(true);
                this.result.emit(event);
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('documento_programa.documento_programa_no_registrado'));
                this.loading = false;
              }
            )
          }
        ).catch(
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
            this.loading = false;
          }
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

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

}
