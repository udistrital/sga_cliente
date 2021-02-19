import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { Router, ResolveEnd } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { OikosService } from '../../../@core/data/oikos.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { UserService } from '../../../@core/data/users.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { TercerosService} from '../../../@core/data/terceros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import { IMAGENES } from './imagenes';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { from } from 'rxjs';
import { ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { SgaMidService } from '../../../@core/data/sga_mid.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ngx-preinscripcion',
  templateUrl: './preinscripcion.component.html',
  styleUrls: ['./preinscripcion.component.scss'],
})
export class PreinscripcionComponent implements OnInit, OnChanges {

  @Input('inscripcion_id')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === '0') {
      this.selectedValue = undefined;
      window.localStorage.setItem('programa', this.selectedValue);
    }
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      // this.getInfoInscripcion();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  config: ToasterConfig;
  inscripcion_id: number;
  info_persona_id: number;
  info_ente_id: number;
  estado_inscripcion: number;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion: Inscripcion;
  preinscripcion: boolean;
  step = 0;
  cambioTab = 0;
  nForms: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;

  percentage_info: number = 0;
  percentage_acad: number = 0;
  percentage_expe: number = 0;
  percentage_proy: number = 0;
  percentage_prod: number = 0;
  percentage_desc: number = 0;
  percentage_docu: number = 0;
  percentage_total: number = 0;

  total: boolean = false;

  percentage_tab_info = [];
  percentage_tab_expe = [];
  percentage_tab_acad = [];
  percentage_tab_proy = [];
  percentage_tab_prod = [];
  percentage_tab_desc = [];
  percentage_tab_docu = [];
  posgrados = [];
  tipo_inscripciones = [];
  periodos = [];
  nivel_load = [{nombre: 'Pregrado', id: 14}, { nombre: 'Posgrado', id: 15}];

  show_info = false;
  show_profile = false;
  show_expe = false;
  show_acad = false;

  info_persona: boolean;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  tipo_inscripcion_selected: any;
  selectTipo: any;
  selectTabView: any;
  tag_view_posg: boolean;
  tag_view_pre: boolean;
  selectprograma: boolean = true;
  imagenes: any;
  periodo: any;
  selectednivel: any;

  loading: boolean = false;
  toasterService: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private terceroService: TercerosService,
    private inscripcionService: InscripcionService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private programaService: OikosService,
    private sgaMidService: SgaMidService,
  ) {
    this.imagenes = IMAGENES;
    //this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    // ojo quitar comentario
    // this.loadInfoPostgrados();
    this.total = true;
    this.show_info = true;
    // if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
    //   && this.inscripcion_id.toString() !== '0') {
    //   this.getInfoInscripcion();
    // } else {
    //   const ENTE = this.userService.getEnte();
    //   if (ENTE !== 0 && ENTE !== undefined && ENTE.toString() !== '' && ENTE.toString() !== 'NaN') {
    //     this.info_ente_id = <number>ENTE;
    //   } else {
    //     this.info_ente_id = undefined;
    //   }
    // }

  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();
      await this.cargarPeriodo();
      await this.loadInfoInscripcion();
    } catch (error) {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('inscripcion.error_cargar_informacion'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  cargarPeriodo() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Status === '200') {
          this.periodo = <any>res['Data'][0];
          window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
          resolve(this.periodo);
          const periodos = <any[]>res['Data'];
         periodos.forEach(element => {
            this.periodos.push(element);
          });
          this.loading = false;
        }
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        reject(error);
        this.loading = false;
      });
    });
  }

  loadInfoInscripcion() {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(`inscripcion?limit=1&query=PeriodoId:${this.periodo.Id},PersonaId:${this.info_persona_id || 4}`)
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          if (r[0].Id) {
            this.inscripcion_id = r[0].Id;
          }
        }
        this.loading = false;
        resolve(this.inscripcion_id);
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
        reject(error);
      });
    });
  }


  setPercentage_info(number, tab) {
    setTimeout(()=>{
      this.percentage_tab_info[tab] = (number * 100) / 2;
      this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
      this.setPercentage_total();
    });
  }

  setPercentage_acad(number, tab) {
    this.percentage_tab_acad[tab] = (number * 100) / 2;
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }
  setPercentage_total() {
    this.percentage_total = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info)) / 2;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad)) / 4;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_docu)) / 4;
    this.percentage_total += Math.round(UtilidadesService.getSumArray(this.percentage_tab_proy)) / 4;
    if (this.info_inscripcion !== undefined) {
      if (this.info_inscripcion.EstadoInscripcionId.Id > 1) {
        this.percentage_total = 100;
      }
      if (this.percentage_total >= 100) {
        if (this.info_inscripcion.EstadoInscripcionId.Id === 1) {
          this.total = false;
        }
      }
    }
  }

  loadTipoInscripcion() {
    this.loading = true;
    window.localStorage.setItem('IdNivel', String(this.selectednivel.id));
    this.inscripcionService.get('tipo_inscripcion/?query=NivelId:' + Number(this.selectednivel.id) + ',Activo:true&sortby=NumeroOrden&order=asc')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          const tiposInscripciones = <Array<any>>res;
          this.tipo_inscripciones = tiposInscripciones;
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
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

  loadInfoPostgrados() {
    // Tener el cuenta que el 5 corresponde al id del evento padre de inscripcion en una facultad
    this.loading = true;
    this.sgaMidService.get('inscripciones/consultar_proyectos_eventos/5')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          const programaPosgrados = <Array<any>>res;
          programaPosgrados.forEach(element => {
            this.posgrados.push(element);
          });
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.posgrados = [];
          this.posgrados.push({Id: 1, Nombre: 'test'});
          this.loading = false;
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

  loadidInscripcion() {
    this.loading = true;
    this.inscripcionService.get('inscripcion/?query=PersonaId:' + this.info_persona_id )
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.inscripcion_id = res[0].Id
          window.localStorage.setItem('IdInscripcion', String(this.inscripcion_id));
          this.getInfoInscripcion() ;
        }else {
          this.inscripcion_id = undefined;
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
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

  getInfoInscripcion() {
    this.loading = true;
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      this.loading = true;
      this.inscripcionService.get('inscripcion/' + this.inscripcion_id)
        .subscribe(inscripcion => {
          this.loading = false;
          this.info_inscripcion = <any>inscripcion;
          if (inscripcion !== null && this.info_inscripcion.Type !== 'error') {
            this.estado_inscripcion = this.info_inscripcion.EstadoInscripcionId.Id;
            if (this.info_inscripcion.EstadoInscripcionId.Id > 1) {
              this.total = true;
            }
            this.programaService.get('dependencia/' + this.info_inscripcion.ProgramaAcademicoId)
              .subscribe(res_programa => {
                this.loading = false;
                const programa_admision = <any>res_programa;
                if (res_programa !== null && programa_admision.Type !== 'error') {
                  // this.selectedValue = programa_admision;
                  // this.posgrados.push(programa_admision);
                  // this.info_ente_id = this.info_inscripcion.PersonaId;
                  this.loading = false;
                }
              },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                      this.translate.instant('GLOBAL.admision') + '|' +
                      this.translate.instant('GLOBAL.programa_academico'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          }
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.admision'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event): void {
    switch (event) {
      case 'info_persona':
        this.show_info = true;
        break;
        case 'info_preinscripcion':
          this.preinscripcion = true;
          break;
      case 'perfil':
        this.show_info = false;
        this.show_profile = true;
        break;
      default:
        this.show_info = false;
        this.show_profile = false;
        break;
    }
  }
  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.info_persona')) {
      if (this.info_persona)
        this.perfil_editar('info_persona');
    } else if (event.tabTitle === this.translate.instant('GLOBAL.info_caracteristica')) {
      this.perfil_editar('info_caracteristica');
    } else if (event.tabTitle === this.translate.instant('GLOBAL.informacion_contacto')) {
      this.perfil_editar('info_contacto');
    }
  }

  ngOnInit() {
    this.loadData();
    //this.info_persona_id = this.userService.getPersonaId();
    // console.info(JSON.parse(atob((localStorage.getItem('id_token').split('.'))[1])).sub)
    // this.usuariowso2 = JSON.parse(atob((localStorage.getItem('id_token').split('.'))[1])).sub,

    //   this.terceroService.get('tercero/?query=UsuarioWSO2:' + String(this.usuariowso2))
    //   .subscribe(res => {
    //     console.info('Datos terceros')
    //     console.info(res)
    //     this.info_inscripcion = <any>res[0];
    //     if (res !== null  && this.info_inscripcion.Type !== 'error') {
    //       // this.inscripcion_id = this.info_inscripcion.Id;
    //       this.info_persona_id = this.inscripcion_id;
    //       console.info('este es el del serivio ' + this.info_persona_id)
    //       // this.getInfoInscripcion();
    //     }
    //   },
    //     (error: HttpErrorResponse) => {
    //       Swal({
    //         type: 'error',
    //         title: error.status + '',
    //         text: this.translate.instant('ERROR.' + error.status),
    //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
    //           this.translate.instant('GLOBAL.admision'),
    //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //       });
    //     });
    }

  ngOnChanges() {

  }

  viewtab() {
    window.localStorage.setItem('IdTipoInscripcion', this.tipo_inscripcion_selected.Id);
    this.selectTipo = true;
  }
    // updateEstadoAdmision() {
    //   const opt: any = {
    //     title: this.translate.instant('GLOBAL.inscribirse'),
    //     text: this.translate.instant('GLOBAL.inscribirse') + '?',
    //     icon: 'warning',
    //     buttons: true,
    //     dangerMode: true,
    //     showCancelButton: true,
    //     confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //     cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    //   };
    //   Swal(opt)
    //     .then((willDelete) => {
    //       if (willDelete.value) {
    //         this.loading = true;
    //         this.inscripcionService.put('inscripcion', this.info_inscripcion)
    //           .subscribe(res_ins => {
    //             const r_ins = <any>res_ins;
    //             if (res_ins !== null && r_ins.Type !== 'error') {
    //               this.loading = false;
    //               this.total = true;
    //               this.captureScreen();
    //             }
    //           },
    //             (error: HttpErrorResponse) => {
    //               Swal({
    //                 type: 'error',
    //                 title: error.status + '',
    //                 text: this.translate.instant('ERROR.' + error.status),
    //                 footer: this.translate.instant('GLOBAL.actualizar') + '-' +
    //                   this.translate.instant('GLOBAL.admision'),
    //                 confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    //               });
    //             });
    //       }
    //     });
    // }

  // public captureScreen() {
  //   this.loading = true;
  //   const data1 = document.getElementById('info_basica');
  //   const data2 = document.getElementById('formacion_academica');
  //   const data3 = document.getElementById('experiencia_laboral');
  //   const data4 = document.getElementById('produccion_academica');
  //   const data5 = document.getElementById('documento_programa');
  //   const data6 = document.getElementById('descuento_matricula');
  //   const data7 = document.getElementById('propuesta_grado');
  //   html2canvas(data1).then(canvas => {
  //     const imgWidth = 50;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //     const imgData = this.imagenes.escudo;
  //     const contentDataURL = canvas.toDataURL('image/png');

  //     html2canvas(data2).then(canvas2 => {
  //       const imgWidth2 = 50;
  //       const imgHeight2 = (canvas2.height * imgWidth2) / canvas2.width;
  //       const contentDataURL2 = canvas2.toDataURL('image/png');

  //       html2canvas(data3).then(canvas3 => {
  //         const imgWidth3 = 50;
  //         const imgHeight3 = (canvas3.height * imgWidth3) / canvas3.width;
  //         const contentDataURL3 = canvas3.toDataURL('image/png');

  //         html2canvas(data4).then(canvas4 => {
  //           const imgWidth4 = 50;
  //           const imgHeight4 = (canvas4.height * imgWidth4) / canvas4.width;
  //           const contentDataURL4 = canvas4.toDataURL('image/png');

  //           html2canvas(data5).then(canvas5 => {
  //             const imgWidth5 = 50;
  //             const imgHeight5 = (canvas5.height * imgWidth5) / canvas5.width;
  //             const contentDataURL5 = canvas5.toDataURL('image/png');

  //             html2canvas(data6).then(canvas6 => {
  //               const imgWidth6 = 50;
  //               const imgHeight6 = (canvas6.height * imgWidth6) / canvas6.width;
  //               const contentDataURL6 = canvas6.toDataURL('image/png');

  //               html2canvas(data7).then(canvas7 => {
  //                 const imgWidth7 = 50;
  //                 const imgHeight7 = (canvas7.height * imgWidth7) / canvas7.width;
  //                 const contentDataURL7 = canvas7.toDataURL('image/png');
  //                 const pdf = new jsPDF('p', 'mm', 'letter');

  //                 pdf.setFontSize(20);
  //                 pdf.addImage(imgData, 'PNG', 10, 10, 92, 35);
  //                 pdf.text(`Comprobante de inscripción`, 65, 55);
  //                 pdf.setFontSize(12);

  //                 pdf.text(`Nombres: ${this.datos_persona['PrimerNombre']} ${this.datos_persona['SegundoNombre']}`, 15, 68);
  //                 pdf.text(`Apellidos: ${this.datos_persona['PrimerApellido']} ${this.datos_persona['SegundoApellido']}`, 15, 75);
  //                 pdf.text('Documento de identificación: ' + this.datos_persona['TipoIdentificacion']['CodigoAbreviacion'] + ' ' +
  //                   this.datos_persona['NumeroIdentificacion'],
  //                   15, 82);
  //                 pdf.text(`Fecha de inscripción: ${formatDate(new Date(), 'yyyy-MM-dd', 'en')}`, 15, 89);
  //                 pdf.text(`Programa académico: ${this.selectedValue.Nombre}`, 15, 96);

  //                 pdf.text(`Formulario: `, 15, 103);
  //                 pdf.addImage(contentDataURL, 'PNG', 18, 108, imgWidth, imgHeight);
  //                 pdf.addImage(contentDataURL2, 'PNG', 82, 108, imgWidth2, imgHeight2);
  //                 pdf.addImage(contentDataURL3, 'PNG', 147, 108, imgWidth3, imgHeight3);
  //                 pdf.addImage(contentDataURL4, 'PNG', 18, 148, imgWidth4, imgHeight4);
  //                 pdf.addImage(contentDataURL5, 'PNG', 82, 148, imgWidth5, imgHeight5);
  //                 pdf.addImage(contentDataURL6, 'PNG', 147, 148, imgWidth6, imgHeight6);
  //                 pdf.addImage(contentDataURL7, 'PNG', 82, 188, imgWidth7, imgHeight7);
  //                 pdf.setFontSize(9);
  //                 pdf.text(`Universidad Distrital Francisco José de Caldas`, 78, 256);
  //                 pdf.text(`Carrera 7 # 40B - 53 - Bogotá D.C. - Colombia`, 78, 262);
  //                 pdf.text(`Teléfono (Colombia) : +57 3 323-9300`, 83, 267);

  //                 const nombre_archivo = `${this.datos_persona['PrimerNombre']}_${this.datos_persona['PrimerApellido']}_` +
  //                   `${this.datos_persona['NumeroIdentificacion']}`;

  //                 this.loading = false;
  //                 pdf.save(`${nombre_archivo}.pdf`);
  //                 this.eventChange.emit(true);
  //                 this.router.navigate(['/pages/procesos_admisiones/estado_admision']);
  //               });
  //             });
  //           });
  //         });
  //       });
  //     });
  //   });
  // }
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
