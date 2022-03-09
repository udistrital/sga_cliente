import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FORM_SOLICITUD_TRANSFERENCIA, FORM_RESPUESTA_SOLICITUD } from '../forms-transferencia';
import { ActivatedRoute, Router } from '@angular/router';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { UserService } from '../../../@core/data/users.service';
import * as moment from 'moment';
import { TransferenciaInternaReintegro } from '../../../@core/data/models/inscripcion/transferencia_reintegro';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';

@Component({
  selector: 'solicitud-transferencia',
  templateUrl: './solicitud-transferencia.component.html',
  styleUrls: ['./solicitud-transferencia.component.scss']
})
export class SolicitudTransferenciaComponent implements OnInit, OnDestroy {
  formTransferencia: any;
  formRespuesta: any;
  sub = null;
  uid = null;
  nivelNombre: string;
  nivel: string;
  tipo: string;
  periodo: string;
  dataTransferencia: TransferenciaInternaReintegro = null;
  terminadaInscripcion: boolean = false;
  solicitudCreada: boolean = false;
  solicitudId: any;
  inscriptionSettings: any = null;
  process: string;
  loading: boolean;
  file: any;
  proyectosCurriculares: any[];
  codigosEstudiante: any[];
  id: any;
  nombreEstudiante: any;
  codigoEstudiante: any;
  documentoEstudiante: any;
  nombreCordinador: any;
  rolCordinador: any;

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private sgaMidService: SgaMidService,
    private nuxeo: NewNuxeoService,
    private autenticationService: ImplicitAutenticationService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private router: Router,
    private location: Location,
    private _Activatedroute: ActivatedRoute
  ) {
    this.formTransferencia = FORM_SOLICITUD_TRANSFERENCIA;
    this.formRespuesta = FORM_RESPUESTA_SOLICITUD;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
      this.utilidades.translateFields(this.formRespuesta, 'inscripcion.', 'inscripcion.placeholder_');
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
    this.utilidades.translateFields(this.formRespuesta, 'inscripcion.', 'inscripcion.placeholder_');
  }

  ngOnInit() {
    this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
      const { id, process } = params.params;
      this.process = atob(process);
      this.id = id

      this.loading = true;
      this.loadSolicitud();

      if (this.process === 'all') {
        this.loadInfoPersona();
        this.loadEstados();
      }

    })
  }

  ocultarCampo(campo, ocultar) {
    this.formTransferencia.campos[campo].ocultar = ocultar;
    this.formTransferencia.campos[campo].requerido = !ocultar;
  }

  getIndexFormTrans(nombre: String): number {
    for (let index = 0; index < this.formTransferencia.campos.length; index++) {
      const element = this.formTransferencia.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  getIndexFormRes(nombre: String): number {
    for (let index = 0; index < this.formRespuesta.campos.length; index++) {
      const element = this.formRespuesta.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  loadInfoPersona(): void {
    this.loading = true;
    this.uid = this.userService.getPersonaId();

    this.autenticationService.getRole().then((rol: Array<String>) => {
      if (rol.includes('COORDINADOR') || rol.includes('COORDINADOR_PREGADO') || rol.includes('COORDINADOR_POSGRADO')) {
        this.rolCordinador = 'COORDINADOR';
      }
    });

    if (this.uid !== undefined && this.uid !== 0 &&
      this.uid.toString() !== '' && this.uid.toString() !== '0') {
      this.sgaMidService.get('persona/consultar_persona/' + this.uid).subscribe((res: any) => {
        this.loading = true;
        if (res !== null) {
          this.nombreCordinador = res.NombreCompleto;
        }
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.info_persona'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    } else {
      this.loading = false;
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  loadSolicitud() {
    this.loading = true;
    this.sgaMidService.get('transferencia/inscripcion/' + this.id).subscribe(inscripcion => {
      if (inscripcion !== null) {
        if (inscripcion.Success) {
          this.loading = true;

          this.periodo = inscripcion['Data']['Periodo']['Nombre'];
          this.nivelNombre = inscripcion['Data']['Nivel']['Nombre'];
          this.nivel = inscripcion['Data']['Nivel']['Id'];
          this.tipo = inscripcion['Data']['TipoInscripcion']['Nombre'];
          this.nombreEstudiante = inscripcion['Data']['DatosEstudiante']['Nombre'];
          this.documentoEstudiante = inscripcion['Data']['DatosEstudiante']['Identificacion'];
          this.codigoEstudiante = inscripcion['Data']['CodigoEstudiante']['Codigo'];

          this.formTransferencia.campos.forEach(campo => {
            delete campo.deshabilitar;
          });
          this.formTransferencia.btn = 'Guardar';

          const origen = this.getIndexFormTrans("ProgramaOrigen");
          const origenExterno = this.getIndexFormTrans('ProgramaOrigenInput');
          const estudiante = this.getIndexFormTrans("CodigoEstudiante");
          const estudianteExterno = this.getIndexFormTrans("CodigoEstudianteExterno");
          const destino = this.getIndexFormTrans("ProgramaDestino");
          const universidad = this.getIndexFormTrans("UniversidadOrigen");
          const cancelo = this.getIndexFormTrans("Cancelo");
          const acuerdo = this.getIndexFormTrans("Acuerdo");
          const creditos = this.getIndexFormTrans("CantidadCreditos");
          const ultimo = this.getIndexFormTrans("UltimoSemestre");

          this.formTransferencia.campos[destino].valor = inscripcion['Data']['ProgramaDestino'];
          this.formTransferencia.campos[destino].deshabilitar = true;

          this.ocultarCampo(acuerdo, true);
          this.formTransferencia.campos[cancelo].ocultar = true;
          this.formTransferencia.campos[creditos].claseGrid = 'col-sm-6 col-xs-6';
          this.formTransferencia.campos[ultimo].claseGrid = 'col-sm-6 col-xs-6';

          if (this.tipo === "Transferencia externa") {
            this.ocultarCampo(estudianteExterno, false);
            this.ocultarCampo(estudiante, true);

            this.ocultarCampo(origenExterno, false);
            this.ocultarCampo(origen, true);

            this.formTransferencia.campos[universidad].deshabilitar = false;
          } else {
            this.ocultarCampo(estudianteExterno, true);
            this.ocultarCampo(estudiante, false);

            this.ocultarCampo(origenExterno, true);
            this.ocultarCampo(origen, false);

            this.formTransferencia.campos[universidad].deshabilitar = true;
            this.formTransferencia.campos[universidad].valor = "Universidad Distrital Francisco José de Caldas"

            this.formTransferencia.campos[estudiante].deshabilitar = false;
            this.formTransferencia.campos[estudiante].opciones = inscripcion['Data']['CodigoEstudiante'];

            this.formTransferencia.campos[origen].deshabilitar = false;
            this.formTransferencia.campos[origen].opciones = inscripcion['Data']['ProyectoCurricular'];
            this.formTransferencia.campos[origen].opciones = inscripcion['Data']['ProyectoCodigo'];

            if (this.tipo === "Reingreso") {
              this.ocultarCampo(acuerdo, false);
              this.formTransferencia.campos[cancelo].ocultar = false;

              this.formTransferencia.campos[creditos].claseGrid = 'col-sm-5 col-xs-5';
              this.formTransferencia.campos[ultimo].claseGrid = 'col-sm-5 col-xs-5';

              inscripcion['Data']['CodigoEstudiante'].forEach(codigo => {
                if (codigo.IdProyecto === inscripcion['Data']['ProgramaDestino']['Id']) {
                  this.formTransferencia.campos[estudiante].valor = codigo;
                  this.formTransferencia.campos[estudiante].deshabilitar = true;
                }
              });

              this.formTransferencia.campos[origen].valor = inscripcion['Data']['ProgramaDestino'];
              this.formTransferencia.campos[origen].deshabilitar = true;
            }
          }

          if (inscripcion.Data.SolicitudId) {
            this.solicitudCreada = true;
            this.solicitudId = inscripcion["Data"]["SolicitudId"]

            this.formTransferencia.campos[this.getIndexFormTrans("SoporteDocumento")].ocultar = true;

            this.formTransferencia.campos.forEach(campo => {
              campo.deshabilitar = true;
            });
            this.formTransferencia.btn = '';

            let data = {
              Cancelo: inscripcion["Data"]["DatosInscripcion"]["CanceloSemestre"],
              Acuerdo: inscripcion["Data"]["DatosInscripcion"]["SolicitudAcuerdo"],
              CantidadCreditos: inscripcion["Data"]["DatosInscripcion"]["CantidadCreditos"],
              CodigoEstudiante: inscripcion["Data"]["DatosInscripcion"]["CodigoEstudiante"],
              CodigoEstudianteExterno: inscripcion["Data"]["DatosInscripcion"]["CodigoEstudiante"],
              SoporteDocumento: inscripcion["Data"]["DatosInscripcion"]["DocumentoId"],
              MotivoCambio: inscripcion["Data"]["DatosInscripcion"]["MotivoRetiro"],
              UltimoSemestre: inscripcion["Data"]["DatosInscripcion"]["UltimoSemestreCursado"],
              ProgramaOrigen: inscripcion["Data"]["DatosInscripcion"]["ProyectoCurricularProviene"],
              ProgramaOrigenInput: inscripcion["Data"]["DatosInscripcion"]["ProyectoCurricularProviene"],
              UniversidadOrigen: inscripcion["Data"]["DatosInscripcion"]["UniversidadProviene"],
              ProgramaDestino: inscripcion["Data"]["ProgramaDestino"],
            }
            if (!(this.tipo === "Transferencia externa")) {
              data.UniversidadOrigen = "Universidad Distrital Francisco José de Caldas";
              if (this.tipo === "Reingreso") {
                data.ProgramaOrigen = data.ProgramaDestino;
              }
            }

            this.file = {
              id: inscripcion["Data"]["DatosInscripcion"]["DocumentoId"],
              label: this.translate.instant('inscripcion.' + 'placeholder_soportes_documentos')
            }

            this.dataTransferencia = data;

          } else {
            this.formTransferencia.campos[this.getIndexFormTrans("SoporteDocumento")].ocultar = false;
          }

          this.loading = false;
          this.inscriptionSettings = this.nivelNombre === 'Pregrado' ? {
            basic_info_button: true,
            hide_header_labels: true,
            formacion_academica_button: true,
            documentos_programa_button: true,
            select_tipo: this.tipo,
            nivel: this.nivelNombre,
            detalle_inscripcion: true,
            es_transferencia: true,
          } : {
            basic_info_button: true,
            hide_header_labels: true,
            formacion_academica_button: true,
            documentos_programa_button: true,
            select_tipo: this.tipo,
            nivel: this.nivelNombre,
            detalle_inscripcion: true,
            experiencia_laboral: true,
            produccion_academica: true,
            es_transferencia: true,
          }
          this.loading = false;
        }
      }
    });
  }

  loadEstados() {
    this.loading = true;
    this.sgaMidService.get('transferencia/estados').subscribe(estados => {
      if (estados !== null) {
        if (estados.Success) {
          const respuesta = this.getIndexFormRes("Respuesta");

          this.formRespuesta.campos[respuesta].opciones = estados['Data'].filter(estado => estado.Nombre != "Radicada" && estado.Nombre != "Solicitado");

          this.loading = false;
        }
      }
    });
  }

  goback() {
    this.location.back();
  }

  send() {
    this.loading = true;

    const hoy = new Date();
    const inscripcionPut = {
      'EstadoId': 15,
      'FechaRespuesta': moment().format('YYYY-MM-DD hh:mm:ss'),
      'TerceroId': this.userService.getPersonaId(),
      'EstadoAbreviacion': 'INSCREAL'
    }

    this.sgaMidService.put('transferencia/actualizar_estado/' + this.solicitudId, inscripcionPut).subscribe((response: any) => {
      this.loading = false;
      const r_ins = <any>response;
      if (response !== null && r_ins.Type !== 'error') {
        this.loading = false;
        this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
        this.router.navigate([`pages/inscripcion/transferencia/${btoa(this.process)}`])
      }
    },
      (error: any) => {
        this.loading = false;
        if (error.System.Message.includes('duplicate')) {
          Swal.fire({
            icon: 'info',
            text: this.translate.instant('inscripcion.error_update_programa_seleccionado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

          });
        } else {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.actualizar') + '-' +
              this.translate.instant('GLOBAL.admision'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      });
  }

  ngOnDestroy() {

  }

  respuestaForm(event) {
    console.log(event);
  }

  async validarForm(event) {
    if (event.valid) {
      let files: any;
      const element = event.data.dataTransferencia.SoporteDocumento;
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
        files = file;
      }

      const data = {
        "InscripcionId": parseInt(this.id),
        "Codigo_estudiante": this.tipo == "Reingreso" ? parseFloat(event.data.dataTransferencia.CodigoEstudiante.Codigo) :
          this.tipo == "Transferencia interna" ? event.data.dataTransferencia.CodigoEstudiante.Codigo :
            event.data.dataTransferencia.CodigoEstudianteExterno,
        "Motivo_retiro": event.data.dataTransferencia.MotivoCambio,
        "Cantidad_creditos": event.data.dataTransferencia.CantidadCreditos,
        "Tipo": this.tipo,
        "Proyecto_origen": event.data.dataTransferencia.ProgramaOrigen ? event.data.dataTransferencia.ProgramaOrigen.Id : event.data.dataTransferencia.ProgramaOrigenInput,
        "Universidad": event.data.dataTransferencia.UniversidadOrigen,
        "Ultimo_semestre": event.data.dataTransferencia.UltimoSemestre,
        "Interna": this.tipo == "Transferencia interna",
        "Acuerdo": event.data.dataTransferencia.Acuerdo == true,
        "Cancelo": event.data.dataTransferencia.Cancelo == true,
        "Documento": files,
        "SolicitanteId": this.userService.getPersonaId(),
        "FechaRadicacion": moment().format('YYYY-MM-DD hh:mm:ss'),
      }

      this.sgaMidService.post('transferencia', data).subscribe(
        res => {
          const r = <any>res.Response
          if (r !== null && r.Type !== 'error') {
            this.loading = false;
            this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.solicitud_generada')).then(cerrado => {
              this.ngOnInit();
            });
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_solicitud'));
            this.loading = false;
          }
        }, error => {
          this.loading = false;
        }
      )

    }
  }

  validarFormRespuesta(event) {
    console.log(event);
  }
}
