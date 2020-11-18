import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Proceso } from '../../../@core/data/models/calendario-academico/proceso';
import { Calendario } from '../../../@core/data/models/calendario-academico/calendario';
import { EventoService } from '../../../@core/data/evento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-proceso-calendario-academico',
  templateUrl: './proceso-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss'],
})
export class ProcesoCalendarioAcademicoComponent {

  process: Proceso;
  processForm: FormGroup;
  periodicidad: any[];

  constructor(
    public dialogRef: MatDialogRef<ProcesoCalendarioAcademicoComponent>,
    private builder: FormBuilder,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private eventoService: EventoService,
  ) {
    this.fetchSelectData();
    this.createProcessForm();
    this.dialogRef.backdropClick().subscribe(() => this.closeDialog());
    if (this.data.editProcess !== undefined) {
      this.processForm.setValue({
        Nombre: this.data.editProcess.Nombre,
        Descripcion: this.data.editProcess.Descripcion,
        TipoRecurrenciaId: this.data.editProcess.TipoRecurrenciaId.Id,
      });
    }
  }

  saveProcess() {
    const options: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('calendario.seguro_registrar_proceso'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(options).then(() => {
      this.process = this.processForm.value;
      this.process.CalendarioId = {Id: this.data.calendar.calendarioId};
      this.process.TipoRecurrenciaId = {Id: this.processForm.value.TipoRecurrenciaId}
      this.dialogRef.close(this.process);
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createProcessForm() {
    this.processForm = this.builder.group({
      Nombre: ['', Validators.required],
      Descripcion: ['', Validators.required],
      TipoRecurrenciaId: '',
    });
  }

  fetchSelectData() {
    this.eventoService.get('tipo_recurrencia?limit=0').subscribe((data => this.periodicidad = data));
  }

}
