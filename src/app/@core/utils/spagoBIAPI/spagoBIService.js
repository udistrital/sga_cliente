function setBaseUrl(config){
	Sbi.sdk.services.setBaseUrl(config);
}

function authenticate(config){
      Sbi.sdk.api.authenticate(config);
}

function getDocumentHtml(config){
      var html = Sbi.sdk.api.getDocumentHtml(config);
      return html;
}

function getReport(scope, callbackFunction){
      const baseUrl = {
            protocol: 'https', 
            host: 'intelligentia.udistrital.edu.co', 
            port: '8443', 
            contextPath: 'SpagoBI', 
            controllerPath: 'servlet/AdapterHTTP'
      };
      const authConf = {
            params: {
                  user: 'sergio_orjuela',
                  password: 'sergio_orjuela'
            },
            callback: {
                  fn: callbackFunction,
                  scope: scope
            }
      };
      setBaseUrl(baseUrl);
      authenticate(authConf);
}

var spagoBIService = {};

/*
spagoBIService.setBaseUrl = setBaseUrl;
spagoBIService.getDocumentHtml = getDocumentHtml;
spagoBIService.authenticate = authenticate;
*/

spagoBIService.getReport = getReport;
spagoBIService.getDocumentHtml = getDocumentHtml;

export {spagoBIService};

