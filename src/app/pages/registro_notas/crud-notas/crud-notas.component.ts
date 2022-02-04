import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { settings1, settings2, settings3, settings4, notes1, notes2, notes3, notes4, students } from './settings-forms';
@Component({
  selector: 'crud-notas',
  templateUrl: './crud-notas.component.html',
  styleUrls: ['./crud-notas.component.scss']
})
export class CrudNotasComponent implements OnInit {
  totalPercentage = 0;
  parcialPercentage = [0, 0, 0]

  settings1 = null;
  settings2 = null;
  settings3 = null;
  settings4 = null;
  notes1 = null;
  notes2 = null;
  notes3 = null;
  notes4 = null;
  students = null;
  matrixForm: any = [];
  constructor() {
    this.settings1 = settings1;
    this.settings2 = settings2;
    this.settings3 = settings3;
    this.settings4 = settings4;
    this.notes1 = notes1;
    this.notes2 = notes2;
    this.notes3 = notes3;
    this.notes4 = notes4;
    this.students = students.map((student) => {
      return {
        ...student,
        ...{ notes1: { ...notes1, ...{ importantValue: student.code } } },
        ...{ notes2: { ...notes2, ...{ importantValue: student.code } } },
        ...{ notes3: { ...notes3, ...{ importantValue: student.code } } },
        ...{ notes4: { ...notes4, ...{ importantValue: student.code } } },
      }
    });
    console.log(this.students);

  }

  ngOnInit() {
  }

  formSettings1(form: FormGroup) {
    console.log(form.valid)
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.updateSumPercentage(0, data)
      } else {
        this.updateSumPercentage(0, 0);
      }
    })
  }

  formSettings2(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.updateSumPercentage(1, data)
      } else {
        this.updateSumPercentage(1, 0);
      }
    })
  }

  formSettings3(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.updateSumPercentage(2, data)
      } else {
        this.updateSumPercentage(2, 0);
      }
    })
  }

  formSettings4(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        //console.log(data);
      }
    })
  }

  updateSumPercentage(index, value) {
    const { fields } = value;
    if (fields && JSON.stringify(fields) !== '[]') {
      this.parcialPercentage[index] = fields.map((f) => {
        let data = 0;
        for (let key in f) {
          data = f[key];
        }
        return data
      }).reduce((a: number, b: number) => a + b, 0);
      this.totalPercentage = this.parcialPercentage.reduce((a, b) => a + b)
    } else {
      this.parcialPercentage[index] = value;
      this.totalPercentage = this.parcialPercentage.reduce((a, b) => a + b);
    }
  }

  formNotes(form) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        console.log(data);
      }
    })
  }
}
