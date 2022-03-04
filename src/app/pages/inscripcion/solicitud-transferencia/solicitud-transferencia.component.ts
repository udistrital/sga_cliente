import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'solicitud-transferencia',
  templateUrl: './solicitud-transferencia.component.html',
  styleUrls: ['./solicitud-transferencia.component.scss']
})
export class SolicitudTransferenciaComponent implements OnInit, OnDestroy, AfterViewInit {
  formTransferencia: any;
  formRespuesta: any;
  sub = null;
  nivelNombre: string;
  nivel: string;
  tipo: string;
  inscriptionSettings: any = null;
  process: string;
  loading: boolean;
  proyectosCurriculares: any[];
  codigosEstudiante: any[];
  id: any;

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private sgaMidService: SgaMidService,
    private nuxeo: NewNuxeoService,
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
      this.id = atob(id)

      this.loading = true;
      this.sgaMidService.get('transferencia/inscripcion/' + this.id).subscribe(inscripcion => {
        if (inscripcion !== null) {
          const origen = this.getIndexForm("ProgramaOrigen");
          const origenExterno = this.getIndexForm('ProgramaOrigenInput');
          const estudiante = this.getIndexForm("CodigoEstudiante");
          const estudianteExterno = this.getIndexForm("CodigoEstudianteExterno");
          const destino = this.getIndexForm("ProgramaDestino");
          const universidad = this.getIndexForm("UniversidadOrigen");
          const cancelo = this.getIndexForm("Cancelo");
          const acuerdo = this.getIndexForm("Acuerdo");
          const creditos = this.getIndexForm("CantidadCreditos");
          const ultimo = this.getIndexForm("UltimoSemestre");

          this.nivelNombre = inscripcion['Data']['Nivel']['Nombre'];
          this.nivel = inscripcion['Data']['Nivel']['Id'];
          this.tipo = inscripcion['Data']['TipoInscripcion']['Nombre'];
          this.formTransferencia.campos[destino].valor = inscripcion['Data']['ProgramaDestino'];

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
          this.loading = false;
        }

      });

      if (this.process === 'all') {
        this.formTransferencia.campos.forEach(element => {
          element.deshabilitar = true;
          if (element.etiqueta === 'file') {
            element.ocultar = true;
          }
        });
        this.formTransferencia.btn = false;
      }
      this.inscriptionSettings = this.nivelNombre === 'Pregrado' ? {
        basic_info_button: true,
        hide_header_labels: true,
        formacion_academica_button: true,
        documentos_programa_button: true,
        nivel: this.nivelNombre,
        detalle_inscripcion: true,
      } : {
        basic_info_button: true,
        hide_header_labels: true,
        formacion_academica_button: true,
        documentos_programa_button: true,
          nivel: this.nivelNombre,
        detalle_inscripcion: true,
        experiencia_laboral: true,
        produccion_academica: true,
      }

    })
  }

  ocultarCampo(campo, ocultar) {
    this.formTransferencia.campos[campo].ocultar = ocultar;
    this.formTransferencia.campos[campo].requerido = !ocultar;
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTransferencia.campos.length; index++) {
      const element = this.formTransferencia.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  loadSolicitud() {

  }

  ngAfterViewInit() {

  }

  goback() {
    this.location.back();
  }

  send() {
    console.log('send here! ')
  }

  ngOnDestroy() {

  }

  respuestaForm(event) {
    console.log(event);
  }

  async validarForm(event) {
    if (event.valid) {
      let files: any;
      const element = event.data.InfoPersona.SoporteDocumento;
      if (typeof element.file !== 'undefined' && element.file !== null) {
        this.loading = true;
        console.log(element)
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
        "Codigo_estudiante": this.tipo == "Reingreso" ? parseFloat(event.data.InfoPersona.CodigoEstudiante.Codigo) :
          this.tipo == "Transferencia interna" ? event.data.InfoPersona.CodigoEstudiante.Codigo :
            event.data.InfoPersona.CodigoEstudianteExterno,
        "Motivo_retiro": event.data.InfoPersona.MotivoCambio,
        "Cantidad_creditos": event.data.InfoPersona.CantidadCreditos,
        "Tipo": this.tipo,
        "Proyecto_origen": event.data.InfoPersona.ProgramaOrigen ? event.data.InfoPersona.ProgramaOrigen.Nombre : event.data.InfoPersona.ProgramaOrigenInput,
        "Universidad": event.data.InfoPersona.UniversidadOrigen,
        "Ultimo_semestre": event.data.InfoPersona.UltimoSemestre,
        "Interna": this.tipo == "Transferencia interna",
        "Acuerdo": event.data.InfoPersona.Acuerdo == true,
        "Cancelo": event.data.InfoPersona.Cancelo == true,
        "Documento": files,
        "SolicitanteId": this.userService.getPersonaId(),
        "FechaRadicacion": moment().format('YYYY-MM-DD hh:mm:ss'),
      }

      this.sgaMidService.post('transferencia', data).subscribe(
        res => {
          const r = <any>res.Response
          if (r !== null && r.Type !== 'error') {
            this.loading = false;
            this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.solicitud_generada'));
            this.router.navigate([`pages/inscripcion/transferencia/${btoa(this.process)}`])
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
