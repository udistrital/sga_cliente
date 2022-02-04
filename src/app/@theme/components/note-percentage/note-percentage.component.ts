import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
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
  type: any = '';
  importantValue: any = null;
  @Output() formObservable: EventEmitter<any> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {

  }
  ngAfterViewInit() {
  }

  @Input('settings')
  set settings(settings: any) {
    if (settings) {
      this.name = settings.name;
      this.settingFields = settings.fields;
      this.percentage = settings.percentage;
      this.type = settings.type;
      this.importantValue = settings.importantValue;
      this.buildForm(settings.type);
      settings.percentage ? this.maxPercentageField.setValue(settings.percentage) : null;
      settings.importantValue ? this.importantValueField.setValue(settings.importantValue) : null;
    }
  }

  private createPercentageField(defaultValue, type, name) {
    if (type === 'percentage') {
      console.log(type)
      return this.formBuilder.group({
        [name]: [defaultValue, [Validators.min(0), Validators.max(100)]]
      })
    } else {
      return this.formBuilder.group({
        [name]: [defaultValue, [Validators.min(0), Validators.max(5)]]
      })
    }
  }

  ngOnInit() {
    if (this.settingFields && this.type) {
      this.settingFields.forEach((field) => {
        this.fields.push(this.createPercentageField(field.value ? field.value : 0, this.type, field.name?field.name:'field'));
      });

    }
  }

  private buildForm(type) {
    if (type === 'percentage') {
      this.form = this.formBuilder.group({
        fields: this.formBuilder.array([]),
        maxPercentage: new FormControl(''),
        importantValue: new FormControl(''),
      }, {
        validators: MyValidators.isPercentageValid
      })
    } else {
      this.form = this.formBuilder.group({
        fields: this.formBuilder.array([]),
        maxPercentage: new FormControl(''),
        importantValue: new FormControl(''),
      })
    }
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
