import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { Router, ResolveEnd } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { OikosService } from '../../../@core/data/oikos.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { UserService } from '../../../@core/data/users.service';
import { CoreService } from '../../../@core/data/core.service';
import { TercerosService} from '../../../@core/data/terceros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { from } from 'rxjs';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FormControl, Validators } from '@angular/forms';
import { EvaluacionInscripcionService } from '../../../@core/data/evaluacion_inscripcion.service';
import { LocalDataSource } from 'ng2-smart-table';
import { MatSelect } from '@angular/material';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-listado-aspirante',
  templateUrl: './listado_aspirante.component.html',
  styleUrls: ['./listado_aspirante.component.scss'],
})
export class ListadoAspiranteComponent implements OnInit, OnChanges {

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
  proyectos_selected: any;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  periodo: any;
  selectednivel: any ;
  buttoncambio: boolean = true;
  info_consultar_aspirantes: any;
  settings_emphasys: any;
  arr_cupos: any[] = [];
  source_emphasys: LocalDataSource = new LocalDataSource();
  show_listado= false;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  constructor(
    private translate: TranslateService,
    private sgamidService: SgaMidService,
    private oikosService: OikosService,
    private coreService: CoreService,
    private toasterService: ToasterService ) {
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
          TipoDocumento: {
            title: this.translate.instant('GLOBAL.Tipo'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
            width: '2%',
          },
          NumeroDocumento: {
            title: this.translate.instant('GLOBAL.Documento'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
            width: '8%',
          },
          NombreAspirante: {
            title: this.translate.instant('GLOBAL.Nombre'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
            width: '50%',
          },
          NotaFinal: {
            title: this.translate.instant('GLOBAL.Puntaje'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
            width: '5%',
          },
          TipoInscripcionId: {
            title: this.translate.instant('GLOBAL.TipoInscripcion'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value.Nombre;
            },
            width: '25%',
          },
          EstadoInscripcionId: {
            title: this.translate.instant('GLOBAL.Estado'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value.Nombre;
            },
            width: '10%',
          },
        },
      };
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
          Swal({
            type: 'error',
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

  mostrartabla() {
    this.show_listado = true

    this.info_consultar_aspirantes = {
      Id_proyecto: Number(this.proyectos_selected['Id']),
      Id_periodo: Number(this.periodo['Id']),
    }
          this.sgamidService.post('admision/consulta_aspirantes', this.info_consultar_aspirantes)
            .subscribe(res => {
              const r = <any>res
              if (r !== null && r.Type !== 'error') {
                this.loading = false;
                r.sort((puntaje_mayor, puntaje_menor ) =>  puntaje_menor.NotaFinal - puntaje_mayor.NotaFinal )
                 const data = <Array<any>>r;
                 this.source_emphasys.load(data);

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
                  footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                    this.translate.instant('GLOBAL.info_estado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
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
