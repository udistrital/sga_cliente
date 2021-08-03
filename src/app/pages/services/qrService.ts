import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QrService {
    private dataInfo = {};
    private qrDataSubject = new BehaviorSubject("");
    public qrData$ = this.qrDataSubject.asObservable();

    constructor() {}

    updateData(dataInfo) {
        this.dataInfo = {
            ...dataInfo
        }
        this.qrDataSubject.next(JSON.stringify(this.dataInfo));
    }

}
