import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { DescuentoAcademicoService } from '../../../@core/data/descuento_academico.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { SolicitudDescuento } from '../../../@core/data/models/descuento/solicitud_descuento';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-list-descuento-academico',
  templateUrl: './list-descuento_academico.component.html',
  styleUrls: ['./list-descuento_academico.component.scss'],
})
export class ListDescuentoAcademicoComponent implements OnInit {
  uid: number;
  persona: number;
  programa: number;
  periodo: number;
  inscripcion: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  source: LocalDataSource = new LocalDataSource();
  data: Array<SolicitudDescuento>;
  solicituddescuento: any;

  @Input('persona_id')
  set info(info: number) {
    this.persona = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion = info2;
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
      this.loadData();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage: number;

  constructor(private translate: TranslateService,
    private mid: CampusMidService,
    private descuentoService: DescuentoAcademicoService,
    private inscripcionService: InscripcionService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private toasterService: ToasterService) {
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loadData();
    this.loading = false;
  }

  cargarCampos() {
    this.settings = {
      columns: {
        DescuentosDependenciaId: {
          title: this.translate.instant('GLOBAL.tipo_descuento_matricula'),
          width: '100%',
          valuePrepareFunction: (value) => {
            return value.TipoDescuentoId.Nombre;
          },
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        add: false,
        edit: true,
        delete: false,
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('GLOBAL.tooltip_editar_registro') + '"></i>',
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    // this.inscripcionService.get('inscripcion/' + this.inscripcion)
    //   .subscribe(dato_inscripcion => {
    //     const inscripciondata = <any>dato_inscripcion;
    //     this.programa = inscripciondata.ProgramaAcademicoId;
    //     this.periodo = inscripciondata.PeriodoId;
    //     this.programa = 16;
    this.loading = true;
        this.sgaMidService.get('descuento_academico/descuentopersonaperiododependencia?' +
          'PersonaId=' + Number(window.localStorage.getItem('persona_id')) + '&DependenciaId=' +
          Number(window.sessionStorage.getItem('ProgramaAcademicoId')) + '&PeriodoId=' + Number(window.sessionStorage.getItem('IdPeriodo')))
          .subscribe((result: any) => {
            const r = <any>result.Data.Body[1];
                if (result !== null && result.Data.Code == '404') {
                  this.popUpManager.showAlert('', this.translate.instant('inscripcion.sin_descuento'));
                }else {
                  this.data = <Array<SolicitudDescuento>>r;
                  this.getPercentage(1);
                  this.source.load(this.data);
                }
                this.loading = false;
          },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.cargar') + '-' +
                  this.translate.instant('GLOBAL.descuento_matricula') + '|' +
                  this.translate.instant('GLOBAL.descuento_matricula'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        // this.descuentoService.get('descuentos_dependencia/?query=DependenciaId:' + this.programa +
        //   ',PeriodoId:' + this.periodo + '&limit=0')
        //   .subscribe(descuentos => {
        //     const descuentosdependencia = <Array<any>>descuentos;
        //     this.data = [];
        //     descuentosdependencia.forEach(element => {
        //       this.descuentoService.get('solicitud_descuento/?query=DescuentosDependenciaId:' + element.Id + ',PersonaId:' + this.persona + '&limit=0')
        //         .subscribe(solicitud => {
        //           if (solicitud !== null && JSON.stringify(solicitud[0]) !== '{}') {
        //             this.solicituddescuento = <any>solicitud[0];
        //             if (this.solicituddescuento.Id !== undefined && this.solicituddescuento.Id !== null) {
        //               const id_aux = this.solicituddescuento.Id;
        //               this.mid.get('descuento_academico/?PersonaId=' + this.persona + '&SolicitudId=' + id_aux)
        //                 .subscribe(res => {
        //                   console.info(JSON.stringify(res))
        //                   if (res !== null) {
        //                     this.data.push(<SolicitudDescuento>res);
        //                     this.loading = false;
        //                     this.getPercentage(1);
        //                     this.source.load(this.data);
        //                   }
        //                 },
        //                   (error: HttpErrorResponse) => {
        //                     Swal.fire({
        //                       icon:'error',
        //                       title: error.status + '',
        //                       text: this.translate.instant('ERROR.' + error.status),
        //                       footer: this.translate.instant('GLOBAL.cargar') + '-' +
        //                         this.translate.instant('GLOBAL.descuento_matricula') + '|' +
        //                         this.translate.instant('GLOBAL.descuento_matricula'),
        //                       confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        //                     });
        //                   });
        //             }
        //           }
        //         },
        //           (error: HttpErrorResponse) => {
        //             Swal.fire({
        //               icon:'error',
        //               title: error.status + '',
        //               text: this.translate.instant('ERROR.' + error.status),
        //               footer: this.translate.instant('GLOBAL.cargar') + '-' +
        //                 this.translate.instant('GLOBAL.descuento_matricula') + '|' +
        //                 this.translate.instant('GLOBAL.descuento_matricula'),
        //               confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        //             });
        //         });
        //     });
        //   },
        //     (error: HttpErrorResponse) => {
        //       Swal.fire({
        //         icon:'error',
        //         title: error.status + '',
        //         text: this.translate.instant('ERROR.' + error.status),
        //         footer: this.translate.instant('GLOBAL.cargar') + '-' +
        //           this.translate.instant('GLOBAL.descuento_matricula') + '|' +
        //           this.translate.instant('GLOBAL.descuentos_dependencia'),
        //         confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        //       });
        //     });
      // },
      //   (error: HttpErrorResponse) => {
      //     Swal.fire({
      //       icon:'error',
      //       title: error.status + '',
      //       text: this.translate.instant('ERROR.' + error.status),
      //       footer: this.translate.instant('GLOBAL.cargar') + '-' +
      //         this.translate.instant('GLOBAL.descuento_matricula') + '|' +
      //         this.translate.instant('GLOBAL.admision'),
      //       confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      //     });
      // });
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

  onDelete(event): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('GLOBAL.eliminar') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          this.mid.delete('descuento_academico', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', this.translate.instant('GLOBAL.eliminar'),
                this.translate.instant('GLOBAL.descuento_matricula') + ' ' +
                this.translate.instant('GLOBAL.confirmarEliminar'));
            }
            this.loading = false;
          },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                  this.translate.instant('GLOBAL.descuento_matricula'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        }
        this.loading = false;
      });
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
      this.uid = 0;
      this.loadData();
    }
  }

  itemselec(event): void {
  }

  getPercentage(event) {
    this.percentage = event;
    this.result.emit(this.percentage);
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
