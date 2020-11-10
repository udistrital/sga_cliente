import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Actividad } from '../../../@core/data/models/calendario-academico/actividad';
import { CoreService } from '../../../@core/data/core.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'ngx-actividad-calendario-academico',
  templateUrl: './actividad-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss'],
})
export class ActividadCalendarioAcademicoComponent {

  activity: Actividad;
  processName: string;
  period: string;
  activityForm: FormGroup;
  responsables: any;

  constructor(
    public dialogRef: MatDialogRef<ActividadCalendarioAcademicoComponent>,
    private builder: FormBuilder,
    private coreService: CoreService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.processName = this.data.process.Nombre;
    this.period = '';
    this.fetchSelectData(this.data.calendar.PeriodoId);
    this.createActivityForm();
    this.dialogRef.backdropClick().subscribe(() => this.closeDialog());
  }

  saveActivity() {
    const options: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('calendario.seguro_registrar_actividad'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(options).then(() => {
      this.activity = this.activityForm.value;
      this.activity.TipoEventoId = {Id: this.data.process.procesoId};
      this.activity.FechaInicio = moment(this.activity.FechaInicio).format('YYYY-MM-DDTHH:mm') + ':00Z';
      this.activity.FechaFin = moment(this.activity.FechaFin).format('YYYY-MM-DDTHH:mm') + ':00Z';
      this.activity.Activo = true;
      this.dialogRef.close(this.activity);
    })
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createActivityForm() {
    this.activityForm = this.builder.group({
      Nombre: ['', Validators.required],
      Descripcion: ['', Validators.required],
      FechaInicio: ['', Validators.required],
      FechaFin: ['', Validators.required],
      responsable: '',
    })
  }

  fetchSelectData(period) {
    this.coreService.get('periodo/' + period ).subscribe(
      response => this.period = response['Nombre'],
  );


    // this.eventoService.get('rol_encargado_evento/?limit=0').subscribe((data => this.responsables = data));
    this.responsables = [
      {Nombre: 'Coordinador', Id: 1},
      {Nombre: 'Estudiantes', Id: 2},
      {Nombre: 'Rectoria', Id: 3},
      {Nombre: 'Decanaturas', Id: 4},
      {Nombre: 'Proyectos curriculares', Id: 5},
    ]
  }

}
