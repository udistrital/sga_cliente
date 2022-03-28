import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ViewCell } from 'ng2-smart-table';

@Component({
  selector: 'render-data',
  templateUrl: './render-data.component.html',
  styleUrls: ['./render-data.component.scss']
})
export class RenderDataComponent implements ViewCell, OnInit {

  ObjectData: Object[];
  needPercent: boolean = true;
  needEdit: boolean = false;
  canEdit: boolean = true;
  forTitle: boolean = false;
  form: FormGroup;

  @Input() rowData: any;
  @Input() value: string | any ;

  @Output() valueEdited: EventEmitter<any> = new EventEmitter();
  
  constructor() { }

  ngOnInit() {

    this.form = new FormGroup({});

    if(this.value.hasOwnProperty("forTitle")){
      this.forTitle = true;
    } else {
      this.forTitle = false;
    }

    this.needEdit = this.value["needEdit"];
    this.canEdit = this.value["canEdit"];
    this.ObjectData = this.value["values"];
    
    this.ObjectData.forEach( (data) => {
      if(data.hasOwnProperty("Perc")){
        data["needPercent"] = true;
      }
      else{
        data["needPercent"] = false;
      }
      this.form.addControl(data["N"], new FormControl(data["Value"]))
    });

    this.onChanges();

  }

  onChanges(): void {
    this.form.valueChanges.subscribe(val => {
      this.ObjectData.forEach( (data) => {
        data["Value"] = this.form.get(data["N"]).value;
      })
      this.value["values"] = this.ObjectData;
      this.valueEdited.emit(this.value);
    });
  }

}
