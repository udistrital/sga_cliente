import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { IdiomaService } from '../../../@core/data/idioma.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-list-idiomas',
  templateUrl: './list-idiomas.component.html',
  styleUrls: ['./list-idiomas.component.scss'],
})
export class ListIdiomasComponent implements OnInit {
  uid: number;
  inscripcion_id: number;
  cambiotab: boolean = false;
  settings: any;
  source: LocalDataSource = new LocalDataSource();

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    if (inscripcion_id !== undefined && inscripcion_id !== 0 && inscripcion_id.toString() !== '') {
      this.inscripcion_id = inscripcion_id;
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();
  @Output() bridge_create_inscripcion: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage: number;
  persona_id: number;

  constructor(
    private translate: TranslateService,
    private idiomaService: IdiomaService,
    private userService: UserService,
    private popUpManager: PopUpManager,
  ) {
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loading = false;
  }

  crear_inscripcion(data) {
    this.bridge_create_inscripcion.emit(data);
  }

  cargarCampos() {
    this.settings = {
      columns: {
        IdiomaId: {
          title: this.translate.instant('GLOBAL.idioma'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        NivelEscribeId: {
          title: this.translate.instant('GLOBAL.nivel_escribe'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        NivelEscuchaId: {
          title: this.translate.instant('GLOBAL.nivel_escucha'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        NivelHablaId: {
          title: this.translate.instant('GLOBAL.nivel_habla'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        NivelLeeId: {
          title: this.translate.instant('GLOBAL.nivel_lee'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
      },
      mode: 'external',
      actions: {
        add: false,
        edit: true,
        delete: true,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('idiomas.tooltip_editar') + '"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('idiomas.tooltip_eliminar') + '"></i>',
        confirmDelete: true,
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.loading = true;
    this.persona_id = this.userService.getPersonaId() || 1;
    // no tiene campo Activo ??? Activo:true,
    this.idiomaService.get('conocimiento_idioma?Activo:true,query=TercerosId:' + this.persona_id +
      '&limit=0')
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const data = <Array<any>>res;
          this.getPercentage(1);
          this.source.load(data);
        } else {
          this.getPercentage(0);
          this.source.load([])
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.' + error.status));
        });
  }

  onChange(event) {
    if (event) {
      this.uid = 0;
      this.loadData();
    }
  }

  getPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  onDelete(event): void {
    this.popUpManager.showConfirmAlert(this.translate.instant('idiomas.eliminar'))
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          event.data.Activo = false;
          this.idiomaService.put('conocimiento_idioma', event.data).subscribe(res => {
          //this.idiomaService.delete('conocimiento_idioma', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.popUpManager.showInfoToast(
                this.translate.instant('GLOBAL.idioma') + ' ' + this.translate.instant('GLOBAL.confirmarEliminar'), 5000
              );
            }
            this.loading = false;
          },
            (error: HttpErrorResponse) => {
              this.loading = false;
              this.popUpManager.showErrorAlert(this.translate.instant('ERROR.' + error.status))
            });
        }
        this.loading = false;
      });
  }

  ngOnInit() {
    this.uid = 0;
  }

  onEdit(event): void {
    this.uid = event.data.Id;
  }

  onCreate(event): void {
    this.uid = 0;
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  itemselec(event): void {
  }
}
