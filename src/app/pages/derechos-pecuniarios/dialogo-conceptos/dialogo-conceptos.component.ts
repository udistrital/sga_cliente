import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Concepto } from '../../../@core/data/models/derechos-pecuniarios/concepto';

@Component({
  selector: 'dialogo-conceptos',
  templateUrl: './dialogo-conceptos.component.html',
  styleUrls: ['../derechos-pecuniarios.component.scss']
})
export class DialogoConceptosComponent {

  concepto: Concepto;
  formConcepto: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogoConceptosComponent>,
    private builder: FormBuilder,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    @Inject(MAT_DIALOG_DATA) private conceptoEditar: Concepto,
  ) {
    this.dialogRef.backdropClick().subscribe(() => this.cerrarDialogo());
    this.formConcepto = this.builder.group({
      Codigo: ['', Validators.required],
      Nombre: ['', Validators.required],
      Factor: ['', Validators.required],
    });

  }

  ngOnInit() {
    if (this.conceptoEditar !== null) {
      this.formConcepto.setValue({
        Codigo: this.conceptoEditar.Codigo,
        Nombre: this.conceptoEditar.Nombre,
        Factor: this.conceptoEditar.Factor,
      });
    }
  }

  cerrarDialogo() {
    this.dialogRef.close();
  }

  agregarConcepto() {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('derechos_pecuniarios.confirmar_concepto')
    ).then(ok => {
      if (ok.value) {
        this.concepto = this.formConcepto.value;
        this.dialogRef.close(this.concepto);
      }
    });
  }

}
