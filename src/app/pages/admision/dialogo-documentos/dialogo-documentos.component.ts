import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';

@Component({
  selector: 'dialogo-documentos',
  templateUrl: './dialogo-documentos.component.html',
  styleUrls: ['./dialogo-documentos.component.scss'],
})
export class DialogoDocumentosComponent implements OnInit {

  revisionForm: FormGroup;
  documento: any;
  loading: boolean;

  constructor(
    public dialogRef: MatDialogRef<DialogoDocumentosComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private builder: FormBuilder,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
  ) {
    this.crearForm();
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit() {
    this.downloadFile(this.data.documento_id)
  }

  crearForm() {
    this.revisionForm = this.builder.group({
      observacion: [''],
      aprobado: ['', Validators.required],
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

  downloadFile(id_documento: any) {
    const filesToGet = [
      {
        Id: id_documento,
        key: id_documento,
      },
    ];
    this.loading = true;
    this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService).subscribe(
      response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          filesToGet.forEach((file: any) => {
            this.documento = filesResponse[file.Id];
            this.loading = false;
          });
        }
      },
      error => {
        this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
      },
    );
  }

}
