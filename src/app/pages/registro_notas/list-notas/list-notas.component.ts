import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { LocalDataSource } from 'ng2-smart-table';
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { CustomizeButtonComponent } from '../../../@theme/components/customize-button/customize-button.component';
import { PopUpManager } from '../../../managers/popUpManager';

interface RegistroNotasDocente {
  Nivel: string;
  Codigo: number;
  Asignatura: string,
  Periodo: string,
  PeriodoId: number,
  Grupo: string,
  Inscritos: number
  Proyecto_Academico: string,
  AsignaturaId: string,
  Opcion: {
    icon: 'fa fa-pencil fa-2x',
    label: 'Registrar notas',
    class: "btn btn-primary"
  };
}

@Component({
  selector: 'list-notas',
  templateUrl: './list-notas.component.html',
  styleUrls: ['./list-notas.component.scss']
})
export class ListNotasComponent implements OnInit {
  settings: any;
  dataSource: LocalDataSource;
  niveles: NivelFormacion[];

  loading: boolean = false;
  proceso: Object;
  validado = {
    corte1: {
      existe: false,
      enFecha: false
    },
    corte2: {
      existe: false,
      enFecha: false
    },
    examen: {
      existe: false,
      enFecha: false
    },
    habilit: {
      existe: false,
      enFecha: false
    }
  };

  IdAsignatura: string = "";

  constructor(
    private router: Router,
    private sgaMidService: SgaMidService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private userService: UserService,
  ) { 
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    })
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.createTable();
    this.loadData();
  }

  createTable() {
    this.settings = {
      actions: false,
      columns: {
        Nivel: {
          title: this.translate.instant('notas.nivel'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Codigo: {
          title: this.translate.instant('notas.codigo'),
          editable: false,
          width: '7%',
          filter: false,
        },
        Asignatura: {
          title: this.translate.instant('notas.asignatura'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Periodo: {
          title: this.translate.instant('notas.periodo'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Grupo: {
          title: this.translate.instant('notas.grupo'),
          width: '10%',
          editable: false,
          filter: false,
        },
        Inscritos: {
          title: this.translate.instant('notas.inscritos'),
          width: '5%',
          editable: false,
          filter: false,
        },
        Proyecto_Academico: {
          title: this.translate.instant('notas.carrera'),
          width: '20%',
          editable: false,
          filter: false,
        },
        Opcion: {
          title: this.translate.instant('notas.opcion'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data: RegistroNotasDocente) => {
              this.bringActivities(data.PeriodoId,data.AsignaturaId);
            })
          },
        },
      },
      mode: 'external',
    }
  }


  loadData() {

    var data: RegistroNotasDocente[];

    var docenteId = this.userService.getPersonaId();

    console.log(docenteId)
    this.loading = true;
    this.sgaMidService.get('notas/EspaciosAcademicos/' + docenteId).subscribe(
      (response: any) => {
        if (response !== null && response.Status == '404') {
          this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_espacios_academicos'));
        } else {
          data = response.Data;
          data.forEach(registro => {
            registro.Opcion = {
              icon: 'fa fa-pencil fa-2x',
              label: 'Registrar notas',
              class: "btn btn-primary"
            };
          })
          console.log(data)
          this.dataSource.load(data);
        }
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      }
    );

  }

  async bringActivities(periodo,asignatura){
    this.loading = true;
    this.proceso = undefined;
    this.sgaMidService.get('consulta_calendario_academico/'+periodo).subscribe(
      (response: any) => {
        if(response === null){
          this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_calendario'));
        }
        else {
          this.proceso = response[0].proceso.filter(proceso => this.existe(proceso.Proceso,["calificaciones"]))[0];
          if( this.proceso === undefined)
          {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.no_proceso_calificaciones'));
          }
          else{
            this.loading = false;
            this.chechDates(asignatura)
          }
        }
        this.loading = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      }
    );
  }

  chechDates(asignatura){

    this.validado = {
      corte1: {
        existe: false,
        enFecha: false
      },
      corte2: {
        existe: false,
        enFecha: false
      },
      examen: {
        existe: false,
        enFecha: false
      },
      habilit: {
        existe: false,
        enFecha: false
      }
    }

    if(this.proceso !== undefined){
      this.proceso["Actividades"].forEach((element) => {
        if(this.existe(element.Nombre,["primer"])){
          this.validado.corte1.existe = true;
        if(this.enFechas(element.FechaInicio,element.FechaFin)){
          this.validado.corte1.enFecha = true;
        }
      }

        if(this.existe(element.Nombre,["segundo"])){
          this.validado.corte2.existe = true;
        if(this.enFechas(element.FechaInicio,element.FechaFin)){
          this.validado.corte2.enFecha = true;
        }
      }

        if(this.existe(element.Nombre,["ultimo", "examen"])){
          this.validado.examen.existe = true;
        if(this.enFechas(element.FechaInicio,element.FechaFin)){
          this.validado.examen.enFecha = true;
        }
      }

        if(this.existe(element.Nombre,["habilitacion", "habilitaciones"])){
          this.validado.habilit.existe = true;
        if(this.enFechas(element.FechaInicio,element.FechaFin)){
          this.validado.habilit.enFecha = true;
        }
      }
      });
    }
    console.log(this.validado)
    
    if(this.validado.corte1.existe && this.validado.corte2.existe && this.validado.examen.existe && this.validado.habilit.existe)
    {
      if(this.validado.corte1.enFecha){
        this.popUpManager.showConfirmAlert(this.translate.instant('notas.fecha_corte1')); //"Esta ingresando a fechas 1 corte"
        this.router.navigate([`pages/notas/crud-notas/${asignatura}`])
      }
      else if(this.validado.corte2.enFecha){
        this.popUpManager.showConfirmAlert(this.translate.instant('notas.fecha_corte2')); //"Esta ingresando a fechas 2 corte"
        this.router.navigate([`pages/notas/crud-notas/${asignatura}`])
      }
      else if(this.validado.examen.enFecha){
        this.popUpManager.showConfirmAlert(this.translate.instant('notas.fecha_examen')); //"Esta ingresando a fechas examen"
        this.router.navigate([`pages/notas/crud-notas/${asignatura}`])
      }
      else if(this.validado.habilit.enFecha){
        this.popUpManager.showConfirmAlert(this.translate.instant('notas.fecha_habilit')); //"Esta ingresando a fechas habilit"
        this.router.navigate([`pages/notas/crud-notas/${asignatura}`])
      }
      else{
        this.popUpManager.showErrorAlert(this.translate.instant('notas.fuera_fechas')); //"fuera de fechas"
      }
    }
    else{
      this.popUpManager.showErrorAlert(this.translate.instant('notas.falta_actividad_calificacion')); //"Faltan actividades de calificaciones"
    } 
    
    

  }

  existe(variable, textos: string[]) {
    return textos.some( (texto) => variable.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(texto) !== -1 );
  }

  enFechas(fechaIni, fechaFin){
    let fi = moment(fechaIni,"YYYY-MM-DDTHH:mm:ss").toDate();
    let ff = moment(fechaFin,"YYYY-MM-DDTHH:mm:ss").toDate();
    let f = new Date();
    return (fi <= f) && (ff >= f)
  }


}
