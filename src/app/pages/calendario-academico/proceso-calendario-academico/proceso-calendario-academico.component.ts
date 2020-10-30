import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Proceso } from '../../../@core/data/models/calendario-academico/proceso';
import { EventoService } from '../../../@core/data/evento.service';

@Component({
  selector: 'ngx-proceso-calendario-academico',
  templateUrl: './proceso-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss']
})
export class ProcesoCalendarioAcademicoComponent {

  processForm: FormGroup;
  periodicidad: any;

  constructor(
    public dialogRef: MatDialogRef<ProcesoCalendarioAcademicoComponent>,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public process: Proceso,
    private eventoService: EventoService
  ) { 
    this.fetchSelectData();
    this.createProcessForm();
  }

  savePeriod() {
    this.process = this.processForm.value;
    this.dialogRef.close(this.process);
  }

  createProcessForm() {
    this.processForm = this.builder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      periodicidad: 'Semestral'
    }) 
  }

  fetchSelectData() {
    //this.eventoService.get('tipo_recurrencia/?limit=0').subscribe((data => this.periodicidad = data));

    this.periodicidad = [
      {nombre: "Semestral", value: 1},
      {nombre: "Anual", value: 2},
      {nombre: "Bimestral", value: 3}
    ]
  }

}
