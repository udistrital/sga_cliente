import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FORM_SOLICITUD_TRANSFERENCIA } from '../forms-transferencia';

@Component({
  selector: 'solicitud-transferencia',
  templateUrl: './solicitud-transferencia.component.html',
  styleUrls: ['./solicitud-transferencia.component.scss']
})
export class SolicitudTransferenciaComponent implements OnInit {
  formTransferencia: any;

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private location: Location,
    ) {
    this.formTransferencia = FORM_SOLICITUD_TRANSFERENCIA;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
  }

  ngOnInit() {
  }

  goback(){
    this.location.back();
  }

  send(){
    console.log('send here! ')
  }

}
