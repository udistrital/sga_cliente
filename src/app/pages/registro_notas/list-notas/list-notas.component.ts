import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
          title: this.translate.instant('GENERAL.codigo'),
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
              //this.router.navigate([`pages/notas/crud-notas/${data.Id}`])
              console.log([`pages/notas/crud-notas/${data.AsignaturaId}`])
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

    this.sgaMidService.get('notas/listaEspaciosAcademicos/' + docenteId).subscribe(
      (response: any) => {
        if (response !== null && response.Status == '404') {
          this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_registros'));
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
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    )


    
    
  }

  async bringActivities(periodo,asignatura){
    var response: any = [
      {
        "Activo": true,
        "Id": "7",
        "ListaCalendario": null,
        "Nivel": 2,
        "Nombre": "Calendario Académico 2021-2 Posgrado",
        "PeriodoId": 12,
        "proceso": [
          {
            "Actividades": [
              {
                "Activo": true,
                "Descripcion": "prueba",
                "EventoPadreId": null,
                "FechaFin": "2030-06-04T00:00:00Z",
                "FechaInicio": "2021-12-01T00:00:00Z",
                "Nombre": "Admisiones ",
                "Responsable": [
                  {
                    "Nombre": "Aspirantes",
                    "responsableID": 2
                  }
                ],
                "TipoEventoId": {
                  "Activo": false,
                  "CalendarioID": {
                    "Activo": true,
                    "AplicacionId": 0,
                    "CalendarioPadreId": null,
                    "DependenciaId": "{\"proyectos\":[30,29,28,26,25,27,48,32,31,21]}",
                    "Descripcion": "",
                    "DocumentoId": 142735,
                    "FechaCreacion": "2021-12-10 08:38:09.716123 +0000 +0000",
                    "FechaModificacion": "2022-02-28 08:51:20.798855 +0000 +0000",
                    "Id": 7,
                    "Nivel": 2,
                    "Nombre": "Calendario Académico 2021-2 Posgrado",
                    "PeriodoId": 12
                  },
                  "CodigoAbreviacion": "",
                  "Descripcion": "Prueba",
                  "FechaCreacion": "2021-12-10 08:38:27.661288 +0000 +0000",
                  "FechaModificacion": "2021-12-10 08:38:27.661389 +0000 +0000",
                  "Id": 9,
                  "Nombre": "Admisiones ",
                  "TipoRecurrenciaId": {
                    "Activo": true,
                    "CodigoAbreviacion": "SEM",
                    "Descripcion": "Semestral",
                    "FechaCreacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "FechaModificacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "Id": 7,
                    "Nombre": "Semestral"
                  }
                },
                "actividadId": 13
              },
              {
                "Activo": true,
                "Descripcion": "Pago de aspirantes ",
                "EventoPadreId": null,
                "FechaFin": "2030-06-12T00:00:00Z",
                "FechaInicio": "2021-07-09T00:00:00Z",
                "Nombre": "PAGO INSCRIPCIÓN  DE ASPIRANTES",
                "Responsable": [
                  {
                    "Nombre": "Aspirantes",
                    "responsableID": 2
                  }
                ],
                "TipoEventoId": {
                  "Activo": false,
                  "CalendarioID": {
                    "Activo": true,
                    "AplicacionId": 0,
                    "CalendarioPadreId": null,
                    "DependenciaId": "{\"proyectos\":[30,29,28,26,25,27,48,32,31,21]}",
                    "Descripcion": "",
                    "DocumentoId": 142735,
                    "FechaCreacion": "2021-12-10 08:38:09.716123 +0000 +0000",
                    "FechaModificacion": "2022-02-28 08:51:20.798855 +0000 +0000",
                    "Id": 7,
                    "Nivel": 2,
                    "Nombre": "Calendario Académico 2021-2 Posgrado",
                    "PeriodoId": 12
                  },
                  "CodigoAbreviacion": "",
                  "Descripcion": "Prueba",
                  "FechaCreacion": "2021-12-10 08:38:27.661288 +0000 +0000",
                  "FechaModificacion": "2021-12-10 08:38:27.661389 +0000 +0000",
                  "Id": 9,
                  "Nombre": "Admisiones ",
                  "TipoRecurrenciaId": {
                    "Activo": true,
                    "CodigoAbreviacion": "SEM",
                    "Descripcion": "Semestral",
                    "FechaCreacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "FechaModificacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "Id": 7,
                    "Nombre": "Semestral"
                  }
                },
                "actividadId": 12
              }
            ],
            "Proceso": "Admisiones "
          },
          {
            "Actividades": [
              {
                "Activo": true,
                "Descripcion": "Pago de aspirantes ",
                "EventoPadreId": null,
                "FechaFin": "2038-07-09T00:00:00Z",
                "FechaInicio": "2021-11-11T00:00:00Z",
                "Nombre": "Pago inscripción aspirantes ",
                "Responsable": [
                  {
                    "Nombre": "Aspirantes",
                    "responsableID": 2
                  }
                ],
                "TipoEventoId": {
                  "Activo": false,
                  "CalendarioID": {
                    "Activo": true,
                    "AplicacionId": 0,
                    "CalendarioPadreId": null,
                    "DependenciaId": "{\"proyectos\":[30,29,28,26,25,27,48,32,31,21]}",
                    "Descripcion": "",
                    "DocumentoId": 142735,
                    "FechaCreacion": "2021-12-10 08:38:09.716123 +0000 +0000",
                    "FechaModificacion": "2022-02-28 08:51:20.798855 +0000 +0000",
                    "Id": 7,
                    "Nivel": 2,
                    "Nombre": "Calendario Académico 2021-2 Posgrado",
                    "PeriodoId": 12
                  },
                  "CodigoAbreviacion": "",
                  "Descripcion": "Pago Inscripción de aspirantes",
                  "FechaCreacion": "2021-12-10 08:39:55.832084 +0000 +0000",
                  "FechaModificacion": "2021-12-10 08:39:55.832178 +0000 +0000",
                  "Id": 10,
                  "Nombre": "Inscripción",
                  "TipoRecurrenciaId": {
                    "Activo": true,
                    "CodigoAbreviacion": "SEM",
                    "Descripcion": "Semestral",
                    "FechaCreacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "FechaModificacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "Id": 7,
                    "Nombre": "Semestral"
                  }
                },
                "actividadId": 14
              }
            ],
            "Proceso": "Inscripción"
          },
          {
            "Actividades": [
              {
                "Activo": true,
                "Descripcion": "Fecha limite para primer corte",
                "EventoPadreId": null,
                "FechaFin": "2022-02-25T00:00:00Z",
                "FechaInicio": "2022-02-05T00:00:00Z",
                "Nombre": "Fecha limite para primer corte",
                "Responsable": [
                  {
                    "Nombre": "Docentes",
                    "responsableID": 15
                  }
                ],
                "TipoEventoId": {
                  "Activo": false,
                  "CalendarioID": {
                    "Activo": true,
                    "AplicacionId": 0,
                    "CalendarioPadreId": null,
                    "DependenciaId": "{\"proyectos\":[30,29,28,26,25,27,48,32,31,21]}",
                    "Descripcion": "",
                    "DocumentoId": 142735,
                    "FechaCreacion": "2021-12-10 08:38:09.716123 +0000 +0000",
                    "FechaModificacion": "2022-02-28 08:51:20.798855 +0000 +0000",
                    "Id": 7,
                    "Nivel": 2,
                    "Nombre": "Calendario Académico 2021-2 Posgrado",
                    "PeriodoId": 12
                  },
                  "CodigoAbreviacion": "",
                  "Descripcion": "Proceso de Calificaciones",
                  "FechaCreacion": "2022-02-28 08:54:05.495977 +0000 +0000",
                  "FechaModificacion": "2022-02-28 08:54:05.496084 +0000 +0000",
                  "Id": 11,
                  "Nombre": "Calificaciones",
                  "TipoRecurrenciaId": {
                    "Activo": true,
                    "CodigoAbreviacion": "SEM",
                    "Descripcion": "Semestral",
                    "FechaCreacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "FechaModificacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "Id": 7,
                    "Nombre": "Semestral"
                  }
                },
                "actividadId": 15
              },
              {
                "Activo": true,
                "Descripcion": "Fecha limite para Habilitaciones ",
                "EventoPadreId": null,
                "FechaFin": "2022-06-01T00:00:00Z",
                "FechaInicio": "2022-05-02T00:00:00Z",
                "Nombre": "Fecha limite para Habilitaciones ",
                "Responsable": [
                  {
                    "Nombre": "Docentes",
                    "responsableID": 15
                  }
                ],
                "TipoEventoId": {
                  "Activo": false,
                  "CalendarioID": {
                    "Activo": true,
                    "AplicacionId": 0,
                    "CalendarioPadreId": null,
                    "DependenciaId": "{\"proyectos\":[30,29,28,26,25,27,48,32,31,21]}",
                    "Descripcion": "",
                    "DocumentoId": 142735,
                    "FechaCreacion": "2021-12-10 08:38:09.716123 +0000 +0000",
                    "FechaModificacion": "2022-02-28 08:51:20.798855 +0000 +0000",
                    "Id": 7,
                    "Nivel": 2,
                    "Nombre": "Calendario Académico 2021-2 Posgrado",
                    "PeriodoId": 12
                  },
                  "CodigoAbreviacion": "",
                  "Descripcion": "Proceso de Calificaciones",
                  "FechaCreacion": "2022-02-28 08:54:05.495977 +0000 +0000",
                  "FechaModificacion": "2022-02-28 08:54:05.496084 +0000 +0000",
                  "Id": 11,
                  "Nombre": "Calificaciones",
                  "TipoRecurrenciaId": {
                    "Activo": true,
                    "CodigoAbreviacion": "SEM",
                    "Descripcion": "Semestral",
                    "FechaCreacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "FechaModificacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "Id": 7,
                    "Nombre": "Semestral"
                  }
                },
                "actividadId": 18
              },
              {
                "Activo": true,
                "Descripcion": "Fecha limite para Ultimo corte",
                "EventoPadreId": null,
                "FechaFin": "2022-05-31T00:00:00Z",
                "FechaInicio": "2022-04-01T00:00:00Z",
                "Nombre": "Fecha limite para Ultimo corte",
                "Responsable": [
                  {
                    "Nombre": "Docentes",
                    "responsableID": 15
                  }
                ],
                "TipoEventoId": {
                  "Activo": false,
                  "CalendarioID": {
                    "Activo": true,
                    "AplicacionId": 0,
                    "CalendarioPadreId": null,
                    "DependenciaId": "{\"proyectos\":[30,29,28,26,25,27,48,32,31,21]}",
                    "Descripcion": "",
                    "DocumentoId": 142735,
                    "FechaCreacion": "2021-12-10 08:38:09.716123 +0000 +0000",
                    "FechaModificacion": "2022-02-28 08:51:20.798855 +0000 +0000",
                    "Id": 7,
                    "Nivel": 2,
                    "Nombre": "Calendario Académico 2021-2 Posgrado",
                    "PeriodoId": 12
                  },
                  "CodigoAbreviacion": "",
                  "Descripcion": "Proceso de Calificaciones",
                  "FechaCreacion": "2022-02-28 08:54:05.495977 +0000 +0000",
                  "FechaModificacion": "2022-02-28 08:54:05.496084 +0000 +0000",
                  "Id": 11,
                  "Nombre": "Calificaciones",
                  "TipoRecurrenciaId": {
                    "Activo": true,
                    "CodigoAbreviacion": "SEM",
                    "Descripcion": "Semestral",
                    "FechaCreacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "FechaModificacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "Id": 7,
                    "Nombre": "Semestral"
                  }
                },
                "actividadId": 17
              },
              {
                "Activo": true,
                "Descripcion": "Fecha limite para segundo corte",
                "EventoPadreId": null,
                "FechaFin": "2022-03-31T00:00:00Z",
                "FechaInicio": "2022-02-28T00:00:00Z",
                "Nombre": "Fecha limite para segundo corte",
                "Responsable": [
                  {
                    "Nombre": "Docentes",
                    "responsableID": 15
                  }
                ],
                "TipoEventoId": {
                  "Activo": false,
                  "CalendarioID": {
                    "Activo": true,
                    "AplicacionId": 0,
                    "CalendarioPadreId": null,
                    "DependenciaId": "{\"proyectos\":[30,29,28,26,25,27,48,32,31,21]}",
                    "Descripcion": "",
                    "DocumentoId": 142735,
                    "FechaCreacion": "2021-12-10 08:38:09.716123 +0000 +0000",
                    "FechaModificacion": "2022-02-28 08:51:20.798855 +0000 +0000",
                    "Id": 7,
                    "Nivel": 2,
                    "Nombre": "Calendario Académico 2021-2 Posgrado",
                    "PeriodoId": 12
                  },
                  "CodigoAbreviacion": "",
                  "Descripcion": "Proceso de Calificaciones",
                  "FechaCreacion": "2022-02-28 08:54:05.495977 +0000 +0000",
                  "FechaModificacion": "2022-02-28 08:54:05.496084 +0000 +0000",
                  "Id": 11,
                  "Nombre": "Calificaciones",
                  "TipoRecurrenciaId": {
                    "Activo": true,
                    "CodigoAbreviacion": "SEM",
                    "Descripcion": "Semestral",
                    "FechaCreacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "FechaModificacion": "2019-12-18 02:10:05.435446 +0000 +0000",
                    "Id": 7,
                    "Nombre": "Semestral"
                  }
                },
                "actividadId": 16
              }
            ],
            "Proceso": "Calificaciones"
          }
        ],
        "resolucion": {
          "Anno": "2020",
          "Enlace": "aceada39-f2bb-45e6-8ca9-a2306bfc0736",
          "Id": 142735,
          "Nombre": "",
          "Resolucion": 123
        }
      }
    ];
    this.proceso = response[0].proceso.filter(proceso => this.existe(proceso.Proceso,["calificaciones"]))[0];
    this.chechDates(asignatura)

    this.loading = true;
      this.proceso = undefined;
      this.sgaMidService.get('consulta_calendario_academico/'+periodo).subscribe(
        (response: any) => {
          if(response === null){
            this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_calendario'));//* "No se encuentra calendario para periodo" 
          }
          else {
            this.proceso = response[0].proceso.filter(proceso => this.existe(proceso.Proceso,["calificaciones"]))[0];
            if( this.proceso === undefined)
            {
              this.popUpManager.showErrorAlert(this.translate.instant('notas.no_proceso_calificaciones'));//* "No hay proceso de Calificaciones" 
            }
            else{
              this.chechDates(periodo)
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
