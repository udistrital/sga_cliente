import { Aplicacion } from './../../../@core/data/models/aplicacion';

import { Perfil } from './../../../@core/data/models/perfil';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FORM_ARCHIVO_ICFES } from './form-archivo_icfes';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-archivo-icfes',
  templateUrl: './crud-archivo_icfes.component.html',
  styleUrls: ['./crud-archivo_icfes.component.scss'],
})
export class CrudArchivoIcfesComponent implements OnInit {
  config: ToasterConfig;
  perfil_id: number;

  
  @Input('perfil_id')
  set name(perfil_id: number) {
    this.perfil_id = perfil_id;
  }
  

  @Output() eventChange = new EventEmitter();

  // info_perfil: Perfil;
  // formPerfil: any;
  // regPerfil: any;
  // clean: boolean;
  archivo_icfes_data: any;


  constructor(private translate: TranslateService, private sgaMidService: SgaMidService, private toasterService: ToasterService) {
    // this.formPerfil = FORM_ARCHIVO_ICFES;
    /*
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    */
    this.archivo_icfes_data = {
      name: undefined,
      archivo_icfes: undefined,
    }
  }

  onFileChange(event) {
    console.log(event);
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'text/plain') {
        this.archivo_icfes_data.archivo_icfes = file;
      } else {
        this.archivo_icfes_data.archivo_icfes = undefined;
        this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('archivo_icfes.error_formato')); 
      } 
    }
  }

  private preparePost(): any {
    const postData = new FormData();
    postData.append('name', this.archivo_icfes_data.name);
    postData.append('archivo_icfes', this.archivo_icfes_data.archivo_icfes);
    return postData;
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  postArchivoIcfes(): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.confirmar'),
      text: this.translate.instant('archivo_icfes.registrar_archivo'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willCreate) => {
      if (willCreate.value) {
        const formModel = this.preparePost();
        this.sgaMidService.post_file('archivo_icfes', formModel)
          .subscribe(res => {
            this.eventChange.emit(true);
            this.showToast('info', this.translate.instant('GLOBAL.confirmar'), this.translate.instant('archivo_icfes.archivo_registrado'));
          }, error => {
            this.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('archivo_icfes.archivo_no_registrado'))
          });
      }
    });
  }

  ngOnInit() {

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
