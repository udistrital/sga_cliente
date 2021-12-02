import { Component, Output, EventEmitter, Input } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { DOCENTE_PRACTICA } from './form-docente-practica';
import { UserService } from '../../../@core/data/users.service';
import { Docente } from '../../../@core/data/models/practicas_academicas/docente'
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-solicitante-practica',
  templateUrl: './solicitante-practica.component.html',
  styleUrls: ['../practicas-academicas.component.scss'],
})
export class SolicitantePracticaComponent {

  docenteSolicitante: any;
  source: LocalDataSource = new LocalDataSource();
  DocentePractica: Array<Docente> = [];
  docenteColaborador: any;
  info_persona_id: number;
  settings_authors: any;
  nuevoColaborador: boolean;
  nuevaSolicitud: boolean;
  docentesSolicitud: any;

  @Output('loading')
  loading: EventEmitter<any> = new EventEmitter();

  @Output('docentes')
  docentes: EventEmitter<any> = new EventEmitter();

  @Input('docentesSolicitud')
  set info(info: any) {
    if (info.length !== 0 && info.toString() !== '') {
      this.docentesSolicitud = info;
      this.nuevaSolicitud = false;
      this.loadData();
    } else {
      this.nuevaSolicitud = true;
      this.loadData();
    }
  }

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private sgamidService: SgaMidService,
  ) {
    this.docenteSolicitante = DOCENTE_PRACTICA;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.construirTabla();
    this.nuevoColaborador = false;
  }

  construirForm() {
    this.info_persona_id = this.userService.getPersonaId();
    this.docenteSolicitante.titulo = this.translate.instant('practicas_academicas.colaborador')
    this.docenteSolicitante.campos.forEach(campo => {
      campo.label = this.translate.instant('practicas_academicas.' + campo.label_i18n);
      campo.placeholder = this.translate.instant('practicas_academicas.placeholder_' + campo.placeholder_i18n);
    });
  }

  construirTabla() {
    this.settings_authors = {
      add: {
        addButtonContent: '<i class="nb-plus" title="' + this.translate.instant('practicas_academicas.tooltip_agregar') + '"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('practicas_academicas.tooltip_remover') + '"></i>',
        confirmDelete: true,
      },
      actions: {
        edit: false,
        position: 'right',
        columnTitle: this.translate.instant('practicas_academicas.actions')
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('practicas_academicas.nombre'),
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '30%',
        },
        TipoVinculacionId: {
          title: this.translate.instant('practicas_academicas.vinculacion'),
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          width: '30%',
        },
        Correo: {
          title: this.translate.instant('practicas_academicas.correo'),
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '25%',
        },
        Telefono: {
          title: this.translate.instant('practicas_academicas.telefono'),
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '30%',
        },
      },
    };
  }

  loadData(): void {
    this.source.load([]);
    if (this.nuevaSolicitud && this.docentesSolicitud === undefined) {
      this.sgamidService.get('practicas_academicas/consultar_solicitante/' + this.info_persona_id).subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Success !== 'false') {
          if (r.Status === '200' && res['Data'] !== null) {
            if (res['Data']['Correo'] === undefined) {
              if (res['Data']['CorreoInstitucional'] !== undefined) {
                res['Data']['Correo'] = res['Data']['CorreoInstitucional']
              } else if (res['Data']['CorreoPersonal'] !== undefined) {
                res['Data']['Correo'] = res['Data']['CorreoPersonal']
              }
            }

            if (res['Data']['Telefono'] === undefined) {
              if (res['Data']['Celular'] !== undefined) {
                res['Data']['Telefono'] = res['Data']['Celular']
              }
            }

            this.DocentePractica.push(res['Data']);
            this.source.load(this.DocentePractica);
            this.docentes.emit(this.DocentePractica);
          }
        }
        this.loading.emit(false);
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    } else {
      this.source.load(this.docentesSolicitud);
      this.settings_authors.actions.add = false;
      this.settings_authors.actions.delete = false;
    }
  }

  agregarColaborador(event) {
    let docente = <Docente>this.docenteColaborador;
    let existe = false;

    for (let i = 0; i < this.DocentePractica.length; i++) {
      const docenteAux = this.DocentePractica[i];

      if (docente.Id == docenteAux.Id) {
        existe = true;
        break;
      }
    }

    if (!existe) {
      this.DocentePractica.push(this.docenteColaborador);
      this.source.load(this.DocentePractica);

      this.docenteColaborador = undefined;
      this.nuevoColaborador = !this.nuevoColaborador;
      this.docentes.emit(this.DocentePractica)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('practicas_academicas.error_docente_ya_registrado'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  buscarColaborador(event) {
    if (event.data.docDocente !== '') {
      this.loading.emit(true);
      this.sgamidService.get('practicas_academicas/consultar_colaborador/' + event.data.docDocente).subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Success !== false) {
          if (r.Status === '200' && res['Data'] !== null) {
            if (res['Data']['Correo'] === undefined) {
              if (res['Data']['CorreoInstitucional'] !== undefined) {
                res['Data']['Correo'] = res['Data']['CorreoInstitucional']
              } else if (res['Data']['CorreoPersonal'] !== undefined) {
                res['Data']['Correo'] = res['Data']['CorreoPersonal']
              }
            }

            if (res['Data']['Telefono'] === undefined) {
              if (res['Data']['Celular'] !== undefined) {
                res['Data']['Telefono'] = res['Data']['Celular']
              }
            }

            this.docenteColaborador = res['Data'];
            this.docenteColaborador.Vinculacion = this.docenteColaborador.TipoVinculacionId.Nombre;
            this.popUpManager.showToast("success", this.translate.instant('practicas_academicas.docente_encontrado'), this.translate.instant('GLOBAL.operacion_exitosa'))
          }
        } else {
          this.docenteColaborador = undefined;
          this.docenteSolicitante.campos.forEach(campo => {
            if (campo.nombre !== "docDocente") {
              campo.valor = null;
            }
          });
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: this.translate.instant('practicas_academicas.error_docente_no_existe') + event.data.docDocente + '.',
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });

        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
      this.loading.emit(false);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('practicas_academicas.alerta_llenar_campo'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  onCreateColaborador(event): void {
    this.nuevoColaborador = !this.nuevoColaborador;
  }

  onDeleteColaborador(event): void {
    if (event.data.PuedeBorrar) {
      this.DocentePractica.splice(this.DocentePractica.indexOf(event.data), this.DocentePractica.indexOf(event.data));
      this.source.load(this.DocentePractica);
      this.docentes.emit(this.DocentePractica);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('practicas_academicas.error_docente_borrar'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }
}
