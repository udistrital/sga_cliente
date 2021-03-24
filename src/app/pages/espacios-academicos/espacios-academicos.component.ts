import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { relative } from 'path';
import { Periodo } from '../../@core/data/models/periodo/periodo';
import { ParametrosService } from '../../@core/data/parametros.service';
import { PopUpManager } from '../../managers/popUpManager';

@Component({
  selector: 'espacios-academicos',
  templateUrl: './espacios-academicos.component.html',
  styleUrls: ['./espacios-academicos.component.scss']
})
export class EspaciosAcademicosComponent implements OnInit {

  periodo: Periodo;
  proyecto: any;
  codigo_estudiante: string;
  enfasis: string;
  modalidad: string;
  isPreinscrito: boolean;
  preinscribiendo: boolean;

  preinscritos: string[]

  settings = {
    columns: {
      Codigo: {
        title: this.translate.instant('solicitudes.codigo'),
        editable: false,
        width: '20%',
      },
      Nombre: {
        title: this.translate.instant('GLOBAL.nombre'),
        editable: false,
        width: '20%',
      },
      Creditos: {
        title: this.translate.instant('GLOBAL.creditos'),
        editable: false,
        width: '20%',
      },
      Clasificacion: {
        title: this.translate.instant('GLOBAL.clasificacion'),
        editable: false,
        width: '20%',
      },
    },
    actions: {
      add: false,
      edit: false,
      position: 'right',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
    },
    hideSubHeader: true,
    mode: 'inline',
  }

  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private popUpManager: PopUpManager,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.loadPeriodo();
  }

  ngOnInit() {
    this.preinscritos = [];
    this.isPreinscrito = false;
    this.preinscribiendo = false;
    this.proyecto = 'Especialización en Bioingeniería'; // obtener de la vinculación del tercero
    this.codigo_estudiante = '2011102059'; // obtener de informacion complementaria del tercero
    this.enfasis = 'Enfasis 1'; // obtener del proyecto academico
    this.modalidad = 'Investigación' // obtener del proyecto academico

    // cargar datos de preinscripción de la API correspondiente
    this.route.paramMap.subscribe(params => {
      if (params.getAll('data') !== null) {
        this.preinscritos = params.getAll('data');
        this.preinscribiendo = false;
        this.isPreinscrito = this.preinscritos.length > 0;
      }
    });
  }

  loadPeriodo() {
    this.periodo = new Periodo();
    this.parametrosService.get('periodo?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1').subscribe(
      (response: Periodo[]) => {
        this.periodo = response['Data'][0];
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'))
      }
    );
  }

  preinscribir() {
    this.preinscribiendo = true;
    this.router.navigate(['./preinscripcion-espacios-academicos'], {relativeTo: this.route});
  }

}
