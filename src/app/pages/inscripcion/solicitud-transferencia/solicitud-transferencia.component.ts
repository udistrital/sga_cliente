import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FORM_SOLICITUD_TRANSFERENCIA, FORM_RESPUESTA_SOLICITUD } from '../forms-transferencia';
import { ActivatedRoute } from '@angular/router';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';

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
  periodo = '2022-1';
  inscriptionSettings: any = null;
  process: string;
  loading: boolean;
  proyectosCurriculares: any[];
  codigosEstudiante: any[];

  general = {
    nombre: 'Fabián Sánchez',
    codigo: '20102020088',
    documento: '123546987'
  }
  responde = {
    nombre: 'Fabián Sánchez',
    rol: 'administrativo',
  }

  file = {
    id: 142689,
    label: 'Soportes'
  }

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
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

      this.loading = true;
      this.sgaMidService.get('transferencia/inscripcion/' + atob(id)).subscribe(inscripcion => {
        if (inscripcion !== null) {
          const origen = this.getIndexForm("ProgramaOrigen");
          const origenExterno = this.getIndexForm('ProgramaOrigenInput');
          const estudiante = this.getIndexForm("CodigoEstudiante");
          const estudianteExterno = this.getIndexForm("CodigoEstudianteExterno");
          const destino = this.getIndexForm("ProgramaDestino");

          this.nivelNombre = inscripcion['Data']['Nivel']['Nombre'];
          this.nivel = inscripcion['Data']['Nivel']['Id'];
          this.tipo = inscripcion['Data']['TipoInscripcion']['Nombre'];
          this.formTransferencia.campos[destino].valor = inscripcion['Data']['ProgramaDestino'];

          if (this.tipo === "Transferencia externa") {
            this.ocultarCampo(estudianteExterno, false);
            this.ocultarCampo(estudiante, true);

            this.ocultarCampo(origenExterno, false);
            this.ocultarCampo(origen, true);
          } else {
            this.ocultarCampo(estudianteExterno, true);
            this.ocultarCampo(estudiante, false);

            this.ocultarCampo(origenExterno, true);
            this.ocultarCampo(origen, false);

            this.formTransferencia.campos[estudiante].deshabilitar = false;
            this.formTransferencia.campos[estudiante].opciones = inscripcion['Data']['CodigoEstudiante'];

            this.formTransferencia.campos[origen].deshabilitar = false;
            this.formTransferencia.campos[origen].opciones = inscripcion['Data']['ProyectoCurricular'];
            this.formTransferencia.campos[origen].opciones = inscripcion['Data']['ProyectoCodigo'];

            if (this.tipo === "Reingreso") {

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

  validarForm(event) {
    console.log(event);
  }

  validarFormRespuesta(event) {
    console.log(event);

  }
}
