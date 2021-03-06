import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
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

@Component({
  selector: 'actualizacion-nombres',
  templateUrl: './actualizacion-nombres.component.html',
  styleUrls: ['../solicitudes.component.scss']
})
export class ActualizacionNombresComponent implements OnInit {

  solicitante: Solicitante;
  solicitudForm: any;
  respuestaSolicitudForm: any;
  solicitudDatos: ActualizacionNombre;
  solicitudRespuesta: RespuestaSolicitud;
  filesUp: any; 
  SoporteDocumento: any; 
  rol: any;
  Admin: boolean = false;
  loading: boolean;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private tercerosService: TercerosService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sgaMidService: SgaMidService,
    private autenticationService: ImplicitAutenticationService,
    private dialogo: MatDialog,) {
    this.solicitudForm = ACTUALIZAR_NOMBRE;
    this.respuestaSolicitudForm = RESPUESTA_SOLICITUD;
    this.construirForm();
    this.loading = true;

    this.rol = this.autenticationService.getPayload().role;
    for (var i = 0; i < this.rol.length; i++){
      if(this.rol[i] === "ADMIN_CAMPUS" || this.rol[i] === "COORDINADOR" || this.rol[i] === "FUNCIONARIO"){
        this.Admin = true;
        this.loadInfoById();
        break;
      } else if (this.rol[i] === "ESTUDIANTE"){
        this.Admin = false;
        this.loadInfo();
        this.loadInfoNueva();
        break;
      }
    }

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  loadInfoById(){
    var IdSolicitud = sessionStorage.getItem("Solicitud")
    if (IdSolicitud != undefined){
      this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/solicitud/'+IdSolicitud).subscribe(
        (response: any) => {
          if (response.Response.Code === "200"){
            this.solicitudForm.btn = "";
            var date = moment(response.Response.Body[0].FechaExpedicionNuevo, "DD/MM/YYYY").toDate()
            this.solicitudForm.campos[this.getIndexForm('FechaSolicitud')].valor = momentTimezone.tz(response.Response.Body[0].FechaSolicitud, 'America/Bogota').format('DD/MM/YYYY');
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
              files.push({ Id: this.solicitudForm.Documento, key: 'Documento' });
            }
            if (this.solicitudForm.Documento !== undefined && this.solicitudForm.Documento !== null && this.solicitudForm.Documento !== 0){
              this.nuxeoService.getDocumentoById$(files, this.documentoService)
                .subscribe(res => {
                  const filesResponse = <any>res;
                  if (Object.keys(filesResponse).length === files.length) {
                    this.SoporteDocumento = this.solicitudForm.Documento;
                    this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = filesResponse['Documento'] + '';
                    this.solicitudForm.campos[this.getIndexForm('Documento')].valor = filesResponse['Documento'] + '';
                    this.loading = false;
                  }
                },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
                }
              );
            }
            this.loading = false;
          } else if (response.Response.Code === "404"){
            this.loading = false;
          } else if (response.Response.Code === "400"){
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            this.loading = false;
          }
        }, 
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        }       
      );
    }
  }
  
  ngOnInit() {
    this.solicitante = new Solicitante();
    this.solicitante.Carrera = "Ingenieria de Sistemas"
    this.solicitante.Codigo = "20111020005"
    this.solicitante.CorreoInstitucional = "correo@udistrital.edu.co"
    this.solicitante.CorreoPersonal = "correo@gmail.com"
    this.solicitante.Nombre = "Nombre de prueba"
    this.solicitante.Telefono = "+57 000-000-0000"
  }

  enviarRespuesta(event) {
    this.loading = true;
    this.solicitudRespuesta = new RespuestaSolicitud();
    this.solicitudRespuesta.SolicitudId = parseInt(sessionStorage.getItem('Solicitud'));
    this.solicitudRespuesta.Observacion = this.respuestaSolicitudForm.campos[this.getIndexForm('Observacion')].valor;
    if (this.respuestaSolicitudForm.campos[1].valor === ""){
      this.respuestaSolicitudForm.campos[1].valor = false;
    }
    this.solicitudRespuesta.Aprobado = this.respuestaSolicitudForm.campos[1].valor;
    this.sgaMidService.post('solicitud_evaluacion/registrar_evolucion', this.solicitudRespuesta).subscribe(
      (response: any) => {
        if (response.Response.Code === "200") {
          this.loading = false;
          this.loadInfoById();
          this.popUpManager.showSuccessAlert(this.translate.instant('solicitudes.respuesta'));
        } else if (response.Response.Code === "400") {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('solicitudes.error'));
        }
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  construirForm() {
    this.solicitudForm.titulo = this.translate.instant('solicitudes.solicitud_encabezado');
    this.respuestaSolicitudForm.titulo = this.translate.instant('solicitudes.solicitud_respuesta');
    this.solicitudForm.campos.forEach(campo => {
      if (campo.etiqueta === 'button') {
        campo.info = this.translate.instant('solicitudes.' + campo.label_i18n)
      }
      campo.label = this.translate.instant('solicitudes.' + campo.label_i18n);
    })
    this.respuestaSolicitudForm.campos.forEach(campo => {
      campo.label = this.translate.instant('solicitudes.' + campo.label_i18n);
    })
  }

  loadInfoNueva(){
    var IdPersona = localStorage.getItem('persona_id');
    this.SoporteDocumento = [];
    this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/'+IdPersona+'/16').subscribe(
      (response: any) => {
        if (response.Response.Code === "200"){
          this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].valor = response.Response.Body[0].NombreNuevo;
          this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].deshabilitar = true;  
          this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].valor = response.Response.Body[0].ApellidoNuevo;
          this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = true; 
          this.solicitudForm.Documento = response.Response.Body[0].Documento;
          const files = []
          if (this.solicitudForm.Documento + '' !== '0') {
            files.push({ Id: this.solicitudForm.Documento, key: 'Documento' });
          }
          if (this.solicitudForm.Documento !== undefined && this.solicitudForm.Documento !== null && this.solicitudForm.Documento !== 0){
            this.nuxeoService.getDocumentoById$(files, this.documentoService)
              .subscribe(res => {
                const filesResponse = <any>res;
                if (Object.keys(filesResponse).length === files.length) {
                  this.SoporteDocumento = this.solicitudForm.Documento;
                  this.solicitudForm.btn = "";
                  this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = filesResponse['Documento'] + '';
                  this.solicitudForm.campos[this.getIndexForm('Documento')].valor = filesResponse['Documento'] + '';
                  this.loading = false;
                }
              },
              (error: HttpErrorResponse) => {
                this.loading = false;
                this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
              }
            );
          }
        } else if (response.Response.Code === "404"){
          this.sgaMidService.get('solicitud_evaluacion/consultar_solicitud/'+IdPersona+'/18').subscribe(
            (response: any) => {
              if (response.Response.Code === "200"){
                this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].valor = response.Response.Body[0].NombreNuevo;
                this.solicitudForm.campos[this.getIndexForm('NombreNuevo')].deshabilitar = true;  
                this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].valor = response.Response.Body[0].ApellidoNuevo;
                this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = true; 
                this.solicitudForm.Documento = response.Response.Body[0].Documento;
                const files = []
                if (this.solicitudForm.Documento + '' !== '0') {
                  files.push({ Id: this.solicitudForm.Documento, key: 'Documento' });
                }
                if (this.solicitudForm.Documento !== undefined && this.solicitudForm.Documento !== null && this.solicitudForm.Documento !== 0){
                  this.nuxeoService.getDocumentoById$(files, this.documentoService)
                    .subscribe(res => {
                      const filesResponse = <any>res;
                      if (Object.keys(filesResponse).length === files.length) {
                        this.SoporteDocumento = this.solicitudForm.Documento;
                        this.solicitudForm.btn = "";
                        this.solicitudForm.campos[this.getIndexForm('Documento')].urlTemp = filesResponse['Documento'] + '';
                        this.solicitudForm.campos[this.getIndexForm('Documento')].valor = filesResponse['Documento'] + '';
                      }
                      this.loading = false;
                    },
                    (error: HttpErrorResponse) => {
                      this.loading = false;
                      this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
                    }
                  );
                } else {
                  this.loading = false;
                }
              } else if (response.Response.Code === "404"){
                this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = false;
                this.solicitudForm.campos[this.getIndexForm('ApellidoNuevo')].deshabilitar = false;
                this.loading = false;
              } else{
                this.loading = false;
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              }
            },
            error => {
              this.loading = false;
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            }
          );
        } else{
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
      },
      error => {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  loadInfo(){
    var TerceroId = parseInt(localStorage.getItem('persona_id'))
    if (TerceroId != undefined){
      var hoy = new Date();
      this.solicitudForm.campos[this.getIndexForm('FechaSolicitud')].valor = hoy.getFullYear()+"/"+(hoy.getMonth()+1)+"/"+hoy.getDate();
      this.tercerosService.get('tercero/'+TerceroId).subscribe(
        (response: any) => {
          if (response !== undefined && response !== ""){
            this.solicitudForm.campos[this.getIndexForm('NombreActual')].valor = response["PrimerNombre"] + " " + response["SegundoNombre"]
            this.solicitudForm.campos[this.getIndexForm('ApellidoActual')].valor = response["PrimerApellido"] + " " + response["SegundoApellido"];
          }
        }, 
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
      );
    }
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

  enviarSolicitud(event) {
    if (event.valid){
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
            var Solicitud: any = {};
            this.solicitudDatos = event.data;
            if (this.solicitudDatos["Documento"].file !== undefined) {
              files.push({
                nombre: this.autenticationService.getPayload().sub, key: 'Documento',
                file: this.solicitudDatos["Documento"].file , IdDocumento: 25
              });
            }
            this.nuxeoService.getDocumentos$(files, this.documentoService)
              .subscribe(response => {
                if (Object.keys(response).length === files.length) {
                  this.filesUp = <any>response;
                  if (this.filesUp['Documento'] !== undefined) {
                    this.solicitudDatos["Documento"] = this.filesUp['Documento'].Id;
                  }
                }
                this.solicitudDatos.FechaSolicitud = momentTimezone.tz(this.solicitudDatos.FechaSolicitud, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
                this.solicitudDatos.FechaSolicitud = this.solicitudDatos.FechaSolicitud + ' +0000 +0000';
                Solicitud.Solicitud = this.solicitudDatos;
                Solicitud.Solicitante = parseInt(localStorage.getItem('persona_id'))
                Solicitud.TipoSolicitud = 4;
                this.sgaMidService.post('solicitud_evaluacion/registrar_solicitud', Solicitud).subscribe(
                  (res: any) => {
                    if(res.Response.Code === "200"){
                      //Funcion get
                      this.loading = false;
                      this.popUpManager.showSuccessAlert(this.translate.instant('solicitudes.crear_exito'));
                    } else {
                      this.loading = false;
                      this.popUpManager.showErrorToast(this.translate.instant('solicitudes.crear_error'));
                    }
                  },
                  (error: HttpErrorResponse) => {
                    this.loading = false;
                    Swal.fire({
                      icon:'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      footer: this.translate.instant('informacion_academica.documento_informacion_academica_no_registrado'),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                  }
                );
              }, 
              (error: HttpErrorResponse) => {
                this.loading = false;
                Swal.fire({
                  icon:'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('informacion_academica.documento_informacion_academica_no_registrado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              }
            );
          }
        }
      );
    }
  }

}
