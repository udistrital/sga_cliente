import { Component } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DOCENTE_PRACTICA } from './form-docente-practica';

@Component({
  selector: 'ngx-solicitante-practica',
  templateUrl: './solicitante-practica.component.html',
  styleUrls: ['../practicas-academicas.component.scss'],
})
export class SolicitantePracticaComponent {

  docenteSolicitante: any;
  DocentePractica: any;

  constructor(
    private translate: TranslateService
  ) {
    this.docenteSolicitante = DOCENTE_PRACTICA;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  construirForm() {
    this.docenteSolicitante.titulo = this.translate.instant('practicas_academicas.solicitante')
    this.docenteSolicitante.campos.forEach(campo => {
      campo.label = this.translate.instant('practicas_academicas.' + campo.label_i18n);

    });
  }

  agregarDocente() {
    // acciones para agregar un docente
  }

}
