import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Documento } from '../data/models/documento/documento'
import { Subject } from 'rxjs/Subject';
import { DocumentoService } from '../data/documento.service';
import { AnyService } from '../data/any.service';
import { mergeMap } from 'rxjs/operators';


@Injectable({
    providedIn: 'root',
})
export class NewNuxeoService {

    constructor(
        private anyService: AnyService,
        private documentService: DocumentoService,
    ) {

    }

    getUrlFile(base64, minetype) {
        return new Promise((resolve, reject) => {
            const url = `data:${minetype};base64,${base64}`;
            fetch(url)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "File name", { type: minetype })
                    const url = URL.createObjectURL(file);
                    resolve(url);
                })
        });
    }


    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
                if ((encoded.length % 4) > 0) {
                    encoded += '='.repeat(4 - (encoded.length % 4));
                }
                resolve(encoded);
            };
            reader.onerror = error => reject(error);
        });
    }

    uploadFiles(files) {
        const documentsSubject = new Subject<Documento[]>();
        const documents$ = documentsSubject.asObservable();

        const documentos = [];

        files.map(async (file) => {
            const sendFileData = [{
                IdTipoDocumento: file.IdDocumento,
                nombre: file.nombre,
                metadatos: {
                    NombreArchivo:file.nombre,
                    Tipo:"Archivo",
                    Observaciones:file.nombre,
                    "dc:title": file.nombre,
                },
                descripcion: file.nombre,
                file: await this.fileToBase64(file.file)
            }]

            this.anyService.post(environment.NUXEO_SERVICE, '/document/upload', sendFileData)
                .subscribe((dataResponse) => {
                    documentos.push(dataResponse);
                    if (documentos.length === files.length) {
                        documentsSubject.next(documentos);
                    }
                })
        });

        return documents$;
    }

    get(files) {
        const documentsSubject = new Subject<Documento[]>();
        const documents$ = documentsSubject.asObservable();
        const documentos = [];

        files.map(async (file, index) => {
            this.documentService.get('documento/' + file.Id)
                .pipe(mergeMap((doc) => {
                    documentos.push(doc);
                    return this.anyService.get(environment.NUXEO_SERVICE, '/document/' + doc.Enlace)
                })
                )
                .subscribe(async (f: any) => {
                    const url = await this.getUrlFile(f.file, f['file:content']['mime-type']);
                    documentos[index] = {...documentos[index], ...{url: url}}
                    if (documentos.length === files.length) {
                        documentsSubject.next(documentos);
                    }
                })
        });
        return documents$;
    }
}
