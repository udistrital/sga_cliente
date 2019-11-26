import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { RequestManager } from '../../managers/requestManager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

const httpOptionsFile = {
    headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
    }),
}

const path = environment.SGA_MID_SERVICE;

@Injectable()
export class SgaMidService {


  constructor(private requestManager: RequestManager, private http: HttpClient) {
    this.requestManager.setPath('SGA_MID_SERVICE');
  }
  get(endpoint) {
    this.requestManager.setPath('SGA_MID_SERVICE');
    return this.requestManager.get(endpoint);
  }
  post(endpoint, element) {
    this.requestManager.setPath('SGA_MID_SERVICE');
    return this.requestManager.post(endpoint, element);
  }
  post_file(endpoint, element) {
    this.requestManager.setPath('SGA_MID_SERVICE');
    return this.http.post<any>(path + endpoint, element, httpOptionsFile).pipe(
      catchError(this.handleError),
    );
  }

  put(endpoint, element) {
    this.requestManager.setPath('SGA_MID_SERVICE');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint, element) {
    this.requestManager.setPath('SGA_MID_SERVICE');
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
}
