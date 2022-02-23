import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FORM_SOLICITUD_PRACTICAS, FORM_SOPORTES_DOCUMENTALES } from '../form-solicitud-practica';
import { Docente } from '../../../@core/data/models/practicas_academicas/docente';
import { SolicitudPracticaAcademica } from '../../../@core/data/models/practicas_academicas/solicitud_practica_academica';
import { PopUpManager } from '../../../managers/popUpManager';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { PracticasAcademicasService } from '../../../@core/data/practicas_academicas.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { Location } from '@angular/common';


@Component({
  selector: 'ngx-nueva-solicitud',
  templateUrl: './nueva-solicitud.component.html',
  styleUrls: ['../practicas-academicas.component.scss'],
})
export class NuevaSolicitudComponent implements OnInit {

  info_persona_id: number;
  InfoPracticasAcademicas: any;
  InfoDocumentos: any;
  InfoDocentes: Array<Docente>;
  NuevaSolicitud: any;
  FormPracticasAcademicas: any;
  FormSoporteDocumentales: any;
  periodos: any[];
  proyectos: any[];
  espaciosAcademicos: any[];
  tiposVehiculo: any[];
  limpiar: boolean = true;
  loading: boolean;
  llenarDocumentos: boolean = false;
  sub: any;
  idPractica: any;
  process: string;
  estado: any;
  estadosSolicitud: any;
  fechaRadicado: any;
  tablaEstados: any;

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private popUpManager: PopUpManager,
    private nuxeo: NewNuxeoService,
    private practicasService: PracticasAcademicasService,
    private _Activatedroute: ActivatedRoute,
    private location: Location,
    private router: Router,
    private sgamidService: SgaMidService,
  ) {
    this.FormSoporteDocumentales = FORM_SOPORTES_DOCUMENTALES;
    this.FormPracticasAcademicas = FORM_SOLICITUD_PRACTICAS;

    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    // this.loadData();
  }

  ngOnInit() {
    this.loading = true;
    this.construirForm();

    this.loadData().then(aux => {
      this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
        const { process, id } = params.params;
        this.idPractica = id;

        if (id) {
          // this.llenarDocumentos = true;
          // this.FormPracticasAcademicas.btn = null;

          this.process = atob(process);
          if (this.process == 'process') {
            this.sgamidService.get('practicas_academicas/' + id).subscribe(async practica => {
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
                  let docs = await this.cargarDocs(this.InfoPracticasAcademicas.Documentos);
                  // this.loading = false;
                }
              }
            });

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
        } else {
          this.InfoDocentes = [];
        }
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  cargarDocs(files) {
    return new Promise((resolve, reject) => {

      this.loading = true;
      files.forEach(documento => {
        this.nuxeo.getByUUID(documento.Enlace).subscribe(res => {
          switch (documento.Nombre) {
            case "Cronograma":
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('Cronograma')].valor = res;
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('Cronograma')].urlTemp = res;
              break;
            case "Presupuesto":
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('Presupuesto')].valor = res;
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('Presupuesto')].urlTemp = res;
              break;
            case "Presentacion":
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('Presentacion')].valor = res;
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('Presentacion')].urlTemp = res;
              break;
            case "ListaEstudiantes":
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('ListaEstudiantes')].valor = res;
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('ListaEstudiantes')].urlTemp = res;
              break;
            case "GuiaPractica":
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('GuiaPractica')].valor = res;
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('GuiaPractica')].urlTemp = res;
              break;
            case "ListaPersonalApoyo":
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('ListaPersonalApoyo')].valor = res;
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('ListaPersonalApoyo')].urlTemp = res;
              break;
            case "InformacionAsistente":
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('InformacionAsistente')].valor = res;
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('InformacionAsistente')].urlTemp = res;
              break;
            case "ActaCompromiso":
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('ActaCompromiso')].valor = res;
              this.FormSoporteDocumentales.campos[this.getIndexFormDoc('ActaCompromiso')].urlTemp = res;
              break;
          }
        })

      });
      this.loading = false;

      resolve(true);
    });
  }

  getIndexFormDoc(nombre: String): number {
    for (let index = 0; index < this.FormSoporteDocumentales.campos.length; index++) {
      const element = this.FormSoporteDocumentales.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.FormPracticasAcademicas.campos.length; index++) {
      const element = this.FormPracticasAcademicas.campos[index];
      if (element.nombre === nombre) {
        return index
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

  construirForm() {
    this.info_persona_id = this.userService.getPersonaId();
    this.FormPracticasAcademicas.titulo = this.translate.instant('practicas_academicas.datos');
    this.FormPracticasAcademicas.btn = this.translate.instant('proyecto.siguiente')
    for (let i = 0; i < this.FormPracticasAcademicas.campos.length; i++) {
      this.FormPracticasAcademicas.campos[i].label = this.translate.instant('practicas_academicas.' + this.FormPracticasAcademicas.campos[i].label_i18n);
      this.FormPracticasAcademicas.campos[i].placeholder = this.translate.instant('practicas_academicas.placeholder_' + this.FormPracticasAcademicas.campos[i].label_i18n);
      this.FormPracticasAcademicas.campos[i].deshabilitar = false;
    }

    this.FormSoporteDocumentales.titulo = this.translate.instant('practicas_academicas.datos');
    this.FormSoporteDocumentales.btn = this.translate.instant('solicitudes.enviar')

    this.FormSoporteDocumentales.campos = this.FormSoporteDocumentales.campos.map(campo => {
      return {
        ...campo,
        ...{
          label: this.translate.instant('practicas_academicas.' + campo.label_i18n),
          deshabilitar: false,
        }
      }
    });
  }

  async enviarSolicitud(event) {
    this.InfoPracticasAcademicas = event.data.InfoPracticasAcademicas;
    if (event.valid) {
      if (event.nombre === "SOLICITUD_PRACTICAS") {
        this.NuevaSolicitud = <SolicitudPracticaAcademica>event.data.InfoPracticasAcademicas;
        let docenteAux: Array<Docente> = [];
        this.InfoDocentes.forEach(docente => {
          if (docente['PuedeBorrar']) {
            docenteAux.push(docente);
          } else {
            this.NuevaSolicitud.SolicitanteId = docente.Id;
            this.NuevaSolicitud.DocenteSolicitante = docente;
          }
        });

        this.NuevaSolicitud.DocentesInvitados = docenteAux;
        this.FormPracticasAcademicas.btn = null;
        this.llenarDocumentos = true;
      }

      if (event.nombre === "SOPORTES_DOCUMENTALES") {

        let files: Array<any> = [];
        this.InfoDocumentos = event.data.documental;
        for (const key in this.InfoDocumentos) {
          if (Object.prototype.hasOwnProperty.call(this.InfoDocumentos, key)) {
            const element = this.InfoDocumentos[key];
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
        this.NuevaSolicitud.Documentos = files

        this.NuevaSolicitud.FechaHoraRegreso = momentTimezone.tz(this.NuevaSolicitud.FechaHoraRegreso, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';
        this.NuevaSolicitud.FechaHoraSalida = momentTimezone.tz(this.NuevaSolicitud.FechaHoraSalida, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';

        const fecha = new Date();
        this.NuevaSolicitud.FechaRadicacion = moment(`${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');

        if (this.idPractica) {
          this.NuevaSolicitud.EstadoTipoSolicitudIdAnterior = { Id: 35 };
          this.NuevaSolicitud.Estado = { Id: 17 };
          this.NuevaSolicitud.IdTercero = this.NuevaSolicitud.DocenteSolicitante.Id;
          this.NuevaSolicitud.FechaRespuesta = momentTimezone.tz(event.data.documental.FechaRespuesta, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';
          this.NuevaSolicitud.Comentario = '';
          this.NuevaSolicitud.Estados = [];

          this.sgamidService.put('practicas_academicas', this.NuevaSolicitud).subscribe(res => {
            const r = <any>res["Response"]['Body'][0];
            if (r !== null && r.Type !== 'error') {
              if (r.Status === '200' && r["Data"] !== null) {
                this.ngOnInit();
                this.FormPracticasAcademicas.campos.forEach(campo => {
                  campo.deshabilitar = true;
                });
                this.FormSoporteDocumentales.campos.forEach(campo => {
                  campo.deshabilitar = true;
                });
                this.practicasService.clearCache();
                this.loading = false;
                this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_estado') + ' ' +
                  this.translate.instant('GLOBAL.confirmarActualizar'));
                this.router.navigate([`pages/practicas-academicas/lista-practicas/${btoa('process')}`]);
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
        } else {
          this.sgamidService.post('practicas_academicas/', this.NuevaSolicitud).subscribe(res => {
            const r = <any>res
            if (r !== null && r.Response.Type !== 'error') {
              this.loading = false;
              this.practicasService.clearCache();
              this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_estado') + ' ' +
                this.translate.instant('practicas_academicas.solicitud_creada') + res.Response.Body[0].Solicitud.Id);
              this.router.navigate([`pages/practicas-academicas/lista-practicas/${btoa('process')}`]);
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

  getSeleccion(event) {
    this.changeLoading(true);
    if (event.nombre === 'Proyecto') {

      // this.sgamidService.get('practicas_academicas/consultar_espacios_academicos/' + this.info_persona_id).subscribe(res => {
      //   const r = <any>res;
      //   if (res !== null && r.Type !== 'error') {
      //     if (r.Status === '200' && res['Data'] !== null) {
      //       this.espaciosAcademicos = res['Data'];

      //       this.FormPracticasAcademicas.campos[this.getIndexForm('EspacioAcademico')].opciones = this.espaciosAcademicos;
      //     }
      //   }
      // },
      //   (error: HttpErrorResponse) => {
      //     Swal.fire({
      //       icon: 'error',
      //       title: error.status + '',
      //       text: this.translate.instant('ERROR.' + error.status),
      //       confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      //     });
      //   });

      this.espaciosAcademicos = [{ Nombre: '123 - Calculo Integral', Id: 1 }];
      this.FormPracticasAcademicas.campos[this.getIndexForm('EspacioAcademico')].opciones = this.espaciosAcademicos;

    }

    this.changeLoading(false);
  }

  changeLoading(event) {
    this.loading = event;
  }

  loadDocentes(event) {
    this.InfoDocentes = event;
  }

  goback() {
    this.location.back();
  }
}
