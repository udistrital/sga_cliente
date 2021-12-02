import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import Swal from 'sweetalert2';
import { Docente } from '../../../@core/data/models/practicas_academicas/docente';
import * as moment from 'moment';
import { FORM_SOLICITUD_PRACTICAS, FORM_DOCUMENTOS_ADICIONALES, FORM_RESPUESTA_SOLICITUD } from '../form-solicitud-practica';

@Component({
  selector: 'ngx-detalle-practica-academica',
  templateUrl: './detalle-practica-academica.component.html',
  styleUrls: ['./detalle-practica-academica.component.scss'],
})
export class DetallePracticaAcademicaComponent implements OnInit {

  InfoDocentes: Array<Docente> = [];
  formDocente: FormGroup;
  InfoPracticasAcademicas: any;
  fechaRadicado: any;
  estado: any;
  FormPracticasAcademicas: any;
  periodos: any[];
  proyectos: any[];
  espaciosAcademicos: any;
  tiposVehiculo: any;
  process: string;
  estadosSolicitud: any;
  sub: any;
  tablaEstados: any;
  files: any = [];
  formDocumentosAdicionales: any;
  formRespuestaSolicitud: any;
  estadosList: any = [];
  loading: boolean;

  constructor(
    private builder: FormBuilder,
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private _Activatedroute: ActivatedRoute) {

    this.loading = true;

    this.formDocente = this.builder.group({
      NombreDocente: [{ value: '', disabled: true }],
      NumeroDocumento: [{ value: '', disabled: true }],
      EstadoDocente: [{ value: '', disabled: true }],
    });

    this.InfoDocentes = [{
      Id: 0, Nombre: '', TipoVinculacionId: { Nombre: '', Activo: false, CodigoAbreviacion: '', Descripcion: '', Id: 0, NumeroOrden: 0, ParametroPadreId: null, TipoParametroId: null }, Correo: '', CorreoInstitucional: '', Celular: '', Telefono: '',
    }]

    this.FormPracticasAcademicas = FORM_SOLICITUD_PRACTICAS;
    this.formDocumentosAdicionales = FORM_DOCUMENTOS_ADICIONALES;
    this.formRespuestaSolicitud = FORM_RESPUESTA_SOLICITUD;
    this.construirForm();
    this.crearTabla();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
      this.crearTabla();
      this.inicializiarDatos();
    });
  }

  ngOnInit() {
    this.loadData().then(aux => {

      this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
        const { process, id } = params.params;

        this.sgamidService.get('practicas_academicas/' + id).subscribe(practica => {
          this.InfoPracticasAcademicas = practica["Data"];
          this.InfoPracticasAcademicas.FechaHoraRegreso = this.InfoPracticasAcademicas.FechaHoraRegreso.slice(0, -4);
          this.InfoPracticasAcademicas.FechaHoraSalida = this.InfoPracticasAcademicas.FechaHoraSalida.slice(0, -4);

          this.fechaRadicado = moment(this.InfoPracticasAcademicas.FechaRadicado, 'YYYY-MM-DD').format('DD/MM/YYYY');
          this.estado = this.InfoPracticasAcademicas.EstadoTipoSolicitudId.EstadoId.Nombre

          let aux = [];
          aux.push(this.InfoPracticasAcademicas.DocenteSolicitante);
          this.InfoPracticasAcademicas.DocentesInvitados.forEach(docente => {
            aux.push(docente);
          });
          this.InfoDocentes = aux;
          this.estadosSolicitud = practica["Data"].Estados;
          this.inicializiarDatos();
          this.loading = false;
        });

        this.process = atob(process);

        if (['invitation'].includes(this.process)) {
          this.files = [
            { id: 140089, label: this.translate.instant('practicas_academicas.' + 'cronograma_practica') },
            { id: 140089, label: this.translate.instant('practicas_academicas.' + 'presupuesto_practica') },
            { id: 140089, label: this.translate.instant('practicas_academicas.' + 'presentacion_practica') },
            { id: 140089, label: this.translate.instant('practicas_academicas.' + 'lista_estudiantes') },
            { id: 140089, label: this.translate.instant('practicas_academicas.' + 'guia_practica') },
            { id: 140089, label: this.translate.instant('practicas_academicas.' + 'lista_personal_apoyo') },
            { id: 140089, label: this.translate.instant('practicas_academicas.' + 'acta_compromiso') },
            { id: 140089, label: this.translate.instant('practicas_academicas.' + 'info_asistencia_practica') },
          ];
        }
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
      }
      this.files.push(documento);
    });

    this.estadosList = [
      { Nombre: 'Verificada', Id: 1 },
      { Nombre: 'Devuelta', Id: 2 },
      { Nombre: 'Rechazada', Id: 3 },
    ];
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

    this.formDocumentosAdicionales.campos.forEach(element => {
      element.label = this.translate.instant('practicas_academicas.' + element.label_i18n);
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
      html: `<span>${event.data.FechaSolicitud}</span><br>
                <span>${event.data.EstadoSolicitud}</span><br>
                <span class="form-control">${event.data.Observaciones}</span><br>`,
      icon: "info",
      buttons: true,
      dangerMode: true,
      showCancelButton: true
    };
    Swal.fire(opt)
      .then((result) => {
        if (result) {
        }
      })
  }

  enviarInvitacion(event) {
    const opt: any = {
      title: this.translate.instant("GLOBAL.invitacion"),
      html: `Próximamente envío de invitación aquí`,
      icon: "info",
      buttons: true,
      dangerMode: true,
      showCancelButton: true
    };
    Swal.fire(opt);
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
        Observaciones: {
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

}
