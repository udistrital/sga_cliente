import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'captura-notas',
  templateUrl: './captura-notas.component.html',
  styleUrls: ['./captura-notas.component.scss']
})
export class CapturaNotasComponent implements OnInit {
  settings: Object;
  dataSource: LocalDataSource;
  periodos: any;

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    ) {
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    })
  }

  ngOnInit() {
    this.periodosActivos()
    this.createTable();
  }

  createTable() {
    this.settings = {
      columns: {
        Identificacion: {
          title: this.translate.instant('notas.identificacion'),
          editable: false,
          width: '5%',
          filter: true,
        },
        Docente: {
          title: this.translate.instant('notas.docente'),
          editable: false,
          width: '20%',
          filter: true,
        },
        Codigo: {
          title: this.translate.instant('notas.codigo'),
          editable: false,
          width: '5%',
          filter: true,
        },
        Asignatura: {
          title: this.translate.instant('notas.asignatura'),
          editable: false,
          width: '20%',
          filter: true,
        },
        Nivel: {
          title: this.translate.instant('notas.nivel'),
          editable: false,
          width: '5%',
          filter: true,
        },
        Grupo: {
          title: this.translate.instant('notas.grupo'),
          editable: false,
          width: '5%',
          filter: true,
        },
        Inscritos: {
          title: this.translate.instant('notas.inscritos'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Proyecto_Academico: {
          title: this.translate.instant('notas.carrera'),
          editable: false,
          width: '30%',
          filter: true,
        },
        Estado: {
          title: this.translate.instant('notas.estado'),
          editable: false,
          width: '5%',
          filter: true,
        },
      },
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('notas.no_datos_captura_notas')
    };
  }

  filterPeriodo(periodo) {
    this.sgaMidService.get('notas/EstadosRegistros/'+periodo).subscribe(
      response => {
        if (response !== null && response.Status == '200') {
          this.dataSource.load(response.Data) 
        } else {
          this.popUpManager.showInfoToast(this.translate.instant('notas.no_datos_estados_registros'),3000)
          this.dataSource.load([])
        }
      },
      error => {
        this.popUpManager.showInfoToast(this.translate.instant('notas.no_datos_estados_registros'),3000)
        this.dataSource.load([])
      }
    );
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }
  
  periodosActivos() {
    this.sgaMidService.get('calendario_academico?limit=0').subscribe(
      (response: any) => {
        if (response !== null && (response.Response.Code == '404' || response.Response.Code == '400')) {
          this.popUpManager.showErrorAlert(this.translate.instant('calendario.sin_calendarios'));
        }
        else {
          this.periodos = response.Response.Body[1].filter(periodo => periodo.Activo === true);
          if (this.periodos === null) {
            this.popUpManager.showErrorAlert(this.translate.instant('calendario.sin_calendarios'));
          }
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

}
