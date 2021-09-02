import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class PivotDocument {

    private documentSubject = new BehaviorSubject(null);
    public document$ = this.documentSubject.asObservable();

    private infoSubject = new BehaviorSubject(null);
    public info$ = this.infoSubject.asObservable();

    constructor() {
    }

    updateInfo(info){
        this.infoSubject.next(info);
    }

    updateDocument(document) {
        console.log("documento para presentar", document);
        this.documentSubject.next(document)
    }

}
