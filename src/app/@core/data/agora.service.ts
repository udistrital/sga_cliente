import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { RequestManager } from '../../managers/requestManager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable({
  providedIn: 'root',
})
export class AgoraService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('AGORA_SERVICE');
  }
  get(endpoint) {
    this.requestManager.setPath('AGORA_SERVICE');
    return this.requestManager.get(endpoint);
  }
  post(endpoint, element) {
    this.requestManager.setPath('AGORA_SERVICE');
    return this.requestManager.post(endpoint, element);
  }
  put(endpoint, element) {
    this.requestManager.setPath('AGORA_SERVICE');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint, element) {
    this.requestManager.setPath('AGORA_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
  }
}
