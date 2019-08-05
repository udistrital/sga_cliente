import { Component } from '@angular/core';

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

  constructor() {
    this.universidad = {
      title: 'Universidad Distrital Francisco José de Caldas',
      nit: 'NIT. 899.999.230.7',
      norma: 'Institución de Educación Superior sujeta a inspección y vigilancia por el Ministerio de ' +
        'Educación Nacional',
      creacion: [{
        label: 'Acuerdo de creación N° 10 de 1948 del Concejo de Bogotá',
        title: 'Acuerdo de creación',
        url: 'https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=3499',
      }],
      acreditacion: [{
        label: 'Acreditación institucional de alta calidad - Resolución N° 23096 del 15 de diciembre del 2016',
        title: 'Acreditación institucional de alta calidad',
        url: 'http://autoevaluacion.udistrital.edu.co/version3/varios/acreditacion_23096_institucional.pdf',
      }],
      representante: [{
        subtitle: 'Representante legal',
        nombre: 'Rector Dr. Ricardo García Duarte',
        correo: 'rectoria@udistrital.edu.co',
      }],
    };
    this.final = {
      list: [{
        url: 'http://www.bogota.gov.co/sdqs',
        title: 'Sistema distrital de quejas y soluciones',
        label: 'SDQS',
      }, {
        url: '#',
        title: 'Mapa del sitio',
        label: 'Mapa del sitio',
      }, {
        url: 'https://www.udistrital.edu.co/politicas-de-privacidad',
        title: 'Política de privacidad',
        label: 'Política de privacidad',
      }, {
        url: 'https://www.udistrital.edu.co/contacto',
        title: 'Contáctenos',
        label: 'Contáctenos',
      }],
    };
    this.normatividad = {
      title: 'Normatividad',
      seccion: [{
        subtitle: 'Académica',
        list: [{
          label: 'Derechos pecuniarios 2019',
          title: 'Derechos pecuniarios',
          url: 'http://sgral.udistrital.edu.co/xdata/sgral/cir_2019-001.pdf',
        }, {
          label: 'Estatuto académico',
          title: 'Estatuto académico',
          url: 'http://sgral.udistrital.edu.co/xdata/csu/acu_1996-004.pdf',
        }, {
          label: 'Estatuto estudiantil',
          title: 'Estatuto estudiantil',
          url: 'http://sgral.udistrital.edu.co/xdata/csu/acu_1993-027.pdf',
        }, {
          label: 'Estatuto docente',
          title: 'Estatuto docente',
          url: 'http://sgral.udistrital.edu.co/xdata/csu/acu_2002-011.pdf',
        }],
      },
      {
        subtitle: 'General',
        list: [{
          label: 'Estatuto general',
          title: 'Estatuto general',
          url: 'http://sgral.udistrital.edu.co/xdata/csu/acu_1997-003.pdf',
        }, {
          label: 'PUI',
          title: 'Proyecto universitario institucional',
          url: 'http://www1.udistrital.edu.co:8080/documents/11171/0b3bf491-87f5-4e5d-97f2-dc3c70a6fe0e',
        }],
      }],
    };
    this.recomendados = {
      title: 'Recomendados',
      list: [{
        title: 'Distrinautas',
        label: 'Distrinautas',
        url: 'http://comunidad.udistrital.edu.co/distrinautas/',
      }, {
        title: 'Elecciones Universidad Distrital',
        label: 'Elecciones UD',
        url: 'http://comunidad.udistrital.edu.co/elecciones/',
      }, {
        title: 'Transparencia y acceso a información pública',
        label: 'Transparencia y acceso a información pública',
        url: 'https://www.udistrital.edu.co/transparencia',
      }, {
        title: 'Sistema de gestión ambiental',
        label: 'Sistema de gestión ambiental',
        url: 'http://comunidad.udistrital.edu.co/piga/',
      }, {
        title: 'Reforma Universidad Distrital',
        label: 'Reforma UD',
        url: 'http://comunidad.udistrital.edu.co/reformaud/',
      }, {
        title: 'Hora legal colombiana	',
        label: 'Hora legal colombiana	',
        url: 'http://horalegal.inm.gov.co/',
      }],
    };
    this.contactenos = {
      title: 'Contáctenos',
      datos: [{
        dato: 'Carrera 7 No. 40B - 53',
        title: 'Carrera 7 No. 40B - 53',
        url: 'https://www.google.com.co/maps/place/Cra.+7+%2340b-53,+Bogot%C3%A1/@4.6280856,-74.0674698,17z/' +
        'data=!3m1!4b1!4m5!3m4!1s0x8e3f9a287591013f:0x5cce5fbab6b77b9b!8m2!3d4.6280856!4d-74.0652811?hl=es',
      }, {
        dato: 'Bogotá D.C. - República de Colombia',
      }, {
        label: 'Código Postal',
        dato: '11021 - 110231588',
      }, {
        dato: '(+57 1) 3239300',
        title: 'Centro de relevo',
        url: 'http://www.centroderelevo.gov.co/632/w3-channel.html',
      }, {
        dato: '01 - 8000 - 914410',
        title: 'Centro de relevo',
        url: 'http://www.centroderelevo.gov.co/632/w3-channel.html',
      }, {
        label: 'Atención a usuarios - Centro de relevo',
        dato: '(+57 1) 3238314',
        title: 'Centro de relevo',
        url: 'http://www.centroderelevo.gov.co/632/w3-channel.html',
      }, {
        label: 'Atención al cuidadano',
        dato: 'atencion@udistrital.edu.co',
        title: 'Atención al cuidadano',
        url: 'mailto:atencion@udistrital.edu.co',
      }, {
        label: 'Notificaciones judiciales',
        dato: 'notificacionjudicial@udistrital.edu.co',
        title: 'Notificaciones judiciales',
        url: 'mailto:notificacionjudicial@udistrital.edu.co',
      }, {
        dato: 'Directorio institucional',
        title: 'Directorio institucional',
        url: 'https://www.udistrital.edu.co/directorio',
      }, {
        dato: 'Lunes a viernes de 8 a.m.a 5 p.m.',
      }],
    };
    this.social = {
      list: [{
        url: 'https://www.facebook.com/UniversidadDistrital',
        title: 'Facebook',
        class: 'facebook',
      }, {
        url: 'https://twitter.com/udistrital',
        title: 'Twitter',
        class: 'twitter',
      }, {
        url: 'https://www.instagram.com/universidaddistrital/',
        title: 'Instagram',
        class: 'instagram',
      }, {
        url: 'https://www.youtube.com/udistritaltv',
        title: 'Youtube',
        class: 'youtube',
      }],
    }
    this.copyright = '© Copyright 2019. | Todos los Derechos Reservados';
  }
}
