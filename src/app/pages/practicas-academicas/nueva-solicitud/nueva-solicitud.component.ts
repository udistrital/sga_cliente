import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FORM_SOLICITUD_PRACTICAS, FORM_SOPORTES_DOCUMENTALES } from '../form-solicitud-practica';
import { Docente } from '../../../@core/data/models/practicas_academicas/docente';
import { SolicitudPracticaAcademica } from '../../../@core/data/models/practicas_academicas/solicitud_practica_academica';
import { PopUpManager } from '../../../managers/popUpManager';
import * as momentTimezone from 'moment-timezone';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';


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
  NuevaSolicitud: SolicitudPracticaAcademica;

  FormPracticasAcademicas: any;
  FormSoporteDocumentales: any;
  periodos: any[];
  proyectos: any[];
  espaciosAcademicos: any[];
  tiposVehiculo: any[];
  limpiar: boolean = true;
  loading: boolean;
  llenarDocumentos: boolean = false;

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private popUpManager: PopUpManager,
    private nuxeo: NewNuxeoService,
    private sgamidService: SgaMidService,
  ) {
    this.FormSoporteDocumentales = FORM_SOPORTES_DOCUMENTALES;
    this.FormPracticasAcademicas = FORM_SOLICITUD_PRACTICAS;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadData();
  }

  ngOnInit() {
    this.loading = true;
    this.construirForm();
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

  loadData(): void {
    this.sgamidService.get('practicas_academicas/consultar_parametros/').subscribe(res => {
      const r = <any>res;
      if (res !== null && r.Type !== 'error') {
        if (r.Status === '200' && res['Data'] !== null) {
          this.periodos = res['Data']['periodos'];
          this.proyectos = res['Data']['proyectos'];
          this.tiposVehiculo = res['Data']['vehiculos'];

          this.FormPracticasAcademicas.campos[this.getIndexForm('Periodo')].opciones = this.periodos;
          this.FormPracticasAcademicas.campos[this.getIndexForm('Periodo')].valor = this.periodos[0];
          this.FormPracticasAcademicas.campos[this.getIndexForm('Periodo')].deshabilitar = true;

          this.FormPracticasAcademicas.campos[this.getIndexForm('Proyecto')].opciones = this.proyectos;
          this.FormPracticasAcademicas.campos[this.getIndexForm('TipoVehiculo')].opciones = this.tiposVehiculo;
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
    this.InfoPracticasAcademicas = event.data.InfoPracticasAcademicas
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
        this.llenarDocumentos = true;
      }
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
      const hoy = new Date();
      this.NuevaSolicitud.FechaRadicacion = momentTimezone.tz(hoy.getFullYear() + '/' + (hoy.getMonth() + 1) + '/' + hoy.getDate(),
        'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
      this.NuevaSolicitud.FechaRadicacion = this.NuevaSolicitud.FechaRadicacion + ' +0000 +0000';

      this.sgamidService.post('practicas_academicas/', this.NuevaSolicitud).subscribe(res => {
        const r = <any>res
        if (r !== null && r.Response.Type !== 'error') {
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_estado') + ' ' +
            this.translate.instant('GLOBAL.confirmarCrear'));
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
}
