/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: false,
  NUXEO: {
    PATH: 'https://documental.udistrital.edu.co/nuxeo/',
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
  DOCUMENTO_SERVICE: 'http://api.planestic.udistrital.edu.co:8094/v1/',
  CAMPUS_MID: 'http://localhost:8095/v1/',
  CORE_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8205/v1/',
  EVENTO_SERVICE: 'http://localhost:8080/v1/',
  OIKOS_SERVICE: 'http://localhost:8082/v1/',
  UNIDAD_TIEMPO_SERVICE: 'http://api.planestic.udistrital.edu.co:8102/v1/',
  PROYECTO_ACADEMICO_SERVICE: 'http://localhost:8080/v1/',
  SGA_MID_SERVICE: 'http://localhost:8095/v1/',
  CLIENTE_HABILITAR_PERIODO_SERVICE: 'http://localhost:8088/v1/',
  OFERTA_ACADEMICA_SERVICE: 'http://localhost:8095/v1/',
};
