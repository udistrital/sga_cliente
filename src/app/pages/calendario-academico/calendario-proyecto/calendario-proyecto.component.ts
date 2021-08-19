import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-calendario-proyecto',
  templateUrl: './calendario-proyecto.component.html',
  styleUrls: ['../calendario-academico.component.scss'],
})
export class CalendarioProyectoComponent {

  selectedLevel: FormControl;
  selectedProject: FormControl;
  niveles: NivelFormacion[];
  projects: any[];
  calendarioId: string = '';
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
    this.nivel_load();
  }

  filtrarProyecto(proyecto) {
    if (this.selectedLevel.value === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.selectedLevel.value) {
        return true
      }
    } else {
      return false
    }
  }

  onSelectLevel() {
    this.loading = true;
    this.showCalendar = false;
    this.projectService.get('proyecto_academico_institucion?limit=0&fields=Id,Nombre,NivelFormacionId').subscribe(
      response => {
        this.projects = <any[]>response.filter(proyecto => this.filtrarProyecto(proyecto));
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
    this.showCalendar = false;
    this.sgaMidService.get('consulta_calendario_proyecto/' + this.selectedProject.value).subscribe(
      response => {
        this.calendarioId = response["CalendarioId"];
        this.projectId = this.selectedProject.value
        if (this.calendarioId === "0") {
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

  nivel_load() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: NivelFormacion[]) => {
        this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null)
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

}
