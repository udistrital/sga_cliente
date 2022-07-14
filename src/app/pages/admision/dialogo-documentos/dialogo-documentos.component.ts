import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'dialogo-documentos',
  templateUrl: './dialogo-documentos.component.html',
  styleUrls: ['./dialogo-documentos.component.scss'],
})
export class DialogoDocumentosComponent implements OnInit {

  revisionForm: FormGroup;
  documento: any;
  nombreDocumento: string = "";
  loading: boolean;
  observando: boolean;

  constructor(
    public dialogRef: MatDialogRef<DialogoDocumentosComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private builder: FormBuilder,
  ) {
    this.crearForm();
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit() {
    this.loading = true;
    this.nombreDocumento = this.data.documento.DocumentoProgramaId.TipoDocumentoProgramaId.Nombre;
    this.documento = this.data.documento.Documento['changingThisBreaksApplicationSecurity'];
    this.observando = this.data.observando;
    this.revisionForm.setValue({
      observacion: this.data.documento.observacion,
      aprobado: this.data.documento.aprobado,
    });
  }

  crearForm() {
    this.revisionForm = this.builder.group({
      observacion: [''],
      aprobado: [false, Validators.required],
    });
  }

  guardarRevision() {
    this.popUpManager.showConfirmAlert(this.translate.instant('admision.seguro_revision')).then(
      ok => {
        if (ok.value) {
          this.dialogRef.close(this.revisionForm.value)
        }
      }
    )
  }

  docCargado() {
    this.loading = false;
  }

}
