import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import Swal from 'sweetalert2';
import { Docente } from '../../../@core/data/models/practicas_academicas/docente';
import * as momentTimezone from 'moment-timezone';
import * as moment from 'moment';
import { PopUpManager } from '../../../managers/popUpManager';
import { FORM_SOLICITUD_PRACTICAS, FORM_RESPUESTA_SOLICITUD, FORM_DOCUMENTOS_ADICIONALES_LEGALIZACION } from '../form-solicitud-practica';
import { PracticasAcademicasService } from '../../../@core/data/practicas_academicas.service';
import { UserService } from '../../../@core/data/users.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'ngx-detalle-practica-academica',
  templateUrl: './detalle-practica-academica.component.html',
  styleUrls: ['./detalle-practica-academica.component.scss'],
})
export class DetallePracticaAcademicaComponent implements OnInit {

  InfoDocentes: Array<Docente> = [];
  InfoPracticasAcademicas: any;
  InfoPersona: any = {}
  InfoRespuesta: any;
  formDocente: FormGroup;
  FormPracticasAcademicas: any;
  formDocumentosAdicionalesLegalizacion: any;
  formRespuestaSolicitud: any;
  periodos: any[];
  files: any = [];
  proyectos: any[];
  estadosList: any = [];
  estado: any;
  idPractica: any;
  fechaRadicado: any;
  espaciosAcademicos: any;
  tiposVehiculo: any;
  Legalizacion: any;
  process: string;
  estadosSolicitud: any;
  sub: any;
  tablaEstados: any;
  loading: boolean;

  constructor(
    private builder: FormBuilder,
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private popUpManager: PopUpManager,
    private nuxeo: NewNuxeoService,
    private userService: UserService,
    private practicasService: PracticasAcademicasService,
    private _Activatedroute: ActivatedRoute) {

    this.loading = true;

    this.formDocente = this.builder.group({
      NombreDocente: [{ value: '', disabled: true }],
      NumeroDocumento: [{ value: '', disabled: true }],
      EstadoDocente: [{ value: '', disabled: true }],
    });

    this.FormPracticasAcademicas = FORM_SOLICITUD_PRACTICAS;
    this.formDocumentosAdicionalesLegalizacion = FORM_DOCUMENTOS_ADICIONALES_LEGALIZACION;
    this.formRespuestaSolicitud = FORM_RESPUESTA_SOLICITUD;
    this.construirForm();
    this.crearTabla();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.inicializiarDatos();
      this.crearTabla();
      this.construirForm();
    });
  }

  ngOnInit() {
    this.loadData().then(aux => {

      this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
        const { process, id } = params.params;
        this.idPractica = id;

        this.sgamidService.get('practicas_academicas/' + id).subscribe(practica => {
          const r = <any>practica;
          if (practica !== null && r.Type !== 'error') {
            if (r.Status === '200' && practica['Data'] !== null) {
              this.InfoPracticasAcademicas = practica["Data"];
              this.InfoPracticasAcademicas.FechaHoraRegreso = this.InfoPracticasAcademicas.FechaHoraRegreso.slice(0, -4);
              this.InfoPracticasAcademicas.FechaHoraSalida = this.InfoPracticasAcademicas.FechaHoraSalida.slice(0, -4);

              this.fechaRadicado = moment(this.InfoPracticasAcademicas.FechaRadicado, 'YYYY-MM-DD').format('DD/MM/YYYY');
              this.estado = this.InfoPracticasAcademicas.EstadoTipoSolicitudId.EstadoId.Nombre;

              let aux = [];
              aux.push(this.InfoPracticasAcademicas.DocenteSolicitante);
              this.InfoPracticasAcademicas.DocentesInvitados.forEach(docente => {
                aux.push(docente);
              });
              this.InfoDocentes = aux;
              this.estadosSolicitud = practica["Data"].Estados;
              // this.estadosSolicitud.forEach(estado => {
              //   if (estado.Activo) {
              //     this.InfoPersona = { ...this.InfoPersona, Comentario: estado.Comentario, Estado: estado.EstadoTipoSolicitudId.EstadoId };
              //   }
              // });

              this.inicializiarDatos();
              this.loading = false;
            }
          }
        });
        this.process = atob(process);
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.FormPracticasAcademicas.campos.length; index++) {
      const element = this.FormPracticasAcademicas.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      this.sgamidService.get('practicas_academicas/consultar_parametros/')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Type !== 'error') {
            if (r.Status === '200' && res['Data'] !== null) {
              this.periodos = res['Data']['periodos'];
              this.proyectos = res['Data']['proyectos'];
              this.tiposVehiculo = res['Data']['vehiculos'];
              this.espaciosAcademicos = [{ Nombre: '123 - Calculo Integral', Id: 1 }];
              res['Data']['estados'].forEach(estado => {
                if (estado['Nombre'] !== 'Radicada' && estado['Nombre'] !== 'Ejecutada' && estado['Nombre'] !== 'Rectificar') {
                  this.estadosList.push(estado);
                }
              });

              this.FormPracticasAcademicas.campos[this.getIndexForm('Periodo')].opciones = this.periodos;
              this.FormPracticasAcademicas.campos[this.getIndexForm('Periodo')].valor = this.periodos[0];
              this.FormPracticasAcademicas.campos[this.getIndexForm('Periodo')].deshabilitar = true;

              this.FormPracticasAcademicas.campos[this.getIndexForm('EspacioAcademico')].opciones = this.espaciosAcademicos;
              this.FormPracticasAcademicas.campos[this.getIndexForm('EspacioAcademico')].valor = this.espaciosAcademicos[0];

              this.FormPracticasAcademicas.campos[this.getIndexForm('Proyecto')].opciones = this.proyectos;
              this.FormPracticasAcademicas.campos[this.getIndexForm('TipoVehiculo')].opciones = this.tiposVehiculo;

              resolve(true);
            }
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
            reject(false);
          });
    });
  }

  inicializiarDatos() {
    this.files = [];
    this.InfoPracticasAcademicas.Documentos.forEach(documento => {
      documento.id = documento.Id;
      switch (documento.Nombre) {
        case "Cronograma":
          documento.label = this.translate.instant('practicas_academicas.' + 'cronograma_practica');
          break;
        case "Presupuesto":
          documento.label = this.translate.instant('practicas_academicas.' + 'presupuesto_practica');
          break;
        case "Presentacion":
          documento.label = this.translate.instant('practicas_academicas.' + 'presentacion_practica');
          break;
        case "ListaEstudiantes":
          documento.label = this.translate.instant('practicas_academicas.' + 'lista_estudiantes');
          break;
        case "GuiaPractica":
          documento.label = this.translate.instant('practicas_academicas.' + 'guia_practica');
          break;
        case "ListaPersonalApoyo":
          documento.label = this.translate.instant('practicas_academicas.' + 'lista_personal_apoyo');
          break;
        case "InformacionAsistente":
          documento.label = this.translate.instant('practicas_academicas.' + 'info_asistencia_practica');
          break;
        case "ActaCompromiso":
          documento.label = this.translate.instant('practicas_academicas.' + 'acta_compromiso');
          break;
        case "InformePractica":
          documento.label = this.translate.instant('practicas_academicas.' + 'informe_practica');
          break;
        case "CumplidoPractica":
          documento.label = this.translate.instant('practicas_academicas.' + 'cumplido_practica');
          break;
      }
      this.files.push(documento);
    });

    this.userService.tercero$.subscribe((user: any) => {
      this.InfoPersona = { ...this.InfoPersona, Nombre: user.NombreCompleto, FechaRespuesta: new Date(), IdTercero: user.Id };
    })
  }

  construirForm() {
    this.FormPracticasAcademicas.titulo = this.translate.instant('practicas_academicas.datos');
    this.FormPracticasAcademicas.btn = ''
    this.FormPracticasAcademicas.campos.forEach(campo => {
      if (campo.etiqueta === 'select') {
        switch (campo.nombre) {
          case 'Periodo':
            campo.opciones = this.periodos;
            break;
          case 'Proyecto':
            campo.opciones = this.proyectos;
            break;
          case 'EspacioAcademico':
            campo.opciones = this.espaciosAcademicos;
            break;
          case 'TipoVehiculo':
            campo.opciones = this.tiposVehiculo;
            break;
        }
      }
      campo.label = this.translate.instant('practicas_academicas.' + campo.label_i18n);
      campo.deshabilitar = true;
    });

    this.formDocumentosAdicionalesLegalizacion.campos.forEach(element => {
      element.label = this.translate.instant('practicas_academicas.' + element.label_i18n);
      element.placeholder = this.translate.instant('practicas_academicas.' + element.placeholder_i18n);
    });

    this.formRespuestaSolicitud.campos.forEach(element => {
      element.label = this.translate.instant('practicas_academicas.' + element.label_i18n);
      if (element.etiqueta === 'select') {
        switch (element.nombre) {
          case 'Estado':
            element.opciones = this.estadosList;
            break;
        }
      }
    });

  }

  verEstado(event) {
    const opt: any = {
      title: this.translate.instant("GLOBAL.estado"),
      html: `<span>${moment(event.data.FechaCreacion, 'YYYY-MM-DD').format('DD/MM/YYYY')}</span><br>
                <span>${this.InfoPracticasAcademicas.EstadoTipoSolicitudId.EstadoId.Nombre}</span><br>
                <span class="form-control">${event.data.Comentario}</span><br>`,
      icon: "info",
      // buttons: true,
      // dangerMode: true,
      showCancelButton: true
    };
    Swal.fire(opt)
      .then((result) => {
        if (result) {
        }
      })
  }

  enviarInvitacion(event) {
    this.loading = true;

    this.sgamidService.post('practicas_academicas/enviar_invitacion/', this.InfoPracticasAcademicas).subscribe(res => {
      const r = <any>res["Response"];
      if (r !== null && r.Type !== 'error') {
        if (r.Code === '200' && r["Data"] !== null) {
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('practicas_academicas.invitaciones_enviadas'));
        }
      } else {
        this.loading = false;
        this.popUpManager.showErrorAlert(this.translate.instant('practicas_academicas.invitaciones_no_enviadas'));
      }
    }, (error: HttpErrorResponse) => {
      this.loading = false;
      Swal.fire({
        icon: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        footer: this.translate.instant('practicas_academicas.enviar_invitacion') + '-' +
          this.translate.instant('GLOBAL.invitaciones_no_enviadas'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

  async enviarSolicitud(event) {
    if (event.valid) {
      if (event.nombre === "RESPUESTA_SOLICITUD") {
        this.InfoRespuesta = event.data.documental;
        this.InfoRespuesta.FechaRespuesta = momentTimezone.tz(event.data.documental.FechaRespuesta, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';
        this.InfoRespuesta.EstadoTipoSolicitudIdAnterior = this.InfoPracticasAcademicas.EstadoTipoSolicitudId;
        this.loading = true;
        this.sgamidService.put('practicas_academicas/' + this.idPractica, this.InfoRespuesta).subscribe(res => {
          const r = <any>res["Response"]['Body'][0];
          if (r !== null && r.Type !== 'error') {
            if (r.Status === '200' && r["Data"] !== null) {
              this.ngOnInit();
              this.formRespuestaSolicitud.campos.forEach(campo => {
                campo.deshabilitar = true;
              });
              this.practicasService.clearCache();
              this.loading = false;
              this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_estado') + ' ' +
                this.translate.instant('GLOBAL.confirmarActualizar'));
            }
          } else {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_practicas_academicas'));
          }
        }, (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.crear') + '-' +
              this.translate.instant('GLOBAL.info_practicas_academicas'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });

      }
    }
  }

  crearTabla() {
    this.tablaEstados = {
      columns: {
        EstadoTipoSolicitudId: {
          title: this.translate.instant('solicitudes.estado'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.EstadoId.Nombre;
          },
          editable: false,
        },
        FechaCreacion: {
          title: this.translate.instant('solicitudes.fecha'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return moment(value, 'YYYY-MM-DD').format('DD/MM/YYYY');
          },
          editable: false,
        },
        Comentario: {
          title: this.translate.instant('solicitudes.observaciones'),
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',
      hideSubHeader: true,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'view',
            title:
              '<i class="nb-search" title="' +
              this.translate.instant('practicas_academicas.tooltip_ver_registro') +
              '"></i>',
          },
        ],
      },
      noDataMessage: this.translate.instant('practicas_academicas.no_data'),
    };
  }

  changeLoading(event) {
    this.loading = event;
  }

  async enviarLegalizacion(event) {
    let files: Array<any> = [];
    this.Legalizacion = event.data.documental;
    for (const key in this.Legalizacion) {
      if (Object.prototype.hasOwnProperty.call(this.Legalizacion, key)) {
        const element = this.Legalizacion[key];
        if (typeof element.file !== 'undefined' && element.file !== null) {
          this.loading = true;
          const file = {
            file: await this.nuxeo.fileToBase64(element.file),
            IdTipoDocumento: element.IdDocumento,
            metadatos: {
              NombreArchivo: element.nombre,
              Tipo: "Archivo",
              Observaciones: element.nombre,
              "dc:title": element.nombre,
            },
            descripcion: element.nombre,
            nombre: element.nombre,
            key: 'Documento',
          }
          files.push(file);
        }
      }
    }
    // console.log(files, this.InfoPracticasAcademicas)
    this.InfoPracticasAcademicas.Documentos = files

    this.InfoPracticasAcademicas.FechaHoraRegreso = momentTimezone.tz(this.InfoPracticasAcademicas.FechaHoraRegreso, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';
    this.InfoPracticasAcademicas.FechaHoraSalida = momentTimezone.tz(this.InfoPracticasAcademicas.FechaHoraSalida, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';
    const hoy = new Date();
    this.InfoPracticasAcademicas.FechaRadicacion = momentTimezone.tz(hoy.getFullYear() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getDate(),
      'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
    this.InfoPracticasAcademicas.FechaRadicacion = this.InfoPracticasAcademicas.FechaRadicacion + ' +0000 +0000';

    this.InfoPracticasAcademicas.EstadoTipoSolicitudIdAnterior = this.InfoPracticasAcademicas.EstadoTipoSolicitudId;
    this.InfoPracticasAcademicas.Estado = { Id: 23 };
    this.InfoPracticasAcademicas.IdTercero = this.InfoPersona.IdTercero;
    this.InfoPracticasAcademicas.FechaRespuesta = momentTimezone.tz(event.data.documental.FechaRespuesta, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';
    this.InfoPracticasAcademicas.Comentario = '';
    this.InfoPracticasAcademicas.Estados = [];

    this.sgamidService.put('practicas_academicas', this.InfoPracticasAcademicas).subscribe(res => {
      const r = <any>res["Response"]['Body'][0];
      if (r !== null && r.Type !== 'error') {
        if (r.Status === '200' && r["Data"] !== null) {
          this.ngOnInit();
          this.FormPracticasAcademicas.campos.forEach(campo => {
            campo.deshabilitar = true;
          });
          this.formDocumentosAdicionalesLegalizacion.campos.forEach(campo => {
            campo.deshabilitar = true;
          });
          this.practicasService.clearCache();
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_estado') + ' ' +
            this.translate.instant('GLOBAL.confirmarActualizar'));
        }
      } else {
        this.loading = false;
        this.popUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_practicas_academicas'));
      }
    }, (error: HttpErrorResponse) => {
      Swal.fire({
        icon: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        footer: this.translate.instant('GLOBAL.crear') + '-' +
          this.translate.instant('GLOBAL.info_practicas_academicas'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

}
