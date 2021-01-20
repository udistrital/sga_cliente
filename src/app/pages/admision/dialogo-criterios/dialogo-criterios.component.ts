import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { Criterio } from '../../../@core/data/models/admision/criterio';

@Component({
  selector: 'dialogo-criterios',
  templateUrl: './dialogo-criterios.component.html',
  styleUrls: ['./dialogo-criterios.component.scss']
})
export class DialogoCriteriosComponent implements OnInit {

  criterio: Criterio;
  criterioForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogoCriteriosComponent>,
    private builder: FormBuilder,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.dialogRef.backdropClick().subscribe(() => this.closeDialog());
  }

  ngOnInit() {
    this.criterioForm = this.builder.group({
      Nombre: ['', Validators.required],
      Descripcion: ['', Validators.required],
    });
    if (this.data.oldCriterio !== undefined) {
      this.criterioForm.setValue(this.data.oldCriterio);
    }
  }

  enviarCriterio() {
    this.popUpManager.showConfirmAlert(
      this.data.oldCriterio === undefined ?
      this.translate.instant('admision.seguro_crear_criterio') :
      this.translate.instant('admision.seguro_modificar_criterio')
    ).then(ok => {
      if(ok.value) {
        if (this.data.oldCriterio === undefined) {
          this.criterio =  new Criterio();
          this.criterio = this.criterioForm.value;
          this.criterio.Activo = true;
          this.criterio.NumeroOrden = 1;
          this.dialogRef.close(this.criterio);
        } else {
          this.data.oldCriterio = this.criterioForm.value;
          this.dialogRef.close(this.data.oldCriterio);
        }
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
