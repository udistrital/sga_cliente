import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { AnyService } from '../../../@core/data/any.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DialogPreviewFileComponent } from '../dialog-preview-file/dialog-preview-file.component';

@Component({
  selector: 'ngx-dinamicform',
  templateUrl: './dinamicform.component.html',
  styleUrls: ['./dinamicform.component.scss'],
})

export class DinamicformComponent implements OnInit, OnChanges {

  @Input('normalform') normalform: any;
  @Input('modeloData') modeloData: any;
  @Input('clean') clean: boolean;
  @Output() result: EventEmitter<any> = new EventEmitter();
  @Output() resultAux: EventEmitter<any> = new EventEmitter();
  @Output() resultSmart: EventEmitter<any> = new EventEmitter();
  @Output() interlaced: EventEmitter<any> = new EventEmitter();
  @Output() percentage: EventEmitter<any> = new EventEmitter();
  @Output() dateChange: EventEmitter<any> = new EventEmitter();
  @ViewChild(MatDatepicker, { static: true }) datepicker: MatDatepicker<Date>;
  @ViewChildren("documento") fileInputs: QueryList<ElementRef>;
  
  data: any;
  searchTerm$ = new Subject<any>();
  DocumentoInputVariable: ElementRef;
  init: boolean;

  constructor(
    private sanitization: DomSanitizer,
    private anyService: AnyService,
    private gestorDocumental: NewNuxeoService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private matDialog: MatDialog,
  ) {
    this.data = {
      valid: true,
      confirm: true,
      data: {},
      percentage: 0,
      files: [],
    };

    this.searchTerm$
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        filter(data => (data.text).length > 3),
        switchMap(({ text, path, query, keyToFilter, field }) => this.searchEntries(text, path, query, keyToFilter, field)),
      ).subscribe((response: any) => {
        let opciones = []
        if (response.queryOptions.hasOwnProperty('Data')) {
          opciones = response.queryOptions.Data;
        } else {
          opciones = response.queryOptions;
        }
        const fieldAutocomplete = this.normalform.campos.filter((field) => (field.nombre === response.options.field.nombre));
        fieldAutocomplete[0].opciones = opciones;
        if (opciones != null){
          if (opciones.length == 1 && Object.keys(opciones[0]).length == 0) {
            let canEmit = fieldAutocomplete[0].entrelazado ? fieldAutocomplete[0].entrelazado : false;
            if (canEmit) {
              this.interlaced.emit({...fieldAutocomplete[0], noOpciones: true, valorBuscado: response.keyToFilter});
            }
          }
        } else if (opciones == null){
          this.interlaced.emit({value: null, name: `selected_value_autocomplete_${response.options.field.nombre}`})
        }
      });
  }

  displayWithFn(field) {
    return field ? field.Nombre : '';
  }

  setNewValue({ element, field }) {
    field.valor = element.option.value;
    this.validCampo(field);
    this.interlaced.emit({value: element.option.value, name: `selected_value_autocomplete_${field.nombre}`})
  }

  searchEntries(text, path, query, keyToFilter, field) {

    const encodedText = encodeURIComponent(text);
    const channelOptions = new BehaviorSubject<any>({ field: field });
    const options$ = channelOptions.asObservable();
    const queryOptions$ = this.anyService.get(path, query.replace(keyToFilter, encodedText))
    return combineLatest([options$, queryOptions$]).pipe(
      map(([options$, queryOptions$]) => ({
        options: options$,
        queryOptions: queryOptions$,
        keyToFilter: encodedText,
      })),
    );
  }

  ngOnChanges(changes) {
    if (changes.normalform !== undefined) {
      if (changes.normalform.currentValue !== undefined) {
        this.normalform = changes.normalform.currentValue;
      }
    }
    if (changes.modeloData !== undefined) {
      if (changes.modeloData.currentValue !== undefined) {
        this.modeloData = changes.modeloData.currentValue;
        if (this.normalform.campos) {
          this.normalform.campos.forEach(element => {
            for (const i in this.modeloData) {
              if (this.modeloData.hasOwnProperty(i)) {
                if (i === element.nombre && this.modeloData[i] !== null) {
                  switch (element.etiqueta) {
                    case 'selectmultiple':
                      element.valor = [];
                      if (this.modeloData[i].length > 0) {
                        this.modeloData[i].forEach((e1) => element.opciones.forEach((e2) => {
                          if (e1.Id === e2.Id) {
                            element.valor.push(e2);
                          }
                        }));
                      }
                      break;
                    case 'select':
                      if (element.hasOwnProperty('opciones')) {
                        if (element.opciones != undefined) {
                          element.opciones.forEach((e1) => {
                            if (this.modeloData[i].Id !== null || this.modeloData[i].Id !== undefined) {
                              if (e1.Id === this.modeloData[i].Id) {
                                element.valor = e1;
                              }
                            }
                          });
                        }
                      }
                      break;
                    case 'mat-date':
                      element.valor = new Date(this.modeloData[i]);
                      break;
                    case 'file':
                      element.url = this.cleanURL(this.modeloData[i]);
                      element.urlTemp = this.modeloData[i];
                      break;
                    default:
                      element.valor = this.modeloData[i];
                  }
                  this.validCampo(element);
                }
              }
            }
          });
          this.setPercentage()
        }
      }
    }
    if (changes.clean !== undefined && this.init) {
      this.clearForm();
      this.clean = false;
    }
  }

  ngAfterViewInit() {
    this.fileInputs.changes.subscribe(x => {
      if (x.length) {
        this.DocumentoInputVariable = x.first;
      }
    })
  }

  download(url, title, w, h, previewForm?, message?) {
    if (previewForm !== undefined) {
      switch (previewForm) {
        case "preview":
          this.preview(url, title, message);
          break;
        case "nopreview":
          this.nopreview(url, title);
          break;
        case "both":
          const spliturl = url.split('|');
          this.preview(spliturl[0], title, message);
          this.nopreview(spliturl[1], title);
          break;
        default:
          this.preview(url, title, message);
          break;
      }
    } else {
      this.preview(url, title, message);
    }
  }

  preview(url, title, message) {
    /* const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    let prev = window.open(url, title, 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    prev.document.title = title; */
    const dialogDoc = new MatDialogConfig();
    dialogDoc.width = '80vw';
    dialogDoc.height = '90vh';
    dialogDoc.data = {url, title, message};
    this.matDialog.open(DialogPreviewFileComponent, dialogDoc);
  }

  nopreview(url, title) {
    const download = document.createElement("a");
    download.href = url;
    download.download = title;
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
  }

  onChange(event, c) {
    if (c.valor !== undefined) {
      c.urlTemp = URL.createObjectURL(event.srcElement.files[0])
      c.url = this.cleanURL(c.urlTemp);
      c.valor = event.srcElement.files[0];
      this.validCampo(c);
      c.File = event.srcElement.files[0];
    }
    // Tipo file
    if (c.valor === undefined && c.etiqueta === 'file') {
      c.urlTemp = URL.createObjectURL(event.srcElement.files[0])
      c.url = this.cleanURL(c.urlTemp);
      c.valor = event.srcElement.files[0];
      this.validCampo(c);
      c.File = event.srcElement.files[0];
    }
  }

  onChange2(event, c) {
    if (event.srcElement.files.length > 0) {
      c.File = event.srcElement.files[0];
      c.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
      c.url = this.cleanURL(c.urlTemp);
    } else {
      c.File = undefined, c.urlTemp = undefined, c.url = undefined;
    }
    this.validCampo(c);
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  validlog1(event) {
    const camposLog1 = this.normalform.campos.filter((campo: any) => (campo.etiqueta === 'inputConfirmacion'));
    // if (camposLog1[0].valor> )

  }

  confirmacion(event) {
    this.checkConfirmacion();
    if(event.entrelazado){
      this.interlaced.emit(event);
    }
  }

  checkConfirmacion() {
    let valido = true;

    const camposAValidar = this.normalform.campos.filter((campo: any) => (campo.etiqueta === 'inputConfirmacion'));
    let l = camposAValidar.length;

    if (l % 2 == 0) {
      for (let i = 0; i < l; i+=2) {
        if (!(camposAValidar[i].valor === camposAValidar[i+1].valor)) {
          camposAValidar[i].clase = 'form-control form-control-danger';
          camposAValidar[i+1].clase = 'form-control form-control-danger';
          camposAValidar[i].alerta = camposAValidar[i].mensajeIguales;
          camposAValidar[i+1].alerta = camposAValidar[i+1].mensajeIguales;
          valido = false;
        } else {
          camposAValidar[i].clase = 'form-control form-control-success';
          camposAValidar[i+1].clase = 'form-control form-control-success';
          camposAValidar[i].alerta = '';
          camposAValidar[i+1].alerta = '';
        }
      }
    } else {
      console.warn('Error, algún campo de confirmacion no tiene pareja');
    }

    return valido;

  }

  ngOnInit() {
    this.init = true;
    if (!this.normalform.tipo_formulario) {
      this.normalform.tipo_formulario = 'grid';
    }

    this.normalform.campos = this.normalform.campos.map(d => {
      d.clase = 'form-control';
      if (d.relacion === undefined) {
        d.relacion = true;
      }
      if (!d.valor) {
        d.valor = '';
      }
      if (!d.deshabilitar) {
        d.deshabilitar = false;
      }
      if (d.etiqueta === 'fileRev') {
        d.File = undefined;
        d.urlTemp = undefined;
      }
      return d;
    });
  }

  onChangeDate(event, c) {
    c.valor = event.value;
    this.dateChange.emit(c)
  }

  validCampo(c, emit = true): boolean {
    if (c.etiqueta === 'fileRev' && !c.ocultar) {
      if (c.requerido && !c.valor && (c.File === undefined || c.File === null || c.File === '' ||
          c.urlTemp === undefined || c.urlTemp === null || c.urlTemp === '')) {
            c.alerta = '** Debe llenar este campo'
            c.clase = 'form-control form-control-danger';
            return false;
      }
      if (c.File) {
        if (c.tamanoMaximo) {
          if (c.File.size > c.tamanoMaximo * 1024000) {
            c.clase = 'form-control form-control-danger';
            c.alerta = 'El tamaño del archivo es superior a : ' + c.tamanoMaximo + 'MB. ';
            return false;
          }
        }
        if (c.tipo) {
          if (c.tipo.indexOf(c.File.type.split('/')[1]) === -1) {
            c.clase = 'form-control form-control-danger';
            c.alerta = 'Solo se admiten los siguientes formatos: ' + c.formatos;
            return false;
          }
        }
      }
      c.clase = 'form-control form-control-success';
      c.alerta = '';
      return true;
    }
    if (c.etiqueta === 'file' && !!c.ocultar) {
      return true;
      // console.info((c.etiqueta === 'file' && (c.valor)?true:c.valor.name === undefined));
    }
    if (c.etiqueta === 'input' && c.tipo === 'number' && (c.valor === '' || c.valor === null || c.valor === undefined)) {
      c.alerta = '** Debe llenar este campo solo con numeros';
      c.clase = 'form-control form-control-danger';
      return false;
    }
    if (c.requerido && ((c.valor === '' && c.etiqueta !== 'file') || c.valor === null || c.valor === undefined ||
      (JSON.stringify(c.valor) === '{}' && c.etiqueta !== 'file') || JSON.stringify(c.valor) === '[]')
      || ((c.etiqueta === 'file' && c.valor.name === undefined) && (c.etiqueta === 'file' && (c.urlTemp === undefined || c.urlTemp === '')))
      || ((c.etiqueta === 'file' && c.valor.name === null) && (c.etiqueta === 'file' && (c.urlTemp === null || c.urlTemp === '')))) {
      if (c.entrelazado && emit) {
        this.interlaced.emit(c);
        return true;
      }
      c.alerta = '** Debe llenar este campo';
      c.clase = 'form-control form-control-danger';
      return false;
    }
    if ((c.etiqueta === 'input' || c.etiqueta === 'inputConfirmacion') && c.tipo === 'number') {
      c.valor = parseInt(c.valor, 10);
      if (c.valor < c.minimo) {
        c.clase = 'form-control form-control-danger';
        c.alerta = 'El valor no puede ser menor que ' + c.minimo;
        return false;
      }
    }
    if ((c.etiqueta === 'input' || c.etiqueta === 'inputConfirmacion') && c.tipo === 'number') {
      c.valor = parseInt(c.valor, 10);
      if (c.valor > c.maximolog) {
        c.clase = 'form-control form-control-danger';
        c.alerta = 'El valor no puede ser mayor que ' + c.maximolog;
        return false;
      }
    }
    if ((c.etiqueta === 'input' || c.etiqueta === 'inputConfirmacion') && c.tipo === 'email') {
      const pattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      let esValido: boolean = c.valor.match(pattern) ? true : false;
      if(!esValido) {
        c.clase = 'form-control form-control-danger';
        c.alerta = 'No es un correo válido';
        return false;
      }
    }
    if (c.etiqueta === 'radio') {
      if (c.valor.Id === undefined) {
        c.clase = 'form-control form-control-danger';
        c.alerta = 'Seleccione el campo';
        return false;
      }
    }
    if (c.etiqueta === 'select') {
      if (c.valor == null) {
        c.clase = 'form-control form-control-danger';
        c.alerta = 'Seleccione el campo';
        return false;
      }
    }
    if (c.etiqueta === 'file' && c.valor !== null && c.valor !== undefined && c.valor !== '' && !c.ocultar) {
      if (c.valor.size > c.tamanoMaximo * 1024000) {
        c.clase = 'form-control form-control-danger';
        c.alerta = 'El tamaño del archivo es superior a : ' + c.tamanoMaximo + 'MB. ';
        return false;
      }
      if (c.valor.type) {
        if (c.formatos.indexOf(c.valor.type.split('/')[1]) === -1) {
          c.clase = 'form-control form-control-danger';
          c.alerta = 'Solo se admiten los siguientes formatos: ' + c.formatos;
          return false;
        }
      }
    }
    if (c.entrelazado && emit) {
      if (c.valor) {
        this.interlaced.emit(c);
      }
    }
    if (c.etiqueta === 'textarea') {
      const caracteresEspeciales1: RegExp = /[\"\\\/\b\f]/g;  // pueden romper JSON string in api GO
      const caracteresEspeciales2: RegExp = /[\t\n\r]/g;  // pueden romper JSON string in api GO
      const multiespacio: RegExp = /\s\s+/g; // bonus: quitar muchos espacios juntos
      c.valor = c.valor.replace(caracteresEspeciales1,'');
      c.valor = c.valor.replace(caracteresEspeciales2,' '); // tabs y enter se reemplazan por espacio
      c.valor = c.valor.replace(multiespacio, ' ');
      if (c.cantidadCaracteres) {
        if (c.valor.length > c.cantidadCaracteres) {
          c.clase = 'form-control form-control-danger'
          c.alerta = 'El texto supera el máximo de caracteres permitido (máximo: ' +  c.cantidadCaracteres + ', actualmente: ' + c.valor.length +')';
          return false;
        }
      }
    }
    // if (!this.normalform.btn) {
    //   if (this.validForm().valid) {
    //     this.resultSmart.emit(this.validForm());
    //   }
    // }
    c.clase = 'form-control form-control-success';
    c.alerta = '';
    return true;
  }

  checkFileSignature(): Promise<boolean> {
    const len = this.normalform.campos.length;
    return new Promise<boolean>((resolve, reject) => {
      this.normalform.campos.forEach(async (d, i) => {
        if ((d.etiqueta === 'file' || d.etiqueta === 'fileRev') && !d.ocultar) {
          const valid = await this.gestorDocumental.readVerifyMimeType(d.File);
          if (!valid) {
            d.clase = 'form-control form-control-danger';
            d.alerta = this.translate.instant('ERROR.contenido_archivo_erroneo');
            this.popUpManager.showPopUpGeneric(this.translate.instant('GLOBAL.error'), d.File.name + "<br><br>" + this.translate.instant('ERROR.contenido_archivo_erroneo_mensaje'), "error", false)
            reject(false)
          }
        }
        if (len-1 === i) {
          resolve(true)
        }
      });
    });
  }

  clearForm() {
    this.normalform.campos.forEach(d => {
      d.valor = null;
      if (d.etiqueta === 'file') {
        const nativeElement = this.DocumentoInputVariable ? this.DocumentoInputVariable.nativeElement ? this.DocumentoInputVariable.nativeElement : null : null;
        nativeElement ? nativeElement.value = '' : '';
        d.File = undefined;
        d.url = "";
        d.urlTemp = "";
        d.valor = "";
      }
      if (d.etiqueta === 'fileRev') {
        d.File = undefined, d.urlTemp = undefined, d.url = undefined, d.valor = undefined;
      }
      if (d.etiqueta === 'autocomplete') {
        const e = document.querySelectorAll('.inputAuto');
        e.forEach((e: HTMLInputElement) => { e.value = ''; });
        d.opciones = [];
      }
      d.alerta = "";
      d.clase = 'form-control form-control-success';
  });
    this.percentage.emit(0);
  }

  async validForm() {
    const result = {};
    let requeridos = 0;
    let resueltos = 0;
    this.data.data = {};
    this.data.percentage = 0;
    this.data.files = [];
    this.data.valid = true;

    this.normalform.campos.forEach(d => {
      requeridos = d.requerido && !d.ocultar ? requeridos + 1 : requeridos;
      if (this.validCampo(d, false)) {
        if ((d.etiqueta === 'file' || d.etiqueta === 'fileRev') && !d.ocultar) {
          result[d.nombre] = { nombre: d.nombre, file: d.File, url: d.url, IdDocumento: d.tipoDocumento };
          // result[d.nombre].push({ nombre: d.name, file: d.valor });
        } else if (d.etiqueta === 'select') {
          result[d.nombre] = d.relacion ? d.valor : d.valor.Id;
        } else {
          result[d.nombre] = d.valor;
        }
        resueltos = d.requerido ? resueltos + 1 : resueltos;
      } else {
        this.data.valid = false;
      }
    });

    if (this.data.valid) {
      await this.checkFileSignature().then(() => this.data.valid = true).catch(() => this.data.valid = false);
    }

    this.data.valid = this.data.valid && this.checkConfirmacion();

    if (this.data.valid && (resueltos / requeridos) >= 1) {
      if (this.normalform.modelo) {
        this.data.data[this.normalform.modelo] = result;
      } else {
        this.data.data = result;
      }
    }

    this.data.percentage = (resueltos / requeridos);
    for (const key in this.modeloData) {  // Agrega parametros faltantes del modelo
      if (this.data.data[this.normalform.modelo] !== undefined && !this.data.data[this.normalform.modelo].hasOwnProperty(key)) {
        this.data.data[this.normalform.modelo][key] = this.modeloData[key];
      }
    }

    if (this.normalform) {
      if (this.normalform.nombre) {
        this.data.nombre = this.normalform.nombre;
      }
    }

    this.result.emit(this.data);
    if (this.data.valid)
      this.percentage.emit(this.data.percentage);
    return this.data;
  }

  auxButton(c) {
    const result = {};
    this.normalform.campos.forEach(d => {
      if (d.etiqueta === 'file') {
        result[d.nombre] = { nombre: d.nombre, file: d.File };
      } else if (d.etiqueta === 'select') {
        result[d.nombre] = d.relacion ? d.valor : d.valor.Id;
      } else {
        result[d.nombre] = d.valor;
      }
    });
    const dataTemp = {
      data: result,
      button: c.nombre,
    }
    if (c.resultado) {
      this.result.emit(dataTemp)
    } else {
      this.resultAux.emit(dataTemp);
    }
  }

  setPercentage(): void {
    let requeridos = 0;
    let resueltos = 0;
    this.normalform.campos.forEach(form_element => {
      if (form_element.requerido && !form_element.ocultar) {
        requeridos = requeridos + 1;
        resueltos = form_element.valor ? resueltos + 1 : resueltos;
      }
    });
    this.percentage.emit(resueltos / requeridos);
  }

  isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  getUniqueSteps(campos: any[]): number[] {
    const uniqueSteps: number[] = [];
    for (const campo of campos) {
      const step = campo.step;
      if (!uniqueSteps.includes(step)) {
        uniqueSteps.push(step);
      }
    }
    return uniqueSteps;
  }
  
  getFieldsInStep(step: number): any[] {
    return this.normalform.campos.filter(c => c.step === step);
  }
  

  ngOnDestroy() {
    this.clearForm();
  }
}
