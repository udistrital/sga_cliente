import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'ng2-st-button',
  template: `
    <div>  
      <button mat-raised-button color="primary" (click)="action()" [ngSwitch]="value.type" [disabled]="value.disabled" [hidden]="value.hidden">
        <i *ngSwitchCase="'ver'" class="nb-search" title="{{ 'GLOBAL.tooltip_ver_registro' | translate }}"></i>
        <i *ngSwitchCase="'editar'" class="nb-edit" title="{{ 'GLOBAL.tooltip_editar_registro' | translate }}"></i>
        <i *ngSwitchCase="'borrar'" class="nb-trash" title="{{ 'GLOBAL.eliminar' | translate }}"></i>
        <i *ngSwitchCase="'crear'" class="nb-plus" title="{{ 'GLOBAL.crear' | translate }}"></i>
        <i *ngSwitchCase="'enviar'" class="nb-paper-plane" title="{{ 'GLOBAL.enviar' | translate }}"></i>
        <i *ngSwitchCase="'evaluar'" class="nb-checkmark" title="{{ 'GLOBAL.evaluar' | translate }}"></i>
      </button>
    </div>
  `,
  styles: [
    'div { display: flex; justify-content:center; align-items:center; }',
    'button { height: 2rem; width: 2rem; }', 
    'i { font-size: 2rem; }'
  ]
})
export class Ng2StButtonComponent implements ViewCell, OnInit {

  @Input() value: any;
  @Input() rowData: any;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  action() {
    this.valueChanged.emit({value: this.value.value, rowData: this.rowData});
  }

}
