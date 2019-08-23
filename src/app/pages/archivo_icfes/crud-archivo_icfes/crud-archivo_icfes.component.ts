import { Aplicacion } from './../../../@core/data/models/aplicacion';

import { Perfil } from './../../../@core/data/models/perfil';
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { FORM_ARCHIVO_ICFES } from './form-archivo_icfes';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-archivo-icfes',
  templateUrl: './crud-archivo_icfes.component.html',
  styleUrls: ['./crud-archivo_icfes.component.scss'],
})
export class CrudArchivoIcfesComponent implements OnInit {
  config: ToasterConfig;
  perfil_id: number;

  @Input('perfil_id')
  set name(perfil_id: number) {
    this.perfil_id = perfil_id;
    this.loadPerfil();
  }

  @Output() eventChange = new EventEmitter();

  info_perfil: Perfil;
  formPerfil: any;
  regPerfil: any;
  clean: boolean;
  archivo_icfes_data: any = {};

  form: FormGroup;
  loading: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(private fb: FormBuilder, private translate: TranslateService, private sgaMidService: SgaMidService, private toasterService: ToasterService) {
    this.formPerfil = FORM_ARCHIVO_ICFES;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      archivo_icfes: null,
    });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.form.get('archivo_icfes').setValue(file);
    }
  }

  private prepareSave(): any {
    const input = new FormData();
    input.append('name', this.form.get('name').value);
    input.append('archivo_icfes', this.form.get('archivo_icfes').value);
    return input;
  }

  onSubmit() {
    const formModel = this.prepareSave();
    // this.loading = true;
    // In a real-world app you'd have a http request / service call here like
    // this.http.post('apiUrl', formModel)
    this.sgaMidService.post_file('archivo_icfes', formModel)
      .subscribe(res => {
        this.info_perfil = <Perfil><unknown>res;
        this.eventChange.emit(true);
        this.showToast('info', 'created', 'Archivo Icfes created');
      });
  }

  clearFile() {
    this.form.get('avatar').setValue(null);
    this.fileInput.nativeElement.value = '';
  }

  construirForm() {
    this.formPerfil.titulo = this.translate.instant('GLOBAL.perfil');
    this.formPerfil.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formPerfil.campos.length; i++) {
      this.formPerfil.campos[i].label = this.translate.instant('GLOBAL.' + this.formPerfil.campos[i].label_i18n);
      this.formPerfil.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formPerfil.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formPerfil.campos.length; index++) {
      const element = this.formPerfil.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadPerfil(): void {
    if (this.perfil_id !== undefined && this.perfil_id !== 0) {
      this.sgaMidService.get('perfil/?query=id:' + this.perfil_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_perfil = <Perfil>res[0];
          }
        });
    } else  {
      this.info_perfil = undefined;
      this.clean = !this.clean;
    }
  }

  updatePerfil(perfil: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update Perfil!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_perfil = <Perfil>perfil;
        this.sgaMidService.put('perfil', this.info_perfil)
          .subscribe(res => {
            this.loadPerfil();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'Perfil updated');
          });
      }
    });
  }

  createArchivoIcfes(archivo_icfes: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create Perfil!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        // this.info_perfil = <Perfil>perfil;
        // archivo_icfes.archivo_icfes = archivo_icfes.SoporteDocumento.file;
        // console.log("archivo icfes", archivo_icfes);
        this.sgaMidService.post('archivo_icfes', archivo_icfes)
          .subscribe(res => {
            this.info_perfil = <Perfil><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'Archivo Icfes created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadPerfil();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_perfil === undefined) {
        this.createArchivoIcfes(event.data.Perfil);
      } else {
        this.updatePerfil(event.data.Perfil);
      }
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
