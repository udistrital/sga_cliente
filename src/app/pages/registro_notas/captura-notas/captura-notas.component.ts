import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'captura-notas',
  templateUrl: './captura-notas.component.html',
  styleUrls: ['./captura-notas.component.scss']
})
export class CapturaNotasComponent implements OnInit {
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
  }

  createTable() {
    this.settings = {
      columns: {
        Identificacion: {
          title: this.translate.instant('notas.identificacion'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Docente: {
          title: this.translate.instant('notas.docente'),
          editable: false,
          width: '20%',
          filter: false,
        },
        Codigo: {
          title: this.translate.instant('notas.codigo'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Asignatura: {
          title: this.translate.instant('notas.asignatura'),
          editable: false,
          width: '15%',
          filter: false,
        },
        Nivel: {
          title: this.translate.instant('notas.asignatura'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Grupo: {
          title: this.translate.instant('notas.grupo'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Inscritos: {
          title: this.translate.instant('notas.inscritos'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Carrera: {
          title: this.translate.instant('notas.carrera'),
          editable: false,
          width: '15%',
          filter: false,
        },
        Estado: {
          title: this.translate.instant('notas.estado'),
          editable: false,
          width: '10%',
          filter: false,
        },
      },
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('notas.no_datos_captura_notas')
    };
  }

  filterPeriodo(query: string = '') {
    console.log(query)
    if(query == '2022-01'){
      this.dataSource.load(this.data1);
    }
    if(query == '2022-02'){
      this.dataSource.load(this.data2);
    }
  }

  onSearch(query: string = '') {
    if(query == ''){
      this.dataSource.setFilter([]);
    }
    else{
      this.dataSource.setFilter([
        {
          field: this.translate.instant('notas.identificacion'),
          search: query
        },
        {
          field: this.translate.instant('notas.docente'),
          search: query
        }
      ], false);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  data1 = [{
    Identificacion: 1118565127,
    Docente: "Neider Fabian Pinto",
    Codigo: 1125,
    Asignatura: "Circuitos Electricos 1",
    Nivel: "Pregrado",
    Grupo: "001",
    Inscritos: 15,
    Carrera: "Ingenieria Electrónica",
    Estado: "Primer Corte"
  },
  {
    Identificacion: 1118555127,
    Docente: "Otro Neider Fabian",
    Codigo: 1125,
    Asignatura: "Microelectrónica aplicada",
    Nivel: "Posgrado",
    Grupo: "003",
    Inscritos: 1,
    Carrera: "Ingenieria Electrónica",
    Estado: "Primer Corte"
  }
];
  data2 = [
    {
      Identificacion: 1116565127,
      Docente: "Neider Pinto",
      Codigo: 1125,
      Asignatura: "Circuitos Electricos 1",
      Nivel: "Posgrado",
      Grupo: "001",
      Inscritos: 12,
      Carrera: "Ingenieria Electrónica",
      Estado: "Primer Corte"
    },
  ];
  
  periodos = [
    {
      value: '2022-01',
      viewValue: '2022-01'
    },
    {
      value: '2022-02',
      viewValue: '2022-02'
    },
  ];

}
