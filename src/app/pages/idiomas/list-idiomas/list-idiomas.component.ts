import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { IdiomaService } from '../../../@core/data/idioma.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-list-idiomas',
  templateUrl: './list-idiomas.component.html',
  styleUrls: ['./list-idiomas.component.scss'],
})
export class ListIdiomasComponent implements OnInit {
  uid: number;
  inscripcion_id: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  source: LocalDataSource = new LocalDataSource();

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    if (inscripcion_id !== undefined && inscripcion_id !== 0 && inscripcion_id.toString() !== '') {
      this.inscripcion_id = inscripcion_id;
    }
  }

  @Output() eventChange = new EventEmitter();
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage: number;

  constructor(private translate: TranslateService,
    private idiomaService: IdiomaService,
    private userService: UserService,
    private toasterService: ToasterService) {
      this.loadData();
      this.cargarCampos();
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.cargarCampos();
      });
      this.loading = false;
    }

  cargarCampos() {
    this.settings = {
      actions: {
        columnTitle: '',
        add: false,
        edit: true,
        delete: true,
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      mode: 'external',
      columns: {
        Idioma: {
          title: this.translate.instant('GLOBAL.idioma'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        NivelEscribe: {
          title: this.translate.instant('GLOBAL.nivel_escribe'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        NivelEscucha: {
          title: this.translate.instant('GLOBAL.nivel_escucha'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        NivelHabla: {
          title: this.translate.instant('GLOBAL.nivel_habla'),
          width: '20%',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
        },
        NivelLee: {
          title: this.translate.instant('GLOBAL.nivel_lee'),
          width: '20%',
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
    this.loading = true;
    this.idiomaService.get('conocimiento_idioma/?query=Persona:' + this.userService.getEnte() +
      '&limit=0')
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const data = <Array<any>>res;
            this.loading = false;
            this.getPercentage(1);
            this.source.load(data);
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.idiomas'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
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
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('GLOBAL.eliminar') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.idiomaService.delete('conocimiento_idioma/', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', this.translate.instant('GLOBAL.eliminar'),
                this.translate.instant('GLOBAL.idioma') + ' ' +
                this.translate.instant('GLOBAL.confirmarEliminar'));
            }
          },
            (error: HttpErrorResponse) => {
              Swal({
                type: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                  this.translate.instant('GLOBAL.idioma'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        }
      });
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
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
