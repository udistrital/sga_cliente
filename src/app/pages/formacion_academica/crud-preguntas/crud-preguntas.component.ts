import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Lugar } from './../../../@core/data/models/lugar/lugar';
import { ProgramaAcademico } from './../../../@core/data/models/proyecto_academico/programa_academico';
import { FORM_PREGUNTAS} from './form-preguntas';
import { UbicacionService } from '../../../@core/data/ubicacion.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { Organizacion } from '../../../@core/data/models/ente/organizacion';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { ListService } from '../../../@core/store/services/list.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';

@Component({
  selector: 'ngx-crud-preguntas',
  templateUrl: './crud-preguntas.component.html',
  styleUrls: ['./crud-preguntas.component.scss'],
})
export class CrudPreguntasComponent implements OnInit {
  config: ToasterConfig;
  info_formacion_academica_id: number;

  @Input('info_formacion_academica_id')
  set name(info_formacion_academica_id: number) {
    this.info_formacion_academica_id = info_formacion_academica_id;
    // this.loadInfoFormacionAcademica();
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_universidad: any;
  formUniversidad: any;
  temp: any;
  clean: boolean;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private users: UserService,
    private store: Store<IAppState>,
    private listService: ListService,
    private toasterService: ToasterService) {
    this.formUniversidad = FORM_PREGUNTAS;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    // this.loadOptionsPais();
    // this.ente = this.users.getEnte();
    this.listService.findMediosEnteroUniversidad();
    this.listService.findSePresentaAUniversidadPor();
    this.loadLists();
  }

  construirForm() {
    // this.formUniversidad.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formUniversidad.btn = this.translate.instant('GLOBAL.guardar');
    this.formUniversidad.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formUniversidad.campos.length; i++) {
      this.formUniversidad.campos[i].label = this.translate.instant('GLOBAL.' + this.formUniversidad.campos[i].label_i18n);
      this.formUniversidad.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formUniversidad.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formUniversidad.campos.length; index++) {
      const element = this.formUniversidad.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
       this.formUniversidad.campos[this.getIndexForm('MedioEntero')].opciones = list.listMediosEnteroUniversidad[0];
       this.formUniversidad.campos[this.getIndexForm('PresentoUniversidad')].opciones = list.listSePresentaAUniversidadPor[0];
      },
   );
 }

  ngOnInit() {
    // this.loadInfoFormacionAcademica();
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  validarForm(event) {
    if (event.valid) {
      this.result.emit(event);
    }
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
