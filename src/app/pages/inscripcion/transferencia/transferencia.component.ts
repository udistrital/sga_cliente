import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { LocalDataSource } from 'ng2-smart-table';
import { CustomizeButtonComponent } from '../../../@theme/components/customize-button/customize-button.component';
import { LinkDownloadNuxeoComponent } from '../../../@theme/components/link-download-nuxeo/link-download-nuxeo.component';
import { FORM_TRANSFERENCIA_INTERNA } from '../forms-transferencia';
import { ActivatedRoute, Router } from "@angular/router";
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { TransferenciaInterna } from '../../../@core/data/models/inscripcion/transferencia_interna';
import { InfoPersona } from '../../../@core/data/models/informacion/info_persona';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.scss']
})
export class TransferenciaComponent implements OnInit {

  formTransferencia: any = null;
  listadoSolicitudes: boolean = true;
  actions: boolean = true;
  recibo: boolean = false;
  settings: any = null;
  uid = null;
  dataSource: LocalDataSource;
  sub: any;
  process: string = '';
  loading: boolean;
  info_info_persona: InfoPersona;
  inscripcionProjects: any[];
  proyectosCurriculares: any[];
  codigosEstudiante: any[];

  dataTransferencia: TransferenciaInterna = {
    Periodo: null,
    CalendarioAcademico: null,
    TipoInscripcion: null,
    CodigoEstudiante: null,
    ProyectoCurricular: null,
  };

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private router: Router,
    private _Activatedroute: ActivatedRoute
  ) {
    this.formTransferencia = FORM_TRANSFERENCIA_INTERNA;
    this.dataSource = new LocalDataSource();
    this.uid = localStorage.getItem('persona_id');
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.');
  }

  construirForm() {
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.');
    this.formTransferencia.campos.forEach(campo => {
      if (campo.nombre === 'Periodo') {
        campo.valor = campo.opciones[0];
      }
    });
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

  ngOnInit() {
    this.sub = this._Activatedroute.paramMap.subscribe((params: any) => {
      const { process } = params.params;
      this.process = atob(process);
      this.actions = (this.process === 'my');
      this.createTable(this.process);
      this.loadData(this.process)
    })
    Swal.fire({
      icon: 'warning',
      text: this.translate.instant('inscripcion.alerta_transferencia'),
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    })
  }

  createTable(process) {
    this.settings = {
      actions: false,
      columns: {
        Recibo: {
          title: this.translate.instant('inscripcion.recibo'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Concepto: {
          title: this.translate.instant('inscripcion.concepto'),
          editable: false,
          width: '30%',
          filter: false,
        },
        Programa: {
          title: this.translate.instant('inscripcion.programa'),
          width: '10%',
          editable: false,
          filter: false,
        },
        FechaGeneracion: {
          title: this.translate.instant('inscripcion.fecha_generacion'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Estado: {
          title: this.translate.instant('inscripcion.estado'),
          width: '15%',
          editable: false,
          filter: false,
        },
        ...process === 'my' ? {
          Descargar: {
            title: this.translate.instant('derechos_pecuniarios.ver_respuesta'),
            width: '5%',
            editable: false,
            filter: false,
            renderComponent: LinkDownloadNuxeoComponent,
            type: 'custom',
            // onComponentInitFunction: (instance) => {
            //   instance.save.subscribe((data) => this.descargarReciboPago(data))
            // },
          }
        } : {},
        Opcion: {
          title: this.translate.instant('derechos_pecuniarios.solicitar'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => {
              const dataType = btoa(data['tipoTransferencia']);
              const level = btoa(data['nivel']);
              this.router.navigate([`pages/inscripcion/solicitud-transferencia/${dataType}/${level}/${btoa(process)}`])
            })
          },
        },
      },
      mode: 'external',
    }
  }

  loadData(process) {
    this.loading = true;

    const data = [{
      Recibo: 99999,
      Concepto: "Transferencia",
      Programa: "Maestría ingeniería industrial",
      FechaGeneracion: '12-01-01',
      Estado: "Pagado",
      Descargar: 140837,
      Opcion: {
        icon: 'fa fa-pencil fa-2x',
        label: 'Inscribirme',
        class: "btn btn-primary"
      },
      tipoTransferencia: 'interna',
      nivel: 'Pregrado'
    }, {
      Recibo: 99998,
      Concepto: "Transferencia2",
      Programa: "Maestría en Ciencias de la información y las comunicaciones",
      FechaGeneracion: '12-01-01',
      Estado: "Pagado",
      Descargar: 140837,
      Opcion: {
        icon: 'fa fa-pencil fa-2x',
        label: 'Inscribirme',
        class: "btn btn-primary"
      },
      tipoTransferencia: 'externa',
      nivel: 'Pregrado'
    }, {
      Recibo: 99998,
      Concepto: "Transferencia2",
      Programa: "Maestría en Ciencias de la información y las comunicaciones",
      FechaGeneracion: '12-01-01',
      Estado: "Pagado",
      Descargar: 140837,
      Opcion: {
        icon: 'fa fa-pencil fa-2x',
        label: 'Inscribirme',
        class: "btn btn-primary"
      },
      tipoTransferencia: 'interna',
      nivel: 'Posgrado'
    }, {
      Recibo: 99998,
      Concepto: "Transferencia2",
      Programa: "Maestría en Ciencias de la información y las comunicaciones",
      FechaGeneracion: '12-01-01',
      Estado: "Pagado",
      Descargar: 140837,
      Opcion: {
        icon: 'fa fa-pencil fa-2x',
        label: 'Inscribirme',
        class: "btn btn-primary"
      },
      tipoTransferencia: 'externa',
      nivel: 'Posgrado'
    }
    ]
    this.dataSource.load(data.map((e) => {
      return {
        ...e,
        ...process === 'my' ? {
          Opcion: {
            icon: 'fa fa-pencil fa-2x',
            label: 'Inscribirme',
            class: "btn btn-primary"
          }
        } :
          {
            Opcion: {
              icon: 'fa fa-search fa-2x',
              label: 'Detalle',
              class: "btn btn-primary"
            }
          }
      }
    }));

    this.loading = false;
  }

  descargarNormativa() {
    console.log('Descargar normativa! ');
  }

  async nuevaSolicitud() {
    this.listadoSolicitudes = false;
    await this.loadPeriodo().catch(e => this.loading = false);
    this.construirForm();
  }

  loadPeriodo() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.sgaMidService.get('transferencia/consultar_periodo').subscribe(
        (response: any) => {
          if (response.Success) {

            this.formTransferencia.campos.forEach(campo => {
              if (campo.etiqueta === 'select') {
                campo.opciones = response.Data[campo.nombre];
                if (campo.nombre === 'Periodo') {
                  campo.valor = campo.opciones[0];
                }
              }
            });
            this.loading = false;
            resolve(response.Data)
          }
          reject();
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error);
        },
      );
    });
  }

  async seleccion(event) {
    this.recibo = false;
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');

    this.formTransferencia.campos.forEach(campo => {
      this.dataTransferencia[campo.nombre] = campo.valor;
    });

    if (event.nombre === 'CalendarioAcademico' && !this.recibo && event.valor != null) {

      let parametros = await this.loadParams(this.dataTransferencia.CalendarioAcademico.Id).catch(e => this.loading = false);

      this.codigosEstudiante = parametros["Data"]["CodigoEstudiante"];
      this.proyectosCurriculares = parametros["Data"]["ProyectoCurricular"];

      this.formTransferencia.campos.forEach(campo => {

        if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
          campo.opciones = parametros["Data"][campo.nombre];
          campo.ocultar = false;
        }

      });
    }

    if (event.nombre === 'TipoInscripcion' && !this.recibo && event.valor != null) {
      this.formTransferencia.campos.forEach(campo => {

        if (event.valor.Nombre === 'Transferencia interna' || event.valor.Nombre === 'Reingreso') {
          Swal.fire({
            icon: 'warning',
            html: this.translate.instant('inscripcion.alerta_recibo_transferencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          })
        }

        if (campo.nombre === 'ProyectoCurricular') {
          if (event.valor.Nombre === 'Reingreso') {
            let aux: any[] = [];

            this.codigosEstudiante.forEach(codigo => {
              this.proyectosCurriculares.forEach(opcion => {
                if (opcion.Id == codigo.IdProyecto) {
                  aux.push(opcion)
                }

              });
            });
            campo.valor = null;
            campo.opciones = aux;
          } else {
            campo.opciones = this.proyectosCurriculares;
          }
        }
      });
    }

    this.loading = false
  }

  loadParams(calendarioId) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.sgaMidService.get('transferencia/consultar_parametros/' + calendarioId + '/' + this.uid).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.Success) {
            resolve(response);
          } else {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            reject();
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          this.loading = false;
          reject(error);
        },
      );
    });
  }

  validarForm(event) {
    if (event.valid) {
      this.recibo = true;
      this.formTransferencia.btn = '';
    }

  }

  generarRecibo() {
    this.popUpManager.showConfirmAlert(this.translate.instant('inscripcion.seguro_inscribirse')).then(
      async ok => {
        if (ok.value) {
          this.loading = true;
          if (this.info_info_persona === undefined) {
            this.sgaMidService.get('persona/consultar_persona/' + this.uid)
              .subscribe(async res => {
                if (res !== null) {
                  const temp = <InfoPersona>res;
                  this.info_info_persona = temp;
                  const files = [];
                  await this.generar_inscripcion();
                }
              },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal.fire({
                    icon: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                      this.translate.instant('GLOBAL.info_persona'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            await this.generar_inscripcion();
            this.loading = false;
          }
        }
      },
    );
  }

  generar_inscripcion() {
    return new Promise((resolve, reject) => {
      const inscripcion = {
        Id: parseInt(this.info_info_persona.NumeroIdentificacion, 10),
        Nombre: `${this.info_info_persona.PrimerNombre} ${this.info_info_persona.SegundoNombre}`,
        Apellido: `${this.info_info_persona.PrimerApellido} ${this.info_info_persona.SegundoApellido}`,
        Correo: JSON.parse(atob(localStorage.getItem('id_token').split('.')[1])).email,
        PersonaId: Number(this.uid),
        PeriodoId: this.dataTransferencia.Periodo.Id,
        Nivel: this.dataTransferencia.TipoInscripcion.NivelId,
        ProgramaAcademicoId: this.dataTransferencia.ProyectoCurricular.Id,
        TipoInscripcionId: this.dataTransferencia.TipoInscripcion.Id,
        Year: this.dataTransferencia.Periodo.Year,
        Periodo: parseInt(this.dataTransferencia.Periodo.Ciclo, 10),
        FechaPago: '',
      };

      this.loading = true;
      this.sgaMidService.get('consulta_calendario_proyecto/nivel/' + this.dataTransferencia.TipoInscripcion.NivelId).subscribe(
        (response: any[]) => {
          if (response !== null && response.length !== 0) {
            this.inscripcionProjects = response;
            this.inscripcionProjects.forEach(proyecto => {
              if (proyecto.ProyectoId === this.dataTransferencia.ProyectoCurricular.Id && proyecto.Evento != null) {
                inscripcion.FechaPago = moment(proyecto.Evento[0].FechaFinEvento, 'YYYY-MM-DD').format('DD/MM/YYYY');

                this.sgaMidService.post('inscripciones/generar_inscripcion', inscripcion).subscribe(
                  (response: any) => {
                    if (response.Code === '200') {
                      this.listadoSolicitudes = true;

                      this.clean();

                      this.loadData(this.process);
                      this.loading = false;

                      resolve(response);
                      this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.generado'));
                    } else if (response.Code === '204') {
                      this.loading = false;
                      reject([]);
                      this.popUpManager.showErrorAlert(this.translate.instant('recibo_pago.recibo_duplicado'));
                    } else if (response.Code === '400') {
                      this.loading = false;
                      reject([]);
                      this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
                    }
                  },
                  (error: HttpErrorResponse) => {
                    this.loading = false;
                    this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
                    reject([]);
                  },
                );
              }
            });
            this.loading = false;
          }
        },
        error => {
          this.loading = false;
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('calendario.sin_proyecto_curricular'));
          reject([]);
        },
      );
    });
  }

  clean() {
    this.dataTransferencia = {
      Periodo: null,
      CalendarioAcademico: null,
      TipoInscripcion: null,
      CodigoEstudiante: null,
      ProyectoCurricular: null,
    };
    this.formTransferencia.campos.forEach(campo => {
      if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
        campo.ocultar = true;
      }
      if (campo.nombre === 'CalendarioAcademico') {
        campo.valor = null;
      }
    });
  }

  // filtrarProyecto(proyecto) {
  //   if (this.dat.data.Dependencia === proyecto['NivelFormacionId']['Id']) {
  //     return true
  //   }
  //   if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
  //     if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Nombre'] === this.dat.data.Dependencia) {
  //       return true
  //     }
  //   } else {
  //     return false
  //   }
  // }
}
