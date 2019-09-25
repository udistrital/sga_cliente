import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ListEnfasisService {
    private subject = new Subject<any>();

    sendListEnfasis(listEnfasis: any) {
        this.subject.next(listEnfasis);
    }

    /*
    clearListEnfasis() {
        this.subject.next();
    }
    */

    getListEnfasis(): Observable<any> {
        return this.subject.asObservable();
    }
}
