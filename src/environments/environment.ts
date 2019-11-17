/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: false,
  NUXEO: {
    PATH: 'https://documental.portaloas.udistrital.edu.co/nuxeo/',
    CREDENTIALS: {
      USERNAME: 'desarrollooas',
      PASS: 'desarrollooas2019',
    },
  },
  CONFIGURACION_SERVICE: 'http://10.20.0.254/configuracion_api/v1/',
  NOTIFICACION_SERVICE: 'ws://10.20.0.254:8199/ws/join',
  CONF_MENU_SERVICE: 'http://10.20.0.254/configuracion_api/v1/menu_opcion_padre/ArbolMenus/',
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'e36v1MPQk2jbz9KM4SmKhk8Cyw0a',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role documento',
    REDIRECT_URL: 'http://localhost:4200/',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'http://localhost:4200/',
  },
  PERSONA_SERVICE: 'http://api.planestic.udistrital.edu.co:8083/v1/',
  PRODUCCION_ACADEMICA_SERVICE: 'http://localhost:8080/v1/',
  // DOCUMENTO_SERVICE: 'http://api.planestic.udistrital.edu.co:8094/v1/',
  DOCUMENTO_SERVICE: 'http://localhost:8094/v1/',
  CAMPUS_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/campus_mid/v1/',
  CORE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/core_crud/v1/',
  EVENTO_SERVICE: 'http://localhost:8080/v1/',
  OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v1/',
  UNIDAD_TIEMPO_SERVICE: 'http://api.planestic.udistrital.edu.co:8102/v1/',
  PROYECTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/proyecto_academico_crud/v1/',
  SGA_MID_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/sga_mid/v1/',
  CLIENTE_HABILITAR_PERIODO_SERVICE: 'http://localhost:8088/v1/',
  OFERTA_ACADEMICA_SERVICE: 'http://localhost:8095/v1/',
  INSCRIPCION_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8208/v1/',
  UBICACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/ubicaciones_crud/v1/',
  DESCUENTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/descuento_academico_crud/v1/',
  DOCUMENTO_PROGRAMA_SERVICE: 'https://autenticacion.udistrital.edu.co/apioas/documento_programa_crud/v1/',
  ENTE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/ente_crud/v1/',
  ORGANIZACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/organizacion_crud/v1/',
  EXPERIENCIA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/experiencia_laboral_crud/v1/',
  FORMACION_ACADEMICA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/formacion_academica_crud/v1/',
  IDIOMA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/idiomas_crud/v1/',
  RECIBO_SERVICE: 'http://api.planestic.udistrital.edu.co:9017/v1/',
  PAGO_SERVICE: 'http://prueba.campusvirtual.udistrital.edu.co/pagos/',
};
