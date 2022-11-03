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
  tabName: string = "";
  documento: any;
  nombreDocumento: string = "";
  verEstado: string = "";
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
    this.tabName = this.data.documento.tabName || "";
    if(this.data.documento.hasOwnProperty('nombreDocumento')){
      this.nombreDocumento = this.data.documento.nombreDocumento;
    } else {
      this.nombreDocumento = "";
    }
    if(this.data.documento.aprobado != null) {
      if(this.data.documento.aprobado){
        this.verEstado = this.translate.instant('GLOBAL.estado_aprobado');
      } else {
        this.verEstado = this.translate.instant('GLOBAL.estado_no_aprobado');
      }
    } else {
      this.verEstado = this.translate.instant('GLOBAL.estado_no_definido');
    }
    this.documento = this.data.documento.Documento['changingThisBreaksApplicationSecurity'];
    this.observando = this.data.documento.observando ? true : false;
    this.revisionForm.setValue({
      observacion: this.data.documento.observacion ? this.data.documento.observacion : "",
      aprobado: this.data.documento.aprobado ? this.data.documento.aprobado : false,
    });
  }

  crearForm() {
    this.revisionForm = this.builder.group({
      observacion: ['', Validators.required],
      aprobado: [false, Validators.required],
    });
  }

  guardarRevision(accion) {
    switch (accion) {
      case "NoAprueba":
        this.revisionForm.patchValue({
          aprobado: false,
        });
        break;
      case "Aprueba":
        this.revisionForm.patchValue({
          observacion: this.revisionForm.value.observacion ? this.revisionForm.value.observacion : "Ninguna",
          aprobado: true,
        });
        break;
      default:
        break;
    }
    if (this.revisionForm.valid) {
      this.popUpManager.showConfirmAlert(this.translate.instant('admision.seguro_revision')).then(
        ok => {
          if (ok.value) {
            this.dialogRef.close(this.revisionForm.value)
          } else {
            this.revisionForm.patchValue({
              observacion: "",
              aprobado: false,
            });
          }
        }
      )
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('GLOBAL.observacion_requerida'))
    }
  }

  docCargado() {
    this.loading = false;
  }

}
