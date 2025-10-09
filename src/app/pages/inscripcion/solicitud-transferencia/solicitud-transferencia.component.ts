import { Component, OnInit, Inject, Optional } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { FORM_SOLICITUD_TRANSFERENCIA, FORM_RESPUESTA_SOLICITUD, FORM_SOLICITUD_REINTEGRO } from '../forms-transferencia';
import { ActivatedRoute, Router } from '@angular/router';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { UserService } from '../../../@core/data/users.service';
import * as moment from 'moment';
import { TransferenciaInternaReintegro } from '../../../@core/data/models/inscripcion/transferencia_reintegro';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { elementAt } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'solicitud-transferencia',
  templateUrl: './solicitud-transferencia.component.html',
  styleUrls: ['./solicitud-transferencia.component.scss']
})
export class SolicitudTransferenciaComponent implements OnInit {
  formTransferencia: any;
  formReintegro: any;
  formRespuesta: any;
  sub = null;
  uid = null;
  nivelNombre: string;
  nivel: string;
  tipo: string;
  periodo: string;
  dataTransferencia: TransferenciaInternaReintegro = null;
  dataReintegro: any = null;
  terminadaInscripcion: boolean = false;
  solicitudCreada: boolean = false;
  mostrarDocumento: boolean = true;
  solicitudId: any;
  inscriptionSettings: any = null;
  process: string;
  loading: boolean;
  file: any;
  idFileDocumento: any;
  proyectosCurriculares: any[];
  codigosEstudiante: any[];
  id: any;
  estado: any;
  nombreEstudiante: any;
  documentoEstudiante: any;
  nombreCordinador: any;
  rolCordinador: any;
  comentario: string;
  programaAcademico: string;
  isDialog: boolean = false;

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private sgaMidService: SgaMidService,
    private nuxeo: NewNuxeoService,
    private autenticationService: ImplicitAutenticationService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private router: Router,
    private _Activatedroute: ActivatedRoute,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Optional() private dialogRef: MatDialogRef<SolicitudTransferenciaComponent>
  ) {
    this.formTransferencia = FORM_SOLICITUD_TRANSFERENCIA;
    this.formReintegro = FORM_SOLICITUD_REINTEGRO;
    this.formRespuesta = FORM_RESPUESTA_SOLICITUD;
    this.isDialog = !!this.dialogData;
    
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
      this.utilidades.translateFields(this.formReintegro, 'inscripcion.', 'inscripcion.placeholder_');
      this.utilidades.translateFields(this.formRespuesta, 'inscripcion.', 'inscripcion.placeholder_');
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.placeholder_');
    this.utilidades.translateFields(this.formReintegro, 'inscripcion.', 'inscripcion.placeholder_');
    this.utilidades.translateFields(this.formRespuesta, 'inscripcion.', 'inscripcion.placeholder_');
  }

  ngOnInit() {
    if (this.isDialog) {
      // Handle dialog mode - get data from dialogData
      this.id = this.dialogData.idInscripcion;
      this.process = this.dialogData.process;
      
      this.loading = true;
      this.loadSolicitud();
      this.loadInfoPersona();

      if (this.process === 'all') {
        console.log("Entra process all")
        this.loadInfoPersona();
        this.loadEstados();
      }
    } else {
      this.sub = this._Activatedroute.paramMap.subscribe(async (params: any) => {
        const { id, process } = params.params;
        this.process = atob(process);
        this.id = id

        this.loading = true;
        await this.loadSolicitud();
        await this.loadInfoPersona();

        if (this.process === 'all') {
          console.log("Entra process all")
          await this.loadInfoPersona();
          await this.loadEstados();
        }
      })
    }
  }

  ocultarCampo(campo, ocultar) {
    this.formTransferencia.campos[campo].ocultar = ocultar;
    this.formTransferencia.campos[campo].requerido = !ocultar;
  }

  getIndexForm(nombre: String, tipo: String): number {
    const formulario = (this.tipo === 'Transferencia externa' || this.tipo === 'Transferencia interna')
      ? this.formTransferencia
      : this.formReintegro;

    for (let index = 0; index < formulario.campos.length; index++) {
      const element = formulario.campos[index];
      if (element.nombre === nombre) {
        console.log("Index campo encontrado en formulario :", index);
        return index;
      }
    }
    return 0;
  }

  getIndexFormRes(nombre: String): number {
    for (let index = 0; index < this.formRespuesta.campos.length; index++) {
      const element = this.formRespuesta.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  loadInfoPersona(): void {
    this.loading = true;
    this.uid = this.userService.getPersonaId();

    this.autenticationService.getRole().then((rol: Array<String>) => {
      if (rol.includes('COORDINADOR') || rol.includes('COORDINADOR_PREGADO') || rol.includes('COORDINADOR_POSGRADO')) {
        this.rolCordinador = 'COORDINADOR';
      }
    });

    if (this.uid !== undefined && this.uid !== 0 &&
      this.uid.toString() !== '' && this.uid.toString() !== '0') {
      this.sgaMidService.get('persona/consultar_persona/' + this.uid).subscribe((res: any) => {
        this.loading = false;
        if (res !== null) {
          this.nombreCordinador = res.NombreCompleto;
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
      this.loading = false;
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  async loadSolicitud() {
    this.loading = true;
    try {
      const inscripcion = await this.recuperarTransferenciaInscripcion(this.id);
      if (inscripcion !== null && inscripcion.Success) {

        this.periodo = inscripcion['Data']['Periodo']['Nombre'];
        this.nivelNombre = inscripcion['Data']['Nivel']['Nombre'];
        this.nivel = inscripcion['Data']['Nivel']['Id'];
        this.tipo = inscripcion['Data']['TipoInscripcion']['Nombre'];
        this.estado = inscripcion['Data']['Estado']['CodigoAbreviacion'];

        // Datos del estudiante
        this.nombreEstudiante = inscripcion['Data']['DatosEstudiante']['Nombre'];
        this.documentoEstudiante = inscripcion['Data']['DatosEstudiante']['Identificacion'];
        this.codigosEstudiante = [];
        for (const codigo of inscripcion['Data']['CodigoEstudiante']) {
          this.codigosEstudiante.push(codigo['Codigo']);
        }
        this.solicitudId = inscripcion['Data']['SolicitudId'];
        this.programaAcademico = inscripcion['Data']['ProgramaDestino']['Nombre'];

        if (this.tipo === 'Reingreso') {
          this.logFormFields();

          this.formReintegro.btn = this.translate.instant('GLOBAL.enviar');
          // Se traen los campos del formulario
          const nombre = this.getIndexForm('Nombres', this.tipo);
          const programa = this.getIndexForm('ProgramaAcademico', this.tipo);
          const documento = this.getIndexForm('NumeroIdentificacion', this.tipo);
          const codigos = this.getIndexForm('CodigoEstudiante', this.tipo);

          this.formReintegro.campos[nombre].valor = this.nombreEstudiante;
          this.formReintegro.campos[programa].valor = this.programaAcademico;
          this.formReintegro.campos[documento].valor = this.documentoEstudiante;
          this.formReintegro.campos[codigos].opciones = this.codigosEstudiante;
          this.loading = false;

        }
        else {
          this.logFormFields();
          this.formTransferencia.campos.forEach(campo => {
            delete campo.deshabilitar;
          });
          this.formTransferencia.btn = 'Guardar';

          const origen = this.getIndexForm('ProgramaOrigen', this.tipo);
          const origenExterno = this.getIndexForm('ProgramaOrigenInput', this.tipo);
          const estudiante = this.getIndexForm('CodigoEstudiante', this.tipo);
          const estudianteExterno = this.getIndexForm('CodigoEstudianteExterno', this.tipo);
          const destino = this.getIndexForm('ProgramaDestino', this.tipo);
          const universidad = this.getIndexForm('UniversidadOrigen', this.tipo);
          const cancelo = this.getIndexForm('Cancelo', this.tipo);
          const acuerdo = this.getIndexForm('Acuerdo', this.tipo);
          const creditos = this.getIndexForm('CantidadCreditos', this.tipo);
          const ultimo = this.getIndexForm('UltimoSemestre', this.tipo);

          this.formTransferencia.campos[destino].valor = inscripcion['Data']['ProgramaDestino'];
          this.formTransferencia.campos[destino].deshabilitar = true;

          this.ocultarCampo(acuerdo, true);
          this.formTransferencia.campos[cancelo].ocultar = true;
          this.formTransferencia.campos[creditos].claseGrid = 'col-sm-6 col-xs-6';
          this.formTransferencia.campos[ultimo].claseGrid = 'col-sm-6 col-xs-6';

          if (this.tipo === 'Transferencia externa') {
            this.ocultarCampo(estudianteExterno, false);
            this.ocultarCampo(estudiante, true);

            this.ocultarCampo(origenExterno, false);
            this.ocultarCampo(origen, true);

            this.formTransferencia.campos[universidad].deshabilitar = false;
            this.solicitudCreada = true;
          } else {
            this.ocultarCampo(estudianteExterno, true);
            this.ocultarCampo(estudiante, false);

            this.ocultarCampo(origenExterno, true);
            this.ocultarCampo(origen, false);

            this.solicitudCreada = false;

            this.formTransferencia.campos[universidad].deshabilitar = true;
            this.formTransferencia.campos[universidad].valor = 'Universidad Distrital Francisco José de Caldas'

            this.formTransferencia.campos[estudiante].deshabilitar = false;
            this.formTransferencia.campos[estudiante].opciones = inscripcion['Data']['CodigoEstudiante'];

            this.formTransferencia.campos[origen].deshabilitar = false;
            this.formTransferencia.campos[origen].opciones = inscripcion['Data']['ProyectoCurricular'];
            this.formTransferencia.campos[origen].opciones = inscripcion['Data']['ProyectoCodigo'];

            if (this.tipo === 'Reingreso') {
              this.ocultarCampo(acuerdo, false);
              this.formTransferencia.campos[cancelo].ocultar = false;

              if (inscripcion['Data']['CodigoEstudiante'] && inscripcion['Data']['CodigoEstudiante'].length > 0) {
                inscripcion['Data']['CodigoEstudiante'].forEach(codigo => {
                  if (codigo.IdProyecto === inscripcion['Data']['ProgramaDestino']['Id']) {
                    this.formTransferencia.campos[estudiante].valor = codigo;
                    this.formTransferencia.campos[estudiante].deshabilitar = true;
                  }
                });
              }

              this.formTransferencia.campos[origen].valor = inscripcion['Data']['ProgramaDestino'];
              this.formTransferencia.campos[origen].deshabilitar = true;
            }
          }

          if (inscripcion.Data.SolicitudId) {
            this.estado = inscripcion['Data']['Estado']['Nombre'];
            let data = {
              Cancelo: inscripcion['Data']['DatosInscripcion']['CanceloSemestre'],
              Acuerdo: inscripcion['Data']['DatosInscripcion']['SolicitudAcuerdo'],
              CantidadCreditos: inscripcion['Data']['DatosInscripcion']['CantidadCreditos'],
              CodigoEstudiante: inscripcion['Data']['DatosInscripcion']['CodigoEstudiante'],
              CodigoEstudianteExterno: inscripcion['Data']['DatosInscripcion']['CodigoEstudiante'],
              SoporteDocumento: inscripcion['Data']['DatosInscripcion']['DocumentoId'],
              MotivoCambio: inscripcion['Data']['DatosInscripcion']['MotivoRetiro'],
              UltimoSemestre: inscripcion['Data']['DatosInscripcion']['UltimoSemestreCursado'],
              ProgramaOrigen: inscripcion['Data']['DatosInscripcion']['ProyectoCurricularProviene'],
              ProgramaOrigenInput: inscripcion['Data']['DatosInscripcion']['ProyectoCurricularProviene'],
              UniversidadOrigen: inscripcion['Data']['DatosInscripcion']['UniversidadProviene'],
              ProgramaDestino: inscripcion['Data']['ProgramaDestino'],
            }
            if (!(this.tipo === 'Transferencia externa')) {
              data.UniversidadOrigen = 'Universidad Distrital Francisco José de Caldas';
              if (this.tipo === 'Reingreso') {
                // data.ProgramaOrigen = data.ProgramaDestino;
              }
            }
            this.dataTransferencia = data;

            // Map data for reintegro form when tipo is 'Reingreso'
            if (this.tipo === 'Reingreso') {
              const nombreCompleto = inscripcion['Data']['DatosEstudiante']['Nombre'] || '';
              const nombrePartes = nombreCompleto.split(' ');
              this.dataReintegro = {
                Nombres: nombrePartes.length > 0 ? nombrePartes[0] : '',
                Apellidos: nombrePartes.length > 1 ? nombrePartes.slice(1).join(' ') : '',
                ProgramaAcademico: inscripcion['Data']['ProgramaDestino']['Nombre'] || '',
                TipoIdentificacion: '', // This would need to come from persona data
                NumeroIdentificacion: inscripcion['Data']['DatosEstudiante']['Identificacion'] || '',
                FechaExpedicion: '', // This might need to come from persona data
                LugarExpedicion: '', // This would need to come from persona data
                CodigoCarrera: inscripcion['Data']['ProgramaDestino']['Codigo'] || '',
                CodigoEstudiante: inscripcion['Data']['DatosInscripcion']['CodigoEstudiante'] || '',
                PeriodoDesde: '', // This would need to be calculated
                PeriodoHasta: '', // This would need to be calculated
                MotivoRetiro: inscripcion['Data']['DatosInscripcion']['MotivoRetiro'] || '',
              };
            }

            this.nombreEstudiante = inscripcion['Data']['DatosEstudiante']['Nombre'];
            this.documentoEstudiante = inscripcion['Data']['DatosEstudiante']['Identificacion'];
            this.codigosEstudiante = inscripcion['Data']['DatosInscripcion']['CodigoEstudiante'];
            this.solicitudId = inscripcion['Data']['SolicitudId'];

            if ((inscripcion['Data']['Estado']['Nombre'] !== 'Requiere modificación' && this.process === 'my') || this.process === 'all') {
              this.formTransferencia.campos[this.getIndexForm('SoporteDocumento', this.tipo)].ocultar = true;
              this.solicitudCreada = true;
              this.mostrarDocumento = true;
              this.formTransferencia.campos.forEach(campo => {
                campo.deshabilitar = true;
              });
              this.formTransferencia.btn = '';

              this.file = {
                id: inscripcion['Data']['DatosInscripcion']['DocumentoId'],
                label: this.translate.instant('inscripcion.' + 'placeholder_soportes_documentos')
              }
            } else {
              this.formTransferencia.campos[origen].deshabilitar = true;
              this.formTransferencia.campos[origenExterno].deshabilitar = true;
              this.solicitudCreada = true;
              this.mostrarDocumento = false;
              this.comentario = inscripcion['Data']['DatosRespuesta']['Observacion'];

              this.inscriptionSettings = this.nivelNombre === 'Pregrado' ? {
                basic_info_button: true,
                hide_header_labels: true,
                formacion_academica_button: true,
                documentos_programa_button: true,
                select_tipo: this.tipo,
                nivel: this.nivelNombre,
                detalle_inscripcion: true,
                es_transferencia: true,
              } : {
                basic_info_button: true,
                hide_header_labels: true,
                formacion_academica_button: true,
                documentos_programa_button: true,
                select_tipo: this.tipo,
                nivel: this.nivelNombre,
                detalle_inscripcion: true,
                experiencia_laboral: true,
                produccion_academica: true,
                es_transferencia: true,
              }

              const SoporteDocumento = this.getIndexForm('SoporteDocumento', this.tipo);

              this.formTransferencia.campos[SoporteDocumento].ocultar = false;
              this.idFileDocumento = inscripcion['Data']['DatosInscripcion']['DocumentoId'];

              try {
                const file = await this.recuperarDocumento(this.idFileDocumento);
                this.formTransferencia.campos[SoporteDocumento].urlTemp = file[0]['url'] + '';
                this.formTransferencia.campos[SoporteDocumento].valor = file[0]['url'] + '';
              } catch (error) {
                console.error('Error loading document:', error);
              }
            }

            if (inscripcion.Data.DatosRespuesta) {
              const EstadoId = this.getIndexFormRes('EstadoId');
              const FechaEspecifica = this.getIndexFormRes('FechaEspecifica');
              const Observacion = this.getIndexFormRes('Observacion');
              const SoporteRespuesta = this.getIndexFormRes('SoporteRespuesta');

              if (inscripcion.Data.Estado.Nombre != "Pago" || inscripcion.Data.Estado.Nombre != "Solicitado") {
                this.formRespuesta.campos[EstadoId].valor = inscripcion.Data.Estado;
              }
              this.formRespuesta.campos[FechaEspecifica].valor = inscripcion.Data.DatosRespuesta.FechaEvaluacion.slice(0, -4);
              this.formRespuesta.campos[Observacion].valor = inscripcion.Data.DatosRespuesta.Observacion;
              this.idFileDocumento = inscripcion.Data.DatosRespuesta.DocRespuesta

              try {
                const file = await this.recuperarDocumento(this.idFileDocumento);
                this.formRespuesta.campos[SoporteRespuesta].urlTemp = file[0]['url'] + '';
                this.formRespuesta.campos[SoporteRespuesta].valor = file[0]['url'] + '';
              } catch (error) {
                console.error('Error loading response document:', error);
              }
            }

          } else {
            this.mostrarDocumento = false;
            this.formTransferencia.campos[this.getIndexForm('SoporteDocumento', this.tipo)].ocultar = false;

            // Initialize empty dataReintegro for new reintegro requests
            if (this.tipo === 'Reingreso') {
              this.dataReintegro = {
                Nombres: '',
                Apellidos: '',
                ProgramaAcademico: inscripcion['Data']['ProgramaDestino']['Nombre'] || '',
                TipoIdentificacion: '',
                NumeroIdentificacion: '',
                FechaExpedicion: '',
                LugarExpedicion: '',
                CodigoCarrera: inscripcion['Data']['ProgramaDestino']['Codigo'] || '',
                CodigoEstudiante: '',
                PeriodoDesde: '',
                PeriodoHasta: '',
                MotivoRetiro: '',
              };
            }
          }

          this.inscriptionSettings = this.nivelNombre === 'Pregrado' ? {
            basic_info_button: true,
            hide_header_labels: true,
            formacion_academica_button: true,
            documentos_programa_button: true,
            select_tipo: this.tipo,
            nivel: this.nivelNombre,
            detalle_inscripcion: true,
            es_transferencia: true,
          } : {
            basic_info_button: true,
            hide_header_labels: true,
            formacion_academica_button: true,
            documentos_programa_button: true,
            select_tipo: this.tipo,
            nivel: this.nivelNombre,
            detalle_inscripcion: true,
            experiencia_laboral: true,
            produccion_academica: true,
            es_transferencia: true,
          }

          // Debug: Log final form fields state
          this.logFormFields();

        }





      }
    } catch (error) {
      this.loading = false;
      console.error('Error loading solicitud:', error);
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
    }
  }

  recuperarTransferenciaInscripcion(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('transferencia/inscripcion/' + id).subscribe((response: any) => {
        if (response != null && response.Success) {
          resolve(response);
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
        }
      },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
        });
    });
  }

  recuperarDocumento(idDoc: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nuxeo.get([{ 'Id': idDoc }]).subscribe((response: any) => {
        resolve(response);
      },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
        });
    });
  }

  async loadEstados() {
    try {
      const estados = await this.recuperarTransferenciaEstados();
      const respuesta = this.getIndexFormRes('Respuesta');
      this.formRespuesta.campos[respuesta].opciones = estados.filter((estado: any) => estado.Nombre != 'Radicada' && estado.Nombre != 'Solicitado');
    } catch (error) {
      console.error('Error loading estados:', error);
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
    }
  }

  recuperarTransferenciaEstados(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('transferencia/estados').subscribe((response: any) => {
        if (response != null && response.Success) {
          resolve(response.Data);
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
        }
      },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
        });
    });
  }

  goback() {
    if (this.isDialog) {
      this.dialogRef.close();
    } else {
      this.router.navigate([`pages/inscripcion/transferencia/${btoa(this.process)}`]);
    }
  }

  generarMatricula() {
    const opt: any = {
      title: this.translate.instant('En desarrollo'),
      html: `Generación de recibos de matricula en desarrollo`,
      icon: 'info',
      buttons: true,
      dangerMode: true,
      showCancelButton: true
    };
    Swal.fire(opt);
  }

  send() {
    this.loading = true;

    const hoy = new Date();
    const inscripcionPut = {
      'EstadoId': 15,
      'FechaRespuesta': moment().format('YYYY-MM-DD hh:mm:ss'),
      'TerceroId': this.userService.getPersonaId(),
      'EstadoAbreviacion': 'INSCREAL'
    }

    this.sgaMidService.put('transferencia/actualizar_estado/' + this.solicitudId, inscripcionPut).subscribe((response: any) => {
      this.loading = false;
      const r_ins = <any>response;
      if (response !== null && r_ins.Type !== 'error') {
        this.loading = false;
        this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
        this.router.navigate([`pages/inscripcion/transferencia/${btoa(this.process)}`])
      }
    },
      (error: any) => {
        this.loading = false;
        if (error.System.Message.includes('duplicate')) {
          Swal.fire({
            icon: 'info',
            text: this.translate.instant('inscripcion.error_update_programa_seleccionado'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

          });
        } else {
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.actualizar') + '-' +
              this.translate.instant('GLOBAL.admision'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      });
  }

  validarFormRespuesta(event) {
    const FechaEspecifica = this.getIndexFormRes('FechaEspecifica');
    if (event.nombre === 'EstadoId') {
      if (event.valor.Nombre !== 'Prueba especifica') {
        this.formRespuesta.campos[FechaEspecifica].deshabilitar = true;
        this.formRespuesta.campos[FechaEspecifica].valor = '';
      } else {
        this.formRespuesta.campos[FechaEspecifica].deshabilitar = false;
      }
    }
  }

  async validarForm(event) {
    if (event.valid) {
      let data: any;
      if (this.tipo === 'Reingreso') {
        // Para reintegro, usar los datos de dataReintegro
        data = {
          'InscripcionId': parseInt(this.id),
          'CodigoEstudiante': event.data.dataReintegro.CodigoEstudiante,
          'MotivoRetiro': event.data.dataReintegro.MotivoRetiro,
          'CantidadCreditos': 0, // Valor por defecto para reintegro
          'Tipo': this.tipo,
          'ProyectoOrigen': null, // Para reintegro es el mismo programa
          'Universidad': 'Universidad Distrital Francisco José de Caldas',
          'UltimoSemestre': 0, // Valor por defecto para reintegro
          'Interna': true, // Siempre es interna para reintegro
          'SolicitanteId': this.userService.getPersonaId(),
          'FechaRadicacion': moment().format('YYYY-MM-DD hh:mm:ss'),
          // Campos específicos de reintegro
          'Nombres': event.data.dataReintegro.Nombres || event.data.dataReintegro.Nombre,
          // 'NumeroIdentificacion': event.data.dataReintegro.NumeroIdentificacion,
          'ProgramaAcademico': event.data.dataReintegro.ProgramaAcademico,
          'Telefono1': event.data.dataReintegro.Telefono1,
          'Telefono2': event.data.dataReintegro.Telefono2
        }
      } else {
        // Para transferencia, usar los datos de dataTransferencia
        data = {
          'InscripcionId': parseInt(this.id),
          'Codigo_estudiante': this.tipo == 'Transferencia interna' ? event.data.dataTransferencia.CodigoEstudiante.Codigo :
            event.data.dataTransferencia.CodigoEstudianteExterno,
          'Motivo_retiro': event.data.dataTransferencia.MotivoCambio,
          'Cantidad_creditos': event.data.dataTransferencia.CantidadCreditos,
          'Tipo': this.tipo,
          'Proyecto_origen': event.data.dataTransferencia.ProgramaOrigen ? event.data.dataTransferencia.ProgramaOrigen.Id : event.data.dataTransferencia.ProgramaOrigenInput,
          'Universidad': event.data.dataTransferencia.UniversidadOrigen,
          'Ultimo_semestre': event.data.dataTransferencia.UltimoSemestre,
          'Interna': this.tipo == 'Transferencia interna',
          'Acuerdo': event.data.dataTransferencia.Acuerdo == true,
          'Cancelo': event.data.dataTransferencia.Cancelo == true,
          'SolicitanteId': this.userService.getPersonaId(),
          'FechaRadicacion': moment().format('YYYY-MM-DD hh:mm:ss'),
        }
      }

      // Actualizacion-creacion de solicitud
      if (this.estado != 'INSCSOL') {
        this.sgaMidService.put('transferencia/' + this.id, data).subscribe(
          (res: any) => {
            if (res.Success == true) {
              this.loading = false;
              this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.solicitud_generada')).then(cerrado => {
                this.ngOnInit();
                this.goback();
              });
            } else {
              this.loading = false;
              this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_solicitud'));
            }
          }, error => {
            this.loading = false;
          }
        );
      } else {
        this.sgaMidService.post('transferencia', data).subscribe(
          (res: any) => {
            if (res.Response.Code === '400') {
              this.loading = false;
              if (Array.isArray(res.Body) && res.Body.some((msg: string) => msg.includes('duplicate'))) {
                Swal.fire({
                  icon: 'info',
                  text: res.Body && res.Body.length ? res.Body.join('\n') : this.translate.instant('inscripcion.error_solicitud'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                }).then(() => {
                  this.goback();
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  text: res.Body && res.Body.length ? res.Body.join('\n') : this.translate.instant('inscripcion.error_solicitud'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                }).then(() => {
                  this.goback();
                });
              }
            }
            if (res.Response.Code === '200') {
              this.loading = false;
              Swal.fire({
                icon: 'success',
                text: this.translate.instant('inscripcion.guardar'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              }).then(() => {
                this.goback();
              });
            }
          }, error => {
            this.loading = false;
          }
        );
      }

      // Manejo de archivos/documentos
      if (this.tipo !== 'Reingreso') {
        let files: any;
        const element = event.data.dataTransferencia.SoporteDocumento;
        if (typeof element.file !== 'undefined' && element.file !== null) {
          this.loading = true;
          const file = {
            file: await this.nuxeo.fileToBase64(element.file),
            IdTipoDocumento: element.IdDocumento,
            metadatos: {
              NombreArchivo: element.nombre,
              Tipo: 'Archivo',
              Observaciones: element.nombre,
              'dc:title': element.nombre,
            },
            descripcion: element.nombre,
            nombre: element.nombre,
            key: 'Documento',
          }
          files = file;
        } else if (this.idFileDocumento) {
          files = this.idFileDocumento;
        }

        // Agregar documento a los datos si existe
        if (files) {
          data['Documento'] = files;
        }
      }
    }
  }

  async respuestaForm(event) {
    if (event.valid) {
      let files: any;

      const element = event.data.Respuesta.SoporteRespuesta;
      if (typeof element.file !== 'undefined' && element.file !== null) {
        this.loading = true;
        const file = {
          file: await this.nuxeo.fileToBase64(element.file),
          IdTipoDocumento: element.IdDocumento,
          metadatos: {
            NombreArchivo: element.nombre,
            Tipo: 'Archivo',
            Observaciones: element.nombre,
            'dc:title': element.nombre,
          },
          descripcion: element.nombre,
          nombre: element.nombre,
          key: 'Documento',
        }
        files = file;
      } else if (this.idFileDocumento) {
        files = this.idFileDocumento;
      }

      const hoy = new Date();
      let Respuesta = {
        DocRespuesta: files,
        FechaEspecifica: '',
        FechaRespuesta: moment(`${hoy.getFullYear()}-${hoy.getMonth()}-${hoy.getDate()}`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
        TerceroResponasble: this.uid,
        EstadoId: event.data.Respuesta.EstadoId,
        Comentario: event.data.Respuesta.Observacion
      };

      if (event.data.Respuesta.FechaEspecifica != '') {
        Respuesta.FechaEspecifica = moment(event.data.Respuesta.FechaEspecifica).format('YYYY-MM-DD hh:mm:ss');
      }

      this.sgaMidService.put('transferencia/respuesta_solicitud/' + this.solicitudId, Respuesta).subscribe(
        (res: any) => {
          if (res.Status == '200') {
            this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.info_estado') + ' ' +
              this.translate.instant('GLOBAL.operacion_exitosa'));
            this.loading = false;
          } else {
            this.loading = false;
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_res_solicitud'));
          }
        }, error => {
          this.loading = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  prueba(event) {
    console.log(event)
  }

  changeLoading(loading: boolean) {
    this.loading = loading;
  }

  logFormFields() {
    console.log('=== FORM FIELDS DEBUG ===');
    console.log('Tipo:', this.tipo);
    this.formTransferencia.campos.forEach((campo, index) => {
      console.log(`Field ${index}: ${campo.nombre} - Hidden: ${campo.ocultar}, Disabled: ${campo.deshabilitar}`);
    });
    console.log('=== END DEBUG ===');
  }
}
