import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'doc-programa-obligatorio',
  templateUrl: './doc-programa-obligatorio.component.html',
  styleUrls: ['./doc-programa-obligatorio.component.scss']
})
export class DocProgramaObligatorioComponent implements ViewCell, OnInit {

  @Input() value: boolean | any;
  @Input() rowData: any;
  @Output() checkboxVal: EventEmitter<any> = new EventEmitter();

  miniForm: FormGroup

  constructor() { }

  ngOnInit() {
    this.miniForm = new FormGroup({
      obligatorio: new FormControl(this.value)
    });

    this.miniForm.get("obligatorio").valueChanges.subscribe(x => {
      this.checkboxVal.emit({value: x, Data: this.rowData})
   })
  }

}
