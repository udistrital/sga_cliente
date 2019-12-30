import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_EXTERNO } from './form-externo';
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
// import { ListService } from '../../../@core/store/services/list.service';
// import { Store } from '@ngrx/store';
// import { IAppState } from '../../../@core/store/app.state';


@Component({
  selector: 'ngx-crud-externo',
  templateUrl: './crud-externo.component.html',
  styleUrls: ['./crud-externo.component.scss'],
})
export class CrudExternoComponent implements OnInit {
  config: ToasterConfig;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  @Input('info_proyecto_seleccionado_id')
  set name(info_proyecto_seleccionado_id: number) {
    this.info_proyecto_seleccionado_id = info_proyecto_seleccionado_id;
    // this.loadInfoFormacionAcademica();
  }

  formTransferenciaExterna: any;
  info_transferencia_externa: any;
  info_proyecto_seleccionado_id: number;
  periodo: any;
  clean: boolean;
  loading: boolean;
  percentage: number;
  persona_id: number;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private users: UserService,
    private coreService: CoreService,
    private sgaMidService: SgaMidService,
    // private store: Store<IAppState>,
    // private listService: ListService,
    private toasterService: ToasterService) {
    this.formTransferenciaExterna = FORM_EXTERNO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.persona_id = this.users.getPersonaId();
    this.cargarPeriodo();
    this.loading = true;
    // this.listService.findProgramaAcademico();
    // this.loadLists();
  }

  construirForm() {
    // this.formTransferenciaExterna.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formTransferenciaExterna.btn = this.translate.instant('GLOBAL.guardar');
    this.formTransferenciaExterna.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formTransferenciaExterna.campos.length; i++) {
      this.formTransferenciaExterna.campos[i].label = this.translate.instant('GLOBAL.' + this.formTransferenciaExterna.campos[i].label_i18n);
      this.formTransferenciaExterna.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formTransferenciaExterna.campos[i].label_i18n);
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTransferenciaExterna.campos.length; index++) {
      const element = this.formTransferenciaExterna.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  /*
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formTransferenciaExterna.campos[this.getIndexForm('CarreraViene')].opciones = list.listProgramaAcademico[0];
      },
   );
  }
  */

  useLanguage(language: string) {
    this.translate.use(language);
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
      const formData = event.data.InfoTransferenciaExterna;
      const dataPostTransferenciaExterna = {
        InscripcionEstudiante: {
          Id: 0,
          PersonaId: this.persona_id,
          // ProgramaAcademicoId: formData.carreratransfiere.Id,
          ProgramaAcademicoId: this.info_proyecto_seleccionado_id || 1,
          PeriodoId: this.periodo.Id,
          AceptaTerminos: true,
          FechaAceptaTerminos: new Date(),
          Activo: true,
          EstadoInscripcionId: {
            Id: 1, // activa
          },
          TipoInscripcionId: {
            Id: 5, // transferencia externa
          },
        },
        TransferenciaEstudiante: {
          Id: 0,
          InscripcionId: {
            Id: 0,
          },
          TransferenciaInterna: false,
          CodigoEstudianteProviene: undefined,
          UniversidadProviene: formData.UniversidadViene,
          ProyectoCurricularProviene: formData.CarreraViene,
          UltimoSemestreCursado: formData.UltimoSemestre,
          MotivoRetiro: formData.Motivos,
          Activo: true,
        },
      }
      this.createTransferenciaExterna(dataPostTransferenciaExterna);
      this.result.emit(event);
    }
  }

  createTransferenciaExterna(infoTransferenciaExterna: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('transferencia_interna.seguro_continuar_registrar'),
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
          this.info_transferencia_externa = <any>infoTransferenciaExterna;
          this.sgaMidService.post('inscripciones/post_transferencia', this.info_transferencia_externa)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.Type !== 'error') {
                this.loading = false;
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.registrar'),
                  this.translate.instant('transferencia_externa.transferencia_registrada'));
                this.clean = !this.clean;
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('transferencia_externa.transferencia_no_registrada'));
              }
            },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('transferencia_externa.transferencia_no_registrada'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
              this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('transferencia_externa.transferencia_no_registrada'));
            });
          }
      });
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
