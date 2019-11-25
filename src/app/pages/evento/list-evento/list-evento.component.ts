import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { UserService } from '../../../@core/data/users.service';
import { CalendarioEventoPost } from './../../../@core/data/models/evento/calendario_evento';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as momentTimezone from 'moment-timezone';

@Component({
  selector: 'ngx-list-evento',
  templateUrl: './list-evento.component.html',
  styleUrls: ['./list-evento.component.scss'],
  })
export class ListEventoComponent implements OnInit {
  calendario_evento_selected: CalendarioEventoPost;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;

  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
    private campusMidService: CampusMidService,
    private user: UserService,
    private toasterService: ToasterService) {
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
    this.settings = {
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
        // Persona: {
        //   title: this.translate.instant('GLOBAL.persona'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Descripcion: {
          title: this.translate.instant('evento.evento'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '15%',
        },
        TipoEvento: {
          title: this.translate.instant('evento.tipo_evento'),
          // type: 'tipo_evento;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '15%',
        },
        Dependencia: {
          title: this.translate.instant('evento.dependencia'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '15%',
        },
        Periodo: {
          title: this.translate.instant('GLOBAL.periodo'),
          // type: 'string',
          valuePrepareFunction: (value) => {
            return value.Ano + '-' + value.Periodo;
          },
          width: '15%',
        },
        FechaInicio: {
          title: this.translate.instant('GLOBAL.fecha_inicio'),
          // type: 'string',
          valuePrepareFunction: (value) => {
            return momentTimezone.tz(value, 'America/Bogota').format('MM/DD/YYYY  HH:mm');
          },
          width: '15%',
        },
        FechaFin: {
          title: this.translate.instant('GLOBAL.fecha_fin'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return momentTimezone.tz(value, 'America/Bogota').format('MM/DD/YYYY  HH:mm');
          },
          width: '15%',
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    // this.campusMidService.get('evento/' + this.user.getPersonaId()).subscribe((res: any) => {
    this.campusMidService.get('evento/' + 6).subscribe((res: any) => {
      if (res !== null) {
        if (Object.keys(res.Body[0]).length > 0 && res.Type !== 'error') {
          const data = <Array<CalendarioEventoPost>>res.Body;
          this.source.load(data);
        } else {
           Swal({
            type: 'error',
            title: '404',
            text: this.translate.instant('ERROR.404'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      }
    }, (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

  ngOnInit() {
  }

  onEdit(event): void {
    if (event.data.RolPersona.RolEncargadoEventoId.Id === 1 || event.data.RolPersona.RolEncargadoEventoId.Id === 2) {
      this.calendario_evento_selected = event.data;
      this.activetab();
    } else {
      this.showToast('error', 'Error', this.translate.instant('evento.no_puede_borrar_evento'));
    }
  }

  onCreate(event): void {
    this.calendario_evento_selected = undefined;
    this.activetab();
  }

  onDelete(event): void {
    if (event.data.RolPersona.RolEncargadoEventoId.Id === 1) {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('evento.seguro_continuar_eliminar_evento'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
      };
      Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.campusMidService.delete('evento', event.data.CalendarioEvento).subscribe((res: any) => {
            if (res !== null) {
              if (res.Body.Id !== undefined) {
                this.source.load([]);
                this.loadData();
                this.showToast('info', 'Ok', this.translate.instant('evento.evento_eliminado'));
              } else {
                this.showToast('info', 'Error', this.translate.instant('evento.evento_no_eliminado'));
              }
            }
           }, (error: HttpErrorResponse) => {
            Swal({
              type: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
        }
      });
    // } else if (event.data.EstadoEnteAutorId.EstadoAutorProduccionId.Id !== 1) {
    } else {
       const opt: any = {
        title: 'Error',
        text: this.translate.instant('evento.no_puede_borrar_evento'),
        icon: 'warning',
        buttons: false,
      };
      Swal(opt);
    }
    /*
    else {
      this.showToast('error', 'Error', this.translate.instant('GLOBAL.accion_no_permitida'));
    }
    */
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }


  itemselec(event): void {
    // console.log("afssaf");
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

}
