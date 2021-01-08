import { Component, Input, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Solicitante } from '../../../@core/data/models/solicitudes/solicitante';
import { DATOS_SOLICITANTE } from './form-datos-solicitante';

@Component({
  selector: 'ngx-datos-solicitante',
  templateUrl: './datos-solicitante.component.html',
  styleUrls: ['../solicitudes.component.scss']
})
export class DatosSolicitanteComponent implements OnInit {

  datosSolicitante: any;

  @Input()
  solicitante: Solicitante; 

  constructor(private translate: TranslateService) {
    this.datosSolicitante = DATOS_SOLICITANTE;
    this.construirForm()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
  }

  construirForm() {
    this.datosSolicitante.titulo = this.translate.instant('solicitudes.solicitante');
    this.datosSolicitante.campos.forEach(campo => {
      campo.label = this.translate.instant('solicitudes.' + campo.label_i18n);
    })
  }

}
