import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_ICFES} from './form-icfes';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { ListService } from '../../../@core/store/services/list.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';

@Component({
  selector: 'ngx-crud-icfes',
  templateUrl: './crud-icfes.component.html',
  styleUrls: ['./crud-icfes.component.scss'],
})
export class CrudIcfesComponent implements OnInit {
  config: ToasterConfig;
  info_formacion_academica_id: number;
  inscripcion_id: number;
  persiona_id: number;

  @Input('info_formacion_academica_id')
  set name(info_formacion_academica_id: number) {
    this.info_formacion_academica_id = info_formacion_academica_id;
    // this.loadInfoFormacionAcademica();
  }

  @Input('inscripcion_id')
  set inscripcion(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    // this.loadInfoFormacionAcademica();
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_icfes: any;
  formIcfes: any;
  temp: any;
  clean: boolean;
  loading: boolean;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private sgaMidService: SgaMidService,
    private users: UserService,
    private store: Store<IAppState>,
    private listService: ListService,
    private toasterService: ToasterService) {
    this.formIcfes = FORM_ICFES;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findTipoICFES();
    this.listService.findLocalidadesBogota();
    this.listService.findTipoColegio();
    this.listService.findSemestresSinEstudiar();
    // this.loadOptionsPais();
    this.persiona_id = this.users.getPersonaId();
    this.loadLists();
  }

  construirForm() {
    // this.formIcfes.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formIcfes.btn = this.translate.instant('GLOBAL.guardar');
    this.formIcfes.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formIcfes.campos.length; i++) {
      this.formIcfes.campos[i].label = this.translate.instant('GLOBAL.' + this.formIcfes.campos[i].label_i18n);
      this.formIcfes.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formIcfes.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    // this.loadInfoFormacionAcademica();
  }

  setPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  createIcfesColegio(infoIcfes: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('icfes_colegio.seguro_continuar_registrar'),
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
          this.info_icfes = <any>infoIcfes;
          this.sgaMidService.post('inscripciones/post_info_icfes_colegio', this.info_icfes)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.Type !== 'error') {
                this.loading = false;
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.registrar'),
                  this.translate.instant('icfes_colegio.icfes_colegio_registrado'));
                this.clean = !this.clean;
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'));
              }
            },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
              this.showToast('error', this.translate.instant('GLOBAL.error'),
                this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'));
            });
          }
      });
  }

  validarForm(event) {
    if (event.valid) {
      const formData = event.data.InfoIcfes;
      const tercero = {
        Id: this.persiona_id  || 1, // se debe cambiar solo por persona id
      }
      const inscripcion = {
        Id: this.inscripcion_id || 1, // se debe cambiar solo por inscripcion
      }
      const dataIcfesColegio = {
        InscripcionPregrado: {
          Id: 0,
          InscripcionId: inscripcion,
          TipoIcfesId: formData.TipoIcfes,
          CodigoIcfes: formData.NúmeroRegistroIcfes,
          TipoDocumentoIcfes: 1,
          NumeroIdentificacionIcfes: 1,
          AnoIcfes: Number(formData.NúmeroRegistroIcfes.substr(0, 4)),
          Activo: true,
        },
        InfoComplementariaTercero: [
          {
            // Localidad colegio
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: formData.LocalidadColegio,
            Dato: JSON.stringify(formData.LocalidadColegio),
            Activo: true,
          },
          {
            // Tipo Colegio
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: formData.TipoColegio,
            Dato: JSON.stringify(formData.TipoColegio),
            Activo: true,
          },
          {
            // Semestres sin estudiar
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: formData.numeroSemestres,
            Dato: JSON.stringify(formData.numeroSemestres),
            Activo: true,
          },
        ],
      }
      this.createIcfesColegio(dataIcfesColegio);
      this.result.emit(event);
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formIcfes.campos.length; index++) {
      const element = this.formIcfes.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
       this.formIcfes.campos[this.getIndexForm('TipoIcfes')].opciones = list.listICFES[0];
       this.formIcfes.campos[this.getIndexForm('LocalidadColegio')].opciones = list.listLocalidadesBogota[0];
       this.formIcfes.campos[this.getIndexForm('TipoColegio')].opciones = list.listTipoColegio[0];
       this.formIcfes.campos[this.getIndexForm('numeroSemestres')].opciones = list.listSemestresSinEstudiar[0];
      },
   );
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
