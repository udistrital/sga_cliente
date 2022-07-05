import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service'
import { ParametrosService } from '../../../@core/data/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormControl, Validators } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { SelectDocumentoProyectoComponent } from '../../documento_proyecto/select-documento-proyecto/select-documento-proyecto.component';
import { SelectDescuentoProyectoComponent } from '../../descuento_proyecto/select-descuento-proyecto/select-descuento-proyecto.component';
import { NbDialogService } from '@nebular/theme';
import { InscripcionService } from '../../../@core/data/inscripcion.service';

@Component({
  selector: 'ngx-asignar_documentos_descuentos',
  templateUrl: './asignar_documentos_descuentos.component.html',
  styleUrls: ['./asignar_documentos_descuentos.component.scss'],
})
export class AsignarDocumentosDescuentosComponent implements OnInit {
  toasterService: any;
  info_inscripcion: any;

  proyectos = [];
  periodos = [];

  loading: boolean = false;
  proyectos_selected: any;
  periodo: any;
  nivel_load: any;
  selectednivel: any;

  tipos_inscripcion = [];
  tipo_inscripcion_selected: any;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);

  loadingGlobal: boolean = false;

  constructor(
    private translate: TranslateService,
    private parametrosService: ParametrosService,
    private dialogService: NbDialogService,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.loadData();
  }

  async loadData() {
    try {
      this.loadingGlobal = true;
      await this.cargarPeriodo();
      await this.loadLevel();
      this.loadingGlobal = false;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: error.status + '',
        text: this.translate.instant('inscripcion.error_cargar_informacion'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = <any>res['Data'][0];
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
            this.loadingGlobal = false;
          });
    });
  }

  loadLevel() {
    this.loading = true;
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        if (response !== null || response !== undefined) {
          this.nivel_load = <any>response;
        }
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
        this.loadingGlobal = false;
      },
    );
  }

  filtrarProyecto(proyecto) {
    if (this.selectednivel === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.selectednivel) {
        return true
      }
    } else {
      return false
    }
  }

  loadProyectos() {
    this.proyectos_selected = undefined;
    sessionStorage.setItem('ProgramaAcademicoId', undefined);
    this.tipo_inscripcion_selected = undefined;
    sessionStorage.setItem('TipoInscripcionId', undefined);
    if (this.selectednivel !== NaN) {
      this.loading = true;
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {
          this.proyectos = <any[]>response.filter(
            proyecto => this.filtrarProyecto(proyecto),
          );
          this.loading = false;
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
          this.loadingGlobal = false;
        },
      );
    }
  }

  filterTipoInscripcion(tipoInscripcion){
    return ( this.selectednivel === tipoInscripcion.NivelId)
  }

  loadTipoInscripcion(){
    this.loading = true;
    this.tipo_inscripcion_selected = undefined;
    sessionStorage.setItem('TipoInscripcionId', undefined);
    if (this.proyectos_selected !== NaN) {
      this.inscripcionService.get('tipo_inscripcion?query=Activo:true&limit=0').subscribe(
        (response: any) => {
          this.tipos_inscripcion = <any[]> response.filter(
            tipoInscripcion => this.filterTipoInscripcion(tipoInscripcion),
          );
          this.loading = false;
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        }
      );
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  savePrograma() {
    sessionStorage.setItem('ProgramaAcademicoId', this.proyectos_selected)
    sessionStorage.setItem('PeriodoId', this.periodo.Id)
    sessionStorage.setItem('TipoInscripcionId', this.tipo_inscripcion_selected)
  }

  openSelectDocumentoProyectoComponent() {
    this.dialogService.open(SelectDocumentoProyectoComponent, {
      context: {
        asDialog: true,
      },
    });
  }

  openSelectDescuentoProyectoComponent() {
    this.dialogService.open(SelectDescuentoProyectoComponent, {
      context: {
        asDialog: true,
      },
    });
  }
}
