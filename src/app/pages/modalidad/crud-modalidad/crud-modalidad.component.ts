import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { Modalidad } from '../../../@core/data/models/modalidad/modalidad';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-crud-modalidad',
  templateUrl: './crud-modalidad.component.html',
  styleUrls: ['./crud-modalidad.component.scss']
})
export class CrudModalidadComponent implements OnInit {

  modalidadId: number;

  @Input('modalidad_id')
  set name(modalidad_id: number) {
    this.modalidadId = modalidad_id;
    this.loadModalidad();
  }

  @Output() eventChange = new EventEmitter();

  infoModalidad: Modalidad;

  modalidadForm: any;

  constructor(private translate: TranslateService,
    private proyectoAcademicoService: ProyectoAcademicoService,
    private formBuilder: FormBuilder) {
    }

  ngOnInit() {
    this.modalidadForm = this.formBuilder.group({
      nombre: new FormControl('', [Validators.required]),
      descripcion: new FormControl('', [Validators.required]),
      abreviacion: new FormControl('', [Validators.required]),
      numeroOrden: new FormControl('', [Validators.required]),
      activo: new FormControl(false),
    })
  }

  loadModalidad() {
    if (this.modalidadId !== undefined && this.modalidadId !== 0) {
      this.proyectoAcademicoService.get('modalidad/?query=id:' + this.modalidadId)
        .subscribe((res: any) => {
          if (res.Type !== 'error') {
            let info = <Modalidad>res[0];
            this.modalidadForm.patchValue({
              nombre: info.Nombre,
              descripcion: info.Descripcion,
              abreviacion: info.CodigoAbreviacion,
              numeroOrden: info.NumeroOrden,
              activo: info.Activo
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('GLOBAL.error'),
              text: this.translate.instant('GLOBAL.error'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }
        }, (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    } else  {
      this.infoModalidad = undefined;
    }
  }

  get f() { return this.modalidadForm.controls; }

  onSubmit() {
    const opt: any = {
      title: this.modalidadId == null ? this.translate.instant('GLOBAL.registrar') : this.translate.instant('GLOBAL.actualizar'),
      text: this.modalidadId == null ? this.translate.instant('modalidad.seguro_continuar_registro') : this.translate.instant('modalidad.seguro_actualizar_registro'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        if (!this.modalidadForm.get('activo').touched) {
          this.modalidadForm.patchValue({
            activo: false
          });
        }

        this.infoModalidad = new Modalidad();
        this.infoModalidad.Nombre = this.modalidadForm.value.nombre;
        this.infoModalidad.Descripcion = this.modalidadForm.value.descripcion;
        this.infoModalidad.CodigoAbreviacion = this.modalidadForm.value.abreviacion;
        this.infoModalidad.NumeroOrden = parseInt(this.modalidadForm.value.numeroOrden);
        this.infoModalidad.Activo = this.modalidadForm.value.activo;

        if (this.modalidadId == null) {
          this.registrar();
        } else {
          this.infoModalidad.Id = this.modalidadId;
          this.actualizar();
        }
      }
    });
  }

  registrar(): void {
    this.proyectoAcademicoService.post('modalidad', this.infoModalidad)
    .subscribe((res: any) => {
      if (res.Type !== 'error') {
        this.infoModalidad = <Modalidad><unknown>res;
        this.eventChange.emit(true);
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('GLOBAL.registrar'),
          text: this.translate.instant('modalidad.creada'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('GLOBAL.error'),
          text: this.translate.instant('modalidad.no_creada'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      }
    }, () => {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('GLOBAL.error'),
        text: this.translate.instant('modalidad.no_creada'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

  actualizar(): void {
    this.proyectoAcademicoService.put('modalidad', this.infoModalidad)
    .subscribe((res: any) => {
      if (res.Type !== 'error') {
        this.infoModalidad = <Modalidad><unknown>res;
        this.eventChange.emit(true);
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('GLOBAL.actualizar'),
          text: this.translate.instant('modalidad.actualizada'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('GLOBAL.error'),
          text: this.translate.instant('modalidad.no_actualizada'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      }
    }, () => {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('GLOBAL.error'),
        text: this.translate.instant('modalidad.no_actualizada'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

}
