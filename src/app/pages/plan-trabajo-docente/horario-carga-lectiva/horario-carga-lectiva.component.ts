import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CdkDrag, CdkDragMove, CdkDragRelease } from '@angular/cdk/drag-drop';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'horario-carga-lectiva',
  templateUrl: './horario-carga-lectiva.component.html',
  styleUrls: ['./horario-carga-lectiva.component.scss']
})
export class HorarioCargaLectivaComponent implements OnInit, OnChanges {

  readonly horarioSize = {days: 7, hourIni: 6, hourEnd: 23, stepHour: 0.25};
  readonly containerGridLengths = {
    x: this.horarioSize.days, 
    y: (this.horarioSize.hourEnd-this.horarioSize.hourIni),
  };
  readonly snapGridSize = {x: 130, y: 50, ymin: 50}; //px no olvide editarlas en scss si las cambia
  readonly containerGridsize = {
    x: this.containerGridLengths.x*this.snapGridSize.x,
    y: this.containerGridLengths.y*this.snapGridSize.y
  };
  genHoursforTable() {
    return Array(this.horarioSize.hourEnd-this.horarioSize.hourIni).fill(0).map((_, index) => index + this.horarioSize.hourIni);
  }
  modificar: boolean = false;

  @ViewChild('contenedorCargaLectiva', { static: false }) contenedorCargaLectiva: ElementRef;
  listaCargaLectiva: any[] = [];

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
  }
  
  identificador: number = 0;

  getDragPosition(eventDrag: CdkDragMove) {
    const contenedor: DOMRect = this.contenedorCargaLectiva.nativeElement.getBoundingClientRect();
    let posicionRelativa = {
      x: Math.floor(eventDrag.pointerPosition.x - contenedor.left-(this.snapGridSize.x/2)), 
      y: Math.floor(eventDrag.pointerPosition.y - contenedor.top-(this.snapGridSize.y/2))
    };
    posicionRelativa.x = posicionRelativa.x <= 0 ? 0 : posicionRelativa.x;
    posicionRelativa.y = posicionRelativa.y <= 0 ? 0 : posicionRelativa.y;
    posicionRelativa.x = Math.round(posicionRelativa.x / this.snapGridSize.x) * this.snapGridSize.x;
    posicionRelativa.y = Math.round(posicionRelativa.y / this.snapGridSize.ymin) * this.snapGridSize.ymin;
    return posicionRelativa;
  }

  onDragMoved(event: CdkDragMove, elementMoved) {
      const posicionRelativa = this.getDragPosition(event);
      
      const ocupado = this.listaCargaLectiva.find(element => {
        if ((element.id != elementMoved.id) && (element.dragPosition.x == posicionRelativa.x) && (element.dragPosition.y == posicionRelativa.y)) {
          return true;
        } else {
          return false;
        }
      });
      if (ocupado) {
        elementMoved.dragPosition = elementMoved.prevPosition;
        event.source._dragRef.setFreeDragPosition(elementMoved.prevPosition)
        event.source._dragRef.disabled = true;
      } else {
        elementMoved.dragPosition = posicionRelativa;
      }
      if ((posicionRelativa.x != elementMoved.prevPosition.x) || (posicionRelativa.y != elementMoved.prevPosition.y)) {
        elementMoved.prevPosition = elementMoved.dragPosition;
      }
    
  }

  onDragReleased(event: CdkDragRelease, elementMoved) {
    if (elementMoved.dragPosition.y > (this.containerGridsize.y - this.snapGridSize.y)) {
      this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.borrar'), this.translate.instant('ptd.ask_borrar'), "info", true).then(
        action => {
          if (action.value) {
            const idx = this.listaCargaLectiva.findIndex(element => element.id == elementMoved.id);
            this.listaCargaLectiva.splice(idx, 1);
            const c: Element =  this.contenedorCargaLectiva.nativeElement;
            c.removeChild(event.source.element.nativeElement)
          } else {
            event.source._dragRef.setFreeDragPosition(elementMoved.finalPosition);
            event.source._dragRef.disabled = true;
          }
        });
    } else {
      elementMoved.finalPosition = elementMoved.dragPosition;
    }
  }

  addCarga() {
    this.modificar = true;
    this.identificador++;
    const newElement = {
      id: this.identificador,
      nombre: "Cálculo", 
      dragPosition: {x: this.containerGridsize.x + this.snapGridSize.x*2, y: 0},
      prevPosition: {x: this.containerGridsize.x + this.snapGridSize.x*2, y:0},
      finalPosition: {x: this.containerGridsize.x + this.snapGridSize.x*2, y:0}
    };
    this.listaCargaLectiva.push(newElement);
    console.log(this.containerGridsize,this.containerGridLengths)
  }

  editElement(htmlElement: HTMLElement, elementClicked) {
    this.modificar = true;
    console.log("edit", elementClicked);
  }

  deleteElement(htmlElement: HTMLElement, elementClicked) {
    this.popUpManager.showPopUpGeneric(this.translate.instant('ptd.borrar'), this.translate.instant('ptd.ask_borrar'), "info", true).then(
      action => {
        if (action.value) {
          const idx = this.listaCargaLectiva.findIndex(element => element.id == elementClicked.id);
          this.listaCargaLectiva.splice(idx, 1);
          const c: Element =  this.contenedorCargaLectiva.nativeElement;
          c.removeChild(htmlElement.parentElement.parentElement)
        }
      });
  }

  guardar_ptd() {
  }

  cancelar() {
  }

}
