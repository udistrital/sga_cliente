import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
    private userSubject = new BehaviorSubject({});
    public user$ = this.userSubject.asObservable();

    private terceroSubject = new BehaviorSubject({});
    public tercero$ = this.terceroSubject.asObservable();
    public terceroData: any = {}

    constructor() {}

    updateUser(dataUser) {
        this.userSubject.next(dataUser);
    }

    updateTercero(data) {
      this.terceroData = {...this.terceroData, ...data}
      this.terceroSubject.next(this.terceroData);
    }

    getAllTercero(){
      
    }
}
