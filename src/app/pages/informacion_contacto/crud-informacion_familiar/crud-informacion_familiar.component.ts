import { Lugar } from './../../../@core/data/models/lugar/lugar';
import { InformacionContacto } from './../../../@core/data/models/informacion/informacion_contacto';
import { InfoContactoGet } from './../../../@core/data/models/ente/info_contacto_get';
import { InfoContactoPut } from './../../../@core/data/models/ente/info_contacto_put';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { FORM_INFORMACION_FAMILIAR } from './form-informacion_familiar';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
// import { IAppState } from '../../../@core/store/app.state';
// import { ListService } from '../../../@core/store/services/list.service';
// import { Store } from '@ngrx/store';

@Component({
  selector: 'ngx-crud-informacion-familiar',
  templateUrl: './crud-informacion_familiar.component.html',
  styleUrls: ['./crud-informacion_familiar.component.scss'],
})
export class CrudInformacionFamiliarComponent implements OnInit {
  config: ToasterConfig;
  informacion_contacto_id: number;



  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_informacion_contacto: InformacionContacto;
  formInformacionFamiliar: any;
  regInformacionContacto: any;
  clean: boolean;
  denied_acces: boolean = false;
  paisSeleccionado: any;
  departamentoSeleccionado: any;
  ciudadSeleccionada: any;
  datosPost: any;
  datosGet: any;
  datosPut: any;
  loading: boolean;

  constructor(
    private translate: TranslateService,
    private campusMidService: CampusMidService,
    private ubicacionesService: UbicacionService,
    // private store: Store<IAppState>,
    // private listService: ListService,
    private toasterService: ToasterService) {
    this.formInformacionFamiliar = FORM_INFORMACION_FAMILIAR;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    // this.listService.findPais();
    // this.loadLists();
    this.loading = false;
  }

  construirForm() {
    // this.formInformacionContacto.titulo = this.translate.instant('GLOBAL.informacion_contacto');
    this.formInformacionFamiliar.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInformacionFamiliar.campos.length; i++) {
      this.formInformacionFamiliar.campos[i].label = this.translate.instant('GLOBAL.' + this.formInformacionFamiliar.campos[i].label_i18n);
      this.formInformacionFamiliar.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInformacionFamiliar.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

 

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInformacionFamiliar.campos.length; index++) {
      const element = this.formInformacionFamiliar.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  ngOnInit() {

  }


  setPercentage(event) {
    this.result.emit(event);
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

  public loadLists() {
    // this.store.select((state) => state).subscribe(
    //   (list) => {
    //     this.formInformacionContacto.campos[this.getIndexForm('PaisResidencia')].opciones = list.listPais[0];
    //   },
    // );
  }

}
