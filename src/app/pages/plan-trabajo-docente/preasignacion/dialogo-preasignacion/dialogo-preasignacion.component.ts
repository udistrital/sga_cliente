import { Component, Inject, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../../managers/popUpManager';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, startWith } from 'rxjs/operators';
import { AnyService } from '../../../../@core/data/any.service';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ParametrosService } from '../../../../@core/data/parametros.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SgaMidService } from '../../../../@core/data/sga_mid.service';
import { EspaciosAcademicosService } from '../../../../@core/data/espacios_academicos.service';

@Component({
  selector: 'dialogo-preasignacion',
  templateUrl: './dialogo-preasignacion.component.html',
  styleUrls: ['./dialogo-preasignacion.component.scss']
})
export class dialogoPreAsignacionPtdComponent implements OnInit {

  modificando: boolean = true;
  loading: boolean;
  preasignacionForm: FormGroup;
  searchTerm$ = new Subject<any>();
  docente: any;
  opcionesDocente: any[];
  opcionesEspaciosAcademicos: any[] = [];
  opcionesProyectos: any[] = [];
  opcionesGrupos: any[] = [];
  opcionesGruposTodas: any[] = [];
  periodos = [];
  filteredDocentes: Observable<string[]>;
  periodo: any;
  tipoVinculacion = [{ id: 293, nombre: 'Carrera tiempo completo' },
  { id: 294, nombre: 'Carrera medio tiempo' },
  { id: 296, nombre: 'Tiempo completo ocasional' },
  { id: 297, nombre: 'Hora cátedra prestaciones' },
  { id: 298, nombre: 'Medio tiempo ocasional' },
  { id: 299, nombre: 'Hora cátedra por honorarios' }];
  documento_docente: any;
  espacio_academico: any;
  grupo: any;

  constructor(
    public dialogRef: MatDialogRef<dialogoPreAsignacionPtdComponent>,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private sgaMidService: SgaMidService,
    private espaciosAcademicosService: EspaciosAcademicosService,
    private parametrosService: ParametrosService,
    private anyService: AnyService,
    private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.loading = true;

    if (this.data.docente == undefined) {
      this.modificando = false;
      this.data = {
        tipo_vinculacion_id: null,
        docente: null,
        codigo: null,
        espacio_academico: null,
        grupo: null,
        proyecto: null,
        nivel: null,
        periodo_id: null,
        doc_docente: null,
      };
      this.preasignacionForm = this.builder.group({
        tipo_vinculacion: [this.data.tipo_vinculacion_id, Validators.required],
        docente: [this.data.docente, Validators.required],
        codigo: [this.data.codigo, Validators.required],
        espacio_academico: [this.data.espacio_academico, Validators.required],
        grupo: [this.data.grupo, Validators.required],
        proyecto: [this.data.proyecto, Validators.required],
        nivel: [this.data.nivel, Validators.required],
        periodo: [this.data.periodo_id, Validators.required],
        doc_docente: [this.data.doc_docente, Validators.required],
      });
    } else {
      this.preasignacionForm = this.builder.group({
        tipo_vinculacion: [this.data.tipo_vinculacion_id, Validators.required],
        docente: [this.data.docente.toLocaleLowerCase(), Validators.required],
        codigo: [this.data.codigo, Validators.required],
        espacio_academico: [this.data.espacio_academico, Validators.required],
        grupo: [this.data.grupo, Validators.required],
        proyecto: [this.data.proyecto, Validators.required],
        nivel: [this.data.nivel, Validators.required],
        periodo: [this.data.periodo_id, Validators.required],
        doc_docente: [this.documento_docente, Validators.required],
      });
    }

    this.loading = true;
    this.cargarPeriodo().then(() => {
      this.cargarEspaciosAcademicos().then(() => {
        if (this.modificando) {
          this.loadPreasignacion();
        }
        this.loading = false;
      });
    });

    this.dialogRef.backdropClick().subscribe(() => { this.dialogRef.close(); });
    this.opcionesDocente = []
    this.searchTerm$
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        filter(data => (data.text).length > 3),
        switchMap(({ text, field }) => this.buscarNombreDocentes(text, field)),
      ).subscribe((response: any) => {

        this.opcionesDocente = response.queryOptions.Data.filter((value, index, array) => index == array.findIndex(item => item.Id == value.Id));
        this.loading = false;
      });
  }

  ngOnInit() {
    this.preasignacionForm.get("docente").disable();
    this.preasignacionForm.get("codigo").disable();
    this.preasignacionForm.get("espacio_academico").disable();
    this.preasignacionForm.get("grupo").disable();
    this.preasignacionForm.get("proyecto").disable();
    this.preasignacionForm.get("nivel").disable();
    this.preasignacionForm.get("doc_docente").disable();

    this.filteredDocentes = this.preasignacionForm.get("docente").valueChanges.pipe(startWith(''), map(value => this._filterDocente(value || '')));
    this.preasignacionForm.get("tipo_vinculacion").valueChanges.subscribe(value => {
      if (this.preasignacionForm.get("periodo").value != null) {
        this.preasignacionForm.get("docente").enable();
        this.preasignacionForm.get("doc_docente").enable();
      }
    });

    this.preasignacionForm.get("periodo").valueChanges.subscribe(value => {
      if (this.preasignacionForm.get("tipo_vinculacion").value != null) {
        this.preasignacionForm.get("docente").enable();
        this.preasignacionForm.get("doc_docente").enable();
      }
    });
    this.loading = false;
  }

  private _filterDocente(value: string): string[] {
    if (value.length > 1) {
      const filterValue = value.toLowerCase();
      if (this.opcionesDocente.length > 0) {
        return this.opcionesDocente.filter(option => option.Nombre.toLowerCase().includes(filterValue));
      }
    }
    return [];
  }

  enviarPreasignacion() {
    if (this.preasignacionForm.valid) {
      let request = {
        "docente_id": String(this.docente.Id),
        "tipo_vinculacion_id": String(this.preasignacionForm.get("tipo_vinculacion").value),
        "espacio_academico_id": this.grupo.Id,
        "periodo_id": String(this.periodo.Id),
        "aprobacion_docente": false,
        "aprobacion_proyecto": false,
        "activo": true
      }

      if (this.modificando) {
        this.anyService.put(environment.PLAN_TRABAJO_DOCENTE_SERVICE, 'pre_asignacion/' + this.data.id, request).subscribe(
          (response: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('ptd.preasignacion_actualizada'));
            this.dialogRef.close();
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_actualizar_preasignacion'));
          },
        );
      } else {
        this.anyService.post(environment.PLAN_TRABAJO_DOCENTE_SERVICE, 'pre_asignacion', request).subscribe(
          (response: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('ptd.preasignacion_creada'));
            this.dialogRef.close();
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_crear_preasignacion'));
          },
        );
      }
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('ptd.alerta_campos_preasignacion'));
    }
  }

  eliminarPreasignacion() {
    this.anyService.delete(environment.PLAN_TRABAJO_DOCENTE_SERVICE, 'pre_asignacion', { Id: this.data.id }).subscribe(
      (response: any) => {
        this.popUpManager.showSuccessAlert(this.translate.instant('ptd.preasignacion_eliminada'));
        this.dialogRef.close();
      }
    );
  }

  cancelar() {
    this.dialogRef.close();
  }

  buscarNombreDocentes(text, field) {
    let query = `plan_trabajo_docente/docentes_nombre/${text}/${this.preasignacionForm.get("tipo_vinculacion").value}`;
    const channelOptions = new BehaviorSubject<any>({ field: field });
    const options$ = channelOptions.asObservable();
    const queryOptions$ = this.anyService.get(environment.SGA_MID_SERVICE, query)

    return combineLatest([options$, queryOptions$]).pipe(
      map(([options$, queryOptions$]) => ({
        options: options$,
        queryOptions: queryOptions$,
        keyToFilter: text,
      })),
    );
  }

  setDocente(element) {
    this.docente = element.option.value;
    this.documento_docente = this.docente.Documento;
    this.preasignacionForm.get("doc_docente").setValue(this.documento_docente);
    this.preasignacionForm.get("docente").setValue(element.option.value.Nombre);
    this.preasignacionForm.get("codigo").enable();
    this.preasignacionForm.get("espacio_academico").enable();
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA,activo:true&sortby=Id&order=desc&limit=0')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = res.Data.find(p => p.Activo);
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  cargarEspaciosAcademicos() {
    return new Promise((resolve, reject) => {
      this.espaciosAcademicosService.get('espacio-academico?query=activo:true,espacio_academico_padre&limit=0&fields=codigo,nombre,_id')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.opcionesEspaciosAcademicos = <any[]>res['Data'];
            resolve(this.opcionesEspaciosAcademicos);
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  buscarDocenteDocumento() {
    if (this.preasignacionForm.get("doc_docente").value != null) {
      this.loading = true;
      this.sgaMidService.get(`plan_trabajo_docente/docente_documento/${this.preasignacionForm.get("doc_docente").value}/${this.preasignacionForm.get("tipo_vinculacion").value}`).subscribe((res: any) => {
        this.loading = false;
        if (res !== null && res.Status === '200') {
          this.docente = res.Data[0];
          this.documento_docente = this.docente.Documento;
          this.preasignacionForm.get("doc_docente").setValue(this.docente.Documento);
          this.preasignacionForm.get("docente").setValue(this.docente.Nombre);
          this.preasignacionForm.get("codigo").enable();
          this.preasignacionForm.get("espacio_academico").enable();
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_docente'));
        }
      }, (error: HttpErrorResponse) => {
        this.loading = false;
        this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_docente'));
      });
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_doc_docente'));
    }
  }

  buscarEspacioAcademico() {
    this.loading = true;
    if (this.preasignacionForm.get("codigo").value != null) {
      this.espaciosAcademicosService.get(`espacio-academico?query=codigo:${this.preasignacionForm.get("codigo").value},activo:true,espacio_academico_padre&fields=codigo,nombre,_id`).subscribe((res: any) => {
        this.loading = false;
        if (res !== null && res.Status === '200') {
          this.preasignacionForm.get("espacio_academico").setValue(this.opcionesEspaciosAcademicos.find(espacio => espacio._id == res.Data[0]._id));

          this.preasignacionForm.get("grupo").enable();
          this.preasignacionForm.get("proyecto").enable();
          this.preasignacionForm.get("nivel").enable();
        } else {
          this.preasignacionForm.get("espacio_academico").setValue(null);
          this.preasignacionForm.get("grupo").disable();
          this.preasignacionForm.get("proyecto").disable();
          this.preasignacionForm.get("nivel").disable();
          this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_espacio_academico'));
        }
      }, (error: HttpErrorResponse) => {
        this.loading = false;
        this.preasignacionForm.get("espacio_academico").setValue(null);
        this.preasignacionForm.get("grupo").disable();
        this.preasignacionForm.get("proyecto").disable();
        this.preasignacionForm.get("nivel").disable();
        this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_espacio_academico'));
      });
    } else {
      this.preasignacionForm.get("espacio_academico").setValue(null);
      this.preasignacionForm.get("grupo").disable();
      this.preasignacionForm.get("proyecto").disable();
      this.preasignacionForm.get("nivel").disable();
      this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_codigo'));
    }
  }

  loadProyectos() {
    return new Promise((resolve, reject) => {
      if (this.preasignacionForm.get("espacio_academico").value != null) {
        this.espacio_academico = this.preasignacionForm.get("espacio_academico").value;
        this.preasignacionForm.get("codigo").setValue(this.espacio_academico.codigo);
        this.preasignacionForm.get("grupo").enable();
        this.preasignacionForm.get("proyecto").enable();
        this.preasignacionForm.get("nivel").enable();

        this.sgaMidService.get(`plan_trabajo_docente/grupos_espacio_academico/${this.espacio_academico._id}/${this.periodo.Id}`).subscribe((res: any) => {
          if (res !== null && res.Status === '200') {
            this.opcionesGrupos = res.Data;
            this.opcionesGruposTodas = res.Data;
            res.Data.forEach(element => {
              if (!this.opcionesProyectos.some(opcion => opcion === element.ProyectoAcademico)) {
                this.opcionesProyectos.push(element.ProyectoAcademico);
              }
            });
            resolve(this.opcionesGrupos);
          }
        }, (error: HttpErrorResponse) => {
          this.popUpManager.showErrorAlert(this.translate.instant('ptd.error_no_found_proyectos'));
          reject(this.opcionesGrupos);
        });

      } else {
        this.preasignacionForm.get("codigo").setValue(null);
        this.preasignacionForm.get("grupo").disable();
        this.preasignacionForm.get("proyecto").disable();
        this.preasignacionForm.get("nivel").disable();
        reject(this.opcionesGrupos);
      }
    });
  }

  changeProyecto() {
    if (this.preasignacionForm.get("proyecto").value != null) {
      let proyecto = this.preasignacionForm.get("proyecto").value;
      let auxGrupos = [];
      this.opcionesGruposTodas.forEach(element => {
        if (element.ProyectoAcademico === proyecto) {
          auxGrupos.push(element);
        }
      });
      this.opcionesGrupos = auxGrupos;
      this.preasignacionForm.get("nivel").setValue(auxGrupos[0].Nivel);
    } else {
      this.opcionesGrupos = this.opcionesGruposTodas;
      this.preasignacionForm.get("nivel").setValue(null);
      this.preasignacionForm.get("grupo").setValue(null);
    }
  }

  changeGrupo() {
    if (this.preasignacionForm.get("grupo").value != null) {
      this.grupo = this.preasignacionForm.get("grupo").value;
      this.preasignacionForm.get("nivel").setValue(this.grupo.Nivel);
      this.preasignacionForm.get("proyecto").setValue(this.grupo.ProyectoAcademico);
    } else {
      this.preasignacionForm.get("nivel").setValue(null);
      this.preasignacionForm.get("proyecto").setValue(null);
    }
  }

  loadPreasignacion() {
    this.anyService.get(environment.TERCEROS_SERVICE, `datos_identificacion?query=TerceroId.Id:${this.data.docente_id},Activo:true&fields=Numero`).subscribe((res: any) => {
      this.preasignacionForm.get("doc_docente").setValue(res[0].Numero);
      this.buscarDocenteDocumento();
      this.preasignacionForm.get("espacio_academico").setValue(this.opcionesEspaciosAcademicos.find(espacio => espacio._id == this.data.espacio_academico_padre));
      this.loadProyectos().then((res: any) => {
        this.preasignacionForm.get("grupo").setValue(this.opcionesGrupos.find(grupo => grupo.Id == this.data.espacio_academico_id));
        this.changeGrupo();
      });
      this.preasignacionForm.get("tipo_vinculacion").setValue(parseInt(this.data.tipo_vinculacion_id));
      this.preasignacionForm.get("periodo").setValue(this.periodos.find(periodo => periodo.Id == this.data.periodo_id));
    })
  }
}
