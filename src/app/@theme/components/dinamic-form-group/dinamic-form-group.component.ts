import { Component, EventEmitter, Injectable, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormParams, Param } from '../../../@core/data/models/define-form-fields';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dinamic-form-group',
  templateUrl: './dinamic-form-group.component.html',
  styleUrls: ['./dinamic-form-group.component.scss']
})
export class DinamicFormGroupComponent implements OnInit, OnChanges, OnDestroy {

  @Input('defineForm') defineForm: FormParams;
  @Output() subsChanges: EventEmitter<Object> = new EventEmitter();
  @Output() createdForm: EventEmitter<any> = new EventEmitter();
  @Output() updatedForm: EventEmitter<any> = new EventEmitter();

  formFields: string[];
  formGroup: FormGroup;
  builded: boolean = false;

  constructor (
    private formBuilder: FormBuilder,
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.traducePlease(this.defineForm);
    })
  }
  
  ngOnInit(): void {
  }
  
  // * ----------
  // * Recepción de datos por trigger de cambios en Inputs 
  //#region
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.defineForm) {
      this.formFields = Object.keys(this.defineForm);
      this.formGroup = this.buildForm(this.defineForm);
      this.traducePlease(this.defineForm);
      this.suscribeToForm(this.defineForm, this.formGroup);
    }
  }
  //#endregion
  // * ----------

  // * ----------
  // * FormBuilder, check if field or spacers, manage validators, and translate
  //#region
  isField(field: Param): boolean {
    const notField = (field.tipo === 'empty') || (field.tipo === 'separator');
    return !notField;
  }

  buildForm(formParams: FormParams): FormGroup {
    let form = {};
    const nameFields = Object.keys(formParams);
    nameFields.forEach((name, i) => {
      if (this.isField(formParams[name])) {
        const validate = this.prepareValidators(formParams[name]);
        form[name] = new FormControl(undefined, validate);
      }
      if (i+1 === nameFields.length) {
        this.builded = true;
      }
    });
    const buildedForm = this.formBuilder.group(form);
    
    this.createdForm.emit(buildedForm);
    return buildedForm;
  }

  prepareValidators(f: Param): Validators {
    let validaciones = []
    if (f.requerido) {
      validaciones.push(Validators.required);
    }
    if (f.minimo || f.minimo === 0) {
      validaciones.push(Validators.min(f.minimo));
    }
    if (f.maximo) {
      validaciones.push(Validators.max(f.maximo));
    }
    if (f.validador) {
      f.validador.push(validaciones);
    } else {
      f.validador = validaciones;
    }
    return f.validador;
  }

  traducePlease(formParams: FormParams): void {
    const nameFields = Object.keys(formParams);
    nameFields.forEach((name) => {
      if (this.isField(formParams[name])) {
        formParams[name].label = this.translate.instant(formParams[name].label_i18n);
        formParams[name].placeholder = this.translate.instant(formParams[name].placeholder_i18n);
      }
    });
  }
  //#endregion
  // * ----------

  // * ----------
  // * Subscribe to changes and emit events
  //#region
  suscribeToForm(formParams: FormParams, form: FormGroup): void {
    form.valueChanges.subscribe(
      (cambios: Object) => {
        this.emiteCambiosGeneral(cambios);
      }
    );
    const nameFields = Object.keys(formParams);
    nameFields.forEach(name => {
      if (this.isField(formParams[name])) {
        if (formParams[name].notificar) {
          form.get(name).valueChanges.subscribe(
            (fcambio: Object) => {
              let whatChanged = {[name]: fcambio};
              this.suscribeToField(whatChanged);
            }
          );
        }
        if (formParams[name].tipo === 'fileMultiple') {
          form.get(name).valueChanges.subscribe((fcambio: Object) => {
            if (fcambio === null) {
              this.resetFileInput(name);
            }
          });
        }
      }
    });
  }

  suscribeToField(field): void {
    this.subsChanges.emit(field);
  }

  emiteCambiosGeneral(cambiosData): void {
    this.updatedForm.emit(this.formGroup);
  }
  //#endregion
  // * ----------

  // * ----------
  // * Manage Files functions 
  //#region
  /** trigger cuando resetea formulario, para vaciar lista de archivos */
  resetFileInput(field: string) {
    this.defineForm[field].archivosLocal = [];
    this.defineForm[field].archivosLinea = [];
    this.defineForm[field].archivosDelete = [];
    this.defineForm[field].validaArchivos = {errTipo: false, errTam: false};
  }

  /** trigger cuando hay cambio en selección de archivos */
  onChangeSelectFiles(label: string, event: any): void {
    const files = <File[]>Object.values(event.target.files);
    const newFiles = files.map(f => {
      return {file: f, urlTemp: URL.createObjectURL(f), err: false}
    });
    this.defineForm[label].archivosLocal = this.defineForm[label].archivosLocal.concat(newFiles);
    const nameFiles = this.passFilesToFormControl(this.defineForm[label].archivosLocal, this.defineForm[label].archivosLinea);
    const errs = this.validateFiles(this.defineForm[label].tipoArchivos, this.defineForm[label].tamMBArchivos, this.defineForm[label].archivosLocal);
    this.defineForm[label].validaArchivos = errs;
    this.formGroup.patchValue({[label]: nameFiles});
    this.formGroup.get(label).markAsTouched({onlySelf: true});
    this.putErrorIfRequired(label, errs);
  }

  /** Quitar archivo seleccionado local */
  deleteSelectedFile(label: string, fileName: string): void {
    const idf = this.defineForm[label].archivosLocal.findIndex(f => f.file.name == fileName)
    if (idf != -1) {
      this.defineForm[label].archivosLocal.splice(idf, 1);
      const nameFiles = this.passFilesToFormControl(this.defineForm[label].archivosLocal, this.defineForm[label].archivosLinea);
      const errs = this.validateFiles(this.defineForm[label].tipoArchivos, this.defineForm[label].tamMBArchivos, this.defineForm[label].archivosLocal);
      this.defineForm[label].validaArchivos = errs;
      this.formGroup.patchValue({[label]: nameFiles});
      this.formGroup.get(label).markAsTouched({onlySelf: true});
      this.putErrorIfRequired(label, errs);
    }
  }

  /** Quitar archivo seleccionado en linea */
  deleteSelectedFileLinea(label: string, idFile: number): void {
    const idf = this.defineForm[label].archivosLinea.findIndex(f => f.Id == idFile);
    if (idf != -1) {
      this.defineForm[label].archivosLinea.splice(idf, 1);
      this.defineForm[label].archivosDelete.push(idFile);
      const nameFiles = this.passFilesToFormControl(this.defineForm[label].archivosLocal, this.defineForm[label].archivosLinea);
      const errs = this.validateFiles(this.defineForm[label].tipoArchivos, this.defineForm[label].tamMBArchivos, this.defineForm[label].archivosLocal);
      this.defineForm[label].validaArchivos = errs;
      this.formGroup.patchValue({[label]: nameFiles});
      this.formGroup.get(label).markAsTouched({onlySelf: true});
      this.putErrorIfRequired(label, errs);
    }
  }

  /** Pasa info a un input text porque matInput no se lleva con input file */
  passFilesToFormControl(archivosLocal: any[], archivosLinea: any[]): string {
    let nameFiles = '';
    archivosLocal.forEach((f) => {
      nameFiles += f.file.name + ', ';
    });
    archivosLinea.forEach((f) => {
      nameFiles += f.nombre + ', ';
    });
    return nameFiles;
  }

  /** Añade error si no coincide extensión y tamaño */
  putErrorIfRequired(label: string, errs: any) {
    if (errs.errTipo || errs.errTam) {
      this.formGroup.get(label).setErrors({errorArchivo: "Type or Size Invalid" });
    }
  }
  /** Valida si el archivo cumple con extensión y tamaño */
  validateFiles(tipoArchivos: string, tamMBArchivos: number, archivosLocal: any[]) {
    let errTipo = false;
    let errTam = false;
    archivosLocal.forEach(f => {
      if (tipoArchivos.indexOf(f.file.type.split('/')[1]) === -1) {
        f.err = true;
        errTipo = true;
      } else if (f.file.size > (tamMBArchivos * 1024000)) {
        f.err = true;
        errTam = true;
      } else {
        f.err = false;
      }
    });
    return {"errTipo": errTipo, "errTam": errTam}
  }

  /** Previsualiza archivo seleccionado local */
  previewFile(url: string): void {
    const h = screen.height * 0.65;
    const w = h * 3/4;
    const left = (screen.width * 3/4) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(url, '', 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }
  //#endregion
  // * ----------

  ngOnDestroy(): void {
  }
}
