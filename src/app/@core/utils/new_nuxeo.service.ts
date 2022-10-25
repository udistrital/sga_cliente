import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Documento } from '../data/models/documento/documento'
import { Subject } from 'rxjs/Subject';
import { DocumentoService } from '../data/documento.service';
import { AnyService } from '../data/any.service';
import { mergeMap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';


@Injectable({
    providedIn: 'root',
})
export class NewNuxeoService {

    constructor(
        private anyService: AnyService,
        private sanitization: DomSanitizer,
        private documentService: DocumentoService,
    ) {

    }

    getUrlFile(base64, minetype) {
        return new Promise<string>((resolve, reject) => {
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
                metadatos: file.metadatos ? file.metadatos : {},
                descripcion: file.descripcion ? file.descripcion : "",
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
        const documentos = files;
        let i = 0;
        files.map((file, index) => {
            this.documentService.get('documento/' + file.Id)
            .subscribe((doc) => {
                this.anyService.get(environment.NUXEO_SERVICE, '/document/' + doc.Enlace)
                .subscribe(async (f: any) => {
                    const url = await this.getUrlFile(f.file, f['file:content']['mime-type'])
                    documentos[index] = { ...documentos[index], ...{ url: url }, ...{ Documento: this.sanitization.bypassSecurityTrustUrl(url) },
                                          ...{ Nombre: doc.Nombre }, ...{ Metadatos: doc.Metadatos } }           
                    i+=1;
                    if(i === files.length){
                        documentsSubject.next(documentos);
                    }
                })
            })
        });
        return documents$;
    }

    getByUUID(uuid) {
        const documentsSubject = new Subject<Documento[]>();
        const documents$ = documentsSubject.asObservable();
        let documento = null;
        this.anyService.get(environment.NUXEO_SERVICE, '/document/' + uuid)
            .subscribe(async (f: any) => {
                const url = await this.getUrlFile(f.file, f['file:content']['mime-type']);
                documento = url
                documentsSubject.next(documento);
            }, (error) => {
                documentsSubject.next(error);
            })
        return documents$;
    }
}
