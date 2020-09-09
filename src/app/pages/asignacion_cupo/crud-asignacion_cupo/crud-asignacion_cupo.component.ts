import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_ASIGNACION_CUPO } from './form-asignacion_cupo';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { ListService } from '../../../@core/store/services/list.service';
import { UserService } from '../../../@core/data/users.service';
import { InstitucionEnfasis } from '../../../@core/data/models/proyecto_academico/institucion_enfasis';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MatSelect } from '@angular/material';

@Component({
  selector: 'ngx-crud-asignacion-cupo',
  templateUrl: './crud-asignacion_cupo.component.html',
  styleUrls: ['./crud-asignacion_cupo.component.scss'],
})
export class CrudAsignacionCupoComponent implements OnInit {
  config: ToasterConfig;

  @Input() info_proyectos: any;
  @Input() info_periodo: any;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_info_persona: any;
  info_cupos: any;
  info_criterio_icfes_post: any;
  formAsigancionCupo: any;
  regInfoPersona: any;
  info_inscripcion: any;
  clean: boolean;
  loading: boolean;
  percentage: number;
  aceptaTerminos: boolean;
  programa: number;
  aspirante: number;
  periodo: any;
  show_calculos_cupos = false;
  source_emphasys: LocalDataSource = new LocalDataSource();
  porcentaje_subcriterio_total: number;
  settings_emphasys: any;
  arr_cupos: any[] = [];
  constructor(
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private toasterService: ToasterService) {
      this.settings_emphasys = {
        delete: {
          deleteButtonContent: '<i class="nb-trash"></i>',
          confirmDelete: true,
        },
        actions: {
          delete: false,
          edit: false,
          add: false,
          position: 'right',
        },
        mode: 'external',
        columns: {
          Nombre: {
            title: this.translate.instant('GLOBAL.cupos'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
            width: '50%',
          },
          Cupos: {
            title: this.translate.instant('GLOBAL.numero_cupos'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
            width: '50%',
          },
        },
      };
      this.formAsigancionCupo = FORM_ASIGNACION_CUPO;
      this.construirForm();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirForm();
      });
      this.loading = false;
  }

  construirForm() {
    // this.formInfoPersona.titulo = this.translate.instant('GLOBAL.info_persona');
    this.formAsigancionCupo.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formAsigancionCupo.campos.length; i++) {
      this.formAsigancionCupo.campos[i].label = this.translate.instant('GLOBAL.' + this.formAsigancionCupo.campos[i].label_i18n);
      this.formAsigancionCupo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formAsigancionCupo.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formAsigancionCupo.campos.length; index++) {
      const element = this.formAsigancionCupo.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }
  onCreateEmphasys(event: any) {
    const projetc = event.value;
    if (!this.arr_cupos.find((proyectos: any) => projetc.Id === proyectos.Id ) && projetc.Id) {
      this.arr_cupos.push(projetc);
      this.source_emphasys.load(this.arr_cupos);
      const matSelect: MatSelect = event.source;
      matSelect.writeValue(null);
    } else {
      Swal({
        type: 'error',
        title: 'ERROR',
        text: this.translate.instant('inscripcion.error_proyecto_ya_existe'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }
  onDeleteEmphasys(event: any) {
    const findInArray = (value, array, attr) => {
      for (let i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
      }
      return -1;
    }
    this.arr_cupos.splice(findInArray(event.data.Id, this.arr_cupos, 'Id'), 1);
    this.source_emphasys.load(this.arr_cupos);
  }
  createCupos() {

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
                console.info(JSON.stringify(this.info_cupos));
                this.sgamidService.post('admision/postcupos', this.info_cupos)
                  .subscribe(res => {
                    const r = <any>res
                    if (r !== null && r.Type !== 'error') {
                      this.loading = false;
                      this.showToast('info', this.translate.instant('GLOBAL.crear'),
                        this.translate.instant('GLOBAL.info_cupos') + ' ' +
                        this.translate.instant('GLOBAL.confirmarCrear'));
                        this.eventChange.emit(true);
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
                          this.translate.instant('GLOBAL.info_cupos'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
        }
      });
  }



  ngOnInit() {

  }

  validarForm(event) {
    if (event.valid) {
      const cupos = event.data.InfoCupos.CuposAsignados
    const datos = [{Nombre: 'Comunidades Negras', Cupos: Math.trunc((Number(cupos) / 40 ) * 2 )},
    { Nombre: 'Desplazados víctimas del conflicto  armado', Cupos: Math.trunc((Number(cupos) / 40 ) * 1 )},
    { Nombre: 'Comunidades indígenas', Cupos: Math.trunc((Number(cupos) / 40 ) * 2 )},
    { Nombre: 'Mejor Bachiller de los Colegios Públicos del Distrito Capital', Cupos: Math.trunc((Number(cupos) / 40 ) * 1 )},
    { Nombre: 'Beneficiarios de la ley 1084 de 2006 ', Cupos: 1 },
    { Nombre: 'Beneficiarios del Programa de Reincorporación y/o Reintegración en el marco del programa para la paz', Cupos: 1 } ];
     const data = <Array<any>>datos;
     this.source_emphasys.load(data);
      this.show_calculos_cupos = true;
      this.calculocupos(event.data.InfoCupos)
    }
  }

  calculocupos(InfoCupos: any): void {
    // Se definen el calculos de los cupos segun historia de usuario la funcion redondea segun decimas por encima por encima de .5
    this.info_cupos = <any>InfoCupos;
    this.info_cupos.Proyectos = this.info_proyectos;
    this.info_cupos.Periodo = this.info_periodo;
    this.info_cupos.CuposOpcionados = Number(Math.trunc((Number(this.info_cupos.CuposAsignados) ) * 0.5 ))
    this.info_cupos.CuposEspeciales = {
      ComunidadesNegras : String(Math.trunc((Number(this.info_cupos.CuposAsignados) / 40 ) * 2 )),
      DesplazadosVictimasConflicto : String(Math.trunc((Number(this.info_cupos.CuposAsignados) / 40 ) * 1 )),
      ComunidadesIndiginas : String(Math.trunc((Number(this.info_cupos.CuposAsignados) / 40 ) * 2 )),
      MejorBachiller : String(Math.trunc((Number(this.info_cupos.CuposAsignados) / 40 ) * 1 )),
      Ley1084 : '1',
      ProgramaReincorporacion: '1',
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
