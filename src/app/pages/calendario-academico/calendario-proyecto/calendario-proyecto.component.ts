import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'calendario-proyecto',
  templateUrl: './calendario-proyecto.component.html',
  styleUrls: ['../calendario-academico.component.scss']
})
export class CalendarioProyectoComponent {

  selectedLevel: FormControl;
  selectedProject: FormControl;
  nivel_load = [{nombre: 'Pregrado', id: 14}, { nombre: 'Posgrado', id: 15}];
  projects: any[];
  calendarioId: string = "";
  projectId: number = 0;
  showCalendar: boolean = false;
  loading: boolean = false;

  constructor(
    private projectService: ProyectoAcademicoService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    this.selectedLevel = new FormControl('');
    this.selectedProject = new FormControl('');
  }

  onSelectLevel() {
    this.loading = true;
    this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
      response => {
        this.projects = (<any[]>response).filter(
          project => this.nivel_load.filter((val) => this.selectedLevel.value === val.id)[0].nombre === project['NivelFormacionId']['Descripcion']
        );
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }

  onSelectProject() {
    this.loading = true;
    this.sgaMidService.get('consulta_calendario_proyecto/' + this.selectedProject.value).subscribe(
      response => {
        this.calendarioId = response["CalendarioId"];
        this.projectId = this.selectedProject.value
        if (this.calendarioId == "0") {
          this.showCalendar = false;
          this.popUpManager.showAlert('', this.translate.instant('calendario.sin_calendario'))
        } else {
          this.showCalendar = true;
        }
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }

}
