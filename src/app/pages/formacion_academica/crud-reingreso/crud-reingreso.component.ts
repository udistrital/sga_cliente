import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProgramaAcademico } from './../../../@core/data/models/proyecto_academico/programa_academico';
import { FORM_REINGRESO} from './form-reingreso';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { UserService } from '../../../@core/data/users.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { CoreService } from '../../../@core/data/core.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { DocumentoService } from '../../../@core/data/documento.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-crud-reingreso',
  templateUrl: './crud-reingreso.component.html',
  styleUrls: ['./crud-reingreso.component.scss'],
})
export class CrudReingresoComponent implements OnInit {
  config: ToasterConfig;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  formReingreso: any;
  info_reintegro: any;
  periodo: any;
  clean: boolean;
  loading: boolean;
  percentage: number;
  ente: any;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private users: UserService,
    private coreService: CoreService,
    private sgaMidService: SgaMidService,
    private toasterService: ToasterService) {
    this.formReingreso = FORM_REINGRESO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.ente = this.users.getEnte();
    this.cargarPeriodo();
    this.loading = true;
  }

  construirForm() {
    // this.formReingreso.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formReingreso.btn = this.translate.instant('GLOBAL.guardar');
    this.formReingreso.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formReingreso.campos.length; i++) {
      this.formReingreso.campos[i].label = this.translate.instant('GLOBAL.' + this.formReingreso.campos[i].label_i18n);
      this.formReingreso.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formReingreso.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  createReintegro(infoReintegro: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('GLOBAL.crear') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          this.info_reintegro = <any>infoReintegro;
          this.sgaMidService.post('inscripciones/post_reintegro', this.info_reintegro)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.Type !== 'error') {
                this.loading = false;
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.crear'),
                  this.translate.instant('GLOBAL.crear') + ' ' +
                  this.translate.instant('GLOBAL.confirmarCrear'));
                this.clean = !this.clean;
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('GLOBAL.error'));
              }
            },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.crear') + '-' +
                  this.translate.instant('GLOBAL.formacion_academica'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
              this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('GLOBAL.error'));
            });
          }
      });
  }

  ngOnInit() {
  }

  cargarPeriodo(): void {
    this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.periodo = <any>res[0];
        }
      },
      (error: HttpErrorResponse) => {
        Swal({
          type: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.periodo_academico'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  validarForm(event) {
    if (event.valid) {
      const formData = event.data.InfoReintegro;
      const dataPostReintegro = {
        InscripcionEstudiante: {
          Id: 0,
          PersonaId: this.ente,
          ProgramaAcademicoId: Number(formData.codigo.substr(5, 3)),
          PeriodoId: this.periodo.Id,
          AceptaTerminos: true,
          FechaAceptaTerminos: new Date(),
          Activo: true,
          EstadoInscripcionId: {
            Id: 1, // activa
          },
          TipoInscripcionId: {
            Id: 6, // reintegro
          },
        },
        ReintegroEstudiante: {
          Id: 0,
          CodigoEstudiante: Number(formData.codigo),
          CanceloSemestre: (formData.Cancelo.Id === 'Si') ? true : false,
          MotivoRetiro: formData.Motivos,
          Activo: true,
          InscripcionId: {
            Id: 0,
          },
          SolicitudAcuerdo: (formData.SolicitudAcuerdo.Id === 'Si') ? true : false,
        },
      }
      this.createReintegro(dataPostReintegro);
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
