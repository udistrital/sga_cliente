import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable()

export class OfertaAcademicaService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('OFERTA_ACADEMICA_SERVICE');
  }

  get(endpoint) {
    this.requestManager.setPath('OFERTA_ACADEMICA_SERVICE');
    return this.requestManager.get(endpoint);
  }

  post(endpoint, element) {
    this.requestManager.setPath('OFERTA_ACADEMICA_SERVICE');
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint, element) {
    this.requestManager.setPath('OFERTA_ACADEMICA_SERVICE');
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint, element) {
    this.requestManager.setPath('OFERTA_ACADEMICA_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
  }
}
