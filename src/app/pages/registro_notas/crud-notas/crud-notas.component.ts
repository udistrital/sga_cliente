import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { DocenteAsignatura } from '../../../@core/data/models/registro-notas/docente-asignatura';
import { EstudiantesNotas, setFooter, setHeader } from '../../../@core/data/models/registro-notas/estudiantes-notas';
import { Fields } from '../../../@core/data/models/registro-notas/fields';
import { PorcentajesAsignatura } from '../../../@core/data/models/registro-notas/porcentajes-asignatura';
import { PropuestasPorcentajes } from '../../../@core/data/models/registro-notas/propuestas-porcentajes';
import { RegistroNotaEstado } from '../../../@core/data/models/registro-notas/registro-nota-estado';
import { DataAsignatura, RegistroNotasService } from '../../../@core/data/registro_notas.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { RenderDataComponent } from '../../../@theme/components';
import { PopUpManager } from '../../../managers/popUpManager';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ParametrosService } from '../../../@core/data/parametros.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'crud-notas',
  templateUrl: './crud-notas.component.html',
  styleUrls: ['./crud-notas.component.scss']
})

export class CrudNotasComponent implements OnInit, OnDestroy {

  //// datos de entrada para cargar componente ////
  dataReceived: DataAsignatura = {
    Asignatura_id: "",
    Periodo_id: 0,
    Nivel_id: 0,
    EstadoRegistro_porTiempo: 0
  };

  //// variables relacionadas a docente info ////
  dataDocente: DocenteAsignatura = {
    Docente: "",
    Identificacion: "",
    Codigo: "",
    Asignatura: "",
    Nivel: "",
    Grupo: "",
    Inscritos: null,
    Creditos: null,
    Periodo: ""
  };
  
  //// variables relacionadas a porcentajes asignatura ////
  totalPercentage = 0;
  parcialPercentage = [0, 0, 0]

  cajaPorcentajesVer: boolean = false;

  modeloPorcentajes: PorcentajesAsignatura[];
  
  Corte1: PorcentajesAsignatura = null;
  Corte2: PorcentajesAsignatura = null;
  Examen: PorcentajesAsignatura = null;
  Habilit: PorcentajesAsignatura = null;
  Definitiva: PorcentajesAsignatura = null;

  GuardarEstructuraNota: boolean = true;

  needCrearPorcentajes: boolean = false;

  //// variables registro calificaciones estudiantes ///
  settings: Object;
  dataSource: LocalDataSource;

  calificacionesGET: EstudiantesNotas[];
  calificacionesEstudiantesV2: EstudiantesNotas[] = [];

  EstadosRegistro: any

  ObservacionesNotas: any

  needCrearNotasEstudiantes: boolean = false;

  definitiva: boolean = false;

  finalizar: boolean = false;

  finalizado: boolean = false;

  //// tiempo muestra modal ////
  timeinfo: number = 10000;

  //// pdf /////
  @ViewChild('HtmlPdf', {static: true}) HtmlPdf: ElementRef;

  //// loading ////
  loading: boolean = false;

  errorgen: boolean = false;

  constructor(
    private parametrosService: ParametrosService,
    private sgaMidService: SgaMidService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    public passDataService: RegistroNotasService,
    private router: Router,
  ) {
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    })
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  async ngOnInit() {

    this.dataReceived = this.passDataService.getData();

    this.EstadosRegistro = JSON.parse(sessionStorage.getItem('EstadosRegistro'))

    this.createTable();
    try {
      await this.getObservaciones();
      await this.getDocenteAsignaturaInfo(this.dataReceived.Asignatura_id);
      await this.getPorcentajes(this.dataReceived.Asignatura_id, this.dataReceived.Periodo_id);
      await this.checkingPorcentajes();
      await this.getNotasEstudiantes(this.dataReceived.Asignatura_id, this.dataReceived.Periodo_id);
      await this.checkingNotasEstudiantes();
    } catch (error) {
      console.log("ngOnInit: ",error)
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      this.errorgen = true;
    }

  }

  createTable() {
    this.settings = {
      columns: {
        Codigo: {
          title: this.translate.instant('notas.codigo'),
          editable: false,
          width: '7%',
          filter: false,
        },
        Nombre: {
          title: this.translate.instant('notas.nombre'),
          editable: false,
          width: '14%',
          filter: false,
        },
        Apellido: {
          title: this.translate.instant('notas.apellido'),
          editable: false,
          width: '14%',
          filter: false,
        },
        CORTE_1: {
          title: this.translate.instant('notas.corte1'),
          editable: false,
          width: '15%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        CORTE_2: {
          title: this.translate.instant('notas.corte2'),
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        EXAMEN: {
          title: this.translate.instant('notas.examen'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        HABILIT: {
          title: this.translate.instant('notas.habilitacion'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        VARIOS: {
          title: this.translate.instant('notas.varios'),
          editable: false,
          width: '15%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        TOTAL: {
          title: this.translate.instant('notas.total'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        }
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('asignaturas.no_datos_notas')
    };
  }

  fillTable() {
    this.calificacionesEstudiantesV2 = [];
    this.calificacionesEstudiantesV2[0] = setHeader();
    let unlinkedCopy = JSON.parse(JSON.stringify(this.calificacionesGET))
    this.calificacionesEstudiantesV2 = this.calificacionesEstudiantesV2.concat(unlinkedCopy);
    this.calificacionesEstudiantesV2.push(setFooter());
    this.updateHeader();
    this.updateFooter();
  }

  updateHeader() {
    this.calificacionesEstudiantesV2[0].CORTE_1.fields = this.Corte1.fields.field;
    this.calificacionesEstudiantesV2[0].CORTE_2.fields = this.Corte2.fields.field;
    this.calificacionesEstudiantesV2[0].EXAMEN.fields = this.Examen.fields.field;
    this.calificacionesEstudiantesV2[0].HABILIT.fields = this.Habilit.fields.field;
  }

  updatePercentsNotes(){
    let max = this.calificacionesEstudiantesV2.length;
    for(let i = 1; i < max-1; i++){
      this.calificacionesEstudiantesV2[i].CORTE_1.fields.forEach((f: Fields) => {
        f.perc = this.Corte1.fields.field.find(p => p.name == f.name).perc;
      });
      this.calificacionesEstudiantesV2[i].CORTE_2.fields.forEach((f: Fields) => {
        f.perc = this.Corte2.fields.field.find(p => p.name == f.name).perc;
      });
    }
  }

  updateFooter() {
    let end = this.calificacionesEstudiantesV2.length;
    this.calificacionesEstudiantesV2[end - 1].CORTE_1.canEdit = ((this.Corte1.editporTiempo || this.Corte1.editExtemporaneo) && !this.Corte1.finalizado);
    this.calificacionesEstudiantesV2[end - 1].CORTE_1.fields[0].value = this.Corte1.finalizado;
    this.calificacionesEstudiantesV2[end - 1].CORTE_2.canEdit = ((this.Corte2.editporTiempo || this.Corte2.editExtemporaneo) && !this.Corte2.finalizado);
    this.calificacionesEstudiantesV2[end - 1].CORTE_2.fields[0].value = this.Corte2.finalizado;
    this.calificacionesEstudiantesV2[end - 1].EXAMEN.canEdit = ((this.Examen.editporTiempo || this.Examen.editExtemporaneo) && !this.Examen.finalizado);
    this.calificacionesEstudiantesV2[end - 1].EXAMEN.fields[0].value = this.Examen.finalizado;
    this.calificacionesEstudiantesV2[end - 1].HABILIT.canEdit = ((this.Habilit.editporTiempo || this.Habilit.editExtemporaneo) && !this.Habilit.finalizado);
    this.calificacionesEstudiantesV2[end - 1].HABILIT.fields[0].value = this.Habilit.finalizado;
  }

  getDocenteAsignaturaInfo(asignaturaId) {
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('notas/InfoDocenteAsignatura/' + asignaturaId).subscribe(
        (response: any) => {
          if (response !== null && response.Status == '404') {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_informacion_docente_asignatura'));
          } else {
            this.dataDocente = response.Data[0];
          }
          resolve(this.dataDocente)
        },
        error => {
          console.log("getDocente...: ",error)
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error)
        }
      );
    });
  }

  getPorcentajes(asignaturaId, periodoId) {
    return new Promise((resolve,reject) => {
      this.sgaMidService.get('notas/PorcentajeAsignatura/' + asignaturaId + '/' + periodoId).subscribe(
        (response: any) => {
          if (response !== null && response.Status == '404') {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_info_porcentajes'));
          } else {
            this.modeloPorcentajes = response.Data;
          }
          resolve(this.modeloPorcentajes)
        },
        error => {
          console.log("getPorcentajes: ",error)
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error)
        }
      );
    });
  }

  async checkingPorcentajes() {

    this.needCrearPorcentajes = false;

    this.modeloPorcentajes.forEach((porcentaje: PorcentajesAsignatura) => {
      if (porcentaje.id == "") {
        porcentaje.fields = this.manageEmptyPorcentaje(porcentaje.estadoRegistro)
        this.needCrearPorcentajes = true;
      }
    });

    this.estructurarPorcentajes();

    if (this.needCrearPorcentajes) {

      try {
        await this.putPorcentajes("Crear");
        await this.getPorcentajes(this.dataReceived.Asignatura_id, this.dataReceived.Periodo_id);
        await this.checkingPorcentajes();

      } catch (error) {
        console.log("checkPerc...: ",error)
      }

    }

    this.needCrearPorcentajes = false;

    if(this.Corte1.finalizado && this.Corte2.finalizado && this.Examen.finalizado && this.Habilit.finalizado && !this.Definitiva.finalizado){
      this.popUpManager.showAlert(this.translate.instant('notas.title_finalizar'),this.translate.instant('notas.info_finalizar'))
      this.definitiva = true;
    }
    this.finalizado = this.Definitiva.finalizado

    this.cajaPorcentajesVer = true;

  }

  manageEmptyPorcentaje(reg) {
    let estructura;
    switch (reg) {
      case this.EstadosRegistro.Corte1:
        estructura = PropuestasPorcentajes.Corte1;
        break;
      case this.EstadosRegistro.Corte2:
        estructura = PropuestasPorcentajes.Corte2;
        break;
      case this.EstadosRegistro.Examen:
        estructura = PropuestasPorcentajes.Examen;
        break;
      case this.EstadosRegistro.Habilit:
        estructura = PropuestasPorcentajes.Habilit;
        break;
      case this.EstadosRegistro.Definitiva:
        estructura = PropuestasPorcentajes.Definitiva;
        break;

      default:
        break;
    }

    return estructura
  }

  estructurarPorcentajes() {

    this.modeloPorcentajes.forEach((porcentajes: PorcentajesAsignatura) => {
      if (porcentajes.estadoRegistro == this.EstadosRegistro.Corte1) {
        porcentajes.editporTiempo = (this.dataReceived.EstadoRegistro_porTiempo == porcentajes.estadoRegistro);
        porcentajes.editExtemporaneo = (this.dataReceived.EstadoRegistro_porExtemporaneo == porcentajes.estadoRegistro);
        this.Corte1 = porcentajes;
      }
      if (porcentajes.estadoRegistro == this.EstadosRegistro.Corte2) {
        porcentajes.editporTiempo = (this.dataReceived.EstadoRegistro_porTiempo == porcentajes.estadoRegistro);
        porcentajes.editExtemporaneo = (this.dataReceived.EstadoRegistro_porExtemporaneo == porcentajes.estadoRegistro);
        this.Corte2 = porcentajes;
      }
      if (porcentajes.estadoRegistro == this.EstadosRegistro.Examen) {
        porcentajes.editporTiempo = (this.dataReceived.EstadoRegistro_porTiempo == porcentajes.estadoRegistro);
        porcentajes.editExtemporaneo = (this.dataReceived.EstadoRegistro_porExtemporaneo == porcentajes.estadoRegistro);
        this.Examen = porcentajes;
      }
      if (porcentajes.estadoRegistro == this.EstadosRegistro.Habilit) {
        porcentajes.editporTiempo = (this.dataReceived.EstadoRegistro_porTiempo == porcentajes.estadoRegistro);
        porcentajes.editExtemporaneo = (this.dataReceived.EstadoRegistro_porExtemporaneo == porcentajes.estadoRegistro);
        this.Habilit = porcentajes;
      }
      if (porcentajes.estadoRegistro == this.EstadosRegistro.Definitiva) {
        porcentajes.editporTiempo = (this.dataReceived.EstadoRegistro_porTiempo == porcentajes.estadoRegistro);
        porcentajes.editExtemporaneo = (this.dataReceived.EstadoRegistro_porExtemporaneo == porcentajes.estadoRegistro);
        this.Definitiva = porcentajes
      }
    })

  }

  putPorcentajes(accion: string) {
    return new Promise((resolve,reject) => {

      let dataPut = undefined;
      let estReg = 0;

      if (this.dataReceived.EstadoRegistro_porExtemporaneo > 0) {
        estReg = this.dataReceived.EstadoRegistro_porExtemporaneo;
      } else if (this.dataReceived.EstadoRegistro_porTiempo > 0) {
        estReg = this.dataReceived.EstadoRegistro_porTiempo;
      }

      let info = undefined;
      if (accion == "Crear") {
        info = {
          nombre: this.dataDocente.Asignatura,
          codigo: this.dataDocente.Codigo,
          periodo: this.dataReceived.Periodo_id,
          nivel: this.dataReceived.Nivel_id,
          espacio_academico: this.dataReceived.Asignatura_id
        }
      }

      dataPut = {
        Estado_registro: estReg,
        Accion: accion,
        Info: info,
        PorcentajesNotas: [
          this.Corte1,
          this.Corte2,
          this.Examen,
          this.Habilit,
          this.Definitiva
        ]
      }

      if (dataPut != undefined) {
        this.sgaMidService.put('notas/PorcentajeAsignatura', dataPut).subscribe(
          (response: any) => {
            if (response !== null && response.Status == '200') {
              if (this.needCrearPorcentajes){
                this.popUpManager.showInfoToast(this.translate.instant('notas.porcentajes_creados'),this.timeinfo)
                this.popUpManager.showAlert(this.translate.instant('notas.captura_notas_parciales'), this.translate.instant('notas.porcentajes_creados_info'))
              } else {
                this.popUpManager.showSuccessAlert(this.translate.instant('notas.porcentajes_actualizados'))
              }
              resolve(dataPut)
              this.updateHeader();
              this.updatePercentsNotes();
              this.dataSource.load(this.calificacionesEstudiantesV2);
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('notas.fallo_porcentajes'));
            }
          },
          error => {
            console.log("putPerc...: ",error)
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            reject(error)
          }
        );
      }

    });
  }

  save_P(){
    this.popUpManager.showConfirmAlert(this.translate.instant('notas.guardar_cambios_porcentajes'),this.translate.instant('notas.captura_porcentajes')).then(accion => {
      if(accion.value){
        this.putPorcentajes("Guardar");
      }
    });
  }

  getObservaciones() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?query=TipoParametroId.Id:55&fields=Id,CodigoAbreviacion,Nombre&limit=0').subscribe(
        response => {
          if (response !== null && response.Status == '200') {
            this.ObservacionesNotas = response["Data"]
            sessionStorage.setItem('ObservacionesNotas', JSON.stringify(this.ObservacionesNotas));
            resolve(this.ObservacionesNotas)
          }
        },
        error => {
          reject("Fail_OBS")
        }
      )
    });
  }

  getNotasEstudiantes(asignaturaId, periodoId) {
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('notas/CapturaNotas/' + asignaturaId + '/' + periodoId).subscribe(
        (response: any) => {
          if (response !== null && response.Status == '404') {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_calificaciones_estudiantes'));
          } else {
            this.calificacionesGET = response.Data.calificaciones_estudiantes;
          }
          resolve(this.calificacionesGET)
        },
        error => {
          console.log("getNotasEst...: ",error)
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error)
        }
      );
    });
  }

  async checkingNotasEstudiantes() {

    this.needCrearNotasEstudiantes = false;

    this.calificacionesGET.forEach((cal: EstudiantesNotas) => {
      if (cal.Corte1.id == "") {
        this.needCrearNotasEstudiantes = true;
      }
      if (cal.Corte2.id == "") {
        this.needCrearNotasEstudiantes = true;
      }
      if (cal.Examen.id == "") {
        this.needCrearNotasEstudiantes = true;
      }
      if (cal.Habilit.id == "") {
        this.needCrearNotasEstudiantes = true;
      }
      if (cal.Definitiva.id == "") {
        this.needCrearNotasEstudiantes = true;
      }
    });

    this.formatNotasEstudiantesforTable();
    this.fillTable();

    if (this.needCrearNotasEstudiantes) {

      try {
        await this.putNotasEstudiantes();
        await this.getNotasEstudiantes(this.dataReceived.Asignatura_id, this.dataReceived.Periodo_id);
        await this.checkingNotasEstudiantes();

      } catch (error) {
        console.log("checkNotasEst...: ",error)
      }
    }

    this.needCrearNotasEstudiantes = false;

    this.dataSource.load(this.calificacionesEstudiantesV2);

  }

  formatNotasEstudiantesforTable() {

    this.calificacionesGET.forEach((est: EstudiantesNotas) => {
      if (est.Id > 0) {
        est.CORTE_1 = { fields: [] };
        est.CORTE_2 = { fields: [] };
        est.EXAMEN = { fields: [] };
        est.HABILIT = { fields: [] };
        est.VARIOS = { fields: [] };
        est.TOTAL = { fields: [] };

        est.CORTE_1.fields = <Fields[]>this.manageEmptyNotaEstudiante(est.Corte1, this.Corte1, false);
        est.CORTE_1.needEdit = true; est.CORTE_1.canEdit = (this.Corte1.editporTiempo || this.Corte1.editExtemporaneo) && !this.Corte1.finalizado;

        est.CORTE_2.fields = <Fields[]>this.manageEmptyNotaEstudiante(est.Corte2, this.Corte2, false);
        est.CORTE_2.needEdit = true; est.CORTE_2.canEdit = (this.Corte2.editporTiempo || this.Corte2.editExtemporaneo) && !this.Corte2.finalizado;

        est.EXAMEN.fields = <Fields[]>this.manageEmptyNotaEstudiante(est.Examen, this.Examen, false);
        est.EXAMEN.needEdit = true; est.EXAMEN.canEdit = (this.Examen.editporTiempo || this.Examen.editExtemporaneo) && !this.Examen.finalizado;

        est.HABILIT.fields = <Fields[]>this.manageEmptyNotaEstudiante(est.Habilit, this.Habilit, false);
        est.HABILIT.needEdit = true; est.HABILIT.canEdit = (this.Habilit.editporTiempo || this.Habilit.editExtemporaneo) && !this.Habilit.finalizado;

        var fallasSuma = 0;
        var fallas = 0;
        var Observacion = 0;

        if ((this.Corte1.editporTiempo || this.Corte1.editExtemporaneo)) {
          fallas = est.Corte1.data.fallas;
          fallasSuma = fallas;
          Observacion = est.Corte1.data.observacion_nota_id;
        }
        if (this.Corte2.editporTiempo || this.Corte2.editExtemporaneo) {
          fallas = est.Corte2.data.fallas;
          fallasSuma = est.Corte1.data.fallas + fallas;
          Observacion = est.Corte2.data.observacion_nota_id;
        }
        if (this.Examen.editporTiempo || this.Examen.editExtemporaneo) {
          fallas = est.Examen.data.fallas;
          fallasSuma = est.Corte1.data.fallas + est.Corte2.data.fallas + fallas;
          Observacion = est.Examen.data.observacion_nota_id;
        }
        if (this.Habilit.editporTiempo || this.Habilit.editExtemporaneo) {
          fallas = est.Habilit.data.fallas;
          fallasSuma = est.Corte1.data.fallas + est.Corte2.data.fallas + est.Examen.data.fallas + fallas;
          Observacion = est.Habilit.data.observacion_nota_id;
        }

        var inDef = (this.Corte1.finalizado && this.Corte2.finalizado && this.Examen.finalizado && this.Habilit.finalizado && !this.Definitiva.finalizado)

        if(inDef){
          fallasSuma = est.Corte1.data.fallas + est.Corte2.data.fallas + est.Examen.data.fallas + est.Habilit.data.fallas;
          Observacion = est.Definitiva.data.observacion_nota_id;
        }
        
        est.VARIOS.fields = [{ name: "Fallas", value: fallasSuma, forceEdit: !this.Definitiva.finalizado }, { name: "ACU", value: est.Acumulado }, { name: "OBS", value: Observacion, forceEdit: !this.Definitiva.finalizado }];
        est.VARIOS.needEdit = true; est.VARIOS.canEdit = false;
        est.VARIOS["fallasPrev"] = <number>fallasSuma-<number>fallas;

        est.TOTAL.fields = est.Definitiva.data.valor_nota
        est.TOTAL.needEdit = true;

      }
    });

  }

  manageEmptyNotaEstudiante(regNota: RegistroNotaEstado, perc: PorcentajesAsignatura, unique: boolean) {
    if (regNota.id == "") {
      if (unique) {
        return { name: perc.fields.field[0].name, perc: perc.fields.field[0].perc, value: (perc.fields.field[0].value ? perc.fields.field[0].value : 0) }
      } else {
        return perc.fields.field.map(n => { return { name: n.name, perc: n.perc, value: (n.value ? n.value : 0) } });
      }
    } else {
      if (unique) {
        return regNota.data.valor_nota[0]
      } else {
        return regNota.data.valor_nota
      }
    }
  }

  prepareNotasEstudiantesforPut(estado_registro: number, accion: string) {

    let max = this.calificacionesEstudiantesV2.length;
    var califEstudiantes = JSON.parse(JSON.stringify(this.calificacionesEstudiantesV2.slice(1, max - 1)));

    califEstudiantes.forEach((est: EstudiantesNotas) => {
      if (est.Id > 0) {
        est.Corte1.data.valor_nota = est.CORTE_1.fields.map((n: Fields) => {
          return { name: n.name, perc: n.perc, value: n.value }
        });
        est.Corte2.data.valor_nota = est.CORTE_2.fields.map((n: Fields) => {
          return { name: n.name, perc: n.perc, value: n.value }
        });
        est.Examen.data.valor_nota = est.EXAMEN.fields.map((n: Fields) => {
          return { name: n.name, perc: n.perc, value: n.value }
        })
        est.Habilit.data.valor_nota = est.HABILIT.fields.map((n: Fields) => {
          return { name: n.name, perc: n.perc, value: n.value }
        })

        let fallas;
        if(this.Corte1.finalizado && this.Corte2.finalizado && this.Examen.finalizado && this.Habilit.finalizado && !this.Definitiva.finalizado){
          fallas = est.VARIOS.fields.filter(v => v.name == "Fallas")[0].value;
        } else {
          fallas = <number>est.VARIOS.fields.filter(v => v.name == "Fallas")[0].value-<number>est.VARIOS["fallasPrev"]
        }

        let Obs1 = est.VARIOS.fields.filter(v => v.name == "OBS")[0].value
        let ObsObj = this.ObservacionesNotas.filter(obs => obs.Id == Obs1)[0]
        if (ObsObj == undefined){
          ObsObj = {CodigoAbreviacion: "0"}
        }

        est["Varios"] = {
          Fallas: fallas,
          Observacion: Obs1,
          ObservacionCod: ObsObj
        }

        delete est.Codigo;
        delete est.Nombre;
        delete est.Apellido;
        delete est.CORTE_1;
        delete est.CORTE_2;
        delete est.EXAMEN;
        delete est.HABILIT
        delete est.TOTAL;
        delete est.VARIOS;
      }
    });

    var dataPut = {
      Espacio_academico: this.dataReceived.Asignatura_id,
      Nombre: this.dataDocente.Asignatura,
      Periodo: this.dataReceived.Periodo_id,
      Estado_registro: estado_registro,
      Accion: accion,
      CalificacionesEstudiantes: califEstudiantes
    }

    return dataPut
  }

  checkAccionNotas() {
    let max = this.calificacionesEstudiantesV2.length;
      var CerrarCorte1 = <boolean>this.calificacionesEstudiantesV2[max - 1].CORTE_1.fields[0].value;
      var CerrarCorte2 = <boolean>this.calificacionesEstudiantesV2[max - 1].CORTE_2.fields[0].value;
      var CerrarExamen = <boolean>this.calificacionesEstudiantesV2[max - 1].EXAMEN.fields[0].value;
      var CerrarHabilit = <boolean>this.calificacionesEstudiantesV2[max - 1].HABILIT.fields[0].value;

      var CerrarDefinitiva = this.finalizar

      var accion = ""
      if (this.needCrearNotasEstudiantes) {
        accion = "Crear";
      } else {
        if ((CerrarCorte1 && !this.Corte1.finalizado) || (CerrarCorte2 && !this.Corte2.finalizado) || (CerrarExamen && !this.Examen.finalizado) || (CerrarHabilit && !this.Habilit.finalizado) || (CerrarDefinitiva && !this.Definitiva.finalizado)) {
          accion = "Cerrar";
        } else {
          accion = "Guardar";
        }
      }
    return accion
  }

  putNotasEstudiantes() {
    return new Promise((resolve,reject) => {

      var estado_registro = 0;

    if (this.dataReceived.EstadoRegistro_porTiempo > 0) {
      estado_registro = this.dataReceived.EstadoRegistro_porTiempo;
    } else if (this.dataReceived.EstadoRegistro_porExtemporaneo > 0) {
      estado_registro = this.dataReceived.EstadoRegistro_porExtemporaneo;
    }

    if(this.Corte1.finalizado && this.Corte2.finalizado && this.Examen.finalizado && this.Habilit.finalizado && !this.Definitiva.finalizado){
      estado_registro = this.EstadosRegistro.Definitiva
    }
      
      var accion = this.checkAccionNotas();

      var dataPut = this.prepareNotasEstudiantesforPut(estado_registro, accion);

      if (dataPut != undefined) {
        this.sgaMidService.put('notas/CapturaNotas', dataPut).subscribe(
          (response: any) => {
            if (response !== null && response.Status == '200') {
              if (this.needCrearNotasEstudiantes){
                this.popUpManager.showInfoToast(this.translate.instant('notas.notas_estudiantes_creados'),this.timeinfo)
              } else {
                this.popUpManager.showSuccessAlert(this.translate.instant('notas.notas_estudiantes_actualizado'))
              }
              resolve(response)
              if(this.dataReceived.EstadoRegistro_porExtemporaneo > 0){
                this.router.navigate([`pages/notas/list-notas`])
              }
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('notas.fallo_definir_notas_estudiantes'));
            }
          },
          error => {
            console.log("putNotasEst...: ",error)
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            reject(error)
          }
        );
      }
    });
  }

  NotasNotValid(){
    
    let noValido: boolean = false;

    let max = this.calificacionesEstudiantesV2.length;
    let califEstudiantes = this.calificacionesEstudiantesV2.slice(1, max - 1);

    califEstudiantes.forEach((est: EstudiantesNotas) => {
      if (est.Id > 0) {
        est.CORTE_1.fields.forEach((n: Fields) => { 
          if (n.value > 5 || n.value < 0) { noValido = true; }
        });
        est.CORTE_2.fields.forEach((n: Fields) => { 
          if (n.value > 5 || n.value < 0) { noValido = true; }
        });
        est.EXAMEN.fields.forEach((n: Fields) => { 
          if (n.value > 5 || n.value < 0) { noValido = true; }
        });
        est.HABILIT.fields.forEach((n: Fields) => {
          if (n.value > 5 || n.value < 0) { noValido = true; }
        });
      }
    });

    return noValido
  }

  save_N() {
    let msg
    let cerrar = false
    if(this.checkAccionNotas() == "Cerrar"){
      msg = 'notas.cerrar_corte_notas';
      cerrar = true;
    } else {
      msg = 'notas.guardar_cambios_notas';
    }
    this.popUpManager.showConfirmAlert(this.translate.instant(msg),this.translate.instant('notas.captura_notas')).then(async accion => {
      if(accion.value){
        let isBad = this.NotasNotValid();
        if (isBad) {
          this.popUpManager.showErrorAlert(this.translate.instant('notas.notas_mal_digitadas'))
        } else {
          try {
            await this.putNotasEstudiantes();
            await this.getNotasEstudiantes(this.dataReceived.Asignatura_id, this.dataReceived.Periodo_id);
            if(cerrar){
              this.cajaPorcentajesVer = false;
              await this.getPorcentajes(this.dataReceived.Asignatura_id, this.dataReceived.Periodo_id);
              await this.checkingPorcentajes();
              this.cajaPorcentajesVer = true;
            }
      
          } catch (error) {
            console.log("save: ",error)
          }
          this.formatNotasEstudiantesforTable();
          this.fillTable();
          this.dataSource.load(this.calificacionesEstudiantesV2); 
        }
      } else if (cerrar) {
        this.updateFooter();
        this.dataSource.load(this.calificacionesEstudiantesV2); 
      }
    });
  }
  
  cancel_N() {

    this.popUpManager.showConfirmAlert(this.translate.instant('notas.cancelar_cambios'),this.translate.instant('notas.captura_notas')).then(accion => {
      if(accion.value){
        this.fillTable();
        this.dataSource.load(this.calificacionesEstudiantesV2);
      }
    });
  }

  regresar() {
    this.router.navigate([`pages/notas/list-notas`])
  }

  terminar() {
    var cerrar = this.checkAccionNotas() == "Cerrar";
     if(this.Corte1.finalizado && this.Corte2.finalizado && this.Examen.finalizado && this.Habilit.finalizado && !this.Definitiva.finalizado){
      this.popUpManager.showConfirmAlert(this.translate.instant('notas.pregunta_finalizar_registros'),this.translate.instant('notas.captura_notas')).then(async accion => {
        if(accion.value){
          this.finalizar = true;
          let isBad = this.NotasNotValid();
        if (isBad) {
          this.popUpManager.showErrorAlert(this.translate.instant('notas.notas_mal_digitadas'))
        } else {
          try {
            await this.putNotasEstudiantes();
            this.router.navigate([`pages/notas/list-notas`])
          } catch (error) {
            console.log("save: ",error)
          }
        }
        } else if (cerrar) {
          this.updateFooter();
          this.dataSource.load(this.calificacionesEstudiantesV2); 
        }
      });
    }
  }

  async exportar(){
    this.popUpManager.showConfirmAlert(this.translate.instant('notas.cancelar_cambios_generarPDF'),this.translate.instant('notas.reporte_captura_porcentajes')).then(accion => {
      if(accion.value){
        this.fillTable();
        this.dataSource.load(this.calificacionesEstudiantesV2);
        this.loading = true;
        this.generatePdf("Exportar").then(()=>{
          this.loading = false;
        }).catch(()=>{
          this.loading = false;
        });
      }
    });
  }

  async imprimir(){
    this.popUpManager.showConfirmAlert(this.translate.instant('notas.cancelar_cambios_generarPDF'),this.translate.instant('notas.reporte_captura_porcentajes')).then(accion => {
      if(accion.value){
        this.fillTable();
        this.dataSource.load(this.calificacionesEstudiantesV2);
        this.loading = true;
        this.generatePdf("Imprimir").then(()=>{
          this.loading = false;
        }).catch(()=>{
          this.loading = false;
        });
      }
    });
  }

  generatePdf(accion: string): Promise<any> {
    return new Promise((resolve, reject) => {
    console.log("generating file")
    let date = new Date()
    let dateinFile = 'Generado por Sistema de Gestión Académica\t\t\t'+date.toLocaleString()+'\n\r'
    let dateinFileName = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear()
    let docDefinition;
    html2canvas(this.HtmlPdf.nativeElement, {scrollX: -window.scrollX}).then(
      canvas => {
        docDefinition = {
          pageSize: 'LETTER',
          pageOrientation: 'landscape',
          pageMargins: [ 40, 40, 40, 40 ],
          content: [
            {
              text: dateinFile, fontSize: 8, alignment: 'center', color: 'gray',
            },
            {
              image: canvas.toDataURL('image/png'),
              width: 700,
              scale: 5,
              alignment: 'center',
            }
          ],
        };
        let namePdf = this.dataDocente.Asignatura+'_'+this.dataDocente.Docente+'_'+dateinFileName+'.pdf';
        const pdfDoc = pdfMake.createPdf(docDefinition);

        console.log("renderizado ahora: "+accion)
        
        if(accion == "Exportar") {
          pdfDoc.download(namePdf);
        } else if (accion == "Imprimir"){
          pdfDoc.print();
        }
        resolve(true)
      }).catch(
        error => {
          reject(error)
        }
      );
    });
  }

  //// funciones para gestion de porcentajes ////
  editCorte1(form: FormGroup) {
    form.valueChanges.subscribe((data) => {

      if (form.valid) {
        this.Corte1.fields.field.forEach((nota) => {
          nota.perc = (data.fields.find(n => String(Object.keys(n)) === nota.name))[nota.name];
        });
        this.updateSumPercentage(0, data)
      } else {
        this.updateSumPercentage(0, 0);
      }
    })
  }

  editCorte2(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.Corte2.fields.field.forEach((nota) => {
          nota.perc = (data.fields.find(n => String(Object.keys(n)) === nota.name))[nota.name];
        });
        this.updateSumPercentage(1, data)
      } else {
        this.updateSumPercentage(1, 0);
      }
    })
  }

  editExamen(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.Examen.fields.field.forEach((nota) => {
          nota.perc = (data.fields.find(n => String(Object.keys(n)) === nota.name))[nota.name];
        });
        this.updateSumPercentage(2, data)
      } else {
        this.updateSumPercentage(2, 0);
      }
    })
  }

  editHabilit(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.Habilit.fields.field.forEach((nota) => {
          nota.perc = (data.fields.find(n => String(Object.keys(n)) === nota.name))[nota.name];
        });
      }
    })
  }

  updateSumPercentage(index, value) {
    const { fields } = value;
    if (fields && JSON.stringify(fields) !== '[]') {
      this.parcialPercentage[index] = fields.map((f) => {
        let data = 0;
        for (let key in f) {
          data = f[key];
        }
        return data
      }).reduce((a: number, b: number) => a + b, 0);
      this.totalPercentage = this.parcialPercentage.reduce((a, b) => a + b)
    } else {
      this.parcialPercentage[index] = value;
      this.totalPercentage = this.parcialPercentage.reduce((a, b) => a + b);
    }
    if (this.totalPercentage == 100) {
      this.GuardarEstructuraNota = true;
    } else {
      this.GuardarEstructuraNota = false;
    }
  }

  ngOnDestroy(): void {
    this.dataReceived.Asignatura_id = "";
    this.dataReceived.Periodo_id = 0;
    this.dataReceived.Nivel_id = 0;
    this.dataReceived.EstadoRegistro_porTiempo = 0;
    this.passDataService.putData(this.dataReceived)
  }
  
}

