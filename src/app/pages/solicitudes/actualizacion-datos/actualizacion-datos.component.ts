import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ActualizacionDatos } from '../../../@core/data/models/solicitudes/actualizacion-datos';
import { RespuestaSolicitud } from '../../../@core/data/models/solicitudes/respuesta-solicitud';
import { Solicitante } from '../../../@core/data/models/solicitudes/solicitante';
import { ACTUALIZAR_DATOS } from './form-actualizacion-datos';
import { RESPUESTA_SOLICITUD } from './form-respuesta-solicitud';
import { TercerosService } from '../../../@core/data/terceros.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { HttpErrorResponse } from '@angular/common/http';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import Swal from 'sweetalert2';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'ngx-actualizacion-datos',
  templateUrl: './actualizacion-datos.component.html',
  styleUrls: ['../solicitudes.component.scss'],
})
export class ActualizacionDatosComponent implements OnInit {

  @Input()
  set nuevaSolicitud(nuevaSolicitud: boolean) {
    this.solicitudNueva = nuevaSolicitud;
    this.autenticationService.getRole().then((rol) => {
      this.rol = rol;
      if (nuevaSolicitud) {
        this.solicitudDatos = new ActualizacionDatos();
        this.solicitudForm.campos[this.getIndexForm('TipoDocumentoNuevo')].valor = '';
        this.solicitudForm.campos[this.getIndexForm('NumeroNuevo')].valor = '';
        this.solicitudForm.campos[this.getIndexForm('FechaExpedicionNuevo')].valor = '';
        this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = '';
        this.solicitudForm.campos[this.getIndexForm('Documento')].valor = '';
        this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = 'noMostrar';
        this.solicitudForm.btn = 'Enviar'
        this.Admin = false;

        if (this.rol.includes('ESTUDIANTE')) {
          this.loadInfo();
          this.solicitudForm.campos[this.getIndexForm('FechaExpedicionNuevo')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('TipoDocumentoNuevo')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('NumeroNuevo')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('Documento')].deshabilitar = false;
          this.respuestaSolicitudForm.campos.forEach(campo => {
            campo.deshabilitar = true;
          });
          this.loading = false;
        }
      } else {
        this.solicitudForm.campos[this.getIndexForm('ButonEditar')].id = '';
        if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
          this.Admin = false;
        } if (this.rol.includes('ESTUDIANTE')) {
          this.Admin = false;
          this.loadInfo();
        }
        this.loadInfoById();
      }
    })
  }

  @Input()
  set dataSolicitud(dataSolicitud: any) {

    this.autenticationService.getRole().then((rol) => {
      this.rol = rol;
      this.solicitudRespuesta = new RespuestaSolicitud;
      this.solicitudRespuesta.Aprobado = false;
      this.solicitudRespuesta.Observacion = '';
      this.solicitudRespuesta.SolicitudId = 0;
      this.respuestaSolicitudForm.campos[1].valor = false;

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
    });
  }

  @Output() solicitudEnviada: EventEmitter<boolean> = new EventEmitter();

  solicitante: Solicitante;
  solicitudForm: any;
  respuestaSolicitudForm: any = RESPUESTA_SOLICITUD;
  solicitudDatos: ActualizacionDatos;
  solicitudRespuesta: RespuestaSolicitud;
  tipoDocumento: any[];
  filesUp: any;
  SoporteDocumento: any;
  rol: any;
  Admin: boolean = false;
  loading: boolean;
  solicitudNueva: Boolean;
  modificado: boolean = false;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private tercerosService: TercerosService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sgaMidService: SgaMidService,
    private newNuxeoService: NewNuxeoService,
    private popUpManager: PopUpManager) {
    this.solicitudForm = ACTUALIZAR_DATOS;
    this.respuestaSolicitudForm = RESPUESTA_SOLICITUD;
    this.loading = true;
    this.Admin = false;
    this.autenticationService.getRole().then((rol) => {
      this.rol = rol;
      this.tercerosService.get('tipo_documento').subscribe(
        response => {
          this.tipoDocumento = response;
          this.construirForm();
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirForm();
      });
    })
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
    const IdSolicitud = sessionStorage.getItem('Solicitud');
    if (IdSolicitud !== undefined) {
      this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/solicitud/' + IdSolicitud).subscribe(
        (response: any) => {
          if (response.Response.Code === '200') {
            this.solicitudForm.btn = '';
            this.solicitudForm.campos[this.getIndexForm('FechaSolicitud')].valor =
              momentTimezone.tz(response.Response.Body[0].FechaSolicitud, 'America/Bogota').format('DD/MM/YYYY');
            this.solicitudForm.campos[this.getIndexForm('FechaExpedicionNuevo')].valor =
              momentTimezone.tz(response.Response.Body[0].FechaExpedicionNuevo, 'America/Bogota').format('YYYY-MM-DD');
            this.solicitudForm.campos[this.getIndexForm('FechaExpedicionNuevo')].deshabilitar = true;
            this.solicitudForm.campos[this.getIndexForm('TipoDocumentoActual')].valor = response.Response.Body[0].TipoDocumentoActual;
            this.solicitudForm.campos[this.getIndexForm('TipoDocumentoActual')].deshabilitar = true;
            this.solicitudForm.campos[this.getIndexForm('NumeroActual')].valor = response.Response.Body[0].NumeroActual;
            this.solicitudForm.campos[this.getIndexForm('NumeroActual')].deshabilitar = true;
            this.solicitudForm.campos[this.getIndexForm('FechaExpedicionActual')].valor =
              momentTimezone.tz(response.Response.Body[0].FechaExpedicionActual, 'America/Bogota').format('DD/MM/YYYY');
            this.solicitudForm.campos[this.getIndexForm('FechaExpedicionActual')].deshabilitar = true;
            this.solicitudForm.campos[this.getIndexForm('TipoDocumentoNuevo')].valor = response.Response.Body[0].TipoDocumentoNuevo;
            this.solicitudForm.campos[this.getIndexForm('TipoDocumentoNuevo')].deshabilitar = true;
            this.solicitudForm.campos[this.getIndexForm('NumeroNuevo')].valor = response.Response.Body[0].NumeroNuevo;
            this.solicitudForm.campos[this.getIndexForm('NumeroNuevo')].deshabilitar = true;
            this.solicitudForm.Documento = response.Response.Body[0].Documento;
            const files = []
            if (this.solicitudForm.Documento + '' !== '0') {
              files.push({ Id: this.solicitudForm.Documento, key: 'Documento' });
            }
            if (this.solicitudForm.Documento !== undefined && this.solicitudForm.Documento !== null && this.solicitudForm.Documento !== 0) {
              this.newNuxeoService.get(files)
                .subscribe((document: any) => {
                  this.SoporteDocumento = this.solicitudForm.Documento;
                  this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = document[0].url;
                  this.solicitudForm.campos[this.getIndexForm('Documento')].valor = document[0].url;
                  this.loading = false;
                },
                  (error: HttpErrorResponse) => {
                    this.loading = false;
                    this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
                  },
                )
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
    } else {
      this.loading = false;
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
    const IdSolcitud = sessionStorage.getItem('Solicitud');
    this.SoporteDocumento = [];
    this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/solicitud/' + IdSolcitud).subscribe(
      (response: any) => {
        if (response.Response.Code === '200') {
          this.solicitudForm.btn = '';
          this.solicitudForm.campos[this.getIndexForm('FechaExpedicionNuevo')].valor =
            momentTimezone.tz(response.Response.Body[0].FechaExpedicionNuevo, 'America/Bogota').format('YYYY-MM-DD');
          this.solicitudForm.campos[this.getIndexForm('FechaExpedicionNuevo')].deshabilitar = true;
          this.solicitudForm.campos[this.getIndexForm('TipoDocumentoNuevo')].valor = response.Response.Body[0].TipoDocumentoNuevo;
          this.solicitudForm.campos[this.getIndexForm('TipoDocumentoNuevo')].deshabilitar = true;
          this.solicitudForm.campos[this.getIndexForm('NumeroNuevo')].valor = response.Response.Body[0].NumeroNuevo;
          this.solicitudForm.campos[this.getIndexForm('NumeroNuevo')].deshabilitar = true;
          this.solicitudForm.campos[this.getIndexForm('Documento')].deshabilitar = true;
          this.solicitudForm.Documento = response.Response.Body[0].Documento;
          const files = []
          if (this.solicitudForm.Documento + '' !== '0') {
            files.push({ Id: this.solicitudForm.Documento, key: 'Documento' });
          }
          if (this.solicitudForm.Documento !== undefined && this.solicitudForm.Documento !== null && this.solicitudForm.Documento !== 0) {
            this.newNuxeoService.get(files)
              .subscribe((document: any) => {
                this.SoporteDocumento = this.solicitudForm.Documento;
                this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = document[0].url;
                this.solicitudForm.campos[this.getIndexForm('Documento')].valor = document[0].url;
                this.loading = false;
              },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
                },
              )
          }
        } else if (response.Response.Code === '404') {
          this.solicitudForm.campos[this.getIndexForm('FechaExpedicionNuevo')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('TipoDocumentoNuevo')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('NumeroNuevo')].deshabilitar = false;
          this.solicitudForm.campos[this.getIndexForm('Documento')].deshabilitar = false;
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
  }

  loadInfo() {
    this.loadInfoSolicitante();
    const TerceroId = parseInt(localStorage.getItem('persona_id'), 10)
    if (TerceroId !== undefined) {
      const hoy = new Date();
      this.solicitudForm.campos[this.getIndexForm('FechaSolicitud')].valor = hoy.getFullYear() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getDate();
      this.tercerosService.get('datos_identificacion?query=TerceroId:' + TerceroId + ',Activo:true').subscribe(
        (response: any) => {
          if (response[0] !== undefined && response[0] !== '') {
            this.solicitudForm.campos[this.getIndexForm('TipoDocumentoActual')].valor = response[0]['TipoDocumentoId'];
            this.solicitudForm.campos[this.getIndexForm('NumeroActual')].valor = response[0]['Numero'];
            if (response[0]['FechaExpedicion'] !== null) {
              response[0]['FechaExpedicion'] = response[0]['FechaExpedicion'].slice(0, response[0]['FechaExpedicion'].indexOf('T'))
              this.solicitudForm.campos[this.getIndexForm('FechaExpedicionActual')].valor =
                momentTimezone.tz(response[0]['FechaExpedicion'], 'America/Bogota').format('DD/MM/YYYY');
            }
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
        if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
          campo.label = this.translate.instant('solicitudes.' + campo.label_i18n)
        } if (this.rol.includes('ESTUDIANTE')) {
          campo.label_i18n = campo.label_i18n_estudiante;
        }
      }
      if (campo.etiqueta === 'select') {
        campo.opciones = this.tipoDocumento;
      }
      campo.label = this.translate.instant('solicitudes.' + campo.label_i18n);
    });
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
        .then(async (willDelete) => {
          this.loading = true;
          if (willDelete.value) {
            const files = [];
            const Solicitud: any = {};
            this.solicitudDatos = event.data.solicitudDatos;
            if (this.solicitudDatos['Documento'].file !== undefined) {
              files.push({
                nombre: await this.autenticationService.getMail(), key: 'Documento',
                file: this.solicitudDatos['Documento'].file,
                IdDocumento: 25,
              });
            }
            this.newNuxeoService.uploadFiles(files)
              .subscribe((data: any) => {
                if (data[0].Status === "200") {
                  this.solicitudDatos['Documento'] = data[0].res.Id
                }
                this.solicitudDatos.FechaExpedicionActual = momentTimezone.tz(
                  this.solicitudDatos.FechaExpedicionActual, 'DD/MM/YYYY', 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
                this.solicitudDatos.FechaExpedicionActual = this.solicitudDatos.FechaExpedicionActual + ' +0000 +0000';
                this.solicitudDatos.FechaExpedicionNuevo = momentTimezone.tz(
                  this.solicitudDatos.FechaExpedicionNuevo, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
                this.solicitudDatos.FechaExpedicionNuevo = this.solicitudDatos.FechaExpedicionNuevo + ' +0000 +0000';
                const hoy = new Date();
                this.solicitudDatos.FechaSolicitud = momentTimezone.tz(hoy.getFullYear() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getDate(),
                  'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
                this.solicitudDatos.FechaSolicitud = this.solicitudDatos.FechaSolicitud + ' +0000 +0000';
                Solicitud.Solicitud = this.solicitudDatos;
                if (this.modificado) {
                  Solicitud.SolicitudPadreId = sessionStorage.getItem('Solicitud')
                }
                Solicitud.Solicitante = parseInt(localStorage.getItem('persona_id'), 10);
                Solicitud.TipoSolicitud = 3;
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
                });
          }
        });
    }
  }

  habilitarRevision(event) {
    if (event.button === 'ButonEditar') {
      if (this.rol.includes('ADMIN_SGA') || this.rol.includes('ASISTENTE_ADMISIONES')) {
        this.Admin = true;
      } if (this.rol.includes('ESTUDIANTE')) {
        this.solicitudForm.campos[this.getIndexForm('FechaExpedicionNuevo')].deshabilitar = false;
        this.solicitudForm.campos[this.getIndexForm('TipoDocumentoNuevo')].deshabilitar = false;
        this.solicitudForm.campos[this.getIndexForm('NumeroNuevo')].deshabilitar = false;
        this.solicitudForm.campos[this.getIndexForm('Documento')].deshabilitar = false;
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
