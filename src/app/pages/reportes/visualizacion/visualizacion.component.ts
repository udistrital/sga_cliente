import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { spagoBIService } from '../../..//@core/utils/spagoBIAPI/spagoBIService';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-visualizacion',
  templateUrl: './visualizacion.component.html',
  styleUrls: ['./visualizacion.component.scss'],
})
export class VisualizacionComponent implements OnInit {

  config: ToasterConfig;
  reportConfig: any;
  retry: boolean = true;
  spinner: string = 'Cargando reporte.';

  @ViewChild('spagoBIDocumentArea', { static: true }) spagoBIDocumentArea: ElementRef;
  @Input() reportLabel: string;

  constructor(
    private translate: TranslateService,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
  ) {
    this.initReportConfig();
  }

  initReportConfig() {
    this.route.data.subscribe(data => {
      if (data && data.reportLabel) {
        this.reportLabel = data.reportLabel;
        const reportLabel = this.reportLabel + environment.SPAGOBI.TIPO_REPORTE;
        this.reportConfig = {
          documentLabel: reportLabel,
          executionRole: '/spagobi/user',
          displayToolbar: true,
          displaySliders: true,
          iframe: {
            style: 'border: solid rgb(0,0,0,0.2) 1px;',
            height: '600px;',
            width: '100%',
          },
        };
      }
    });
  }

  callbackFunction(result, args, success) {
    if (success === true) {
      this.spinner = '';
      const html = spagoBIService.getDocumentHtml(this.reportConfig);
      this.spagoBIDocumentArea.nativeElement.innerHTML = html;
    } else if (this.retry) {
      this.spinner = 'Cargando reporte.';
      this.retry = false;
      this.getReport();
    } else {
      this.spinner = '';
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
      positionClass: 'toast-top-center',
      timeout: 5000,
      newestOnTop: true,
      tapToDismiss: false,
      preventDuplicates: true,
      animation: 'slideDown',
      limit: 5,
    });
    const toast: Toast = {
      type: type,
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }


}
