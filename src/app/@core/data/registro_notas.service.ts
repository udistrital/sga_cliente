import { Injectable } from '@angular/core';

export interface DataAsignatura {
    Asignatura_id: string;
    Periodo_id: number;
    Nivel_id: number;
    EstadoRegistro_porTiempo: number;
    EstadoRegistro_porExtemporaneo?: number;
}

@Injectable()
export class RegistroNotasService {
  private data: DataAsignatura;
  constructor() { }

  public getData(): DataAsignatura {
    return this.data;
  }

  public putData(d: DataAsignatura): void {
    this.data = d;
  }
}