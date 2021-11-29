import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { spagoBIService } from '../../../../@core/utils/spagoBIAPI/spagoBIService';

@Component({
  selector: 'ngx-admision-proyecto',
  templateUrl: './admision-proyecto.component.html',
  styleUrls: ['./admision-proyecto.component.scss'],
})
export class AdmisionProyectoComponent implements OnInit {

  config: ToasterConfig;

  @ViewChild('spagoBIDocumentArea', {static: true}) spagoBIDocumentArea: ElementRef;
  @Input() reportConfig: any;

  constructor(private translate: TranslateService, private toasterService: ToasterService) {
    this.initReportConfig();
  }

  initReportConfig() {
    this.reportConfig = {
      documentLabel: 'admision_proyecto',
      eecutionRole: '/spagobi/user/admin',
      // parameters: {'PARAMETERS': 'param_1=1&param_2=2'},
      displayToolbar: true,
      displaySliders: true,
      iframe: {
          style: 'border: solid rgb(0,0,0,0.2) 1px;',
          height: '500px;',
          width: '100%',
      },
    };
  }

  callbackFunction(result, args, success) {
    if (success === true) {
      const html = spagoBIService.getDocumentHtml(this.reportConfig);
      this.spagoBIDocumentArea.nativeElement.innerHTML = html;
    } else {
      // console.info('ERROR: authentication failed! Invalid username and/or password ');
      const message = this.translate.instant('reportes.error_obteniendo_reporte');
      this.spagoBIDocumentArea.nativeElement.innerHTML = `<h5>${message}</h5>`;
      this.showToast('error', 'Error', this.translate.instant('reportes.error_obteniendo_reporte'));
    }
  }

  ngOnInit() {
    this.getReport();
  }

  getReport() {
    spagoBIService.getReport(this, this.callbackFunction);
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }

}
