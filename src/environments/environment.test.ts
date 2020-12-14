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
  CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
  NOTIFICACION_SERVICE: 'wss://pruebasapi.portaloas.udistrital.edu.co:8116/ws',
  CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'm6xGggH1_HF4PIpoczcDA6EFEYUa',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role documento',
    REDIRECT_URL: 'https://pruebassga.portaloas.udistrital.edu.co',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'https://pruebassga.portaloas.udistrital.edu.co',
  },
  SPAGOBI: {
    PROTOCOL: 'https',
    HOST: 'intelligentia.udistrital.edu.co',
    PORT: '8443',
    CONTEXTPATH: 'SpagoBI',
    USER: 'sergio_orjuela',
    PASSWORD: 'sergio_orjuela',
  },
  TERCEROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
  PERSONA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/personas_crud/v1/',
  PRODUCCION_ACADEMICA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/produccion_academica_crud/v1/',
  DOCUMENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/documento_crud/v1/',
  CORE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/core_crud/v2/',
  OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v1/',
  PROYECTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/proyecto_academico_crud/v1/',
  SGA_MID_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/sga_mid/v1/',
  EVENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/sesiones_crud/v2/',
  OFERTA_ACADEMICA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/sesiones_crud/v1/',
  CLIENTE_HABILITAR_PERIODO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/core_crud/v1/',
  CAMPUS_MID: 'http://localhost:8095/v1/',
  INSCRIPCION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/inscripcion_crud/v2/',
  UBICACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/ubicaciones_crud/v1/',
  DOCUMENTO_PROGRAMA_SERVICE: 'https://autenticacion.udistrital.edu.co/apioas/documento_programa_crud/v1/',
  EXPERIENCIA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/experiencia_laboral_crud/v1/',
  FORMACION_ACADEMICA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/formacion_academica_crud/v1/',
  IDIOMA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/idiomas_crud/v1/',
  ENTE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/ente_crud/v1/',
  ORGANIZACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/organizacion_crud/v1/',
  DESCUENTO_ACADEMICO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/matriculas_descuentos_crud/v1/',
  PAGO_SERVICE: 'http://prueba.campusvirtual.udistrital.edu.co/pagos/',
  RECIBO_SERVICE: 'http://api.planestic.udistrital.edu.co:9017/v1/',
  CIDC_SERVICE: 'http://200.69.103.88:3114/api/v1/',
  EVALUACION_INSCRIPCION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/evaluacion_inscripcion_crud/v2/',
  PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/',
};
