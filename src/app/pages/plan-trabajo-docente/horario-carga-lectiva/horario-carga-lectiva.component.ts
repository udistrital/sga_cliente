import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CdkDragMove, CdkDragRelease, CdkDragStart } from '@angular/cdk/drag-drop';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { MODALS, ROLES } from '../../../@core/data/models/diccionario/diccionario';
import { ACTIONS } from '../../../@core/data/models/diccionario/diccionario';
import { OikosService } from '../../../@core/data/oikos.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { AnyService } from '../../../@core/data/any.service';
import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface elementDragDrop {
  id: number;
  nombre: string;
  idCarga: string;
  idEspacioAcademico: string;
  idActividad: string;
  horas: number;
  horaFormato: string;
  sede: any,
  edificio: any,
  salon: any,
  tipo: number;
  estado: number;
  bloqueado: boolean;
  dragPosition: { x: number, y: number };
  prevPosition: { x: number, y: number };
  finalPosition: { x: number, y: number };
  modular?: boolean;
  docente_id?: string;
  docenteName?: string;
}

@Component({
  selector: 'horario-carga-lectiva',
  templateUrl: './horario-carga-lectiva.component.html',
  styleUrls: ['./horario-carga-lectiva.component.scss']
})
export class HorarioCargaLectivaComponent implements OnInit, OnChanges {

  /** Definitions for horario */
  readonly horarioSize = { days: 7, hourIni: 6, hourEnd: 23, difHoras: 23 - 6, stepHour: 0.25 };
  readonly containerGridLengths = {
    x: this.horarioSize.days,
    y: (this.horarioSize.hourEnd - this.horarioSize.hourIni),
  };
  readonly snapGridSize = { x: 150, y: 75, ymin: 75 * 0.25 }; //px no olvide editarlas en scss si las cambia
  readonly containerGridsize = {
    x: this.containerGridLengths.x * this.snapGridSize.x,
    y: this.containerGridLengths.y * this.snapGridSize.y
  };
  readonly tipo = { carga_lectiva: 1, actividades: 2 };
  readonly estado = { flotando: 1, ubicado: 2, ocupado: 3 }

  matrixBusy = Array(this.containerGridLengths.x)
    .fill(0).map(() => Array(this.containerGridLengths.y / this.horarioSize.stepHour)
      .fill(0).map(() => false)
    )

  genHoursforTable() {
    return Array(this.horarioSize.hourEnd - this.horarioSize.hourIni).fill(0).map((_, index) => index + this.horarioSize.hourIni);
  }

  @ViewChild('contenedorCargaLectiva', { static: false }) contenedorCargaLectiva: ElementRef;
  listaCargaLectiva: any[] = [];
  listaOcupacion: any[] = [];
  /*************************** */

  /** Entradas y Salidas */
  @Input() WorkingMode: Symbol = undefined;
  @Input() Rol: string = undefined;
  @Input() Data: any = undefined;
  @Output() OutLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() DataChanged: EventEmitter<any> = new EventEmitter();

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private anyService: AnyService,
    private builder: FormBuilder,
    private oikosService: OikosService,
  ) { }
  edit: boolean = false;
  isDocente: boolean = false;
  isCoordinador: boolean = false;
  vinculaciones: any[] = [];
  asignaturas: any[] = [];
  actividades: any[] = [];
  vinculacionSelected: any = undefined;
  asignaturaSelected: any = undefined;
  actividadSelected: any = undefined;
  seleccion: number = 0;
  identificador: number = 0;
  observacion: string = '';
  searchTerm$ = new Subject<any>();
  opcionesEdificios: any[] = [];
  opcionesSedes: any[] = [];
  opcionesSalones: any[] = [];
  opcionesSalonesFiltrados: any[] = [];
  opcionesUsos: any[] = [];
  sede: any;
  edificio: any;
  salon: any;
  grupo: any;
  ubicacionForm: FormGroup;
  ubicacionActive: boolean = false;
  editandoAsignacion: elementDragDrop = undefined;
  ocupados: any[] = [];
  aprobacion: any = undefined;
  EspaciosProyecto: any = undefined;

  ngOnInit() {

    this.getSedes().then(() => { this.OutLoading.emit(false); });

    this.ubicacionForm = this.builder.group({
      sede: [null, Validators.required],
      edificio: [null, Validators.required],
      salon: [null, Validators.required],
      horas: [null, Validators.required],
    });

    this.ubicacionForm.get('edificio').disable();
    this.ubicacionForm.get('salon').disable();
    this.ubicacionForm.get('edificio').setValue(undefined);
    this.ubicacionForm.get('salon').setValue(undefined);
    this.opcionesEdificios = [];

    this.searchTerm$.pipe(distinctUntilChanged(),).subscribe((response: any) => {
      this.opcionesSalonesFiltrados = this.opcionesSalones.filter((value, index, array) => value.Nombre.toLowerCase().includes(response.text.toLowerCase()));
    });
  }

  ngOnChanges() {
    if (this.Data) {
      this.edit = this.WorkingMode == ACTIONS.EDIT;
      this.isDocente = this.Rol == ROLES.DOCENTE;
      this.isCoordinador = this.Rol == ROLES.ADMIN_DOCENCIA || this.Rol == ROLES.COORDINADOR;
      this.vinculaciones = this.Data.tipo_vinculacion;
      this.seleccion = this.Data.seleccion;
      this.vinculacionSelected = this.vinculaciones[this.seleccion];
      this.asignaturas = this.Data.espacios_academicos[this.seleccion];
      this.observacion = this.Data.resumenes[this.seleccion].observacion ? this.Data.resumenes[this.seleccion].observacion : '';
      this.calcularHoras();
      this.calcularHoras(this.tipo.actividades);
      this.calcularHoras(this.tipo.carga_lectiva);
      this.getActividades().then(() =>{
        this.loadCarga();
      })
    } else {
      this.listaCargaLectiva = [];
    }
  }

  getDragPosition(eventDrag: CdkDragMove) {
    const contenedor: DOMRect = this.contenedorCargaLectiva.nativeElement.getBoundingClientRect();
    let posicionRelativa = {
      x: Math.floor(eventDrag.pointerPosition.x - contenedor.left - (this.snapGridSize.x / 2)),
      y: Math.floor(eventDrag.pointerPosition.y - contenedor.top - (this.snapGridSize.ymin))
    };
    posicionRelativa.x = posicionRelativa.x <= 0 ? 0 : posicionRelativa.x;
    posicionRelativa.y = posicionRelativa.y <= 0 ? 0 : posicionRelativa.y;
    posicionRelativa.x = Math.round(posicionRelativa.x / this.snapGridSize.x) * this.snapGridSize.x;
    posicionRelativa.y = Math.round(posicionRelativa.y / this.snapGridSize.ymin) * this.snapGridSize.ymin;
    return posicionRelativa;
  }

  chechkUsedRegion(x: number, y: number, h: number) {
    const ymax = y + h / this.horarioSize.stepHour;
    let busy = false;
    for (let index = y; index < ymax; index++) {
      if (this.matrixBusy[x][index]) {
        busy = true;
        break;
      }
    }
    return busy;
  }

  changeStateRegion(x: number, y: number, h: number, state: boolean) {
    const ymax = y + h / this.horarioSize.stepHour;
    for (let index = y; index < ymax; index++) {
      this.matrixBusy[x][index] = state;
    }
  }

  isInsideGrid(element: elementDragDrop) {
    const left = (0 <= element.finalPosition.x);
    const right = (element.finalPosition.x < this.containerGridsize.x);
    const top = (0 <= element.finalPosition.y);
    const bottom = (element.finalPosition.y < this.containerGridsize.y);
    return left && right && top && bottom;
  }

  getPositionforMatrix(element: elementDragDrop) {
    const x = Math.floor(element.finalPosition.x / this.snapGridSize.x);
    const y = Math.floor(element.finalPosition.y / this.snapGridSize.ymin);
    return { x, y };
  }

  onDragMoved(event: CdkDragMove, elementMoved: elementDragDrop) {
    if (this.isInsideGrid(elementMoved)) {
      const coord = this.getPositionforMatrix(elementMoved);
      this.changeStateRegion(coord.x, coord.y, elementMoved.horas, false);
    }
    const posicionRelativa = this.getDragPosition(event);
    const x = posicionRelativa.x / this.snapGridSize.x;
    const y = posicionRelativa.y / this.snapGridSize.ymin;
    const ocupado = this.chechkUsedRegion(x, y, elementMoved.horas);
    if (ocupado) {
      elementMoved.dragPosition = elementMoved.prevPosition;
      event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition);
      event.source._dragRef.disabled = true;
      elementMoved.estado = this.estado.ocupado;
    } else {
      elementMoved.dragPosition = posicionRelativa;
      elementMoved.estado = this.estado.ubicado;
    }
    if ((posicionRelativa.x != elementMoved.prevPosition.x) || (posicionRelativa.y != elementMoved.prevPosition.y)) {
      elementMoved.prevPosition = elementMoved.dragPosition;
      elementMoved.horaFormato = this.calculateTimeSpan(elementMoved.dragPosition, elementMoved.horas);
    }
  }

  onDragStarted(elementMoved: elementDragDrop) {
    this.limpiarOcupado();
    if (this.isCoordinador) {
      this.OutLoading.emit(true);
      this.sgaMidService.get(`plan_trabajo_docente/disponibilidad/${elementMoved.salon.Id}/${this.Data.vigencia}/${this.Data.plan_docente[this.seleccion]}`).subscribe(res => {
        this.ocupados = res.Response.Body ? res.Response.Body : [];
        this.OutLoading.emit(false);
        this.ocupados.forEach(newElement => {
          const newElementFormat: elementDragDrop = {
            id: null,
            nombre: this.translate.instant('ptd.espacio_ocupado'),
            idCarga: newElement.id,
            idEspacioAcademico: null,
            idActividad: null,
            horas: newElement.horas,
            horaFormato: null,
            tipo: null,
            sede: null,
            edificio: null,
            salon: null,
            estado: null,
            bloqueado: true,
            dragPosition: newElement.finalPosition,
            prevPosition: newElement.finalPosition,
            finalPosition: newElement.finalPosition
          };
          this.listaOcupacion.push(newElementFormat);
          const coord = this.getPositionforMatrix(newElement);
          this.changeStateRegion(coord.x, coord.y, newElement.horas, true);
        });
        this.OutLoading.emit(false);
      });
    }
  }

  calculateTimeSpan(dragPosition, h): string {
    const iniTimeRaw = dragPosition.y / this.snapGridSize.y + this.horarioSize.hourIni;
    const finTimeRaw = iniTimeRaw + h;
    const horaI = Math.floor(iniTimeRaw);
    const minI = (iniTimeRaw - horaI) * 60;
    const horaF = Math.floor(finTimeRaw);
    const minF = (finTimeRaw - horaF) * 60;
    return String(horaI).padStart(2, '0') + ':' + String(minI).padEnd(2, '0') + ' - ' + String(horaF).padStart(2, '0') + ':' + String(minF).padEnd(2, '0');
  }

  onDragReleased(event: CdkDragRelease, elementMoved: elementDragDrop) {
    this.limpiarOcupado();
    this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.asignar'), this.translate.instant('ptd.ask_mover') + "<br>" + elementMoved.horaFormato + "?", MODALS.QUESTION, true).then(
      (action) => {
        if (action.value) {
          elementMoved.estado = this.estado.ubicado;
          elementMoved.finalPosition = elementMoved.dragPosition;
          if (this.isInsideGrid(elementMoved)) {
            const coord = this.getPositionforMatrix(elementMoved);
            this.changeStateRegion(coord.x, coord.y, elementMoved.horas, true);
          }
        } else {
          if (this.isInsideGrid(elementMoved)) {
            const coord = this.getPositionforMatrix(elementMoved);
            this.changeStateRegion(coord.x, coord.y, elementMoved.horas, false);
          }
          elementMoved.dragPosition = { x: this.snapGridSize.x * -2.25, y: 0 };
          elementMoved.prevPosition = elementMoved.dragPosition;
          elementMoved.finalPosition = elementMoved.dragPosition;
          event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition);
          event.source._dragRef.disabled = true;
          elementMoved.estado = this.estado.flotando;
          event.source.getRootElement().scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    );
  }

  async formularioEspacioFisico() {
    if (this.asignaturaSelected) {
      this.sgaMidService.get('plan_trabajo_docente/espacios_fisicos_dependencia/'+this.asignaturaSelected.proyecto_id).subscribe(res => {
        if (res.Data.PorAsignar) {
          this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.espacio_fisico'), this.translate.instant('ptd.proyecto_sin_espacios'), MODALS.WARNING, false)
        }
        this.EspaciosProyecto = res.Data;
        this.opcionesSedes = this.EspaciosProyecto.Sedes
      }, err => {
        this.popUpManager.showPopUpGeneric(this.translate.instant('ERROR.titulo_generico'), this.translate.instant('ERROR.persiste_error_comunique_OAS'), MODALS.ERROR, false)
        console.warn(err)
      });
    }
    this.ubicacionActive = true;
    const c: Element = document.getElementById("ubicacion");
    await new Promise(f => setTimeout(f, 10));
    c.scrollIntoView({ behavior: "smooth" });
  }

  cancelarUbicacion() {
    this.ubicacionForm.reset();
    this.ubicacionActive = false;
    this.editandoAsignacion = undefined;
  }

  addCarga() {
    const h = Number(this.ubicacionForm.get('horas').value);
    const salon = this.opcionesSalonesFiltrados.find(opcion => opcion.Nombre == this.ubicacionForm.get('salon').value);
    const x = this.snapGridSize.x * -2.25;
    const y = 0;

    if (!this.editandoAsignacion) {
      this.identificador++;
      const newElement: elementDragDrop = {
        id: this.identificador,
        nombre: this.isDocente ? this.actividadSelected.nombre : this.asignaturaSelected.nombre,
        idCarga: null,
        idEspacioAcademico: this.isDocente ? null : this.asignaturaSelected.id,
        idActividad: this.isDocente ? this.actividadSelected._id : null,
        sede: this.ubicacionForm.get('sede').value,
        edificio: this.ubicacionForm.get('edificio').value ? this.ubicacionForm.get('edificio').value : "-",
        salon: salon ? salon : "-",
        horas: h,
        horaFormato: "",
        tipo: this.isDocente ? this.tipo.actividades : this.tipo.carga_lectiva,
        estado: this.estado.flotando,
        bloqueado: false,
        dragPosition: { x: x, y: y },
        prevPosition: { x: x, y: y },
        finalPosition: { x: x, y: y }
      };
      this.listaCargaLectiva.push(newElement);
    } else {
      if (this.isInsideGrid(this.editandoAsignacion)) {
        const coord = this.getPositionforMatrix(this.editandoAsignacion);
        this.changeStateRegion(coord.x, coord.y, this.editandoAsignacion.horas, false);
      }
      this.editandoAsignacion.horas = h;
      this.editandoAsignacion.sede = this.ubicacionForm.get('sede').value;
      this.editandoAsignacion.edificio = this.ubicacionForm.get('edificio').value ? this.ubicacionForm.get('edificio').value : "-";
      this.editandoAsignacion.salon = salon ? salon : "-";
      this.editandoAsignacion.dragPosition = { x: x, y: y };
      this.editandoAsignacion.prevPosition = this.editandoAsignacion.dragPosition;
      this.editandoAsignacion.finalPosition = this.editandoAsignacion.dragPosition;
      this.editandoAsignacion.estado = this.estado.flotando;
    }

    this.cancelarUbicacion();
  }

  loadCarga() {
    this.listaCargaLectiva = [];

    this.Data.carga[this.seleccion].forEach(carga => {
      this.identificador++;
      var nombre;
      if (carga.espacio_academico_id != null) {
        nombre = this.Data.espacios_academicos[this.seleccion].find(espacio => espacio.id == carga.espacio_academico_id).nombre;
      } else {
        nombre = this.actividades.find(actividad => actividad._id == carga.actividad_id).nombre
      }

      const newElement: elementDragDrop = {
        id: this.identificador,
        nombre: nombre,
        idCarga: carga.id,
        idEspacioAcademico: carga.espacio_academico_id,
        idActividad: carga.actividad_id,
        horas: carga.horario.horas,
        horaFormato: carga.horario.horaFormato,
        tipo: carga.horario.tipo,
        sede: carga.sede,
        edificio: carga.edificio,
        salon: carga.salon,
        estado: carga.horario.estado,
        bloqueado: !this.edit || (this.isDocente && carga.horario.tipo == this.tipo.carga_lectiva) || (this.isCoordinador && carga.horario.tipo == this.tipo.actividades),
        dragPosition: carga.horario.dragPosition,
        prevPosition: carga.horario.prevPosition,
        finalPosition: carga.horario.finalPosition,
      };

      if (this.Data.docentesModular) {
        newElement.modular = true;
        newElement.docente_id = carga.docente_id;
        newElement.docenteName = this.Data.docentesModular[carga.docente_id].NombreCorto;
      }

      this.listaCargaLectiva.push(newElement);
      const coord = this.getPositionforMatrix(newElement);
      this.changeStateRegion(coord.x, coord.y, newElement.horas, true);
    });
  }

  async editElement(elementClicked: elementDragDrop) {
    if (elementClicked.bloqueado) {
      return;
    }
    this.ubicacionActive = true;

    if (this.isInsideGrid(elementClicked)) {
      const coord = this.getPositionforMatrix(elementClicked);
      this.changeStateRegion(coord.x, coord.y, elementClicked.horas, false);
    }

    this.sede = this.opcionesSedes.find(opcion => opcion.Id == elementClicked.sede.Id);
    this.ubicacionForm.get('sede').setValue(this.sede);
    this.cambioSede().then(() => {
      this.edificio = this.opcionesEdificios.find(opcion => opcion.Id == elementClicked.edificio.Id);
      this.ubicacionForm.get('edificio').setValue(this.edificio);
      this.cambioEdificio();
      this.ubicacionForm.get('salon').setValue(elementClicked.salon.Nombre);
    });
    this.ubicacionForm.get('horas').setValue(elementClicked.horas);
    this.editandoAsignacion = elementClicked;
    const c: Element = document.getElementById("ubicacion");
    await new Promise(f => setTimeout(f, 10));
    c.scrollIntoView({ behavior: "smooth" });
  }

  deleteElement(htmlElement: HTMLElement, elementClicked: elementDragDrop) {
    if (elementClicked.bloqueado) {
      return;
    }
    this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.borrar'), this.translate.instant('ptd.ask_borrar'), MODALS.QUESTION, true).then(
      action => {
        if (action.value) {
          this.OutLoading.emit(true);
          if (this.isInsideGrid(elementClicked)) {
            const coord = this.getPositionforMatrix(elementClicked);
            this.changeStateRegion(coord.x, coord.y, elementClicked.horas, false);
          }
          const idx = this.listaCargaLectiva.findIndex(element => element.id == elementClicked.id);
          this.listaCargaLectiva.splice(idx, 1);
          if (elementClicked.idCarga) {
            this.anyService.delete(environment.PLAN_TRABAJO_DOCENTE_SERVICE, 'carga_plan', { Id: elementClicked.idCarga }).subscribe(
              (response: any) => {
                this.OutLoading.emit(false);
                this.DataChanged.emit(this.listaCargaLectiva);
              });
          } else {
            this.OutLoading.emit(false);
          }
          const c: Element = this.contenedorCargaLectiva.nativeElement;
          c.removeChild(htmlElement.parentElement.parentElement);
        }
      });
  }

  calcularHoras(tipo?) {
    let total = 0;
    this.listaCargaLectiva.forEach((carga: elementDragDrop) => {
      if (this.isInsideGrid(carga) && !carga.modular) {
        if (tipo) {
          if (carga.tipo == tipo) {
            total += carga.horas;
          }
        } else {
          total += carga.horas;
        }
      }
    });
    return total;
  }

  guardar_ptd() {
    this.OutLoading.emit(true);
    let carga_plan = [];

    for (let j = 0; j < this.listaCargaLectiva.length; j++) {
      let horaInicio = parseInt(this.listaCargaLectiva[j].horaFormato.split(":")[0]);
      if (!this.listaCargaLectiva[j].bloqueado) {
        carga_plan.push({
          espacio_academico_id: this.listaCargaLectiva[j].idEspacioAcademico,
          actividad_id: this.listaCargaLectiva[j].idActividad,
          id: this.listaCargaLectiva[j].idCarga,
          plan_docente_id: this.Data.plan_docente[this.seleccion],
          sede_id: this.listaCargaLectiva[j].sede.Id,
          edificio_id: this.listaCargaLectiva[j].edificio.Id ? this.listaCargaLectiva[j].edificio.Id : "-",
          salon_id: this.listaCargaLectiva[j].salon.Id ? this.listaCargaLectiva[j].salon.Id : "-",
          horario: JSON.stringify({
            horas: this.listaCargaLectiva[j].horas,
            horaFormato: this.listaCargaLectiva[j].horaFormato,
            tipo: this.listaCargaLectiva[j].tipo,
            estado: this.listaCargaLectiva[j].estado,
            dragPosition: this.listaCargaLectiva[j].dragPosition,
            prevPosition: this.listaCargaLectiva[j].prevPosition,
            finalPosition: this.listaCargaLectiva[j].finalPosition
          }),
          hora_inicio: horaInicio,
          duracion: this.listaCargaLectiva[j].horas,
          activo: true
        });
      }
    }

    let estado_plan_is = "";
    if (this.isCoordinador) {
      if (this.aprobacion) {
        estado_plan_is = this.aprobacion._id;
      } else {
        estado_plan_is = "Sin definir"
      }
    } else {
      estado_plan_is = this.Data.estado_plan[this.seleccion];
    }

    let plan_docente = {
      id: this.Data.plan_docente[this.seleccion],
      resumen: JSON.stringify({ horas_lectivas: this.calcularHoras(this.tipo.carga_lectiva), horas_actividades: this.calcularHoras(this.tipo.actividades), observacion: this.observacion }),
      estado_plan: estado_plan_is
    }
    
    this.sgaMidService.put('plan_trabajo_docente/plan', { carga_plan: carga_plan, plan_docente: plan_docente, descartar: this.Data.descartar ? this.Data.descartar : [] }).subscribe(
      response => {
        this.OutLoading.emit(false);
        if (response.Response.Code == 200) {
          this.popUpManager.showSuccessAlert(this.translate.instant('ptd.guardado_ptd_exito') + " " + this.vinculacionSelected.nombre);
          this.DataChanged.emit(this.listaCargaLectiva);
        }
      });
  }

  selectVinculacion(event) {
    this.asignaturaSelected = undefined;
    if (event.value == undefined) {
      this.asignaturas = [];
    } else {
      for (let index = 0; index < this.vinculaciones.length; index++) {
        const element = this.vinculaciones[index];
        if (element == event.value) {
          this.seleccion = index;
          this.asignaturas = this.Data.espacios_academicos[this.seleccion];
        }
      }
    }
    this.blockcargas();
  }

  blockcargas() {
    this.listaCargaLectiva.forEach((element: elementDragDrop) => {
      if (this.asignaturas.find(asignatura => asignatura.id == element.id)) {
        element.bloqueado = false;
      } else {
        element.bloqueado = true;
      }
    });
  }

  getSedes() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('espacio_fisico?query=TipoEspacioFisicoId.Id:38,Activo:true&limit=0&fields=Id,Nombre,CodigoAbreviacion&sortby=Nombre&order=asc').subscribe(res => {
        this.opcionesSedes = res;
        resolve(res);
      }, err => {
        reject(err);
      }
      );
    });
  }

  cambioSede() {
    this.opcionesEdificios = [];
    this.opcionesSalones = [];
    this.opcionesSalonesFiltrados = [];
    this.ubicacionForm.get('edificio').disable();
    this.ubicacionForm.get('salon').disable();
    this.ubicacionForm.get('edificio').setValue(undefined);
    this.ubicacionForm.get('salon').setValue(undefined);
    return new Promise((resolve, reject) => {
      if (this.asignaturaSelected) {
        this.opcionesEdificios = this.EspaciosProyecto.Edificios[this.ubicacionForm.get("sede").value.Id];
        this.opcionesEdificios.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        this.ubicacionForm.get('edificio').enable();
        resolve(this.opcionesEdificios)
      } else {
        this.oikosService.get(`espacio_fisico_padre?query=PadreId.Id:${this.ubicacionForm.get("sede").value.Id}&fields=HijoId&limit=0`).subscribe(res => {
          res.forEach(element => {
            this.opcionesEdificios.push(element.HijoId);
            this.ubicacionForm.get('edificio').enable();
          });
          this.opcionesEdificios.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
          resolve(res);
        });
      }
    });
  }

  cambioEdificio() {
    this.opcionesSalones = [];
    this.opcionesSalonesFiltrados = [];
    this.ubicacionForm.get('salon').disable();
    this.ubicacionForm.get('salon').setValue(undefined);
    if (this.asignaturaSelected) {
      this.opcionesSalones = this.EspaciosProyecto.Salones[this.ubicacionForm.get("edificio").value.Id];
      this.opcionesSalones.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      this.opcionesSalonesFiltrados = this.opcionesSalones;
      this.ubicacionForm.get('salon').enable();
    } else {
      this.oikosService.get(`espacio_fisico_padre?query=PadreId.Id:${this.ubicacionForm.get("edificio").value.Id}&fields=HijoId&limit=0`).subscribe(res => {
        res.forEach(element => {
          this.opcionesSalones.push(element.HijoId);
          this.ubicacionForm.get('salon').enable();
        });
        this.opcionesSalones.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        this.opcionesSalonesFiltrados = this.opcionesSalones;
      });
    }
  }

  cambioSalon(element) {
    this.salon = element.option.value;
    this.ubicacionForm.get('salon').setValue(this.salon.Nombre);
  }

  getActividades() {
    return new Promise((resolve, reject) => {
      this.anyService.get(environment.PLAN_TRABAJO_DOCENTE_SERVICE, 'actividad?query=activo:true&fields=nombre').subscribe((res: any) => {
        this.actividades = res.Data;
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }

  limpiarOcupado() {
    if (this.listaOcupacion.length > 0) {
      this.listaOcupacion.forEach(ocupado => {
        const coord = this.getPositionforMatrix(ocupado);
        this.changeStateRegion(coord.x, coord.y, ocupado.horas, false);
      });
      this.listaOcupacion = [];
    }
  }
}
