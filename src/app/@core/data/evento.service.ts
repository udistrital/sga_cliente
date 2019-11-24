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

const path = environment.EVENTO_SERVICE;

@Injectable()
export class EventoService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('EventoService');
  }
  get(endpoint) {
    this.requestManager.setPath('EventoService');
    return this.requestManager.get(endpoint);
  }
  post(endpoint, element) {
    return this.requestManager.post(endpoint, element);
  }
  put(endpoint, element) {
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint, element) {
    return this.requestManager.delete(endpoint, element.Id);
  }
}
