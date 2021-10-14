import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { ImplicitAutenticationService } from '../utils/implicit_autentication.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'application/json',
    'authorization': 'Bearer ' + window.localStorage.getItem('access_token'),
  }),
}

// const path = environment.PERSONA_SERVICE;
const path = environment.TERCEROS_SERVICE;

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private user$ = new Subject<[object]>();
  public user: any;

  constructor(private http: HttpClient, private autenticationService: ImplicitAutenticationService) {
    if (window.localStorage.getItem('id_token') !== null && window.localStorage.getItem('id_token') !== undefined) {
      const id_token = window.localStorage.getItem('id_token').split('.');
      const payload = JSON.parse(atob(id_token[1]));
      // this.http.get(path + 'persona/?query=Usuario:' + payload.sub, httpOptions)
      this.autenticationService.getDocument().then((document: string)=> {
        if (document) {
          this.http.get(path + 'datos_identificacion?query=Numero:' + document, httpOptions)
            .subscribe(res => {
              if (res !== null) {
                this.user = res[0];
                if (Object.keys(this.user).length !== 0) {
                  this.user$.next(this.user);
                  // window.localStorage.setItem('ente', res[0].Ente);
                  window.localStorage.setItem('persona_id', res[0].Id);
                } else {
                  //this.user$.next(this.user);
                  window.localStorage.setItem('persona_id', '0');
                }
              }
            });
        }
      })
    }
  }

  // public getEnte(): number {
  //   return parseInt(window.localStorage.getItem('ente'), 10);
  // }

  public getPrograma(): number {
    return parseInt(window.localStorage.getItem('programa'), 10);
  }

  public getUsuario(): string {
    return window.localStorage.getItem('usuario').toString() ;
  }

  public getPersonaId(): number {
    return parseInt(window.localStorage.getItem('persona_id'), 10);
  }

  public getPeriodo(): number {
    return parseInt(window.localStorage.getItem('IdPeriodo'), 10)
  }

  public getUser() {
    return this.user$.asObservable();
  }
}
