import * as Nuxeo from 'nuxeo';
import { Injectable } from '@angular/core';
import { environment } from './../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { Documento } from './../data/models/documento/documento'
import { TipoDocumento } from './../data/models/documento/tipo_documento'
import { DocumentoService } from '../data/documento.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Injectable({
    providedIn: 'root',
})
export class NuxeoService {
    static nuxeo: Nuxeo;

    private nuxeo2 = Nuxeo;

    private documentos$ = new Subject<Documento[]>();
    private documentos: object;

    private blobDocument$ = new Subject<[object]>();
    private blobDocument: object;

    private updateDoc$ = new Subject<[object]>();
    private updateDoc: object

    constructor(
        private documentService: DocumentoService,
        private sanitization: DomSanitizer,
    ) {
        this.documentos = {};
        this.blobDocument = {};
        this.updateDoc = {};
        // console.info(this.blobDocument);
        // console.info(this.updateDoc);

        NuxeoService.nuxeo = new Nuxeo({
            baseURL: environment.NUXEO.PATH,
            auth: {
                method: 'basic',
                username: environment.NUXEO.CREDENTIALS.USERNAME,
                password: environment.NUXEO.CREDENTIALS.PASS,
            },
        });

        this.nuxeo2 = new Nuxeo({
            baseURL: environment.NUXEO.PATH,
            auth: {
                method: 'basic',
                username: environment.NUXEO.CREDENTIALS.USERNAME,
                password: environment.NUXEO.CREDENTIALS.PASS,
            },
        });
    }

    public getDocumentos$(file, documentoService): Observable<Documento[]> {
        this.saveFiles(file, documentoService, this);
        return this.documentos$.asObservable();
    }

    public getDocumentoById$(Id, documentoService): Observable<object[]> {
        this.getFile(Id, documentoService, this);
        return this.blobDocument$.asObservable();
    }

    public updateDocument$(files, documentoService): Observable<object[]> {
        this.updateFile(files, documentoService, this);
        return this.updateDoc$.asObservable();
    }

    saveFiles(files, documentoService, nuxeoservice) {
        this.documentos = {};
        nuxeoservice.documentos = {};
        NuxeoService.nuxeo.connect()
            .then(function (client) {
                files.forEach(file => {
                    documentoService.get('tipo_documento/' + file.IdDocumento)
                        .subscribe(res => {
                            if (res !== null) {
                                const tipoDocumento = <TipoDocumento>res;
                                NuxeoService.nuxeo.operation('Document.Create')
                                    .params({
                                        type: tipoDocumento.TipoDocumentoNuxeo,
                                        name: file.nombre,
                                        properties: 'dc:title=' + file.nombre,
                                    })
                                    .input(tipoDocumento.Workspace)
                                    .execute()
                                    .then(function (doc) {
                                        const nuxeoBlob = new Nuxeo.Blob({ content: file.file });
                                        NuxeoService.nuxeo.batchUpload()
                                            .upload(nuxeoBlob)
                                            .then(function (response) {
                                                file.uid = doc.uid
                                                NuxeoService.nuxeo.operation('Blob.AttachOnDocument')
                                                    .param('document', doc.uid)
                                                    .input(response.blob)
                                                    .execute()
                                                    .then(function (respuesta) {
                                                        const documentoPost = new Documento;
                                                        documentoPost.Enlace = file.uid;
                                                        documentoPost.Nombre = file.nombre;
                                                        documentoPost.TipoDocumento = tipoDocumento;
                                                        documentoPost.Activo = true;
                                                        documentoPost.Metadatos = file.Metadatos;
                                                        documentoService.post('documento', documentoPost)
                                                            .subscribe(resuestaPost => {
                                                                nuxeoservice.documentos[file.key] = resuestaPost;
                                                                // nuxeoservice.documentos[file.key] = resuestaPost.Body;
                                                                nuxeoservice.documentos$.next(nuxeoservice.documentos);
                                                            })

                                                    });
                                            })
                                            .catch(function (error) {
                                                console.error(error);
                                                return error;
                                            });
                                    })
                                    .catch(function (error) {
                                        console.error(error);
                                        return error;
                                    })
                            }
                        });
                });
            });
    }

    updateFile(files, documentoService, nuxeoservice) {
        this.updateDoc = {};
        nuxeoservice.updateDoc = {};
        files.forEach(file => {
            if (file.file !== undefined) {
                const nuxeoBlob = new Nuxeo.Blob({ content: file.file });
                documentoService.get('documento?query=Id:' + file.documento)
                    .subscribe(res => {
                        if (res !== null) {
                            const documento_temp = <any>res[0];
                            NuxeoService.nuxeo.connect()
                            NuxeoService.nuxeo.batchUpload()
                                .upload(nuxeoBlob)
                                .then(function (response) {
                                    NuxeoService.nuxeo.operation('Blob.AttachOnDocument')
                                        .params({
                                            type: documento_temp.TipoDocumento.TipoDocumentoNuxeo,
                                            name: documento_temp.Nombre,
                                            properties: 'dc:title=' + file.nombre,
                                        })
                                        .param('document', documento_temp.Enlace)
                                        .input(response.blob)
                                        .execute()
                                        .then(function (respuesta) {
                                            respuesta.blob()
                                                .then(function (responseblob) {
                                                    const url = URL.createObjectURL(responseblob);
                                                    const response_update = {
                                                        documento: documento_temp,
                                                        url: url,
                                                    };
                                                    nuxeoservice.updateDoc[file.key] = response_update;
                                                    nuxeoservice.updateDoc$.next(nuxeoservice.updateDoc);
                                                });
                                        });
                                });
                        }
                    });
            }
        });
    };

    getFile(files, documentoService, nuxeoservice) {
        this.blobDocument = {};
        nuxeoservice.blobDocument = {};
        files.forEach(file => {
            documentoService.get('documento/' + file.Id)
                .subscribe(res => {
                    if (res !== null) {
                        if (res.Enlace != null) {
                            NuxeoService.nuxeo.header('X-NXDocumentProperties', '*');
                            NuxeoService.nuxeo.request('/id/' + res.Enlace)
                                .get()
                                .then(function (response) {
                                    response.fetchBlob()
                                        .then(function (blob) {
                                            blob.blob()
                                                .then(function (responseblob) {
                                                    const url = URL.createObjectURL(responseblob)
                                                    nuxeoservice.blobDocument[file.key] = url;
                                                    nuxeoservice.blobDocument$.next(nuxeoservice.blobDocument);
                                                });
                                        })
                                        .catch(function (response2) {
                                        });
                                })
                                .catch(function (response) {
                                });
                        }
                    }
                });
        });
    }

    getFilesNew(files) {
        const documentsSubject = new Subject<Documento[]>();
        const documents$ = documentsSubject.asObservable();

        const filesData = [];

        files.forEach((file, index) => {
            this.documentService.get('documento/' + file.Id)
                .subscribe(res => {
                    if (res !== null) {
                        if (res.Enlace != null) {
                            this.nuxeo2.header('X-NXDocumentProperties', '*');
                            this.nuxeo2.request('/id/' + res.Enlace)
                                .get()
                                .then((response) => {
                                    response.fetchBlob()
                                        .then((blob) => {
                                            blob.blob()
                                                .then((responseblob) => {
                                                    const url = URL.createObjectURL(responseblob)
                                                    const objectNext = {
                                                        ...res,
                                                        ...{ documentId: res.Id },
                                                        ...{ key: file.key },
                                                        ...{ urlUnsafe: url },
                                                        ...{ safeUrl: this.sanitization.bypassSecurityTrustUrl(url) },
                                                        ...{ Documento: this.sanitization.bypassSecurityTrustUrl(url) }
                                                    }
                                                    filesData.push(objectNext);
                                                    if ((index + 1) === files.length) {
                                                        documentsSubject.next(filesData);
                                                    }
                                                });
                                        })
                                        .catch(function (response2) {
                                        });
                                })
                                .catch(function (response) {
                                });
                        }
                    }
                });
        });
        return documents$;
    }

    getDocByInfo(info) {
        const documentsSubject = new Subject<Documento[]>();
        const documents$ = documentsSubject.asObservable();
        if (info.Enlace != null) {
            this.nuxeo2.header('X-NXDocumentProperties', '*');
            this.nuxeo2.request('/id/' + info.Enlace)
                .get()
                .then((response) => {
                    response.fetchBlob()
                        .then((blob) => {
                            blob.blob()
                                .then((responseblob) => {
                                    const url = URL.createObjectURL(responseblob)
                                    const objectNext = {
                                        ...info,
                                        ...{ documentId: info.Id },
                                        ...{ key: info.key },
                                        ...{ urlUnsafe: url },
                                        ...{ safeUrl: this.sanitization.bypassSecurityTrustUrl(url) },
                                        ...{ Documento: this.sanitization.bypassSecurityTrustUrl(url) }
                                    }
                                    documentsSubject.next(objectNext);
                                });
                        })
                        .catch(function (response2) {
                        });
                })
                .catch(function (response) {
                });
        }
        return documents$;
    }

    saveFilesNew(files) {
        const documentsSubject = new Subject<Documento[]>();
        const documents$ = documentsSubject.asObservable();

        const documentos = [];
        this.nuxeo2.connect()
            .then((client) => {
                files.forEach((file, index) => {
                    this.documentService.get('tipo_documento/' + file.IdDocumento)
                        .subscribe(res => {
                            if (res !== null) {
                                const tipoDocumento = <TipoDocumento>res;
                                this.nuxeo2.operation('Document.Create')
                                    .params({
                                        type: tipoDocumento.TipoDocumentoNuxeo,
                                        name: file.nombre,
                                        properties: 'dc:title=' + file.nombre,
                                    })
                                    .input(tipoDocumento.Workspace)
                                    .execute()
                                    .then((doc) => {
                                        const nuxeoBlob = new Nuxeo.Blob({ content: file.file });
                                        this.nuxeo2.batchUpload()
                                            .upload(nuxeoBlob)
                                            .then((response) => {
                                                file.uid = doc.uid
                                                this.nuxeo2.operation('Blob.AttachOnDocument')
                                                    .param('document', doc.uid)
                                                    .input(response.blob)
                                                    .execute()
                                                    .then((respuesta) => {
                                                        const documentoPost = new Documento;
                                                        documentoPost.Enlace = file.uid;
                                                        documentoPost.Nombre = file.nombre;
                                                        documentoPost.TipoDocumento = tipoDocumento;
                                                        documentoPost.Activo = true;
                                                        documentoPost.Metadatos = file.Metadatos;
                                                        this.documentService.post('documento', documentoPost)
                                                            .subscribe(resuestaPost => {
                                                                documentos.push(resuestaPost)
                                                                // nuxeoservice.documentos[file.key] = resuestaPost.Body;
                                                                if ((index + 1) === files.length) {
                                                                    documentsSubject.next(documentos);
                                                                }
                                                            })

                                                    });
                                            })
                                            .catch(function (error) {
                                                console.error(error);
                                                return error;
                                            });
                                    })
                                    .catch(function (error) {
                                        console.error(error);
                                        return error;
                                    })
                            }
                        });
                });
            });
        return documents$;
    }
}
