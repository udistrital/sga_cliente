import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';

@Injectable({
  providedIn: 'root'
})
export class ZipManagerService {
  
  private Archivos: any[] = [];
  private CarpetaPrincipal: string = "Compilado Documental";

  constructor() { }

  adjuntarArchivos(file: any[]): number {
    this.Archivos.push(...file);
    return this.Archivos.length
  }

  limpiarArchivos(): string {
    this.Archivos = [];
    return "cleaned"
  }

  generarZip(nombre: string) {
    return new Promise((resolve, reject) => {
      this.CarpetaPrincipal = nombre != "" ? nombre : this.CarpetaPrincipal;
      let zip = new JSZip();
      this.Archivos.forEach((archivo, index) => {
        let nombre = <string>archivo.nombreDocumento;
        let carpeta = <string>archivo.carpeta;
        nombre = nombre.concat('.pdf');
        fetch(archivo.Documento.changingThisBreaksApplicationSecurity)
          .then((res) => res.blob())
          .then((blob) => {
            zip.folder(this.CarpetaPrincipal).folder(carpeta).file(nombre, blob, {binary: true});
            if (index === this.Archivos.length - 1) {
              zip.generateAsync({type:"blob"})
                .then((content) => {
                  const file = new Blob([content], {type: 'application/zip'});
                  const url = URL.createObjectURL(file);
                  resolve(url);
                })
                .catch((error) => reject(error))
            }
          })
      });
    });
  }
}