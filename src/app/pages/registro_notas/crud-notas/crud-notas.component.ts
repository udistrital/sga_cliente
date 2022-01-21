import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'crud-notas',
  templateUrl: './crud-notas.component.html',
  styleUrls: ['./crud-notas.component.scss']
})
export class CrudNotasComponent implements OnInit {
  totalPercentage = 0
  parcialPercentage = [0, 0, 0]
  settings1 = {
    name: 'Corte 1',
    percentage: 35,
    type: 'percentage',
    fields: [
      { placeholder: '% P1', label: 'P1', name: 'p1' },
      { placeholder: '% P2', label: 'P2', name: 'p2' },
      { placeholder: '% P3', label: 'P3', name: 'p3' },
    ]
  }


  settings2 = {
    name: 'Corte 2',
    type: 'percentage',
    percentage: 35,
    fields: [
      { placeholder: '% P1', label: 'P1', name: 'p1' },
      { placeholder: '% P2', label: 'P2', name: 'p2' },
      { placeholder: '% P3', label: 'P3', name: 'p3' },
      { placeholder: '% LAB', label: 'LAB', name: 'lab' },
    ]
  }

  settings3 = {
    name: 'Examen final',
    type: 'percentage',
    percentage: 30,
    fields: [
      { placeholder: '% P1', label: 'P1', name: 'p1', value: 30 },
    ]
  }

  settings4 = {
    name: 'Habilitación',
    type: 'percentage',
    percentage: 70,
    fields: [
      { placeholder: '% P1', label: 'P1', name: 'p1', value: 70 },
    ]
  }
  constructor() { }

  ngOnInit() {
  }

  formSettings1(form: FormGroup) {
    console.log(form.valid)
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.updateSumPercentage(0, data)
      }
    })
  }

  formSettings2(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.updateSumPercentage(1, data)

      }
    })
  }

  formSettings3(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.updateSumPercentage(2, data)
      }
    })
  }

  formSettings4(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        console.log(data);
      }
    })
  }

  updateSumPercentage(index, value) {
    const { percentages } = value;
    this.parcialPercentage[index] = percentages.map(a => a.field).reduce((a, b) => a + b);
    this.totalPercentage = this.parcialPercentage.reduce((a, b) => a + b)
  }
}
