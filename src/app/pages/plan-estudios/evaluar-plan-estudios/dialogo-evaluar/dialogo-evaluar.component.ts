import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { STD } from '../../../../@core/data/models/espacios_academicos/estado_aprobacion';
import { PlanEstudiosService } from '../../../../@core/data/plan_estudios.service';
import { PlanEstudio } from '../../../../@core/data/models/plan_estudios/plan_estudio';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../managers/popUpManager';
import { MODALS } from '../../../../@core/data/models/diccionario/diccionario';
import { TercerosService } from '../../../../@core/data/terceros.service';

@Component({
  selector: 'dialogo-evaluar',
  templateUrl: './dialogo-evaluar.component.html',
  styleUrls: ['./dialogo-evaluar.component.scss']
})
export class DialogoEvaluarComponent implements OnInit {
  
  loading: boolean;
  aprobacionForm: FormGroup;
  estadoAprobacionSeleccionado: string;
  rol: string;
  rolSeleccionado: string;
  estadosAprobacionList = [];
  rolesList = [];
  observaciones: string;
  nombreEvaluador: string;
  multipleRoles = false;
  planEstudio: PlanEstudio;

  constructor(
    public dialogRef: MatDialogRef<DialogoEvaluarComponent>,
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
    this.aprobacionForm = this.builder.group({
      estadoSeleccionado: [null, Validators.required],
      observaciones: [''],
      nombreEvaluador: [''],
      rolSeleccionado: [null, Validators.required]
    });

    if (this.data.rol != null && typeof(this.data.rol) === 'object' && this.data.rol.length > 1) {
      this.multipleRoles = true;
      this.rolesList = this.data.rol;
    } else if (this.data.rol != null && typeof(this.data.rol) === 'object' && this.data.rol.length == 1) {
      this.multipleRoles = false;
      this.rolSeleccionado = this.data.rol[0];
    } else {
      this.multipleRoles = false;
      this.rolSeleccionado = "";
    }

    this.data.estadosAprobacion.forEach(element => {
      this.estadosAprobacionList.push(element);
    });
    this.loading = false;
  }

  ngOnInit() {
    this.loadTerceroData().then((terceroData) => {
      this.aprobacionForm.get('nombreEvaluador').setValue(terceroData.NombreCompleto);
    });
    if (!this.multipleRoles) {
      this.aprobacionForm.get('rolSeleccionado').setValue(this.rolSeleccionado);
    }

    this.getPlanEstudioById(this.data.planEstudioId).then((planEstudio) => {
      this.planEstudio = planEstudio;
      if (this.planEstudio.Observacion != null && this.planEstudio.Observacion != "") {
        this.aprobacionForm.get('observaciones').setValue(this.planEstudio.Observacion);  
      }

      if (this.planEstudio.EstadoAprobacionId != null) {
        let estado = this.data.estadosAprobacion.find(
          (estado) => estado.Id == this.planEstudio.EstadoAprobacionId.Id
        );
        this.aprobacionForm.get('estadoSeleccionado').setValue(estado);  
      }

      if (this.planEstudio.RevisorRol != null && this.planEstudio.RevisorRol != "") {
        this.rolSeleccionado = this.planEstudio.RevisorRol;
        this.aprobacionForm.get('rolSeleccionado').setValue(this.planEstudio.RevisorRol);
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

  loadTerceroData(): Promise<any> {
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

  getPlanEstudioById(planEstudioId: number): Promise<any> {
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

  sendEvaluation() {
    this.aprobacionForm.markAllAsTouched();
    if (this.aprobacionForm.valid && this.planEstudio != null) {
      let evaluationData = this.aprobacionForm.value;  
      this.planEstudio.EstadoAprobacionId = evaluationData.estadoSeleccionado;
      this.planEstudio.Observacion = evaluationData.observaciones;
      this.planEstudio.RevisorId = this.data.tercero_id;
      this.planEstudio.RevisorRol = evaluationData.rolSeleccionado;

      this.popUpManager.showPopUpGeneric(
        this.translate.instant('plan_estudios.plan_estudios'),
        this.translate.instant('plan_estudios.enviar_evaluacion_pregunta'), MODALS.INFO, true
      ).then((action) => {
        if (action.value) {
          this.loading = true;
          this.planEstudiosService.put('plan_estudio/', this.planEstudio).subscribe(
            (resp) => {
              if (resp.Status == '200') {
                this.loading = false;
                this.popUpManager.showSuccessAlert(
                  this.translate.instant('plan_estudios.enviar_evaluacion_ok')
                ).then((action) => {
                  this.dialogRef.close();
                });
              } else {
                this.loading = false;
                this.popUpManager.showErrorAlert(
                  this.translate.instant('plan_estudios.enviar_evaluacion_fallo')
                );
              }
            },
            (err) => {
              this.loading = false;
              this.popUpManager.showErrorAlert(
                this.translate.instant('plan_estudios.enviar_evaluacion_fallo')
              );
            }
          );
        }
      });
    } else {
      this.loading = false;
      this.popUpManager.showErrorAlert(
        this.translate.instant('plan_estudios.error_datos_incompletos')
      );
    }
  }
}
