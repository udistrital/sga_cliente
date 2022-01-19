import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MyValidators } from './../../../@core/utils/validators'

@Component({
  selector: 'ngx-note-percentage',
  templateUrl: './note-percentage.component.html',
  styleUrls: ['./note-percentage.component.scss']
})
export class NotePercentageComponent implements OnInit {

  form: FormGroup;
  settingFields: any = [];
  name: string = '';
  constructor(private formBuilder: FormBuilder) {
    this.buildForm();
  }

  @Input('settings')
  set settings(settings: any) {
    this.name = settings.name;
    this.settingFields = settings.fields;
    this.maxPercentageField.setValue(settings.percentage);
  }

  private createPercentageField() {
    return this.formBuilder.group({
      field: ['']
    })
  }

  ngOnInit() {
    if (this.settingFields) {

      this.settingFields.forEach(() => {
        this.percentageField.push(this.createPercentageField());
      });
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      percentages: this.formBuilder.array([]),
      maxPercentage: new FormControl('')

    }, {
      validators: MyValidators.isPercentageValid
    })
  }

  get percentageField() {
    return this.form.get('percentages') as FormArray
  }

  get maxPercentageField() {
    return this.form.get('maxPercentage') as FormControl
  }

  get percentage$() {
    return this.form.get('percentage').valueChanges;
  }


}
