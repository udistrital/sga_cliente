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

  students = [
    { name: 'Pedro1', code: 99999, lastname: 'Sánchez1' },
    { name: 'Pedro2', code: 99999, lastname: 'Sánchez2' },
    { name: 'Pedro3', code: 99999, lastname: 'Sánchez3' },
    { name: 'Pedro4', code: 99999, lastname: 'Sánchez4' },
    { name: 'Pedro5', code: 99999, lastname: 'Sánchez5' },
    { name: 'Pedro6', code: 99999, lastname: 'Sánchez6' },
    { name: 'Pedro7', code: 99999, lastname: 'Sánchez7' },
  ]
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

  notes1 = {
    fields :this.settings1.fields,
    type: 'notes',
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

  notes2 = {
    fields :this.settings2.fields,
    type: 'notes',
  }

  settings3 = {
    name: 'Examen final',
    type: 'percentage',
    percentage: 30,
    fields: [
      { placeholder: '% P1', label: 'P1', name: 'p1', value: 30 },
    ]
  }

  notes3 = {
    fields :this.settings3.fields,
    type: 'notes',
  }

  settings4 = {
    name: 'Habilitación',
    type: 'percentage',
    percentage: 70,
    fields: [
      { placeholder: '% P1', label: 'P1', name: 'p1', value: 70 },
    ]
  }

  notes4 = {
    fields :this.settings4.fields,
    type: 'notes',
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

  formNotes() {
    
  }
}
