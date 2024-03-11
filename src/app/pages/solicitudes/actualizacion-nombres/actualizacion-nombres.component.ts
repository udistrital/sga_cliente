import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ActualizacionNombre } from '../../../@core/data/models/solicitudes/actualizacion-nombre';
import { RespuestaSolicitud } from '../../../@core/data/models/solicitudes/respuesta-solicitud';
import { Solicitante } from '../../../@core/data/models/solicitudes/solicitante';
import { ACTUALIZAR_NOMBRE } from './form-actualizacion-nombres';
import { RESPUESTA_SOLICITUD } from '../actualizacion-datos/form-respuesta-solicitud';
import { TercerosService } from '../../../@core/data/terceros.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { HttpErrorResponse } from '@angular/common/http';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import Swal from 'sweetalert2';
import * as momentTimezone from 'moment-timezone';
import * as moment from 'moment';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { decrypt } from '../../../@core/utils/util-encrypt';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'actualizacion-nombres',
  templateUrl: './actualizacion-nombres.component.html',
  styleUrls: ['../solicitudes.component.scss'],
})
export class ActualizacionNombresComponent implements OnInit {

  @Input()
  set nuevaSolicitud(nuevaSolicitud: boolean) {
    this.solicitudNueva = nuevaSolicitud;
    this.autenticationService.getRole().then((rol) => {
      this.rol = rol;
      if (nuevaSolicitud) {
        this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].valor = '';
        this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].valor = '';
        this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = '';
        this.solicitudForm.campos[this.getIndexForm('Documento')].valor = '';
        this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = 'noMostrar';
        this.solicitudForm.btn = 'Enviar'
        this.Admin = false;

        if (this.rol.includes('ESTUDIANTE')) {
          this.loadInfo();
          this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('Documento')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('ButonEditar')].deshabilitar = false;
          this.respuestaSolicitudForm.campos.forEach(campo => {
            campo.deshabilitar = true;
          });
          this.loading = false;
        }
      } else {
        this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = '';
        if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
          this.Admin = false;
          this.loadInfoById();
        } if (this.rol.includes('ESTUDIANTE')) {
          this.Admin = false;
          this.loadInfo();
          this.loadInfoById();
        }
      }
    })
  }

  @Input()
  set dataSolicitud(dataSolicitud: any) {
    this.solicitudRespuesta = new RespuestaSolicitud;
    this.solicitudRespuesta.Aprobado = false;
    this.solicitudRespuesta.Observacion = '';
    this.solicitudRespuesta.SolicitudId = 0;
    this.respuestaSolicitudForm.campos[1].valor = false;
    this.rol = this.autenticationService.getRole().then((rol) => {
      this.rol = rol;
      if (dataSolicitud !== undefined) {
        this.solicitudRespuesta.Observacion = dataSolicitud.Observacion
        if (dataSolicitud.Estado === 'Acta aprobada') {
          this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = 'noMostrar';
          this.respuestaSolicitudForm.campos[1].valor = true;
          this.respuestaSolicitudForm.btn = '';
          this.Admin = true;
          this.respuestaSolicitudForm.campos.forEach(campo => {
            campo.deshabilitar = true;
          });
        }

        if (dataSolicitud.Estado === 'Rectificar') {
          this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = 'noMostrar';
          if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
            this.respuestaSolicitudForm.campos.forEach(campo => {
              campo.deshabilitar = false;
            });
            this.respuestaSolicitudForm.btn = 'Enviar';
            this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = '';
          }
        }

        if (dataSolicitud.Estado === 'Radicada') {
          if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
            this.respuestaSolicitudForm.campos.forEach(campo => {
              campo.deshabilitar = false;
            });
            this.respuestaSolicitudForm.btn = 'Enviar';
            this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = '';
          } if (this.rol.includes('ESTUDIANTE')) {
            this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = 'noMostrar';
          }
        }

        if (dataSolicitud.Estado === 'Rechazada') {
          this.respuestaSolicitudForm.btn = '';
          this.Admin = true;
          this.respuestaSolicitudForm.campos.forEach(campo => {
            campo.deshabilitar = true;
          });
          if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
            this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = 'noMostrar';
          } if (this.rol.includes('ESTUDIANTE')) {
            this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = '';
          }
        }
      } else {
        this.Admin = false;
      }
    })
  }

  @Output() solicitudEnviada: EventEmitter<boolean> = new EventEmitter();

  solicitante: Solicitante;
  solicitudForm: any;
  respuestaSolicitudForm: any = RESPUESTA_SOLICITUD;
  solicitudDatos: ActualizacionNombre;
  solicitudRespuesta: RespuestaSolicitud;
  filesUp: any;
  SoporteDocumento: any;
  rol: any;
  solicitudNueva: Boolean;
  modificado: boolean = false;
  Admin: boolean = false;
  loading: boolean = false;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private tercerosService: TercerosService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
    private newNuxeoService: NewNuxeoService,
    private dialogo: MatDialog) {
    this.solicitudForm = ACTUALIZAR_NOMBRE;
    this.respuestaSolicitudForm = RESPUESTA_SOLICITUD;
    this.autenticationService.getRole().then((rol) => {
      this.rol = rol
      this.construirForm();
      this.loading = true;

      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirForm();
      });
    });
  }

  ngOnInit() {
  }

  loadInfoSolicitante() {
    this.loading = true;
    const IdTercero = sessionStorage.getItem('TerceroSolitud')
    if (IdTercero !== undefined) {
      this.sgaMidService.get('persona/consultar_info_solicitante/' + IdTercero).subscribe(
        (response: any) => {
          if (response.Status === '200') {
            this.solicitante = response.Data;
          } else if (response.Status === '400') {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            this.solicitante = new Solicitante();
            this.loading = false;
          } else {
            this.solicitante = new Solicitante();
            this.solicitante.Carrera = 'Ingenieria de Sistemas';
            this.solicitante.Codigo = '20111020005';
            this.solicitante.CorreoInstitucional = 'correo@udistrital.edu.co';
            this.solicitante.CorreoPersonal = 'correo@gmail.com';
            this.solicitante.Nombre = 'Nombre de prueba';
            this.solicitante.Telefono = '+57 000-000-0000';
            this.solicitante.Id = '0';
            this.loading = false;
          }
        },
      )
    }
  }

  loadInfoById() {
    this.loadInfoSolicitante();
    const IdSolicitud = sessionStorage.getItem('Solicitud')
    if (IdSolicitud !== undefined) {
      this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/solicitud/' + IdSolicitud).subscribe(
        (response: any) => {
          if (response.Response.Code === '200') {
            this.solicitudForm.btn = '';
            const date = moment(response.Response.Body[0].FechaExpedicionNuevo, 'DD/MM/YYYY').toDate();
            this.solicitudForm.campos[this.getIndexForm('FechaSolicitud')].valor =
              momentTimezone.tz(response.Response.Body[0].FechaSolicitud, 'America/Bogota').format('DD/MM/YYYY');
            this.solicitudForm.campos[this.getIndexForm('NombreActual')].valor = response.Response.Body[0].NombreActual;
            this.solicitudForm.campos[this.getIndexForm('NombreActual')].deshabilitar = true;
            this.solicitudForm.campos[this.getIndexForm('ApellidoActual')].valor = response.Response.Body[0].ApellidoActual;
            this.solicitudForm.campos[this.getIndexForm('ApellidoActual')].deshabilitar = true;
            this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].valor = response.Response.Body[0].NombreNuevo;
            this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].deshabilitar = true;
            this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].valor = response.Response.Body[0].ApellidoNuevo;
            this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = true;
            this.solicitudForm.Documento = response.Response.Body[0].Documento;
            const files = []
            if (this.solicitudForm.Documento + '' !== '0') {
              files.push({ Id: this.solicitudForm.Documento });
            }
            if (this.solicitudForm.Documento !== undefined && this.solicitudForm.Documento !== null && this.solicitudForm.Documento !== 0) {
              this.newNuxeoService.get(files).subscribe(
                res => {
                  const filesResponse = <any>res;
                  if (Object.keys(filesResponse).length === files.length) {
                    this.SoporteDocumento = this.solicitudForm.Documento;
                    this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = filesResponse[0].url;
                    this.solicitudForm.campos[this.getIndexForm('Documento')].valor = filesResponse[0].url;
                    this.loading = false;
                  }
                },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
                },
              );
            }
            this.loading = false;
          } else if (response.Response.Code === '404') {
            this.loading = false;
          } else if (response.Response.Code === '400') {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            this.loading = false;
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        },
      );
    }
  }

  enviarRespuesta(event) {
    this.loading = true;
    this.solicitudRespuesta = new RespuestaSolicitud();
    this.solicitudRespuesta.SolicitudId = parseInt(sessionStorage.getItem('Solicitud'), 10);
    this.solicitudRespuesta.Observacion = this.respuestaSolicitudForm.campos[this.getIndexForm('Observacion')].valor;
    this.solicitudRespuesta.Estado = 9
    if (this.respuestaSolicitudForm.campos[1].valor === '' || this.respuestaSolicitudForm.campos[1].valor === false) {
      this.respuestaSolicitudForm.campos[1].valor = false;
      this.solicitudRespuesta.Estado = 11
    }
    this.solicitudRespuesta.Aprobado = this.respuestaSolicitudForm.campos[1].valor;
    this.sgaMidService.post('solicitud_evaluacion/registrar_evolucion', this.solicitudRespuesta).subscribe(
      (response: any) => {
        if (response.Response.Code === '200') {
          this.loading = false;
          this.loadInfoById();
          Swal.fire({
            icon: 'success',
            title: this.translate.instant('GLOBAL.operacion_exitosa'),
            text: this.translate.instant('solicitudes.respuesta'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          }).then((willDelete) => {
            if (willDelete.value) {
              this.solicitudEnviada.emit(true);
            }
          });
        } else if (response.Response.Code === '400') {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('solicitudes.error'));
        }
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadInfoNueva() {
    const IdSolcitud = localStorage.getItem('Solicitud');
    this.SoporteDocumento = [];
    this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/solicitud/' + IdSolcitud).subscribe(
      (response: any) => {
        if (response.Response.Code === '200') {
          this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].valor = response.Response.Body[0].NombreNuevo;
          this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].deshabilitar = true;
          this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].valor = response.Response.Body[0].ApellidoNuevo;
          this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = true;
          this.solicitudForm.Documento = response.Response.Body[0].Documento;
          const files = []
          if (this.solicitudForm.Documento + '' !== '0') {
            files.push({ Id: this.solicitudForm.Documento });
          }
          if (this.solicitudForm.Documento !== undefined && this.solicitudForm.Documento !== null && this.solicitudForm.Documento !== 0) {
            this.newNuxeoService.get(files).subscribe(
              res => {
                const filesResponse = <any>res;
                if (Object.keys(filesResponse).length === files.length) {
                  this.SoporteDocumento = this.solicitudForm.Documento;
                  this.solicitudForm.btn = '';
                  this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = filesResponse[0].url;
                  this.solicitudForm.campos[this.getIndexForm('Documento')].valor = filesResponse[0].url;
                  this.loading = false;
                }
              },
              (error: HttpErrorResponse) => {
                this.loading = false;
                this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
              },
            );
          }
        } else if (response.Response.Code === '404') {
          this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/' + IdSolcitud + '/18').subscribe(
            (response: any) => {
              if (response.Response.Code === '200') {
                this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].valor = response.Response.Body[0].NombreNuevo;
                this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].deshabilitar = true;
                this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].valor = response.Response.Body[0].ApellidoNuevo;
                this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = true;
                this.solicitudForm.Documento = response.Response.Body[0].Documento;
                const files = []
                if (this.solicitudForm.Documento + '' !== '0') {
                  files.push({ Id: this.solicitudForm.Documento });
                }
                if (this.solicitudForm.Documento !== undefined && this.solicitudForm.Documento !== null && this.solicitudForm.Documento !== 0) {
                  this.newNuxeoService.get(files).subscribe(
                    res => {
                      const filesResponse = <any>res;
                      if (Object.keys(filesResponse).length === files.length) {
                        this.SoporteDocumento = this.solicitudForm.Documento;
                        this.solicitudForm.btn = '';
                        this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = filesResponse[0].url;
                        this.solicitudForm.campos[this.getIndexForm('Documento')].valor = filesResponse[0].url;
                      }
                      this.loading = false;
                    },
                    (error: HttpErrorResponse) => {
                      this.loading = false;
                      this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
                    },
                  );
                } else {
                  this.loading = false;
                }
              } else if (response.Response.Code === '404') {
                this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = false;
                this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = false;
                this.loading = false;
              } else {
                this.loading = false;
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              }
            },
            error => {
              this.loading = false;
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            },
          );
        } else {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadInfo() {
    this.loadInfoSolicitante();
    const id = decrypt(localStorage.getItem('persona_id'));
    const TerceroId = parseInt(id, 10)
    if (TerceroId !== undefined) {
      const hoy = new Date();
      this.solicitudForm.campos[this.getIndexForm('FechaSolicitud')].valor = hoy.getFullYear() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getDate();
      this.tercerosService.get('tercero/' + TerceroId).subscribe(
        (response: any) => {
          if (response !== undefined && response !== '') {
            this.solicitudForm.campos[this.getIndexForm('NombreActual')].valor = response['PrimerNombre'] + ' ' + response['SegundoNombre']
            this.solicitudForm.campos[this.getIndexForm('ApellidoActual')].valor = response['PrimerApellido'] + ' ' + response['SegundoApellido'];
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  cargoDatos(event) {
    this.loading = !event;
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.solicitudForm.campos.length; index++) {
      const element = this.solicitudForm.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  construirForm() {
    this.solicitudForm.titulo = this.translate.instant('solicitudes.solicitud_encabezado');
    this.respuestaSolicitudForm.titulo = this.translate.instant('solicitudes.solicitud_respuesta');
    this.solicitudForm.campos.forEach(campo => {
      if (campo.etiqueta === 'button') {
        for (let i = 0; i < this.rol.length; i++) {
          if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
            campo.label = this.translate.instant('solicitudes.' + campo.label_i18n)
            break;
          } if (this.rol.includes('ESTUDIANTE')) {
            campo.label_i18n = campo.label_i18n_estudiante
            break;
          }
        }
        campo.info = this.translate.instant('solicitudes.' + campo.label_i18n)
      }
      campo.label = this.translate.instant('solicitudes.' + campo.label_i18n);
    })
    this.respuestaSolicitudForm.campos.forEach(campo => {
      campo.label = this.translate.instant('solicitudes.' + campo.label_i18n);
    })
  }

  enviarSolicitud(event) {
    if (event.valid) {
      const opt: any = {
        title: this.translate.instant('solicitudes.enviar'),
        text: this.translate.instant('solicitudes.confirmar_envio'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt)
        .then((willDelete) => {
          if (willDelete.value) {
            this.loading = true;
            const files = [];
            const Solicitud: any = {};
            this.solicitudDatos = event.data;
            if (this.solicitudDatos['Documento'].file !== undefined) {
              files.push({
                IdDocumento: 25,
                nombre: this.autenticationService.getPayload().sub,
                file: this.solicitudDatos['Documento'].file,
              });
            }
            this.newNuxeoService.uploadFiles(files).subscribe(
              (responseNux: any[]) => {
                if (responseNux[0].Status == "200") {

                  this.solicitudDatos['Documento'] = responseNux[0].res.Id;

                  const hoy = new Date();
                  this.solicitudDatos.FechaSolicitud = momentTimezone.tz(hoy.getFullYear() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getDate(),
                    'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
                  this.solicitudDatos.FechaSolicitud = this.solicitudDatos.FechaSolicitud + ' +0000 +0000';
                  Solicitud.Solicitud = this.solicitudDatos;
                  const id = decrypt(localStorage.getItem('persona_id'));
                  Solicitud.Solicitante = parseInt(id, 10);
                  Solicitud.TipoSolicitud = 4;
                  if (this.modificado) {
                    Solicitud.SolicitudPadreId = sessionStorage.getItem('Solicitud')
                  }
                  this.sgaMidService.post('solicitud_evaluacion/registrar_solicitud', Solicitud).subscribe(
                    (res: any) => {
                      if (res.Response.Code === '200') {
                        this.loading = false;
                        Swal.fire({
                          icon: 'success',
                          title: this.translate.instant('GLOBAL.operacion_exitosa'),
                          text: this.translate.instant('solicitudes.crear_exito'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        }).then((willDelete) => {
                          if (willDelete.value) {
                            this.solicitudEnviada.emit(true);
                          }
                        });
                      } else {
                        this.loading = false;
                        this.popUpManager.showErrorToast(this.translate.instant('solicitudes.crear_error'));
                      }
                    },
                    (error: HttpErrorResponse) => {
                      this.loading = false;
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('informacion_academica.documento_informacion_academica_no_registrado'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    },
                  );
                } else {
                  this.loading = false;
                }
              },
              (error: HttpErrorResponse) => {
                this.loading = false;
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('informacion_academica.documento_informacion_academica_no_registrado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              },
            );
          }
        },
        );
    }
  }

  habilitarRevision(event) {
    if (event.button === 'ButonEditar') {
      if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
        this.Admin = true;
      } if (this.rol.includes('ESTUDIANTE')) {
        this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = false;
        this.solicitudForm.campos[this.getIndexForm('Documento')].deshabilitar = false;
        this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].deshabilitar = false;
        this.solicitudForm.campos[this.getIndexForm('ButonEditar')].deshabilitar = false;
        this.respuestaSolicitudForm.campos.forEach(campo => {
          campo.deshabilitar = true;
        });
        this.respuestaSolicitudForm.btn = ''
        this.Admin = true;
        this.modificado = true;
        this.solicitudForm.btn = 'Enviar'
      }
    }
  }
}
