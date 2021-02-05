import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { UserService } from '../../../@core/data/users.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-view-inscripcion',
  templateUrl: './view-inscripcion.component.html',
  styleUrls: ['./view-inscripcion.component.scss']
})
export class ViewInscripcionComponent implements OnInit {

  persona_id: number;
  periodo_id: number;
  programa_id: number;
  inscripcion_id: number;
  inscripcion: any;

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private parametrosService: ParametrosService,
    private userService: UserService,
    private popUpManager: PopUpManager
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.inscripcion = {
      Periodo: '',
      Estado: '',
      Programa: '',
    }
  }

  ngOnInit() {
    this.programa_id = parseInt(sessionStorage.getItem('ProgramaAcademicoId'));
    this.persona_id = this.userService.getPersonaId();
    this.inscripcion_id = parseInt(sessionStorage.getItem('IdInscripcion'));
    this.periodo_id = this.userService.getPeriodo();
    this.loadInscripcion();
  }

  loadInscripcion() {
    this.inscripcion.Programa = sessionStorage.getItem('ProgramaAcademico');
    this.inscripcionService.get('inscripcion?query=Id:' + this.inscripcion_id).subscribe(
      (response: any[]) => {
        this.inscripcion.Estado = response[0].EstadoInscripcionId.Nombre;
      },
      (error: HttpErrorResponse) => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
      }
    );
    this.parametrosService.get('periodo/' + this.periodo_id).subscribe(
      (resp: any) => {
        this.inscripcion.Periodo = resp.Data.Nombre;
      },
      (error: HttpErrorResponse) => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
      }
    )
  }

}
