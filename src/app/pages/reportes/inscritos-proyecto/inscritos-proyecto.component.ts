import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

import { spagoBIService } from '../../../@core/utils/spagoBIAPI/spagoBIService';

@Component({
  selector: 'ngx-inscritos-proyecto',
  templateUrl: './inscritos-proyecto.component.html',
  styleUrls: ['./inscritos-proyecto.component.scss'],
})
export class InscritosProyectoComponent implements OnInit {

  @ViewChild('spagoBIDocumentArea') spagoBIDocumentArea: ElementRef;
  @Input() reportConfig: any;

  constructor() {
    this.initReportConfig();
  }

  initReportConfig() {
    this.reportConfig = {
      documentLabel: 'sga_v2_reporte_inscr',
      eecutionRole: '/spagobi/user/admin',
      displayToolbar: true,
      displaySliders: false,
      iframe: {
          style: 'border: 0px;',
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
      this.spagoBIDocumentArea.nativeElement.innerHTML = '<h1>Error obteniendo la información del reporte</h1>';
    }
  }

  ngOnInit() {
    this.getReport();
  }

  getReport() {
    spagoBIService.getReport(this, this.callbackFunction);
  }
  
}
