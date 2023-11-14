import { Component, OnInit, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlanEstudiosService } from '../../../@core/data/plan_estudios.service';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { TercerosService } from '../../../@core/data/terceros.service';
import { PlanEstudio } from '../../../@core/data/models/plan_estudios/plan_estudio';

@Component({
  selector: 'dialog-ver-observacion',
  templateUrl: './dialog-ver-observacion.component.html',
  styleUrls: ['./dialog-ver-observacion.component.scss']
})
export class DialogVerObservacionComponent implements OnInit {

  loading: boolean = true;
  revisionForm: FormGroup;
  rol: string;
  rolSeleccionado: string;
  estadosAprobacion: string;
  estadoSeleccionado: string;
  observaciones: string;
  nombreEvaluador: string;
  planEstudio: PlanEstudio;

  constructor(
    public dialogRef: MatDialogRef<DialogVerObservacionComponent>,
    public dialog: MatDialog,
    private planEstudiosService: PlanEstudiosService,
    private builder: FormBuilder,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private terceroService: TercerosService,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.loading = true;
    this.data = data;
    this.revisionForm = this.builder.group({
      estadoSeleccionado: [null, Validators.required],
      observaciones: [''],
      nombreEvaluador: [''],
      rolSeleccionado: [null, Validators.required]
    });
    this.loading = false;
  }

  ngOnInit() {
    this.loadTerceroData().then((terceroData) => {
      this.revisionForm.get('nombreEvaluador').setValue(terceroData.NombreCompleto);
    });

    this.getPlanEstudioById(this.data.planEstudioId).then((planEstudio) => {
      this.planEstudio = planEstudio;
      if (this.planEstudio.Observacion != null && this.planEstudio.Observacion != "") {
        this.revisionForm.get('observaciones').setValue(this.planEstudio.Observacion);
      }

      if (this.planEstudio.EstadoAprobacionId != null) {
        let estado = this.data.estadosAprobacion.find(
          (estado) => estado.Id == this.planEstudio.EstadoAprobacionId.Id
        );
        this.revisionForm.get('estadoSeleccionado').setValue(estado.Nombre);
      }

      if (this.planEstudio.RevisorRol != null && this.planEstudio.RevisorRol != "") {
        this.rolSeleccionado = this.planEstudio.RevisorRol;
        this.revisionForm.get('rolSeleccionado').setValue(this.planEstudio.RevisorRol);
      }
    }).catch((error) => {
      this.loading = false;
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('GLOBAL.error'),
        this.translate.instant('plan_estudios.error_cargando_datos_formulario'),
        'error',
        false
      ).then((action) => {
        this.dialogRef.close();
      });
    });
    this.loading = false;
  }

  private loadTerceroData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.terceroService.get(`tercero/${this.data.tercero_id}`).subscribe(
        response => {
          resolve(response);
        },
        error => {
          reject({"tercero": error});
        });
    });
  }

  private getPlanEstudioById(planEstudioId: number): Promise<any> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.planEstudiosService.get(`plan_estudio/${planEstudioId}`).subscribe(
        response => {
          this.loading = false;
          resolve(response.Data);
        },
        error => {
          this.loading = false;
          reject({"planEstudio": error});
        });
    });
  }

  salirObservacion() {
    this.dialogRef.close();
  }
}
