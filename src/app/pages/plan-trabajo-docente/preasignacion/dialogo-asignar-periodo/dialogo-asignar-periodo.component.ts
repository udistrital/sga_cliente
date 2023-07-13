import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../managers/popUpManager';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SgaMidService } from '../../../../@core/data/sga_mid.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'dialogo-asignar-periodo',
  templateUrl: './dialogo-asignar-periodo.component.html',
  styleUrls: ['./dialogo-asignar-periodo.component.scss']
})
export class DialogoAsignarPeriodoComponent implements OnInit {

  loading: boolean;
  assignPeriodForm: FormGroup;
  groupsList = [];

  constructor(
    public dialogRef: MatDialogRef<DialogoAsignarPeriodoComponent>,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private sgaMidService: SgaMidService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.loading = true;
    this.data = {
      ...this.data, 
      ...{
        nivel: null,
        subnivel: null,
        proyecto: null,
        espacio_academico: null,
        gruposSeleccionados: null,
      }};
    this.assignPeriodForm = this.builder.group({
      nivel: [this.data.nivel, Validators.required],
      subnivel: [this.data.subnivel, Validators.required],
      proyecto: [this.data.proyecto, Validators.required],
      espacio_academico: [this.data.espacio_academico, Validators.required],
      gruposSeleccionados: [this.data.gruposSeleccionados, Validators.required],
    });
    this.loadAcademicGroupData().then(() => {
      this.assignPeriodForm.get("nivel").setValue(this.data.nivel);
      this.assignPeriodForm.get("subnivel").setValue(this.data.subnivel);
      this.assignPeriodForm.get("proyecto").setValue(this.data.proyecto);
      this.assignPeriodForm.get("espacio_academico").setValue(this.data.espacio_academico);

      this.assignPeriodForm.get("nivel").enable();
      this.assignPeriodForm.get("subnivel").enable();
      this.assignPeriodForm.get("proyecto").enable();
      this.assignPeriodForm.get("espacio_academico").enable();
      this.assignPeriodForm.get("gruposSeleccionados").enable();
    });
    this.loading = false;
  }

  ngOnInit() {
    this.assignPeriodForm.get("nivel").disable();
    this.assignPeriodForm.get("subnivel").disable();
    this.assignPeriodForm.get("proyecto").disable();
    this.assignPeriodForm.get("espacio_academico").disable();
    this.assignPeriodForm.get("gruposSeleccionados").disable();
  }

  loadAcademicGroupData(){
    return new Promise((resolve, reject) => {
      var urlGetGroups2AssignPeriod = `plan_trabajo_docente/grupos_espacio_academico/padre/${this.data.espacio_academico_sin_periodo}`
      this.sgaMidService.get(urlGetGroups2AssignPeriod).subscribe(res => {
        if (res !== null && res.Status === '200'){
          const spaceData = <any>res['Data'][0];
          if (spaceData !== null) {
            const groups = spaceData.Grupos;
            groups.forEach(element =>{
              this.groupsList.push(element);
            });
            this.data.nivel = spaceData.Nivel;
            this.data.subnivel = spaceData.Subnivel;
            this.data.proyecto = spaceData.ProyectoAcademico;
            this.data.espacio_academico = spaceData.Nombre;
            resolve(this.data);
          }
        } else {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_espacio_academico'));
        }
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
        this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_espacio_academico'));
        this.dialogRef.close();
      });
    });    
  }

  sendAssingPeriodGroups(){
    if (this.assignPeriodForm.valid){
      const assignPeriodData: any = {};
      assignPeriodData.grupo = this.assignPeriodForm.get("gruposSeleccionados").value;
      assignPeriodData.periodo_id = this.data.periodo_id;
      assignPeriodData.padre = this.data.espacio_academico_sin_periodo;

      this.sgaMidService.put('espacios_academicos/espacio_academico_hijos/asignar_periodo', 
      assignPeriodData).subscribe(
        (response: any) => {
          this.popUpManager.showSuccessAlert(this.translate.instant('ptd.assign_period_2_group_success'));
          this.dialogRef.close();
        },
        (error : any) => {
          this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_update_assign_period_spaces'));
        },
      );
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('ptd.alerta_campos_preasignacion'));
    }
  }

}
