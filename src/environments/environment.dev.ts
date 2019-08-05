/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: true,
  NUXEO: {
    PATH: 'https://documental.udistrital.edu.co/nuxeo/',
  },
  CONFIGURACION_SERVICE: 'https://autenticacion.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
  CONF_MENU_SERVICE: 'https://autenticacion.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
  NOTIFICACION_SERVICE: 'ws://10.20.0.254:8199/ws/join',
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'qGicYmef58iY7VxyFm8B39995FUa',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role documento',
    REDIRECT_URL: 'http://10.20.0.254/configuracionv2/',
    SIGN_OUT_URL: 'https://autenticacion.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'http://10.20.0.254/configuracionv2/',
  },

};
