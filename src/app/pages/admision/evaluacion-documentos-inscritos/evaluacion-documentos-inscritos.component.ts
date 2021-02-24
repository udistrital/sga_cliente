import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { LocalDataSource } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from '../../../managers/popUpManager';
import { combineAll } from 'rxjs/operators';


@Component({
  selector: 'evaluacion-documentos-inscritos',
  templateUrl: './evaluacion-documentos-inscritos.component.html',
  styleUrls: ['./evaluacion-documentos-inscritos.component.scss']
})
export class EvaluacionDocumentosInscritosComponent implements OnInit {

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  settings: any;
  dataSource: LocalDataSource;
  info_persona_id: any;
  periodo: any;
  nivel_load: any;
  selectednivel: any;
  proyectos_selected: any[];
  inscripcion_id: any;
  showProfile: boolean;

  periodos = [];
  proyectos = [];
  Aspirantes = [];
  
  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService,
    private tercerosService: TercerosService,
  ) {
    this.dataSource = new LocalDataSource();
    this.showProfile = true;
    this.loadData();
    this.createTable()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
   }

  ngOnInit() {
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();
      await this.cargarPeriodo();
      await this.loadLevel();
    } catch (error) {
      Swal({
        type: 'error',
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
          });
    });
  }

  loadLevel(){
    this.projectService.get('nivel_formacion?limit=2').subscribe(
      (response: any) => {
        if (response !== null || response !== undefined){
          this.nivel_load = <any>response;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadProyectos() {
    this.dataSource.load([]);
    this.Aspirantes = [];
    if (this.selectednivel !== NaN){
      this.projectService.get('proyecto_academico_institucion?query=NivelFormacionId:'+Number(this.selectednivel)+'&limit=0').subscribe(
        (response: any) => {
          if (response !== null || response !== undefined){
            this.proyectos = <any>response;
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  loadInscritos(){
    this.dataSource.load([]);
    this.Aspirantes = [];
    this.inscripcionService.get('inscripcion?query=EstadoInscripcionId__Id:5,ProgramaAcademicoId:'+this.proyectos_selected+',PeriodoId:'+this.periodo.Id+'&sortby=Id&order=asc').subscribe(
      (response: any) => {
        if (response !== '[{}]') {
          const data = <Array<any>>response;
          data.forEach(element => {  
            if (element.PersonaId != undefined) {
              this.tercerosService.get('datos_identificacion?query=TerceroId:'+element.PersonaId).subscribe(
                (res: any) => { 
                  var aspiranteAux = {
                    Credencial: element.Id,
                    Identificacion: res[0].Numero,
                    Nombre: res[0].TerceroId.NombreCompleto,
                    Estado: element.EstadoInscripcionId.Nombre,
                  }
                  this.Aspirantes.push(aspiranteAux);
                  this.dataSource.load(this.Aspirantes);
                }, 
                error => {
                  this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
                  
                }
              );
            }                
          });
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('admision.no_data'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      }
    );
  }

  activateTab(){
    this.showProfile = true;
  }

  loadPerfil(event){
    this.tercerosService.get('datos_identificacion?query=numero:' + event.data.Identificacion).subscribe(
      (response: any) => {
        this.projectService.get('proyecto_academico_institucion/'+this.proyectos_selected).subscribe(
          (res: any) => {
            this.info_persona_id = response[0].TerceroId.Id;
            this.inscripcion_id = event.data["Credencial"];
            sessionStorage.setItem('IdInscripcion', event.data["Credencial"]);
            sessionStorage.setItem('ProgramaAcademicoId', this.proyectos_selected.toString());
            sessionStorage.setItem('ProgramaAcademico', res.Nombre);
            this.showProfile = false;
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
          }
        );
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      }
    );
  }

  createTable(){
    this.settings = {
      columns: {
        Credencial: {
          title: this.translate.instant('admision.credencial'),
          width: '20%',
          editable: false,
        },
        Identificacion: {
          title: this.translate.instant('admision.id'),
          width: '20%',
          editable: false,
        },
        Nombre: {
          title: this.translate.instant('admision.nombre'),
          width: '35%',
          editable: false,
        },
        Estado: {
          title: this.translate.instant('admision.estado'),
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',
      filter: false,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'view',
            title: '<i class="fa fa-eye"></i>'
          }
        ]
      }
    }
  }

}
