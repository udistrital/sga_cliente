import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProgramaAcademico } from './../../../@core/data/models/proyecto_academico/programa_academico';
import { FORM_TRANSFERENCIAINTERNA} from './form-transferencia_interna';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { UserService } from '../../../@core/data/users.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { CoreService } from '../../../@core/data/core.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-crud-transferencia_interna',
  templateUrl: './crud-transferencia_interna.component.html',
  styleUrls: ['./crud-transferencia_interna.component.scss'],
})
export class CrudTransferenciaInternaComponent implements OnInit {
  config: ToasterConfig;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  formTransferencia: any;
  info_transferencia: any;
  periodo: any;
  clean: boolean;
  loading: boolean;
  percentage: number;
  persona_id: any;

  constructor(
    private translate: TranslateService,
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    private users: UserService,
    private coreService: CoreService,
    private sgaMidService: SgaMidService,
    private store: Store<IAppState>,
    private listService: ListService,
    private toasterService: ToasterService) {
    this.formTransferencia = FORM_TRANSFERENCIAINTERNA;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.persona_id = this.users.getPersonaId();
    this.cargarPeriodo();
    this.loading = true;
    this.listService.findProgramaAcademico();
    this.loadLists();
  }

  construirForm() {
    // this.formTransferencia.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');
    this.formTransferencia.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formTransferencia.campos.length; i++) {
      this.formTransferencia.campos[i].label = this.translate.instant('GLOBAL.' + this.formTransferencia.campos[i].label_i18n);
      this.formTransferencia.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formTransferencia.campos[i].label_i18n);
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTransferencia.campos.length; index++) {
      const element = this.formTransferencia.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formTransferencia.campos[this.getIndexForm('carreraqueviene')].opciones = list.listProgramaAcademico[0];
        this.formTransferencia.campos[this.getIndexForm('carreratransfiere')].opciones = list.listProgramaAcademico[0];
      },
   );
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  createTransferencia(infoTransferencia: any): void {
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
    Swal.fire(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          this.info_transferencia = <any>infoTransferencia;
          this.sgaMidService.post('inscripciones/post_transferencia', this.info_transferencia)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.Type !== 'error') {
                this.loading = false;
                this.eventChange.emit(true);
                this.showToast('info', this.translate.instant('GLOBAL.registrar'),
                  this.translate.instant('transferencia_interna.transferencia_registrada'));
                this.clean = !this.clean;
              } else {
                this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('transferencia_interna.transferencia_no_registrada'));
              }
              this.loading = false;
            },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon:'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('transferencia_interna.transferencia_no_registrada'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
              this.showToast('error', this.translate.instant('GLOBAL.error'),
                  this.translate.instant('transferencia_interna.transferencia_no_registrada'));
            });
          }
      });
  }

  ngOnInit() {
  }

  cargarPeriodo(): void {
    this.loading = true;
    this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.periodo = <any>res[0];
        }
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
        Swal.fire({
          icon:'error',
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
      const formData = event.data.InfoTransferenciaInterna;
      const dataPostTransferencia = {
        InscripcionEstudiante: {
          Id: 0,
          PersonaId: this.persona_id,
          ProgramaAcademicoId: formData.carreratransfiere.Id,
          PeriodoId: this.periodo.Id,
          AceptaTerminos: true,
          FechaAceptaTerminos: new Date(),
          Activo: true,
          EstadoInscripcionId: {
            Id: 1, // activa
          },
          TipoInscripcionId: {
            Id: 4, // transferencia interna
          },
        },
        TransferenciaEstudiante: {
          Id: 0,
          InscripcionId: {
            Id: 0,
          },
          TransferenciaInterna: true,
          CodigoEstudianteProviene: formData.codigo,
          UniversidadProviene: 'Universidad Distrital Francisco José de Caldas',
          ProyectoCurricularProviene: formData.carreraqueviene.Nombre,
          UltimoSemestreCursado: formData.UltimoSemestre,
          MotivoRetiro: formData.Motivos,
          Activo: true,
        },
      }
      this.createTransferencia(dataPostTransferencia);
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
      type: 'info', // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }
}
