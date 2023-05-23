import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragRelease } from '@angular/cdk/drag-drop';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { MODALS, ROLES } from '../../../@core/data/models/diccionario/diccionario';
import { ACTIONS } from '../../../@core/data/models/diccionario/diccionario';

interface elementDragDrop {
  id: number;
  nombre: string;
  horas: number;
  horaFormato: string;
  tipo: number;
  estado: number;
  bloqueado: boolean;
  dragPosition: {x: number, y: number};
  prevPosition: {x: number, y: number};
  finalPosition: {x: number, y: number};
}

@Component({
  selector: 'horario-carga-lectiva',
  templateUrl: './horario-carga-lectiva.component.html',
  styleUrls: ['./horario-carga-lectiva.component.scss']
})
export class HorarioCargaLectivaComponent implements OnInit, OnChanges {

  /** Definitions for horario */
  readonly horarioSize = {days: 7, hourIni: 6, hourEnd: 23, difHoras: 23-6, stepHour: 0.25};
  readonly containerGridLengths = {
    x: this.horarioSize.days, 
    y: (this.horarioSize.hourEnd-this.horarioSize.hourIni),
  };
  readonly snapGridSize = {x: 150, y: 75, ymin: 75 * 0.25}; //px no olvide editarlas en scss si las cambia
  readonly containerGridsize = {
    x: this.containerGridLengths.x*this.snapGridSize.x,
    y: this.containerGridLengths.y*this.snapGridSize.y
  };
  readonly tipo = {carga_lectiva: 1, actividades: 2};
  readonly estado = {flotando: 1, ubicado: 2, ocupado: 3}

  matrixBusy = Array(this.containerGridLengths.x)
      .fill(0).map(() => Array(this.containerGridLengths.y/this.horarioSize.stepHour)
        .fill(0).map(() => false)
      )

  genHoursforTable() {
    return Array(this.horarioSize.hourEnd-this.horarioSize.hourIni).fill(0).map((_, index) => index + this.horarioSize.hourIni);
  }

  @ViewChild('contenedorCargaLectiva', { static: false }) contenedorCargaLectiva: ElementRef;
  listaCargaLectiva: any[] = [];
  /*************************** */

  /** Entradas y Salidas */
  @Input() WorkingMode: Symbol = undefined;
  @Input() Rol: string = undefined;
  @Output() OutCancelar: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }
  
  edit: boolean = false;
  isDocente: boolean = false;
  isCoordinador: boolean = false;
  
  ngOnInit() {
  }

  ngOnChanges() {
    this.edit = this.WorkingMode == ACTIONS.EDIT;
    this.isDocente = this.Rol == ROLES.DOCENTE;
    this.isCoordinador = this.Rol == ROLES.ADMIN_DOCENCIA || this.Rol == ROLES.COORDINADOR;
  }
  
  identificador: number = 0;

  getDragPosition(eventDrag: CdkDragMove) {
    const contenedor: DOMRect = this.contenedorCargaLectiva.nativeElement.getBoundingClientRect();
    let posicionRelativa = {
      x: Math.floor(eventDrag.pointerPosition.x - contenedor.left-(this.snapGridSize.x/2)), 
      y: Math.floor(eventDrag.pointerPosition.y - contenedor.top-(this.snapGridSize.ymin))
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
        event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition)
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

  calculateTimeSpan(dragPosition, h): string {
    const iniTimeRaw = dragPosition.y / this.snapGridSize.y + this.horarioSize.hourIni;
    const finTimeRaw = iniTimeRaw + h;
    const horaI = Math.floor(iniTimeRaw);
    const minI = (iniTimeRaw - horaI) * 60;
    const horaF = Math.floor(finTimeRaw);
    const minF = (finTimeRaw - horaF) * 60;
    return String(horaI).padStart(2, '0')+':'+String(minI).padEnd(2, '0') + ' - ' + String(horaF).padStart(2, '0')+':'+String(minF).padEnd(2, '0');
  }

  onDragReleased(event: CdkDragRelease, elementMoved: elementDragDrop) {
    const html = {
      html: [
        `<label class="swal2">${this.translate.instant('ptd.sede')}</label><select id="sede" class="swal2-input"><option value="1" >--Seleccionar--</option></select>`+
        `<label class="swal2">${this.translate.instant('ptd.edificio')}</label><select id="edificio" class="swal2-input"><option value="1" >--Seleccionar--</option></select>`+
        `<label class="swal2">${this.translate.instant('ptd.salon')}</label><select id="salon" class="swal2-input"><option value="1" >--Seleccionar--</option></select>`
      ],
      ids: ["sede", "edificio", "salon"],
    }
    this.popUpManager.showPopUpForm(this.translate.instant('ptd.espacio_fisico'), html, true).then(
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
          elementMoved.dragPosition = {x: this.snapGridSize.x*-2.25, y: 0};
          elementMoved.prevPosition = elementMoved.dragPosition;
          elementMoved.finalPosition = elementMoved.dragPosition;
          event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition);
          event.source._dragRef.disabled = true;
          elementMoved.estado = this.estado.flotando;
          event.source.getRootElement().scrollIntoView({block: "center", behavior: "smooth"});
        }
      }
    );
  }

  addCarga() {
    this.identificador++;
    
    const html = {
      html: [
        `<input id="horas" type="number" step="0.25" min="0.5" value="2" max="${this.horarioSize.hourEnd-this.horarioSize.hourIni}" class="swal2-input" style="width: 50%;"/>`
      ],
      ids: ["horas"]
    }
    this.popUpManager.showPopUpForm(this.translate.instant('ptd.horas'), html, false).then(
      (action) => {
        if (action.value) {
          const h = Number(action.value.horas);
          if (h > 0) {
            const x = this.snapGridSize.x*-2.25;
            const y = 0;
            const newElement: elementDragDrop = {
              id: this.identificador,
              nombre: "Cálculo",
              horas: h,
              horaFormato: "",
              tipo: this.isDocente ? this.tipo.actividades : this.tipo.carga_lectiva,
              estado: this.estado.flotando,
              bloqueado: false, 
              dragPosition: {x: x, y: y},
              prevPosition: {x: x, y: y},
              finalPosition: {x: x, y: y}
            };
            this.listaCargaLectiva.push(newElement);
            const c: Element =  this.contenedorCargaLectiva.nativeElement;
            c.scrollIntoView({block: "start", behavior: "smooth"});
          }
        }
    }
    )
  }

  editElement(htmlElement: HTMLElement, elementClicked: elementDragDrop) {

    const html = {
      html: [
        `<input id="horas" type="number" step="0.25" min="0.5" value="${elementClicked.horas}" max="${this.horarioSize.hourEnd-this.horarioSize.hourIni}" class="swal2-input" style="width: 50%;"/>`
      ],
      ids: ["horas"]
    }
    this.popUpManager.showPopUpForm(this.translate.instant('ptd.horas'), html, false).then(
      (action) => {
        if (action.value) {
          const h = Number(action.value.horas);
          if (h > 0) {
            if (this.isInsideGrid(elementClicked)) {
              const coord = this.getPositionforMatrix(elementClicked);
              this.changeStateRegion(coord.x, coord.y, elementClicked.horas, false);
            }
            elementClicked.horas = h;
            elementClicked.dragPosition = {x: this.snapGridSize.x*-2.25, y: 0};
            elementClicked.prevPosition = elementClicked.dragPosition;
            elementClicked.finalPosition = elementClicked.dragPosition;
            elementClicked.estado = this.estado.flotando;
            htmlElement.scrollIntoView({block: "center", behavior: "smooth"});
          }
        }
      });
    
  }

  deleteElement(htmlElement: HTMLElement, elementClicked: elementDragDrop) {
    this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.borrar'), this.translate.instant('ptd.ask_borrar'), MODALS.QUESTION, true).then(
      action => {
        if (action.value) {
          if (this.isInsideGrid(elementClicked)) {
            const coord = this.getPositionforMatrix(elementClicked);
            this.changeStateRegion(coord.x, coord.y, elementClicked.horas, false);
          }
          const idx = this.listaCargaLectiva.findIndex(element => element.id == elementClicked.id);
          this.listaCargaLectiva.splice(idx, 1);
          const c: Element =  this.contenedorCargaLectiva.nativeElement;
          c.removeChild(htmlElement.parentElement.parentElement);
        }
      });
  }

  calcularHoras(tipo?) {
    let total = 0;
    this.listaCargaLectiva.forEach((carga: elementDragDrop) => {
      if (this.isInsideGrid(carga)) {
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
  }

  cancelar() {
    this.OutCancelar.emit(true);
  }

}
