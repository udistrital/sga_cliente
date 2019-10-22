import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, Inject } from '@angular/core';
import { OikosService } from '../../../@core/data/oikos.service';
import { CoreService } from '../../../@core/data/core.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {FormBuilder, Validators, FormControl} from '@angular/forms';
import {ProyectoAcademicoPost} from '../../../@core/data/models/proyecto_academico/proyecto_academico_post'
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { HttpErrorResponse } from '@angular/common/http';
import { LocalDataSource } from 'ng2-smart-table';
import { UnidadTiempoService } from '../../../@core/data/unidad_tiempo.service';
import { ProyectoAcademicoInstitucion } from '../../../@core/data/models/proyecto_academico/proyecto_academico_institucion';
import { TipoTitulacion } from '../../../@core/data/models/proyecto_academico/tipo_titulacion';
import { Metodologia } from '../../../@core/data/models/proyecto_academico/metodologia';
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
import { RegistroCalificadoAcreditacion } from '../../../@core/data/models/proyecto_academico/registro_calificado_acreditacion';
import { TipoRegistro } from '../../../@core/data/models/proyecto_academico/tipo_registro';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { InstitucionEnfasis } from '../../../@core/data/models/proyecto_academico/institucion_enfasis';
import { Enfasis } from '../../../@core/data/models/proyecto_academico/enfasis';
import { Titulacion } from '../../../@core/data/models/proyecto_academico/titulacion';
import { TipoDependencia } from '../../../@core/data/models/oikos/tipo_dependencia';
import { DependenciaTipoDependencia } from '../../../@core/data/models/oikos/dependencia_tipo_dependencia';
import { Dependencia } from '../../../@core/data/models/oikos/dependencia';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import * as moment from 'moment';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
// import { CrudEnfasisComponent } from '../../enfasis/crud-enfasis/crud-enfasis.component';
import { ListEnfasisComponent } from '../../enfasis/list-enfasis/list-enfasis.component';
import { ListEnfasisService } from '../../../@core/data/list_enfasis.service';
import { Subscription } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { AnimationGroupPlayer } from '@angular/animations/src/players/animation_group_player';
import { ActivatedRoute } from '@angular/router';
import * as momentTimezone from 'moment-timezone';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { NuevoRegistro } from '../../../@core/data/models/proyecto_academico/nuevo_registro';
import { ListRegistroProyectoAcademicoComponent } from '../list-registro_proyecto_academico/list-registro_proyecto_academico.component';
@Component({
  selector: 'ngx-registro-proyecto-academico',
  templateUrl: './registro-proyecto_academico.component.html',
  styleUrls: ['./registro-proyecto_academico.component.scss'],
  })
export class RegistroProyectoAcademicoComponent implements OnInit {
  config: ToasterConfig;
  settings: any;

  resoluform: any;

  fecha_creacion: Date;
  fecha_vencimiento: string;
  fecha_vencimiento_mostrar: string;
  fecha_vigencia: string;
  registro_califacado_acreditacion: RegistroCalificadoAcreditacion;
  tipo_registro: TipoRegistro;
  fecha_calculada_vencimiento: string
  registro_nuevo: NuevoRegistro
  dpDayPickerConfig: any;


  Campo11Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo13Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo14Control = new FormControl('', [Validators.required]);
  Campo22Control = new FormControl('', [Validators.required, Validators.maxLength(2)]);
  Campo23Control = new FormControl('', [Validators.required, Validators.maxLength(1)]);
  @Output() eventChange = new EventEmitter();

  subscription: Subscription;
  source_emphasys: LocalDataSource = new LocalDataSource();
  arr_enfasis_proyecto: InstitucionEnfasis[] = [];
  settings_emphasys: any;

  constructor(private translate: TranslateService,
  @Inject(MAT_DIALOG_DATA) public data: any,
    private toasterService: ToasterService,
    private coreService: CoreService,
    private proyectoacademicoService: ProyectoAcademicoService,
    public dialogRef: MatDialogRef<ListRegistroProyectoAcademicoComponent>,
    private sgamidService: SgaMidService,
    private dialogService: NbDialogService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder) {
      this.dpDayPickerConfig = {
        locale: 'es',
        format: 'YYYY-MM-DD HH:mm',
        showTwentyFourHours: false,
        showSeconds: false,
        returnedValueType: 'String',
      }
     this.resoluform = formBuilder.group({
      resolucion: ['', Validators.required],
      ano_resolucion: ['', [Validators.required, Validators.maxLength(4)]],
      fecha_creacion: ['', Validators.required],
      mes_vigencia: ['', [Validators.required, Validators.maxLength(2)]],
      ano_vigencia: ['', [Validators.required, Validators.maxLength(1)]],
     })

  }


    mostrarfecha() {
      this.calculateEndDateMostrar(this.fecha_creacion, this.resoluform.value.ano_vigencia, this.resoluform.value.mes_vigencia, 0)
      this.fecha_calculada_vencimiento = this.fecha_vencimiento_mostrar
     }

     calculateEndDateMostrar (date: Date, years: number, months: number, days: number): Date {
      const convertDate = moment(date).add(years, 'year').add(months, 'month').add(days, 'day').format('YYYY-MM-DD');
      this.fecha_vencimiento_mostrar = convertDate
      return new Date(convertDate);
    }



  useLanguage(language: string) {
    this.translate.use(language);
  }
  ngOnInit() {

  }


  calculateEndDate (date: Date, years: number, months: number, days: number): Date {
    const convertDate = moment(date).add(years, 'year').add(months, 'month').add(days, 'day').format('YYYY-MM-DDTHH:mm:ss');
    this.fecha_vencimiento = convertDate
    return new Date(convertDate);
  }

  crearregistro() {
    if (this.resoluform.valid ) {

    this.calculateEndDate(this.fecha_creacion, this.resoluform.value.ano_vigencia, this.resoluform.value.mes_vigencia, 0)
    this.registro_nuevo = {
      AnoActoAdministrativoId: this.resoluform.value.ano_resolucion,
      NumeroActoAdministrativo: Number(this.resoluform.value.resolucion),
      // FechaCreacionActoAdministrativo: this.fecha_creacion + ':00Z',
      FechaCreacionActoAdministrativo: moment(this.fecha_creacion).format('YYYY-MM-DDTHH:mm') + ':00Z',
      VigenciaActoAdministrativo: 'Meses:' + this.resoluform.value.mes_vigencia + 'Años:' + this.resoluform.value.ano_vigencia,
      VencimientoActoAdministrativo: this.fecha_vencimiento + 'Z',
      EnlaceActo: 'Ejemploenalce.udistrital.edu.co',
      Activo: true,
      ProyectoAcademicoInstitucionId : {
        Id: this.data.IdProyecto,
      },
      TipoRegistroId: this.tipo_registro = {
        Id: Number(this.data.tipo_registro),
      },

    }

    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('historial_registro.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willCreate) => {
      if (willCreate.value) {
        this.sgamidService.post('proyecto_academico/' + String(this.data.endpoint + '/' + String(this.data.IdProyecto)), this.registro_nuevo)
        .subscribe((res: any) => {
          if (res.Type === 'error') {
            Swal({
              type: 'error',
               title: res.Code,
              text: this.translate.instant('ERROR.' + res.Code),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
            this.showToast('error', 'error', this.translate.instant('historial_registro.registro_no_creado'));
          } else {
            const opt1: any = {
              title: this.translate.instant('historial_registro.creado'),
              text: this.translate.instant('historial_registro.registro_creado'),
              icon: 'warning',
              buttons: true,
              dangerMode: true,
              showCancelButton: true,
            }; Swal(opt1)
            .then((willDelete) => {
              if (willDelete.value) {
              }
            });
            this.dialogRef.close();
          }
        });
      }
    });
  } else {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('proyecto.error_datos'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    }; Swal(opt1)
    .then((willDelete) => {
      if (willDelete.value) {

      }
    });
  }
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
