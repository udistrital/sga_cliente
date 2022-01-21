import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MyValidators } from './../../../@core/utils/validators'
import { LocalDataSource } from 'ng2-smart-table';

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
  @Output() formObservable: EventEmitter<any> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {

  }
  ngAfterViewInit() {
  }

  @Input('settings')
  set settings(settings: any) {
    this.name = settings.name;
    this.settingFields = settings.fields;
    this.percentage = settings.percentage;
    this.type = settings.type;
    this.buildForm(settings.type);
    this.maxPercentageField.setValue(settings.percentage);
  }

  private createPercentageField(defaultValue, type) {
    if (type === 'percentage') {
      console.log(type)
      return this.formBuilder.group({
        field: [defaultValue, [Validators.min(0), Validators.max(100)]]
      })
    } else {
      return this.formBuilder.group({
        field: [defaultValue, [Validators.min(0), Validators.max(5)]]
      })
    }
  }

  ngOnInit() {
    if (this.settingFields && this.type) {
      this.settingFields.forEach((field) => {
        this.percentageField.push(this.createPercentageField(field.value ? field.value : 0, this.type));
      });

    }
  }

  private buildForm(type) {
    if (type === 'percentage') {
      this.form = this.formBuilder.group({
        percentages: this.formBuilder.array([]),
        maxPercentage: new FormControl('')
      }, {
        validators: MyValidators.isPercentageValid
      })
    } else {
      this.form = this.formBuilder.group({
        percentages: this.formBuilder.array([]),
        maxPercentage: new FormControl('')
      })
    }
    this.formObservable.emit(this.form);
  }

  get percentageField() {
    return this.form.get('percentages') as FormArray
  }

  get maxPercentageField() {
    return this.form.get('maxPercentage') as FormControl
  }

  get sumPercentages$() {
    return this.form.get('percentages').valueChanges
      .pipe(
        map((f: any) => {
          return f.map(p => p.field).reduce((a, b) => a + b, 0)
        })
      )
  }

  get allPercentage$() {
    return this.form.get('percentages').valueChanges
  }


}
