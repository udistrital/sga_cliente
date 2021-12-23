import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FORM_SOLICITUD_TRANSFERENCIA } from '../forms-transferencia';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'solicitud-transferencia',
  templateUrl: './solicitud-transferencia.component.html',
  styleUrls: ['./solicitud-transferencia.component.scss']
})
export class SolicitudTransferenciaComponent implements OnInit, OnDestroy {
  formTransferencia: any;
  sub = null;
  nivel: string;
  tipo: string;
  periodo = '2022-1';
  inscriptionSettings: any = null;

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private location: Location,
    private _Activatedroute: ActivatedRoute
  ) {
    this.formTransferencia = FORM_SOLICITUD_TRANSFERENCIA;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
  }

  ngOnInit() {
    this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
      const { type, level } = params.params;
      this.nivel = atob(level);
      this.tipo = atob(type);
      this.inscriptionSettings = this.nivel === 'Pregrado' ? {
        basic_info_button: true,
        hide_header_labels: true,
        formacion_academica_button: true,
        documentos_programa_button: true,
        nivel: this.nivel,
        detalle_inscripcion: true,
      } : {
        basic_info_button: true,
        hide_header_labels: true,
        formacion_academica_button: true,
        documentos_programa_button: true,
        nivel: this.nivel,
        detalle_inscripcion: true,
        experiencia_laboral: true,
        produccion_academica: true,
      }

    })
  }

  goback() {
    this.location.back();
  }

  send() {
    console.log('send here! ')
  }

  ngOnDestroy() {

  }

  validarForm(event) {
    console.log(event);
  }
}
