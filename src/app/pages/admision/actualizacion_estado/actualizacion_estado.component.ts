import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { OikosService } from '../../../@core/data/oikos.service';
import { CoreService } from '../../../@core/data/core.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-actualizacion-estado',
  templateUrl: './actualizacion_estado.component.html',
  styleUrls: ['./actualizacion_estado.component.scss'],
})
export class ActualizacionEstadoComponent implements OnInit, OnChanges {

  config: ToasterConfig;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  datos_persona: any;
  inscripcion: Inscripcion;
  preinscripcion: boolean;
  step = 0;
  cambioTab = 0;
  nForms: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;
  infoActulizacion: any;


  proyectos = [];
  periodos = [];
  nivel_load = [{nombre: 'Pregrado', id: 14}, { nombre: 'Posgrado', id: 15}];

  loading: boolean;
  programa_seleccionado: any;
  selectedValue: any;
  selectedTipo: any;
  proyectos_selected: any[];
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  periodo: any;
  selectednivel: any ;
  buttoncambio: boolean = true;
  info_actualizar_estados: any;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  constructor(
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private oikosService: OikosService,
    private coreService: CoreService,
    private toasterService: ToasterService ) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.cargarPeriodo();
  }


  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.coreService.get('periodo/?query=Activo:true&sortby=Id&order=desc&limit=1')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.periodo = <any>res[0];
          window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
          resolve(this.periodo);
          const periodos = <Array<any>>res;
         periodos.forEach(element => {
            this.periodos.push(element);
          });
        }
      },
      (error: HttpErrorResponse) => {
        reject(error);
      });
    });
  }

  loadProyectos() {
    // window.localStorage.setItem('IdNivel', String(this.selectednivel.id));
    this.selectprograma = false;
    this.oikosService.get('dependencia/?query=DependenciaTipoDependencia.TipoDependenciaId.Id:' + Number(this.selectednivel.id) +
    ',Activo:true&limit=0')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          const ProyectosConsultados = <Array<any>>res;
            this.proyectos = ProyectosConsultados;
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon:'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.programa_academico'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  activar_button() {
    this.buttoncambio = false

  }

  cambiarestados() {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('GLOBAL.actualizar') + '?',
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
          this.info_actualizar_estados = {}
                this.info_actualizar_estados.Proyectos = this.proyectos_selected;
                this.info_actualizar_estados.Periodo = this.periodo;
                console.info(JSON.stringify(this.info_actualizar_estados));
                this.sgamidService.post('admision/cambioestado', this.info_actualizar_estados)
                  .subscribe(res => {
                    const r = <any>res
                    if (r !== null && r.Type !== 'error') {
                      this.loading = false;
                      this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                        this.translate.instant('GLOBAL.info_estado') + ' ' +
                        this.translate.instant('GLOBAL.confirmarActualizar'));
                        this.eventChange.emit(true);
                    } else {
                      this.showToast('error', this.translate.instant('GLOBAL.error'),
                        this.translate.instant('GLOBAL.error'));
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal.fire({
                        icon:'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                          this.translate.instant('GLOBAL.info_estado'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
        }
      });
  }

  ngOnInit() {

    }

  ngOnChanges() {

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
