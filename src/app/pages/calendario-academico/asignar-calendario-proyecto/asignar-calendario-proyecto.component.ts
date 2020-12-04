import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'asignar-calendario-proyecto',
  templateUrl: './asignar-calendario-proyecto.component.html',
  styleUrls: ['../calendario-academico.component.scss'],
})
export class AsignarCalendarioProyectoComponent implements OnInit {

  selectedProjects: FormControl;
  projects: any[];
  constructor(
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<AsignarCalendarioProyectoComponent>,
    @Inject(MAT_DIALOG_DATA) public dat: any,
  ) {
    this.selectedProjects = new FormControl([], Validators.required);
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit() {
    this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
      response => {
        this.projects = (<any[]>response).filter(
          project => this.dat.data.Dependencia === project['NivelFormacionId']['Descripcion'],
        );
        if (this.dat.calendar.DependenciaId !== '{}') {
          const deps = JSON.parse(this.dat.calendar.DependenciaId);
          this.selectedProjects.setValue(deps['proyectos']);
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  register() {
    this.popUpManager.showConfirmAlert(this.translate.instant('calendario.seguro_proyectos'))
      .then((ok) => {
        if (ok.value) this.dialogRef.close(this.selectedProjects.value);
      });
  }

}
