import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { ImplicitAutenticationService } from '../utils/implicit_autentication.service';
import { AnyService } from './any.service';

const path = environment.TERCEROS_SERVICE;

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private user$ = new Subject<[object]>();
  private userSubject = new BehaviorSubject(null);
  public tercero$ = this.userSubject.asObservable();
  public user: any;

  constructor(private anyService: AnyService, private autenticationService: ImplicitAutenticationService) {
    if (window.localStorage.getItem('id_token') !== null && window.localStorage.getItem('id_token') !== undefined) {
      const id_token = window.localStorage.getItem('id_token').split('.');
      const payload = JSON.parse(atob(id_token[1]));
      this.autenticationService.getDocument().then((document: string) => {
        if (document) {
          console.log("getUser", document);
          this.anyService.get(path, 'datos_identificacion?query=Numero:' + document)
            .subscribe(res => {
              if (res !== null) {
                this.user = res[0].TerceroId;
                if (Object.keys(this.user).length !== 0) {
                  this.user$.next(this.user);
                  this.userSubject.next(this.user);              // window.localStorage.setItem('ente', res[0].Ente);
                  window.localStorage.setItem('persona_id', this.user.Id);
                } else {
                  //this.user$.next(this.user);
                  window.localStorage.setItem('persona_id', '0');
                }
              }
            });
        } else if (payload.sub) {
          this.anyService.get(path, 'tercero?query=UsuarioWSO2:' + payload.sub)
            .subscribe(res => {
              if (res !== null) {
                this.user = res[0];
                this.user$.next(this.user);
                this.userSubject.next(this.user);
                window.localStorage.setItem('persona_id', this.user.Id);
              }
              else {
                //this.user$.next(this.user);
                window.localStorage.setItem('persona_id', '0');
              }
            })
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
    return window.localStorage.getItem('usuario').toString();
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
