import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { RequestManager } from '../../managers/requestManager';

const path = 'CONF_MENU_SERVICE';

@Injectable({
  providedIn: 'root',
})
export class MenuService {

  private permisos: Partial<any>[];

  constructor(
    private requestManager: RequestManager
  ) {
    this.permisos = []; 
  }

  get(endpoint) {
    this.requestManager.setPath(path);
    return this.requestManager.get(endpoint);
  }

  post(endpoint, element) {
    this.requestManager.setPath(path);
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint, element) {
    this.requestManager.setPath(path);
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint, element) {
    this.requestManager.setPath(path);
    return this.requestManager.delete(endpoint, element.Id);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError({
      status: error.status,
      message: 'Something bad happened; please try again later.',
    });
  };

  public setPermisos(configuraciones: any) {
    this.permisos = configuraciones;
  }

  public getRoute(accion: string): any {
    return this.findRoute(this.permisos, accion);
  }

  findRoute(menu: any[], option: string) {
    return menu.find(opt => (opt.Url === option) ||
      (opt.Opciones && opt.Opciones.length && this.findRoute(opt.Opciones, option)));
  }

}
