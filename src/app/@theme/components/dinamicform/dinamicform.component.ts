import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { AnyService } from '../../../@core/data/any.service';

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
  data: any;
  searchTerm$ = new Subject<any>();
  @ViewChild(MatDatepicker, {static: true}) datepicker: MatDatepicker<Date>;
  @ViewChild('documento', {static: true}) DocumentoInputVariable: ElementRef;
  init: boolean;
  constructor(
    private sanitization: DomSanitizer,
    private anyService: AnyService,
  ) {
    this.data = {
      valid: true,
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
        const fieldAutocomplete = this.normalform.campos.filter((field) => (field.nombre === response.options.field.nombre));
        fieldAutocomplete[0].opciones = response.queryOptions;
      });
  }

  displayWithFn(field) {
    return field ? field.Nombre : '';
  }

  setNewValue({ element, field }) {
    field.valor = element.option.value;
    this.validCampo(field);
  }

  searchEntries(text, path, query, keyToFilter, field) {

    const channelOptions = new BehaviorSubject<any>({ field: field });
    const options$ = channelOptions.asObservable();
    const queryOptions$ = this.anyService.get(path, query.replace(keyToFilter, text))
    return combineLatest([options$, queryOptions$]).pipe(
      map(([options$, queryOptions$]) => ({
        options: options$,
        queryOptions: queryOptions$,
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



  download(url, title, w, h) {
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(url, title, 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
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

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }
  validlog1(event) {
    const camposLog1 = this.normalform.campos.filter((campo: any) => (campo.etiqueta === 'inputConfirmacion'));
    // if (camposLog1[0].valor> )

  }
  confirmacion(event) {
    const camposAValidar = this.normalform.campos.filter((campo: any) => (campo.etiqueta === 'inputConfirmacion'));
    if (!(camposAValidar[0].valor === camposAValidar[1].valor)) {
      camposAValidar[0].clase = 'form-control form-control-danger';
      camposAValidar[1].clase = 'form-control form-control-danger';
      camposAValidar[0].alerta = camposAValidar[0].mensajeIguales;
      camposAValidar[1].alerta = camposAValidar[1].mensajeIguales;
    } else {
      camposAValidar[0].clase = 'form-control form-control-success';
      camposAValidar[1].clase = 'form-control form-control-success';
      camposAValidar[0].alerta = '';
      camposAValidar[1].alerta = '';
    }
  }
  ngOnInit() {
    console.log(this.normalform);
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
      return d;
    });
  }

  onChangeDate(event, c) {
    c.valor = event.value;
  }

  validCampo(c): boolean {
    if (c.etiqueta === 'file' && !!c.ocultar) {
      return true;
      // console.info((c.etiqueta === 'file' && (c.valor)?true:c.valor.name === undefined));
    }
    if (c.requerido && ((c.valor === '' && c.etiqueta !== 'file') || c.valor === null || c.valor === undefined ||
      (JSON.stringify(c.valor) === '{}' && c.etiqueta !== 'file') || JSON.stringify(c.valor) === '[]')
      || ((c.etiqueta === 'file' && c.valor.name === undefined) && (c.etiqueta === 'file' && (c.urlTemp === undefined || c.urlTemp === '')))
      || ((c.etiqueta === 'file' && c.valor.name === null) && (c.etiqueta === 'file' && (c.urlTemp === null || c.urlTemp === '')))) {
      if (c.entrelazado) {
        this.interlaced.emit(c);
        return true;
      }
      c.alerta = '** Debe llenar este campo';
      c.clase = 'form-control form-control-danger';
      return false;
    }
    if (c.etiqueta === 'input' && c.tipo === 'number') {
      c.valor = parseInt(c.valor, 10);
      if (c.valor < c.minimo) {
        c.clase = 'form-control form-control-danger';
        c.alerta = 'El valor no puede ser menor que ' + c.minimo;
        return false;
      }
    }
    if (c.etiqueta === 'input' && c.tipo === 'number') {
      c.valor = parseInt(c.valor, 10);
      if (c.valor > c.maximolog) {
        c.clase = 'form-control form-control-danger';
        c.alerta = 'El valor no puede ser mayor que ' + c.maximolog;
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
    if (c.entrelazado) {
      this.interlaced.emit(c);
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
    // if (!this.normalform.btn) {
    //   if (this.validForm().valid) {
    //     this.resultSmart.emit(this.validForm());
    //   }
    // }
    c.clase = 'form-control form-control-success';
    c.alerta = '';
    return true;
  }

  clearForm() {
    this.normalform.campos.forEach(d => {
      d.valor = null;
      if (d.etiqueta === 'file') {
        const nativeElement = this.DocumentoInputVariable?this.DocumentoInputVariable.nativeElement?this.DocumentoInputVariable.nativeElement:null:null;
        nativeElement?nativeElement.value = '': '';
        d.File = null
        d.url = null
        d.urlTemp = undefined
        d.valor = { nombre: undefined }
      }
    });
  }

  validForm() {
    const result = {};
    let requeridos = 0;
    let resueltos = 0;
    this.data.data = {};
    this.data.percentage = 0;
    this.data.files = [];
    this.data.valid = true;

    this.normalform.campos.forEach(d => {
      requeridos = d.requerido && !d.ocultar ? requeridos + 1 : requeridos;
      if (this.validCampo(d)) {
        if (d.etiqueta === 'file' && !d.ocultar) {
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
    this.resultAux.emit(dataTemp);
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

  ngOnDestroy() {
    this.clearForm();
  }
}
