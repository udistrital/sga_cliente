import { Component, OnInit } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { OikosService } from '../../../@core/data/oikos.service';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { CoreService } from '../../../@core/data/core.service';
import { PagoService } from '../../../@core/data/pago.service';
import { ReciboService } from '../../../@core/data/recibo.service';
import { Recibo } from '../../../@core/data/models/recibo/recibo';
import { HttpErrorResponse } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { FORM_PAGO } from './form-pago';
import { Pago } from '../../../@core/data/models/proyecto_academico/pago';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';

@Component({
  selector: 'ngx-pago-inscripcion',
  templateUrl: './pago_inscripcion.component.html',
  styleUrls: ['./pago_inscripcion.component.scss'],
})
export class PagoInscripcionComponent implements OnInit {

  @Input('inscripcion_id')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    console.info(this.inscripcion_id)
    if (this.inscripcion_id !== 0 && this.inscripcion_id !== undefined && this.inscripcion_id.toString() !== '') {
      // this.getInfoRecibo();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  config: ToasterConfig;
  inscripcion_id: number;
  recibo_id: number;
  loading: boolean;
  btnPagar: boolean;
  btnCargar: boolean;
  btnRecibo: boolean;
  btnOficina: boolean;
  mostrarInfo: boolean;
  mostrarForm: boolean;
  formPago: any;
  info_pago: Pago;

  constructor(
    private translate: TranslateService,
    private inscripciones: InscripcionService,
    private programa: OikosService,
    private coreService: CoreService,
    private mid: CampusMidService,
    private pagos: PagoService,
    private recibos: ReciboService,
    private toasterService: ToasterService) {
      this.formPago = FORM_PAGO;
      this.construirForm();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.construirForm();
      });
      this.loading = false;
      this.btnPagar = false;
      this.btnCargar = true;
      this.btnRecibo = true;
      this.btnOficina = true;
      this.mostrarInfo = false;
      this.mostrarForm = false;
  }

  construirForm() {
    this.formPago.titulo = this.translate.instant('GLOBAL.info_pago');
    for (let i = 0; i < this.formPago.campos.length; i++) {
      this.formPago.campos[i].label = this.translate.instant('GLOBAL.' + this.formPago.campos[i].label_i18n);
      this.formPago.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formPago.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formPago.campos.length; index++) {
      const element = this.formPago.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  pagarRecibo(): void {
    if (this.inscripcion_id !== 0 && this.inscripcion_id !== undefined && this.inscripcion_id.toString() !== '') {
       this.inscripciones.get('inscripcion/' + this.inscripcion_id)
        .subscribe(res_inscripcion => {
          const info_inscripcion = <any>res_inscripcion;
          if (res_inscripcion !== null  && info_inscripcion.Type !== 'error' && info_inscripcion.ReciboInscripcionId !== 0) {
            this.mid.get('persona/consultar_persona/' + info_inscripcion.PersonaId)
              .subscribe(res_persona => {
                const info_persona = <any>res_persona;
                this.loading = false;
                if (res_persona !== null && info_persona.Type !== 'error') {
                  const strurl = 'tipoIdentificacion=' + info_persona.TipoIdentificacion.CodigoAbreviacion +
                    '&numeroIdentificacion=' + info_persona.NumeroIdentificacion +
                    '&nombre=' + info_persona.PrimerNombre + ' ' + info_persona.SegundoNombre +
                    ' ' + info_persona.PrimerApellido + ' ' + info_persona.SegundoApellido +
                    '&valor=' + this.info_pago.ValorOrdinario +
                    '&concepto=' + this.info_pago.Concepto +
                    '&referencia=' + this.info_pago.Secuencia;
                  this.pagos.get('encriptar.php?' + strurl)
                    .subscribe(enlace => {
                      const enlace_pago = <any>enlace
                      enlace_pago.crypto = enlace_pago.crypto.replace(/\\/g, '');
                      Swal({
                        showConfirmButton: false,
                        width: 850,
                        html: '<object type="text/html" data=' + enlace_pago.crypto + ''
                        + ' width="810" height="550"></object>',
                        onAfterClose: () => {
                          const strcon = 'programa=' + this.info_pago.ProgramaId +
                            '&numeroIdentificacion=' + this.info_pago.Codigo +
                            '&anio=' + this.info_pago.Anio +
                            '&periodo=' + this.info_pago.Periodo +
                            '&referencia=' + this.info_pago.Secuencia;
                          this.pagos.get('consulta.php?' + strcon)
                            .subscribe(consulta => {
                              const consulta_dato = <any>consulta;
                              if (consulta_dato.estado === 'PAGO') {
                                const info_comprobante = <any>{
                                  ReciboId: {Id: 1 * this.recibo_id},
                                  TipoPagoId: {Id: 1},
                                  Aprobado: true,
                                  FechaPago: new Date(),
                                };
                                this.recibos.post('pago_recibo', info_comprobante)
                                  .subscribe(res_recibo_pago => {
                                    const res_pag = <any>res_recibo_pago;
                                    if (res_recibo_pago !== null && res_pag.Type !== 'error') {
                                      this.recibos.get('recibo/' + this.recibo_id).subscribe(rec => {
                                        if (rec !== null && JSON.stringify(rec).toString() !== '{}') {
                                          const reci = <any>rec;
                                          reci.EstadoReciboId.Id = 3;
                                          this.recibos.put('recibo', reci).subscribe(rec2 => {
                                            if (rec2 !== null) {
                                              info_inscripcion.EstadoInscripcionId = <any>{Id: 3};
                                              this.inscripciones.put('inscripcion', info_inscripcion)
                                                .subscribe(res_ins => {
                                                  if (res_ins !== null) {
                                                    this.loading = false;
                                                    this.eventChange.emit(true);
                                                    this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                                                      this.translate.instant('GLOBAL.recibo') + ' ' +
                                                      this.translate.instant('GLOBAL.confirmarActualizar'));
                                                  }
                                                },
                                                  (error: HttpErrorResponse) => {
                                                    Swal({
                                                      type: 'error',
                                                      title: error.status + '',
                                                      text: this.translate.instant('ERROR.' + error.status),
                                                      footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                                        this.translate.instant('GLOBAL.admision'),
                                                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                                    });
                                                  });
                                            }
                                          },
                                            (error: HttpErrorResponse) => {
                                              Swal({
                                                type: 'error',
                                                title: error.status + '',
                                                text: this.translate.instant('ERROR.' + error.status),
                                                footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                                  this.translate.instant('GLOBAL.recibo'),
                                                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                              });
                                            });
                                        }
                                      },
                                        (error: HttpErrorResponse) => {
                                          Swal({
                                            type: 'error',
                                            title: error.status + '',
                                            text: this.translate.instant('ERROR.' + error.status),
                                            footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                              this.translate.instant('GLOBAL.recibo'),
                                            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                          });
                                        });
                                    }
                                  },
                                    (error: HttpErrorResponse) => {
                                      Swal({
                                        type: 'error',
                                        title: error.status + '',
                                        text: this.translate.instant('ERROR.' + error.status),
                                        footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                          this.translate.instant('GLOBAL.recibo'),
                                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                      });
                                    });
                              } else {
                                if (consulta_dato.estado !== 'NO PAGO') {
                                  Swal({
                                    type: 'error',
                                    title: this.translate.instant('GLOBAL.error'),
                                    text: this.translate.instant('ERROR.' + consulta_dato.estado),
                                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                      this.translate.instant('GLOBAL.recibo'),
                                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                  });
                                }
                              }
                            },
                              (error: HttpErrorResponse) => {
                                Swal({
                                  type: 'error',
                                  title: error.status + '',
                                  text: this.translate.instant('ERROR.' + error.status),
                                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                    this.translate.instant('GLOBAL.recibo'),
                                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                });
                              });
                        },
                      });
                    },
                      (error: HttpErrorResponse) => {
                        Swal({
                          type: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.crear') + '-' +
                            this.translate.instant('GLOBAL.recibo'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                }
              },
                (error: HttpErrorResponse) => {
                  Swal({
                    type: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                      this.translate.instant('GLOBAL.info_persona'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
        }
      },
        (error: HttpErrorResponse) => {
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

  getInfoReciboConsignacion(info_recibo: any, info_inscripcion: any): void {
    this.recibos.get('estado_recibo/' + info_recibo.EstadoReciboId.Id)
      .subscribe(res_estado => {
        const estado_recibo = <any>res_estado;
        if (res_estado !== null && estado_recibo.Type !== 'error') {
          info_recibo.EstadoReciboId = <any>estado_recibo;
          this.recibos.get('tipo_recibo/' + info_recibo.TipoReciboId.Id)
            .subscribe(res_tipo => {
              const tipo_recibo = <any>res_tipo;
              if (res_tipo !== null && tipo_recibo.Type !== 'error') {
                info_recibo.TipoReciboId = <any>tipo_recibo;
                this.programa.get('dependencia/' + info_inscripcion.ProgramaAcademicoId)
                  .subscribe(res_programa => {
                    const info_programa = <any>res_programa;
                    if (res_programa !== null && info_programa.Type !== 'error') {
                      this.coreService.get('periodo/' + info_inscripcion.PeriodoId)
                        .subscribe(res_periodo => {
                          const info_periodo = <any>res_periodo;
                          if (res_periodo !== null  && info_periodo.Type !== 'error') {
                            this.mid.get('persona/consultar_persona/' + info_inscripcion.PersonaId)
                              .subscribe(res_persona => {
                                const info_persona = <any>res_persona;
                                this.loading = false;
                                if (res_persona !== null && info_persona.Type !== 'error') {
                                  const id_token = window.localStorage.getItem('id_token').split('.');
                                  const payload = JSON.parse(atob(id_token[1]));
                                  console.info(atob(id_token[0]));
                                  console.info(atob(id_token[1]));

                                  this.btnPagar = false;
                                  this.btnCargar = true;
                                  this.btnRecibo = false;
                                  this.btnOficina = true;
                                  this.recibo_id = info_recibo.Id;

                                  this.info_pago = <Pago>{
                                    Perpago: info_periodo.Nombre,
                                    Periodo: info_periodo.Nombre.split('-')[1],
                                    Anio: info_periodo.Nombre.split('-')[0],
                                    ProgramaId: info_programa.Id,
                                    Proyecto: info_programa.Nombre,
                                    TipoIdentificacion: info_persona.TipoIdentificacion.CodigoAbreviacion,
                                    Codigo: info_persona.NumeroIdentificacion,
                                    Nombre: info_persona.PrimerNombre + ' ' + info_persona.SegundoNombre,
                                    Apellido: info_persona.PrimerApellido + ' ' + info_persona.SegundoApellido,
                                    FechaOrdinaria: info_recibo.FechaOrdinaria,
                                    ValorOrdinario: info_recibo.ValorOrdinario,
                                    Correo: payload.email,
                                    Concepto: info_recibo.TipoReciboId.Nombre,
                                    TipoRecibo: info_recibo.TipoReciboId.Id,
                                    EstadoPago: info_recibo.EstadoReciboId.Nombre,
                                    Secuencia: info_recibo.Referencia,
                                  };
                                }
                              },
                                (error: HttpErrorResponse) => {
                                  Swal({
                                    type: 'error',
                                    title: error.status + '',
                                    text: this.translate.instant('ERROR.' + error.status),
                                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                      this.translate.instant('GLOBAL.info_persona'),
                                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                  });
                                });
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
            },
              (error: HttpErrorResponse) => {
                Swal({
                  type: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.tipo_recibo'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.estado_recibo'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  getInfoRecibo(): void {
    this.loading = true;
    this.inscripciones.get('inscripcion/' + this.inscripcion_id)
      .subscribe(res_inscripcion => {
        const info_inscripcion = <any>res_inscripcion;
        if (res_inscripcion !== null  && info_inscripcion.Type !== 'error' && info_inscripcion.ReciboInscripcionId !== 0) {
          this.recibos.get('recibo/' + info_inscripcion.ReciboInscripcionId)
            .subscribe(res_recibo => {
              const info_recibo = <any>res_recibo;
              if (info_recibo.Referencia === 0) {
                this.getInfoReciboConsignacion(info_recibo, info_inscripcion);
              } else {
                this.recibos.get('estado_recibo/' + info_recibo.EstadoReciboId.Id)
                  .subscribe(res_estado => {
                    const estado_recibo = <any>res_estado;
                    if (res_estado !== null && estado_recibo.Type !== 'error') {
                      info_recibo.EstadoReciboId = <any>estado_recibo;
                      this.recibos.get('tipo_recibo/' + info_recibo.TipoReciboId.Id)
                        .subscribe(res_tipo => {
                          const tipo_recibo = <any>res_tipo;
                          if (res_tipo !== null && tipo_recibo.Type !== 'error') {
                            info_recibo.TipoReciboId = <any>tipo_recibo;
                            this.programa.get('dependencia/' + info_inscripcion.ProgramaAcademicoId)
                              .subscribe(res_programa => {
                                const info_programa = <any>res_programa;
                                if (res_programa !== null && info_programa.Type !== 'error') {
                                  this.coreService.get('periodo/' + info_inscripcion.PeriodoId)
                                    .subscribe(res_periodo => {
                                      const info_periodo = <any>res_periodo;
                                      if (res_periodo !== null  && info_periodo.Type !== 'error') {
                                        this.mid.get('persona/consultar_persona/' + info_inscripcion.PersonaId)
                                          .subscribe(res_persona => {
                                            const info_persona = <any>res_persona;
                                            if (res_persona !== null && info_persona.Type !== 'error') {
                                              const strcon = 'programa=' + info_programa.Id +
                                                '&numeroIdentificacion=' + info_persona.NumeroIdentificacion +
                                                '&anio=' + info_periodo.Nombre.split('-')[0] +
                                                '&periodo=' + info_periodo.Nombre.split('-')[1] +
                                                '&referencia=' + info_recibo.Referencia;
                                              this.pagos.get('consulta.php?' + strcon)
                                                .subscribe(consulta => {
                                                  const consulta_dato = <any>consulta;
                                                  if (consulta_dato.estado === 'PAGO' && info_recibo.EstadoReciboId.Id < 3) {
                                                    const info_comprobante = <any>{
                                                      ReciboId: {Id: 1 * info_recibo.Id},
                                                      TipoPagoId: {Id: 1},
                                                      Aprobado: true,
                                                      FechaPago: new Date(),
                                                    };
                                                    this.recibos.post('pago_recibo', info_comprobante)
                                                      .subscribe(res_recibo_pago => {
                                                        const res_pag = <any>res_recibo_pago;
                                                        if (res_recibo_pago !== null && res_pag.Type !== 'error') {
                                                          const reci = <any>info_recibo;
                                                          reci.EstadoReciboId.Id = 3;
                                                          this.recibos.put('recibo', reci).subscribe(rec2 => {
                                                            if (rec2 !== null) {
                                                              info_inscripcion.EstadoInscripcionId = <any>{Id: 3};
                                                              this.inscripciones.put('inscripcion', info_inscripcion)
                                                                .subscribe(res_ins => {
                                                                  if (res_ins !== null) {
                                                                    const id_token = window.localStorage.getItem('id_token').split('.');
                                                                    const payload = JSON.parse(atob(id_token[1]));
                                                                    this.btnPagar = false;
                                                                    this.btnCargar = false;
                                                                    this.btnRecibo = false;
                                                                    this.btnOficina = false;
                                                                    this.loading = false;

                                                                    this.info_pago = <Pago>{
                                                                      Perpago: info_periodo.Nombre,
                                                                      Periodo: info_periodo.Nombre.split('-')[1],
                                                                      Anio: info_periodo.Nombre.split('-')[0],
                                                                      ProgramaId: info_programa.Id,
                                                                      Proyecto: info_programa.Nombre,
                                                                      TipoIdentificacion: info_persona.TipoIdentificacion.Nombre,
                                                                      Codigo: info_persona.NumeroIdentificacion,
                                                                      Nombre: info_persona.PrimerNombre + ' ' + info_persona.SegundoNombre,
                                                                      Apellido: info_persona.PrimerApellido + ' ' + info_persona.SegundoApellido,
                                                                      FechaOrdinaria: info_recibo.FechaOrdinaria,
                                                                      ValorOrdinario: info_recibo.ValorOrdinario,
                                                                      Correo: payload.email,
                                                                      Concepto: info_recibo.TipoReciboId.Nombre,
                                                                      TipoRecibo: info_recibo.TipoReciboId.Id,
                                                                      EstadoPago: 'Pago',
                                                                      Secuencia: info_recibo.Referencia,
                                                                    };
                                                                  }
                                                                },
                                                                  (error: HttpErrorResponse) => {
                                                                    Swal({
                                                                      type: 'error',
                                                                      title: error.status + '',
                                                                      text: this.translate.instant('ERROR.' + error.status),
                                                                      footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                                                        this.translate.instant('GLOBAL.admision'),
                                                                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                                                    });
                                                                  });
                                                            }
                                                          },
                                                            (error: HttpErrorResponse) => {
                                                              Swal({
                                                                type: 'error',
                                                                title: error.status + '',
                                                                text: this.translate.instant('ERROR.' + error.status),
                                                                footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                                                  this.translate.instant('GLOBAL.recibo'),
                                                                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                                              });
                                                            });
                                                        }
                                                      },
                                                        (error: HttpErrorResponse) => {
                                                          Swal({
                                                            type: 'error',
                                                            title: error.status + '',
                                                            text: this.translate.instant('ERROR.' + error.status),
                                                            footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                                              this.translate.instant('GLOBAL.recibo'),
                                                            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                                          });
                                                        });
                                                  } else if (consulta_dato.estado === 'NO PAGO' || consulta_dato.estado === 'PAGO') {
                                                    const id_token = window.localStorage.getItem('id_token').split('.');
                                                    const payload = JSON.parse(atob(id_token[1]));
                                                    this.btnPagar = true;
                                                    this.btnCargar = false;
                                                    this.btnRecibo = false;
                                                    this.btnOficina = false;
                                                    this.loading = false;

                                                    this.info_pago = <Pago>{
                                                      Perpago: info_periodo.Nombre,
                                                      Periodo: info_periodo.Nombre.split('-')[1],
                                                      Anio: info_periodo.Nombre.split('-')[0],
                                                      ProgramaId: info_programa.Id,
                                                      Proyecto: info_programa.Nombre,
                                                      TipoIdentificacion: info_persona.TipoIdentificacion.Nombre,
                                                      Codigo: info_persona.NumeroIdentificacion,
                                                      Nombre: info_persona.PrimerNombre + ' ' + info_persona.SegundoNombre,
                                                      Apellido: info_persona.PrimerApellido + ' ' + info_persona.SegundoApellido,
                                                      FechaOrdinaria: info_recibo.FechaOrdinaria,
                                                      ValorOrdinario: info_recibo.ValorOrdinario,
                                                      Correo: payload.email,
                                                      Concepto: info_recibo.TipoReciboId.Nombre,
                                                      TipoRecibo: info_recibo.TipoReciboId.Id,
                                                      EstadoPago: info_recibo.EstadoReciboId.Nombre,
                                                      Secuencia: info_recibo.Referencia,
                                                    };
                                                  } else {
                                                    Swal({
                                                      type: 'error',
                                                      title: this.translate.instant('GLOBAL.error'),
                                                      text: this.translate.instant('ERROR.' + consulta_dato.estado),
                                                      footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                                        this.translate.instant('GLOBAL.recibo'),
                                                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                                    });
                                                  }
                                                },
                                                  (error: HttpErrorResponse) => {
                                                    Swal({
                                                      type: 'error',
                                                      title: error.status + '',
                                                      text: this.translate.instant('ERROR.' + error.status),
                                                      footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                                        this.translate.instant('GLOBAL.recibo'),
                                                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                                    });
                                                  });
                                            }
                                          },
                                            (error: HttpErrorResponse) => {
                                              Swal({
                                                type: 'error',
                                                title: error.status + '',
                                                text: this.translate.instant('ERROR.' + error.status),
                                                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                                  this.translate.instant('GLOBAL.info_persona'),
                                                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                              });
                                            });
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
                        },
                          (error: HttpErrorResponse) => {
                            Swal({
                              type: 'error',
                              title: error.status + '',
                              text: this.translate.instant('ERROR.' + error.status),
                              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                this.translate.instant('GLOBAL.tipo_recibo'),
                              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                            });
                          });
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal({
                        type: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.cargar') + '-' +
                          this.translate.instant('GLOBAL.estado_recibo'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
              }
            },
              (error: HttpErrorResponse) => {
                Swal({
                  type: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.recibo'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        } else {
          this.loading = false;
        }
      },
        (error: HttpErrorResponse) => {
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

  generarRecibo(): void {
    if (this.inscripcion_id !== 0 && this.inscripcion_id !== undefined && this.inscripcion_id.toString() !== '') {
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
            this.inscripciones.get('inscripcion/' + this.inscripcion_id)
              .subscribe(res_inscripcion => {
                const info_inscripcion = <any>res_inscripcion;
                if (res_inscripcion !== null  && info_inscripcion.Type !== 'error' && info_inscripcion.ReciboInscripcionId === 0) {
                  this.programa.get('dependencia/' + info_inscripcion.ProgramaAcademicoId)
                    .subscribe(res_programa => {
                      const info_programa = <any>res_programa;
                      if (res_programa !== null && info_programa.Type !== 'error') {
                        this.coreService.get('periodo/' + info_inscripcion.PeriodoId)
                          .subscribe(res_periodo => {
                            const info_periodo = <any>res_periodo;
                            if (res_periodo !== null  && info_periodo.Type !== 'error') {
                              this.mid.get('persona/consultar_persona/' + info_inscripcion.PersonaId)
                                .subscribe(res_persona => {
                                  const info_persona = <any>res_persona;
                                  if (res_persona !== null && info_persona.Type !== 'error') {
                                    const id_token = window.localStorage.getItem('id_token').split('.');
                                    const payload = JSON.parse(atob(id_token[1]));
                                    const strpago = 'periodo=' + info_periodo.Nombre.split('-')[1] +
                                      '&anio=' + info_periodo.Nombre.split('-')[0] +
                                      '&programa=' + info_programa.Id +
                                      '&tipoIdentificacion=' + info_persona.TipoIdentificacion.CodigoAbreviacion +
                                      '&numeroIdentificacion=' + info_persona.NumeroIdentificacion +
                                      '&nombre=' + info_persona.PrimerNombre + ' ' + info_persona.SegundoNombre +
                                      '&apellido=' + info_persona.PrimerApellido + ' ' + info_persona.SegundoApellido +
                                      '&fecha=' + formatDate(new Date(), 'dd/MM/yyyy', 'en') +
                                      '&valor=' + 1000 +
                                      '&correo=' + payload.emailaddress +
                                      '&nombreRecibo=' + 'Inscripción virtual' +
                                      '&tipoRecibo=' + 15;
                                    this.pagos.get('recibo.php?' + strpago).subscribe(res_pago => {
                                      const pago_dato = <any>res_pago;
                                      if (pago_dato.estado === 'OK') {
                                        const recibo = <Recibo>{
                                          Referencia: 1 * pago_dato.referencia,
                                          ValorOrdinario: 1000,
                                          FechaOrdinaria: new Date(),
                                          TipoReciboId: {Id: 15},
                                          EstadoReciboId: {Id: 1},
                                        };
                                        this.recibos.post('recibo', recibo).subscribe(res_recibo => {
                                          const res_rec = <any>res_recibo;
                                          if (res_recibo !== null && res_rec.Type !== 'error') {
                                            info_inscripcion.ReciboInscripcionId = res_rec.Id;
                                            this.inscripciones.put('inscripcion', info_inscripcion)
                                              .subscribe(res => {
                                                if (res !== null) {
                                                  this.loading = false;
                                                  this.showToast('info', this.translate.instant('GLOBAL.crear'),
                                                    this.translate.instant('GLOBAL.recibo') + ' ' +
                                                    this.translate.instant('GLOBAL.confirmarCrear'));
                                                  this.getInfoRecibo();
                                                }
                                              },
                                                (error: HttpErrorResponse) => {
                                                  Swal({
                                                    type: 'error',
                                                    title: error.status + '',
                                                    text: this.translate.instant('ERROR.' + error.status),
                                                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                                                      this.translate.instant('GLOBAL.admision'),
                                                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                                  });
                                                });
                                          }
                                        },
                                          (error: HttpErrorResponse) => {
                                            Swal({
                                              type: 'error',
                                              title: error.status + '',
                                              text: this.translate.instant('ERROR.' + error.status),
                                              footer: this.translate.instant('GLOBAL.crear') + '-' +
                                                this.translate.instant('GLOBAL.recibo'),
                                              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                            });
                                          });
                                      } else {
                                        Swal({
                                          type: 'error',
                                          title: this.translate.instant('GLOBAL.error'),
                                          text: this.translate.instant('ERROR.' + pago_dato.estado),
                                          footer: this.translate.instant('GLOBAL.crear') + '-' +
                                            this.translate.instant('GLOBAL.recibo'),
                                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                        });
                                      }
                                    },
                                      (error: HttpErrorResponse) => {
                                        Swal({
                                          type: 'error',
                                          title: error.status + '',
                                          text: this.translate.instant('ERROR.' + error.status),
                                          footer: this.translate.instant('GLOBAL.crear') + '-' +
                                            this.translate.instant('GLOBAL.recibo'),
                                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                        });
                                      });
                                  }
                                },
                                  (error: HttpErrorResponse) => {
                                    Swal({
                                      type: 'error',
                                      title: error.status + '',
                                      text: this.translate.instant('ERROR.' + error.status),
                                      footer: this.translate.instant('GLOBAL.cargar') + '-' +
                                        this.translate.instant('GLOBAL.infp_persona'),
                                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                                    });
                                  });
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
              },
                (error: HttpErrorResponse) => {
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
        });
    }
  }

  mostrarConsignacion() {
    this.mostrarInfo = true;
  }

  cargarConsignacion() {
    this.mostrarForm = true;
  }

  ngOnInit() {
  }

  onChange(event) {
    if (event) {
      this.getInfoRecibo();
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
