import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NUEVO_TERCERO } from './form_new_tercero';
import { ToasterConfig } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { Lugar } from '../../../@core/data/models/lugar/lugar'
import { TipoTercero } from '../../../@core/data/models/terceros/tipo_tercero'

@Component({
  selector: 'ngx-new-tercero',
  templateUrl: './new-tercero.component.html',
  styleUrls: ['./new-tercero.component.scss'],
})
export class NewTercero implements OnInit {
  config: ToasterConfig;
  nuevoTercero: boolean = false;
  listaPaises: Lugar[];
  listaTipoTercero: TipoTercero[];

  @Output() eventChange = new EventEmitter();
  @Output('result')
  result: EventEmitter<any> = new EventEmitter();

  @Input('nit')
  set name(nit: number) {
    this.info_tercero = {
      Nit: nit,
    }
    this.formInfoNuevoTercero.campos[this.getIndexFormNew('Nit')].valor = nit;
    this.formInfoNuevoTercero.campos[this.getIndexFormNew('Nit')].deshabilitar = true;
  }
  terceroData = null;
  info_tercero: any;
  formInfoNuevoTercero: any;
  regInfoFormacionAcademica: any;
  temp_info_academica: any;
  clean: boolean;
  percentage: number;
  paisSelecccionado: any;
  infoComplementariaUniversidadId: number = 1;
  universidadConsultada: any;

  constructor(
    private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private store: Store<IAppState>) {
    this.formInfoNuevoTercero = NUEVO_TERCERO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadLists();
  }

  construirForm() {
    this.formInfoNuevoTercero.btn = this.translate.instant('GLOBAL.guardar');
    //this.formInfoNuevoTercero.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoNuevoTercero.campos.length; i++) {
      this.formInfoNuevoTercero.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoNuevoTercero.campos[i].label_i18n);
      this.formInfoNuevoTercero.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoNuevoTercero.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexFormNew(nombre: String): number {
    for (let index = 0; index < this.formInfoNuevoTercero.campos.length; index++) {
      const element = this.formInfoNuevoTercero.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  createInfoTercero(infoTercero: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('informacion_academica.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willMake) => {
        if (willMake.value) {
          if (infoTercero.Nit.includes('-')) {
            let nitAux = infoTercero.Nit.split('-');
            infoTercero.Nit = nitAux[0];
            infoTercero.Verificacion = nitAux[1];
          }

          this.sgaMidService.post('formacion_academica/post_tercero', infoTercero)
            .subscribe((data) => {
              this.result.emit({
                infoPost: infoTercero,
                infoReturn: data,
              });
            });
        }
      });
  }

  ngOnInit() {
    const opt2: any = {
      title: this.translate.instant('GLOBAL.info'),
      text: this.translate.instant('inscripcion.alerta_veracidad_informacion'),
      icon: 'warning',
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    };
    Swal.fire(opt2)
      .then((action2) => {
      });
  }

  setPercentage(event) {
    setTimeout(() => {
      this.percentage = event;
      // this.result.emit(this.percentage);
    });
  }

  validarFormNuevoTercero(event) {
    if (event.valid) {
      const formData = event.data.Tercero;
      this.createInfoTercero(formData)
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.listaTipoTercero = list.listTipoTercero;
        this.formInfoNuevoTercero.campos[this.getIndexFormNew('TipoTrecero')].opciones = this.listaTipoTercero[0];

        // Ajuste de nombre
        this.formInfoNuevoTercero.campos[this.getIndexFormNew('TipoTrecero')].opciones.forEach(tipo => {
          tipo.Nombre = tipo.Nombre.charAt(0) + tipo.Nombre.slice(1).toLowerCase().replaceAll('_', ' ');
        });

        this.listaPaises = list.listPais;
        this.formInfoNuevoTercero.campos[this.getIndexFormNew('Pais')].opciones = list.listPais[0];
      },
    );
  }
}
