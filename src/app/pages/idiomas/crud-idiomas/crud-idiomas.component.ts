import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Idioma } from './../../../@core/data/models/idioma/idioma';
import { ClasificacionNivelIdioma } from './../../../@core/data/models/idioma/clasificacion_idioma';
import { NivelIdioma } from './../../../@core/data/models/idioma/nivel_idioma';
import { InfoIdioma } from './../../../@core/data/models/idioma/info_idioma';
import { FORM_IDIOMAS } from './form-idiomas';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { IdiomaService } from '../../../@core/data/idioma.service';
import { UserService } from '../../../@core/data/users.service';
import { PopUpManager } from '../../../managers/popUpManager';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { ListService } from '../../../@core/store/services/list.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { InscripcionService } from '../../../@core/data/inscripcion.service';

@Component({
  selector: 'ngx-crud-idiomas',
  templateUrl: './crud-idiomas.component.html',
})
export class CrudIdiomasComponent implements OnInit {
  info_idioma_id: number;
  inscripcion_id: number;

  @Input('info_idioma_id')
  set name(info_idioma_id: number) {
    this.info_idioma_id = info_idioma_id;
    this.loadInfoIdioma();
  }

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    if (inscripcion_id !== undefined && inscripcion_id !== 0 && inscripcion_id.toString() !== '') {
      this.inscripcion_id = inscripcion_id;
      this.cargarIdiomaExamen();
      if (this.formData) {
        this.createInfoIdioma(this.formData);
      }
    }
  }

  @Output() crear_inscripcion: EventEmitter<any> = new EventEmitter();

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_idioma: InfoIdioma;
  formInfoIdioma: any;
  formData: any;
  clean: boolean;
  percentage: number;
  persona_id: number;
  idioma_examen: any;
  idioma: number;
  canEmit: boolean = false;

  constructor(
    private translate: TranslateService,
    private users: UserService,
    private idiomaService: IdiomaService,
    private inscripcionService: InscripcionService,
    private store: Store<IAppState>,
    private listService: ListService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager) {
    this.formInfoIdioma = FORM_IDIOMAS;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findIdioma();
    this.listService.findNivelIdioma();
    this.listService.findClasificacionNivelIdioma();
    this.loadLists();

    this.persona_id = this.users.getPersonaId();
  }

  construirForm() {
    // this.formInfoIdioma.titulo = this.translate.instant('GLOBAL.idiomas');
    this.formInfoIdioma.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInfoIdioma.campos.length; i++) {
      this.formInfoIdioma.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoIdioma.campos[i].label_i18n);
      this.formInfoIdioma.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInfoIdioma.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoIdioma.campos.length; index++) {
      const element = this.formInfoIdioma.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  ngOnInit() {
    // this.loadInfoIdioma();
  }

  setPercentage(event) {
    this.percentage = event;
    if (this.canEmit) {
      this.result.emit(this.percentage);
      this.canEmit = false;
    }
  }

  cargarIdiomaExamen(): void {
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== '') {
      this.inscripcionService.get('inscripcion_posgrado/?query=InscripcionId:' + this.inscripcion_id)
        .subscribe(res => {
          const r = <any>res[0];
          if (res !== null && r.Type !== 'error' && JSON.stringify(res[0]).toString() !== '{}') {
            this.idioma_examen = r.Idioma;
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('idiomas.error_cargar_informacion_idiomas'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  createInfoIdioma(infoIdioma: any): void {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('idiomas.seguro_continuar_registrar'),
      this.translate.instant('GLOBAL.crear'),
    ).then((willDelete) => {
      if (willDelete.value) {
        this.info_idioma = <InfoIdioma>infoIdioma;
        if (this.info_idioma.Nativo != true) {
          this.info_idioma.Nativo = false
        }
        if (this.info_idioma.SeleccionExamen != true) {
          this.info_idioma.SeleccionExamen = false
        }
        this.info_idioma.TercerosId = this.persona_id || 1;
        if (this.info_idioma.Nativo === true && this.info_idioma.Nativo === this.info_idioma.SeleccionExamen) {
          this.popUpManager.showErrorAlert(this.translate.instant('idiomas.error_nativo_examen'));
        } else if (this.info_idioma.SeleccionExamen === true && this.idioma_examen !== undefined) {
          // this.info_idioma.Idioma.Id !== this.idioma_examen) {
          this.popUpManager.showErrorAlert(this.translate.instant('idiomas.doble_examen'))
        } else {
          this.info_idioma.Activo = true;
          this.idiomaService.post('conocimiento_idioma', this.info_idioma)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.Type !== 'error') {
                if (this.info_idioma.SeleccionExamen === true) {
                  const examen = {
                    Idioma: this.info_idioma.IdiomaId.Id,
                    Activo: true,
                    InscripcionId: { Id: Number(this.inscripcion_id) },
                  };
                  this.inscripcionService.post('inscripcion_posgrado/', examen)
                    .subscribe(resexamen => {
                      const rex = <any>resexamen;
                      if (rex !== null && rex.Type !== 'error') {
                        this.idioma_examen = this.info_idioma.IdiomaId.Id;
                        this.canEmit = true;
                        this.setPercentage(1);
                        this.eventChange.emit(true);
                        this.popUpManager.showSuccessAlert(this.translate.instant('idiomas.informacion_idioma_registrada'));
                        this.info_idioma_id = 0;
                        this.info_idioma = undefined;
                        this.clean = !this.clean;
                      }
                    },
                      (error: HttpErrorResponse) => {
                        Swal.fire({
                          icon: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('idiomas.informacion_idioma_no_registrada'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                } else {
                  this.eventChange.emit(true);
                  this.popUpManager.showSuccessAlert(this.translate.instant('idiomas.informacion_idioma_registrada'));
                  this.info_idioma_id = 0;
                  this.info_idioma = undefined;
                  this.clean = !this.clean;
                }
              }
            },
              (error: HttpErrorResponse) => {
                this.popUpManager.showErrorAlert(this.translate.instant('idiomas.informacion_idioma_no_registrada'))
              });
        }
      }
    });
  }

  public loadInfoIdioma(): void {
    if (this.info_idioma_id !== undefined && this.info_idioma_id !== 0 &&
      this.info_idioma_id.toString() !== '') {
      this.idiomaService.get('conocimiento_idioma/?query=Id:' + this.info_idioma_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_idioma = <InfoIdioma>res[0];
            this.idioma = this.info_idioma.IdiomaId.Id;
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('idiomas.error_cargar_informacion_idiomas'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.info_idioma = undefined;
      this.idioma = undefined;
      this.clean = !this.clean;
    }
  }

  updateInfoIdioma(infoIdioma: InfoIdioma) {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('idiomas.seguro_actualizar_idioma'),
      this.translate.instant('GLOBAL.actualizar'),
    ).then(willUpdate => {
      if (willUpdate.value) {
        this.info_idioma = infoIdioma;
        if (this.info_idioma.Nativo === true && this.info_idioma.Nativo === this.info_idioma.SeleccionExamen) {
          this.popUpManager.showErrorAlert(this.translate.instant('idiomas.error_nativo_examen'));
        } else if (this.info_idioma.SeleccionExamen === true && this.idioma_examen !== undefined) {
          // this.info_idioma.Idioma.Id !== this.idioma_examen) {
          this.popUpManager.showErrorAlert(this.translate.instant('idiomas.doble_examen'))
        } else {
          this.idiomaService.put('conocimiento_idioma', this.info_idioma).subscribe(
            (resp: any) => {
              if (resp !== null && resp.Type !== 'error') {
                this.canEmit = true;
                this.setPercentage(1);
                this.popUpManager.showSuccessAlert(this.translate.instant('idiomas.informacion_idioma_actualizada'));
                this.eventChange.emit(true);
              }
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
            },
          )
        }
      }
    })
  }

  validarForm(event) {
    if (event.valid) {
      this.formData = event.data.InfoIdioma;
      if (!this.inscripcion_id) {
        this.crear_inscripcion.emit(this.formData);
      } else {
        if (this.info_idioma_id !== undefined && this.info_idioma_id !== 0 &&
          this.info_idioma_id.toString() !== '') {
          this.updateInfoIdioma(this.formData);
        } else {
          this.createInfoIdioma(this.formData);
        }
      }
      //this.result.emit(event);
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formInfoIdioma.campos[this.getIndexForm('IdiomaId')].opciones = list.listIdioma[0];
        this.formInfoIdioma.campos[this.getIndexForm('NivelEscribeId')].opciones = list.listNivelIdioma[0];
        this.formInfoIdioma.campos[this.getIndexForm('NivelEscuchaId')].opciones = list.listNivelIdioma[0];
        this.formInfoIdioma.campos[this.getIndexForm('NivelHablaId')].opciones = list.listNivelIdioma[0];
        this.formInfoIdioma.campos[this.getIndexForm('NivelLeeId')].opciones = list.listNivelIdioma[0];
        this.formInfoIdioma.campos[this.getIndexForm('NivelId')].opciones = list.listClasificacionNivelIdioma[0];
      },
    );
  }

}
