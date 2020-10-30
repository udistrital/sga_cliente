import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actividad } from '../../../@core/data/models/calendario-academico/actividad';
import { EventoService } from '../../../@core/data/evento.service';

@Component({
  selector: 'ngx-actividad-calendario-academico',
  templateUrl: './actividad-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss']
})
export class ActividadCalendarioAcademicoComponent {

  processName: string;
  period: string;
  activityForm: FormGroup;
  responsables: any;

  constructor(
    public dialogRef: MatDialogRef<ActividadCalendarioAcademicoComponent>,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public activity: Actividad,
  ) {
    this.fetchSelectData();
    this.createActivityForm();
  }

  saveActivity() {
    this.activity = this.activityForm.value;
    this.dialogRef.close(this.activity);
  }

  createActivityForm() {
    this.activityForm = this.builder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      responsable: 'Coordinador'
    })
  }

  fetchSelectData() {
    //this.eventoService.get('rol_encargado_evento/?limit=0').subscribe((data => this.responsables = data));

    this.responsables = [
      "Coordinador",
      "Estudiantes",
      "Rectoria",
      "Decanaturas",
      "Proyectos curriculares"
    ]
  }

}
