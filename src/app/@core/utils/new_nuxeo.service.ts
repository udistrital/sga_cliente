import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Documento } from '../data/models/documento/documento'
import { Subject } from 'rxjs';
import { DocumentoService } from '../data/documento.service';
import { AnyService } from '../data/any.service';
import { mergeMap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpEventType } from '@angular/common/http';


@Injectable({
    providedIn: 'root',
})
export class NewNuxeoService {

    private documentsList: any[] = [];

    private mimeTypes = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/bmp": ".bmp",
        "image/webp": ".webp",
        "image/svg+xml": ".svg",
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "application/vnd.ms-excel": ".xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
        "application/vnd.ms-powerpoint": ".ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
        "text/plain": ".txt",
        "text/html": ".html",
        "text/css": ".css",
        "text/javascript": ".js",
        "application/json": ".json",
        "application/xml": ".xml"
      };
    
    // ? list from: https://www.garykessler.net/library/file_sigs.html
    private fileSignatures = {
        "image/jpeg": ["FFD8", "FFD8FF", "464946", "696600"],
        "image/png": ["89504E47"],
        "image/gif": ["47494638"],
        "image/bmp": ["424D"],
        "image/webp": ["52494646", "57454250"],
        "image/svg+xml": ["3C737667"],
        "application/pdf": ["25504446", "255044462D"],
        "application/msword": ["D0CF11E0A1B11AE1"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["504B0304", "504B030414000600"],
        "application/vnd.ms-excel": ["D0CF11E0A1B11AE1"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["504B0304", "504B030414000600"],
        "application/vnd.ms-powerpoint": ["D0CF11E0A1B11AE1"],
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": ["504B0304", "504B030414000600"],
        "none": []
        // Text,HTML,CSS,JavaScript,JSON,XML files don't have a unique signature
      };

    constructor(
        private anyService: AnyService,
        private sanitization: DomSanitizer,
        private documentService: DocumentoService,
    ) {

    }

    readVerifyMimeType(file: File): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const uint8Array = new Uint8Array(arrayBuffer.slice(0, 8));
                const mime = Array.from(uint8Array).map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
                const extension = file.type || "none";
                resolve(this.fileSignatures[extension].some(sign => mime.startsWith(sign)))
            };
            reader.onerror = () => resolve(false)
            reader.readAsArrayBuffer(file)
        });
    }

    clearLocalFiles() {
        this.documentsList = [];
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

    getManyFiles(query: string) {
        const documentsSubject = new Subject<any>();
        const documents$ = documentsSubject.asObservable();
        this.anyService.getp(environment.NUXEO_SERVICE, '/document'+query).subscribe(
            async (response: any) => {
                if (response.type === HttpEventType.DownloadProgress) {
                    const downloadProgress = 100 * response.loaded / response.total;
                    documentsSubject.next({"downloadProgress": downloadProgress});
                }
                if (response.type === HttpEventType.Response) {
                    let listaDocsRaw = <Array<any>>response.body.Data;
                    let listaDocs = await Promise.all(listaDocsRaw.map(async doc => {
                        if (doc.Nuxeo) {
                            return {
                                Id: doc.Id,
                                Nombre: doc.Nombre,
                                Enlace: doc.Enlace,
                                Url: await this.getUrlFile(doc.Nuxeo.file, doc.Nuxeo['file:content']['mime-type']),
                                TipoArchivo: this.mimeTypes[doc.Nuxeo['file:content']['mime-type']],
                            }
                        }
                    }));
                    this.documentsList.push.apply(this.documentsList, listaDocs);
                    documentsSubject.next(listaDocs);
                }
            },
            (error: any) => {
                documentsSubject.error(error)
            }
        );
        return documents$;
    }

    getByIdLocal(id: number) {
        const documentsSubject = new Subject<any>();
        const documents$ = documentsSubject.asObservable();
        const doc = this.documentsList.find(doc => doc.Id === id);
        if (doc != undefined) {
            setTimeout(() => {
                documentsSubject.next({"Id": doc.Id, "nombre": doc.Nombre, "url": doc.Url, "type": doc.TipoArchivo});
            }, 1);
        } else {
            documentsSubject.error("Document not found");
        }
        return documents$
    }

    uploadFiles(files) {
        const documentsSubject = new Subject<Documento[]>();
        const documents$ = documentsSubject.asObservable();

        const documentos = [];

        files.map(async (file) => {
            const sendFileData = [{
                IdTipoDocumento: file.IdDocumento,
                nombre: file.nombre.replace(/[\.]/g),
                metadatos: file.metadatos ? file.metadatos : {},
                descripcion: file.descripcion ? file.descripcion : "",
                file: await this.fileToBase64(file.file)
            }]

            this.anyService.post(environment.NUXEO_SERVICE, '/document/uploadAnyFormat', sendFileData)
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

    deleteByUUID(uuid) {
        const documentsSubject = new Subject<any>();
        const documents$ = documentsSubject.asObservable();
        const versionar = true;
        this.anyService.delete2(environment.NUXEO_SERVICE, '/document/' + uuid + '?versionar=' + versionar)
            .subscribe(r => {
                documentsSubject.next(r)
            }, e => {
                documentsSubject.error(e)
            })
        return documents$;
    }

    deleteByIdDoc(Id, relacion) {
        const documentsSubject = new Subject<any>();
        const documents$ = documentsSubject.asObservable();
        this.documentService.get('documento/'+Id).subscribe((doc: Documento) => {
            doc.Activo = false;
            doc.Descripcion = "id_relacionado: " + relacion;
            this.documentService.put('documento/', doc).subscribe((doc: Documento) => {
                documentsSubject.next(doc)
            }, e => {
                documentsSubject.error(e)
            })
        }, e => {
            documentsSubject.error(e)
        });
        return documents$;
    }
}
