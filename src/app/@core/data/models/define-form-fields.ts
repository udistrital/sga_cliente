import { Validators } from "@angular/forms";

export class FormParams {
  [name: string]: Param;
}

export class Param {
    label_i18n: string;
    label?: string;
    placeholder_i18n: string;
    placeholder?: string;
    placeholder_info?: string;
    tipo: string;
    tipoDato: string;
    validador?: Validators[];
    requerido: boolean;
    soloLectura: boolean;
    desabilitado?: boolean;
    valor: any;
    valorDefecto?: any;
    // ? Para numeros
    oculto?: boolean;
    minimo?: number;
    maximo?: number;
    paso?: number;
    // ? Para selects
    opciones?: any[];
    // ? Para archivos
    archivosLocal?: any[];
    archivosLinea?: any[];
    archivosDelete?: any[];
    tipoArchivos?: string;
    tamMBArchivos?: number;
    validaArchivos?: { errTipo: boolean, errTam: boolean };
    // ? Para comprobar contenido
    coincidencia?: RegExp;
    error?: string;
    info?: string;
    notificar?: boolean;
    claseGrid: string;
    claseAux?: string;
  }