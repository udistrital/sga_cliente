import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { RenderDataComponent } from '../../../@theme/components';

@Component({
  selector: 'notas-parciales',
  templateUrl: './notas-parciales.component.html',
  styleUrls: ['./notas-parciales.component.scss']
})
export class NotasParcialesComponent implements OnInit {
  settings: Object;
  dataSource: LocalDataSource;

  constructor(private translate: TranslateService,) {
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    })
  }

  ngOnInit() {
    this.createTable();
    this.dataSource.load(this.data1);
  }

  createTable() {
    this.settings = {
      columns: {
        Grupo: {
          title: this.translate.instant('asignaturas.grupo'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Asignatura: {
          title: this.translate.instant('asignaturas.asignatura'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Creditos: {
          title: this.translate.instant('asignaturas.creditos'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Corte1: {
          title: this.translate.instant('asignaturas.corte1'),
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        Corte2: {
          title: this.translate.instant('asignaturas.corte2'),
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        LabExamHab: {
          title: "",
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        AcuFallasObsDef: {
          title: "",
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('asignaturas.no_datos_notas_parciales')
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  data1 = [{
    Grupo: "0010",
    Asignatura: "Algebra",
    Creditos: "3",
    Corte1: [
      {N: 1, Value: 4.5, Perc: 10},
      {N: 2, Value: 3.5, Perc: 10},
      {N: 3, Value: 4.0, Perc: 10}
    ],
    Corte2: [
      {N: 4, Value: 4.5, Perc: 10},
      {N: 5, Value: 3.5, Perc: 10},
      {N: 6, Value: 4.0, Perc: 10}
    ],
    LabExamHab: [
      {N: "Lab", Value: 4.5, Perc: 10},
      {N: "Exam", Value: 3.5, Perc: 30},
      {N: "Hab", Value: 0, Perc: 70}
    ],
    AcuFallasObsDef: [
      {N: "ACU", Value: 3.9},
      {N: "Fallas", Value: 3},
      {N: "OBS", Value: 0},
      {N: "DEF", Value: 4.0},
    ],
  },{
    Grupo: "0001",
    Asignatura: "Calculo 1",
    Creditos: "3",
    Corte1: [
      {N: 1, Value: 3.5, Perc: 30}
    ],
    Corte2: [
      {N: 4, Value: 4.5, Perc: 15},
      {N: 5, Value: 3.5, Perc: 15}
    ],
    LabExamHab: [
      {N: "Lab", Value: 4.5, Perc: 10},
      {N: "Exam", Value: 3.5, Perc: 30},
      {N: "Hab", Value: 0, Perc: 70}
    ],
    AcuFallasObsDef: [
      {N: "ACU", Value: 3.75},
      {N: "Fallas", Value: 1},
      {N: "OBS", Value: 0},
      {N: "DEF", Value: 3.7}
    ],
  }
];

  info_est = {
    nombre: "Neider Fabian Walteros Pinto",
    identificacion: 1118565127,
    codigo: "001118565127",
    codigo_programa: "001",
    nombre_programa: "Ingeniería Electrónica",
    promedio: 86,
    periodo_academico: "2022-01"
  };

}
