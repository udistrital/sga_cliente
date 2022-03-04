import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NewNuxeoService } from './new_nuxeo.service';


@Injectable({
    providedIn: 'root',
})
export class PivotDocument {

    private documentSubject = new BehaviorSubject(null);
    public document$ = this.documentSubject.asObservable();

    private infoSubject = new BehaviorSubject(null);
    public info$ = this.infoSubject.asObservable();

    constructor(private nuxeoService: NewNuxeoService) {
    }

    updateInfo(info) {
        this.infoSubject.next(info);
    }

    updateDocument(document) {
        this.nuxeoService.get([document]).subscribe(
            response => {
                const filesResponse = <any>response;
                const url = filesResponse[0].url;
                window.open(url);
            }
        );
        this.documentSubject.next(document);
    }

}
