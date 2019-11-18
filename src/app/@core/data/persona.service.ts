import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { RequestManager } from '../../managers/requestManager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable()
export class PersonaService {

    constructor(private requestManager: RequestManager) {
        this.requestManager.setPath('PERSONA_SERVICE');
      }

      get(endpoint) {
        this.requestManager.setPath('PERSONA_SERVICE');
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
