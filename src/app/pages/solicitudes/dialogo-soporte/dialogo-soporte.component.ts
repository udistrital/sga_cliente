import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';


@Component({
  selector: 'ngx-dialogo-soporte',
  templateUrl: './dialogo-soporte.component.html',
  styleUrls: ['../solicitudes.component.scss']
})
export class DialogoSoporteComponent implements OnInit {

  archivo: any;

  constructor(
    public dialogRef: MatDialogRef<DialogoSoporteComponent>,
    private translate: TranslateService,
  ) {
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit() {

  }

  abrirArchivo() {

  }

  guardarArchivo() {
    this.dialogRef.close(this.archivo)

  }

  seleccionarArchivo(event) {

  }

}
