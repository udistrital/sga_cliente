import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { UserService } from '../../../@core/data/users.service';
import { ProduccionAcademicaPost } from '../../../@core/data/models/produccion_academica/produccion_academica';
import { HttpErrorResponse } from '@angular/common/http';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { MatTableDataSource } from '@angular/material';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { OikosService } from '../../../@core/data/oikos.service';
import { CoreService } from '../../../@core/data/core.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { UnidadTiempoService } from '../../../@core/data/unidad_tiempo.service';
import { Observable, of } from 'rxjs';
import { ProyectoAcademicoInstitucion } from '../../../@core/data/models/proyecto_academico/proyecto_academico_institucion';
import { tap } from 'rxjs/operators';



@Component({
  selector: 'ngx-consulta-proyecto-academico',
  templateUrl: './consulta-proyecto_academico.component.html',
  styleUrls: ['./consulta-proyecto_academico.component.scss'],
  })
export class ConsultaProyectoAcademicoComponent implements OnInit {
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  dataSource: any;
  index: any;
  basicform: FormGroup;
  resoluform: any;
  actoform: any;
  compleform: any;
  facultad = [];
  area = [];
  opcionSeleccionadoFacultad: any;
  opcionSeleccionadoUnidad: any;
  opcionSeleccionadoArea: any;
  opcionSeleccionadoNucleo: any;
  opcionSeleccionadoEnfasis: any;
  opcionSeleccionadoNivel: any;
  opcionSeleccionadoMeto: any;
  checkenfasis: boolean = false;
  checkciclos: boolean = false;
  checkofrece: boolean = false;
  basico_tem: any;
  basico: ProyectoAcademicoInstitucion;
  info_basico: Observable<ProyectoAcademicoInstitucion>;

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  Campo3Control = new FormControl('', [Validators.required]);
  Campo4Control = new FormControl('', [Validators.required]);
  Campo5Control = new FormControl('', [Validators.required]);
  Campo6Control = new FormControl('', [Validators.required]);
  Campo7Control = new FormControl('', [Validators.required]);
  Campo8Control = new FormControl('', [Validators.required]);
  Campo9Control = new FormControl('', [Validators.required]);
  Campo10Control = new FormControl('', [Validators.required]);
  Campo11Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo12Control = new FormControl('', [Validators.required]);
  Campo13Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo14Control = new FormControl('', [Validators.required]);
  Campo15Control = new FormControl('', [Validators.required]);
  Campo16Control = new FormControl('', [Validators.required]);
  Campo17Control = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  Campo18Control = new FormControl('', [Validators.required]);
  Campo19Control = new FormControl('', [Validators.required]);
  Campo20Control = new FormControl('', [Validators.required]);
  Campo21Control = new FormControl('', [Validators.required]);
  CampoCorreoControl = new FormControl('', [Validators.required, Validators.email]);
  CampoCreditosControl = new FormControl('', [Validators.required, Validators.maxLength(4)]);
  selectFormControl = new FormControl('', Validators.required);

  @Input() idproyecto: any;
  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
   private toasterService: ToasterService,
    private oikosService: OikosService,
    private coreService: CoreService,
    private proyectoacademicoService: ProyectoAcademicoService,
    private sgamidService: SgaMidService,
    public dialog: MatDialog,
    private unidadtiempoService: UnidadTiempoService,
    private formBuilder: FormBuilder) {
     this.resoluform = formBuilder.group({
      resolucion: ['', Validators.required],
      ano_resolucion: ['', [Validators.required, Validators.maxLength(4)]],
      fecha_creacion: ['', Validators.required],
      fecha_vigencia: ['', Validators.required],
     })
     this.actoform = formBuilder.group({
      acto: ['', Validators.required],
      ano_acto: ['', [Validators.required, Validators.maxLength(4)]],
     })
     this.compleform = formBuilder.group({
       titulacion_snies: ['', Validators.required],
       titulacion_mujer: ['', Validators.required],
       titulacion_hombre: ['', Validators.required],
       competencias: ['', Validators.required],
     });
    }


  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.basicform = this.formBuilder.group({
      codigo_snies: ['', Validators.required],
      nombre_proyecto: ['', Validators.required],
      abreviacion_proyecto: ['', Validators.required],
      correo_proyecto: ['', [Validators.required, Validators.email]],
      numero_proyecto: ['', Validators.required],
      creditos_proyecto: ['', [Validators.required, Validators.maxLength(4)]],
      duracion_proyecto: ['', Validators.required],
   })
    // this.info_basico = this.loadproyectos().pipe(
    //   tap(info_basico => this.basicform.patchValue(info_basico)),
    // )
     this.loadproyectos();
     this.basicform.controls['nombre_proyecto'].setValue('prueba');

  }

  loadproyectos() {
    const opt1: any = {
      title: this.translate.instant('GLOBAL.atencion'),
      text: this.translate.instant('oferta.evento'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    }
    this.proyectoacademicoService.get('tr_proyecto_academico/' + 6 )
    .subscribe(res => {
    if (res !== null && res[0] !== 'error') {
      this.basico_tem = res;

      console.info(this.basico_tem)

    }else {
      Swal(opt1)
      .then((willDelete) => {
        if (willDelete.value) {
        }
      });
    }
  },
  (error: HttpErrorResponse) => {
    Swal({
      type: 'error',
      title: error.status + '',
      text: this.translate.instant('ERROR.' + error.status),
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    });
  });
  }

  orginizardatos() {
    

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
