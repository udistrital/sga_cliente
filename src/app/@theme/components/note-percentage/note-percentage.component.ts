import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { PorcentajesAsignatura } from '../../../@core/data/models/registro-notas/porcentajes-asignatura';
import { MyValidators } from './../../../@core/utils/validators';

@Component({
  selector: 'ngx-note-percentage',
  templateUrl: './note-percentage.component.html',
  styleUrls: ['./note-percentage.component.scss'],
})
export class NotePercentageComponent implements OnInit, AfterViewInit {

  form: FormGroup;
  settingFields: any = [];
  name: string = '';
  percentage: number = 0;
  currentValue = [];
  importantValue: any = null;
  isreadonly: boolean = false;
  editporTiempo: boolean = false;
  editExtemporaneo: boolean = false;
  @Output() formObservable: EventEmitter<any> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {

  }
  ngAfterViewInit() {
  }

  @Input('settings')
  set settings(settings: PorcentajesAsignatura | any) {
    if (settings) {
      this.name = settings.fields.name;
      this.settingFields = settings.fields.field;
      this.editporTiempo = settings.editporTiempo ? settings.editporTiempo : false;
      this.editExtemporaneo = settings.editExtemporaneo ? settings.editExtemporaneo : false;
      this.isreadonly = !((!settings.finalizado && this.editporTiempo) || this.editExtemporaneo);


      this.importantValue = settings.importantValue;
      this.buildForm();
      settings.fields.porcentaje ? this.maxPercentageField.setValue(settings.fields.porcentaje) : null;
      settings.importantValue ? this.importantValueField.setValue(settings.importantValue) : null;
    }
  }

  private createPercentageField(defaultValue, name, maxval) {
      return this.formBuilder.group({
        [name]: [defaultValue, [Validators.min(0), Validators.max(maxval)]]
      })
  }

  ngOnInit() {
    if (this.settingFields) {
      this.settingFields.forEach((field) => {
        this.fields.push(this.createPercentageField(field.perc ? field.perc : 0, field.name ? field.name:'field', field.max ? field.max : 100));
      });

    }
  }

  private buildForm() {
      this.form = this.formBuilder.group({
        fields: this.formBuilder.array([]),
        maxPercentage: new FormControl(''),
        importantValue: new FormControl(''),
      }, {
        validators: MyValidators.isPercentageValid
      })
    
    this.formObservable.emit(this.form);
  }

  get fields() {
    return this.form.get('fields') as FormArray
  }

  get maxPercentageField() {
    return this.form.get('maxPercentage') as FormControl
  }

  get importantValueField() {
    return this.form.get('importantValue') as FormControl
  }

  get sumPercentages$() {
    return this.form.get('fields').valueChanges
      .pipe(
        map((f: any) => {
          return f.map(p => p.field).reduce((a, b) => a + b, 0)
        })
      )
  }

  get allPercentage$() {
    return this.form.get('fields').valueChanges
  }


}
