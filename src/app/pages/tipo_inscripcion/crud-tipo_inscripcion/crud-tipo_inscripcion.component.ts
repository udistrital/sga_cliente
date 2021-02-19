
import { TipoInscripcion } from './../../../@core/data/models/inscripcion/tipo_inscripcion';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { NivelFormacion } from '../../../@core/data/models/proyecto_academico/nivel_formacion';
import { PopUpManager } from '../../../managers/popUpManager';
import { FORM_TIPO_INSCRIPCION } from './form-tipo_inscripcion';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';

@Component({
  selector: 'ngx-crud-tipo-inscripcion',
  templateUrl: './crud-tipo_inscripcion.component.html',
  styleUrls: ['./crud-tipo_inscripcion.component.scss'],
})
export class CrudTipoInscripcionComponent implements OnInit {
  tipo_inscripcion_id: number;
  niveles: NivelFormacion[];

  @Input('tipo_periodo_id')
  set name(tipo_inscripcion_id: number) {
    this.tipo_inscripcion_id = tipo_inscripcion_id;
    this.loadTipoInscripcion();
  }

  @Output() eventChange = new EventEmitter();

  info_tipo_inscripcion: TipoInscripcion;
  formTipoInscripcion: any;
  regTipoInscripcion: any;
  clean: boolean;

  constructor(private translate: TranslateService, 
    private inscripcionService: InscripcionService,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private store: Store<IAppState>
    ) {
    this.formTipoInscripcion = FORM_TIPO_INSCRIPCION;
    this.nivel_load();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
   }

  construirForm() {
    this.formTipoInscripcion.titulo = this.translate.instant('tipo_inscripcion.sub_titulo');
    this.formTipoInscripcion.btn = this.translate.instant('GLOBAL.guardar');
    this.formTipoInscripcion.campos.forEach(campo => {
      campo.label = this.translate.instant('GLOBAL.' + campo.label_i18n);
      campo.placeholder = this.translate.instant('GLOBAL.placeholder_' + campo.label_i18n);
      if (campo.etiqueta === 'select') {
        campo.opciones = this.niveles;
      }
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  nivel_load() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: NivelFormacion[]) => {
        this.niveles = response.filter(nivel => nivel.NivelFormacionPadreId === null)
        this.construirForm();
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTipoInscripcion.campos.length; index++) {
      const element = this.formTipoInscripcion.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadTipoInscripcion(): void {
    if (this.tipo_inscripcion_id !== undefined && this.tipo_inscripcion_id !== 0) {
      this.inscripcionService.get('tipo_inscripcion/?query=id:' + this.tipo_inscripcion_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_tipo_inscripcion = <TipoInscripcion>res[0];
          }
        });
    } else  {
      this.info_tipo_inscripcion = undefined;
      this.clean = !this.clean;
    }
  }

  updateTipoInscripcion(tipoInscripcion: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('tipo_inscripcion.seguro_actualizar_tipo_inscripcion'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        if(tipoInscripcion['Activo'] == ''){
          tipoInscripcion.Activo = false;
        }
        if(tipoInscripcion['Especial'] == ''){
          tipoInscripcion.Especial = false;
        }
        tipoInscripcion.NivelId = tipoInscripcion['Nivel']['Id'];
        this.info_tipo_inscripcion = <TipoInscripcion>tipoInscripcion;
        this.inscripcionService.put('tipo_inscripcion', this.info_tipo_inscripcion)
          .subscribe(res => {
            this.loadTipoInscripcion();
            this.eventChange.emit(true);
            this.popUpManager.showSuccessAlert(this.translate.instant('tipo_inscripcion.tipo_inscripcion_actualizado'))
          });
      }
    });
  }

  createTipoInscripcion(tipoInscripcion: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('tipo_inscripcion.seguro_continuar_registrar_tipo_inscripcion'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        if(tipoInscripcion['Activo'] == ''){
          tipoInscripcion.Activo = false;
        }
        if(tipoInscripcion['Especial'] == ''){
          tipoInscripcion.Especial = false;
        }
        tipoInscripcion.NivelId = tipoInscripcion['Nivel']['Id'];
        this.info_tipo_inscripcion = <TipoInscripcion>tipoInscripcion;
        this.inscripcionService.post('tipo_inscripcion', this.info_tipo_inscripcion)
          .subscribe(res => {
            this.info_tipo_inscripcion = <TipoInscripcion><unknown>res;
            this.eventChange.emit(true);
            this.popUpManager.showSuccessAlert(this.translate.instant('tipo_periodo.tipo_periodo_creado'))
          });
      }
    });
  }

  ngOnInit() {
    this.loadTipoInscripcion();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_tipo_inscripcion === undefined) {
        this.createTipoInscripcion(event.data.TipoInscripcion);
      } else {
        this.updateTipoInscripcion(event.data.TipoInscripcion);
      }
    }
  }

}
