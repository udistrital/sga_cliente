import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class PivotDocument {

    private documentSubject = new BehaviorSubject(null);
    public document$ = this.documentSubject.asObservable();

    constructor() {
    }

    updateDocument(document) {
        console.log("documento para presentar", document);
        this.documentSubject.next(document)
    }

}
