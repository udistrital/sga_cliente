import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewCell } from 'ng2-smart-table';
import { Fields } from '../../../@core/data/models/registro-notas/fields';
import { FormatForTable } from '../../../@core/data/models/registro-notas/format-for-table';

@Component({
  selector: 'render-data',
  templateUrl: './render-data.component.html',
  styleUrls: ['./render-data.component.scss']
})
export class RenderDataComponent implements ViewCell, OnInit, OnDestroy {

  fields: Fields[] = [];
  needPercent: boolean = true;
  needEdit: boolean = false;
  canEdit: boolean = true;
  forTitle: boolean = false;
  form: FormGroup;

  Observaciones: any;

  forClose: boolean = false;

  subs: any; 

  @Input() rowData: any;
  @Input() value: FormatForTable | any ;

  @Output() valueEdited: EventEmitter<any> = new EventEmitter();
  
  constructor() { }

  getData(){
    this.forTitle = this.value.forTitle ? this.value.forTitle : false;
    this.needEdit = this.value.needEdit ? this.value.needEdit : false;
    this.canEdit = this.value.canEdit ? this.value.canEdit : false;
    this.fields = this.value.fields ? this.value.fields : [];

    this.forClose = this.value.forClose ? this.value.forClose : false;
  }

  ngOnInit() {

    this.Observaciones = JSON.parse(sessionStorage.getItem('ObservacionesNotas'));

    this.getData();

    this.form = new FormGroup({});
    
    this.fields.forEach((f: Fields) => {
      if (f.hasOwnProperty("perc")) {
        f.needPercent = true;
      }
      else {
        f.needPercent = false;
      }
      if (f.name == "Fallas") {
        this.form.addControl(f.name, new FormControl(f.value ? f.value : 0, [Validators.min(<number>f.value), Validators.max(100)]))
      } else if (f.name == "ACU") {
        this.form.addControl(f.name, new FormControl(f.value ? f.value : 0, [Validators.min(0), Validators.max(5)]))
      } else if (f.name == "OBS") {
        if (!this.needEdit && !this.forTitle && !this.forClose) {
          let obs = this.Observaciones.filter(obs => obs.Id == f.value)[0]
          if (obs == undefined) {
            obs = {Nombre: "Sin Observaciones", CodigoAbreviacion: "0"}
          }
          f.name_alt = obs.Nombre; f.value = obs.CodigoAbreviacion;
        }
        this.form.addControl(f.name, new FormControl(f.value ? f.value : 0))
      } else {
        this.form.addControl(f.name, new FormControl(f.value ? f.value : 0, [Validators.min(0), Validators.max(5)]))
      }
    });

    this.subs = this.form.valueChanges.subscribe(val => {
        this.fields.forEach( (f: Fields) => {
          f.value = this.form.get(f.name).value;
        });
        this.value.fields = this.fields;
        this.valueEdited.emit(this.value);
    });

  }

  ngOnDestroy() {
    //console.log("borrando compoente..")
    this.subs.unsubscribe();
  }

}
