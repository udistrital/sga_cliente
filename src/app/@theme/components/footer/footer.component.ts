import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
})
export class FooterComponent {

  universidad: any;
  normatividad: any;
  recomendados: any;
  contactenos: any;
  final: any;
  copyright: any;
  social: any;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.social = {
      list: [{
        title: 'Horario',
        class: 'fa fa-clock-o',
        value: ['Lunes a viernes', '8am a 5pm'],
      }, {
        title: 'Nombre',
        class: 'fa fa-globe',
        value: ['Sistema Integrado de informática y  Telecomunicaciones '],
      }, {
        title: 'Phone',
        class: 'fa fa-phone',
        value: ['323 93 00', 'Ext. 1112'],
      }, {
        title: 'Direccion',
        class: 'fa fa-map-marker',
        value: ['Cra 8 # 40-78', 'Piso 1'],
      }, {
        title: 'mail',
        class: 'fa fa-at',
        value: ['computo@udistrital.edu.co'],
      },
    ],
    };
  }
}
