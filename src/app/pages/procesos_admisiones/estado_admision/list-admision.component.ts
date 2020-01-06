import { Component, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { UserService } from '../../../@core/data/users.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { CoreService } from '../../../@core/data/core.service';
import { OikosService } from '../../../@core/data/oikos.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-list-admision',
  templateUrl: './list-admision.component.html',
  styleUrls: ['./list-admision.component.scss'],
})
export class ListAdmisionComponent implements OnInit {
  uid: number;
  uid2: number;
  cambiotab: boolean = false;
  cambiotab2: boolean = false;
  settings: any;
  data: any;
  persona_id: number;
  posgrados = [];
  periodo = [];
  selectedValuePrograma: any;
  selectedValuePeriodo: any;
  source: LocalDataSource = new LocalDataSource();

  @Output() eventChange = new EventEmitter();

  constructor(private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private coreService: CoreService,
    private userService: UserService,
    private programaService: OikosService) {
    this.persona_id = this.userService.getPersonaId();
    if (this.persona_id !== 0 && this.persona_id !== undefined && this.persona_id.toString() !== '' && this.persona_id.toString() !== 'NaN') {
      this.loadData();
    }
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
    this.settings = {
      hideSubHeader: true,
      edit: {
        editButtonContent: '<i class="nb-person"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-star"></i>',
      },
      actions: {
        columnTitle: '',
        add: false,
        edit: true,
        delete: true,
      },
      mode: 'external',
      columns: {
        ProgramaAcademicoId: {
          title: this.translate.instant('GLOBAL.programa_academico'),
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        PeriodoId: {
          title: this.translate.instant('GLOBAL.periodo_academico'),
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        EstadoInscripcionId: {
          title: this.translate.instant('GLOBAL.estado_admision'),
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    if (this.persona_id !== 0 && this.persona_id !== undefined && this.persona_id.toString() !== '') {
      this.inscripcionService.get('inscripcion/?query=PersonaId:' + this.persona_id +
        '&limit=0').subscribe(res => {
          if (res !== null) {
            const data = <Array<any>>res;
            for (let index = 0; index < data.length; index++) {
              const datos = data[index];
              this.programaService.get('dependencia/' + datos.ProgramaAcademicoId)
                .subscribe(programa => {
                  if (programa !== null) {
                    data[index].ProgramaAcademicoId = <any>programa;
                    this.coreService.get('periodo/' + datos.PeriodoId)
                    .subscribe(periodo => {
                      if (periodo !== null) {
                        data[index].PeriodoId = <any>periodo;
                        if (index === (data.length - 1)) {
                          this.source.load(data);
                        }
                      }
                    },
                      (error: HttpErrorResponse) => {
                        Swal({
                          type: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.cargar') + '-' +
                            this.translate.instant('GLOBAL.admisiones') + '|' +
                            this.translate.instant('GLOBAL.periodo_academico'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                  }
                },
                  (error: HttpErrorResponse) => {
                    Swal({
                      type: 'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      footer: this.translate.instant('GLOBAL.cargar') + '-' +
                        this.translate.instant('GLOBAL.admisiones') + '|' +
                        this.translate.instant('GLOBAL.programa_academico'),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                  });
            }
          }
        },
          (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.admision'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.source.load(<any>{});
    }
  }

  ngOnInit() {
    this.persona_id = this.userService.getPersonaId();
    if (this.persona_id !== 0 && this.persona_id !== undefined && this.persona_id.toString() !== '' && this.persona_id.toString() !== 'NaN') {
      this.loadData();
    }
  }

  onEdit(event): void {
    this.uid = event.data.Id;
    this.activetab();
  }

  onDelete(event): void {
    if (event.data.EstadoInscripcionId.Id === 2) {
      this.uid2 = event.data.Id;
      this.activetab2();
    }
  }

  onCreate(event): void {
    this.uid = 0;
    this.activetab();
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
      this.cambiotab2 = false;
    } else if (event.tabTitle === this.translate.instant('GLOBAL.formulario')) {
      this.cambiotab = true;
      this.cambiotab2 = false;
    } else {
      this.cambiotab = false;
      this.cambiotab2 = true;
    }
  }

  activetab2(): void {
    this.cambiotab2 = !this.cambiotab2;
  }

  selectTab2(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab2 = false;
    } else {
      this.cambiotab2 = true;
    }
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }

  itemselec(event): void {
  }

  crearInscripcion() {
    this.onCreate(true);
  }
}
