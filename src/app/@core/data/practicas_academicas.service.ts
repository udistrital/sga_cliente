import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestManager } from '../../managers/requestManager';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable({
    providedIn: 'root',
})

export class PracticasAcademicasService {

    constructor(private http: HttpClient,
        private requestManager: RequestManager) {
        this.requestManager.setPath('SGA_MID_SERVICE');
    }

    getPracticas(endpoint, id = null, stateFilter = null) {
        if (id) {
            return this.requestManager.get(endpoint).pipe(map((practica: any) => {
                return practica.Data.map((p: any) => {
                    return {
                        ...p,
                        ...{
                            TipoSolicitud: p.EstadoTipoSolicitudId.TipoSolicitud,
                            EstadoId: p.EstadoTipoSolicitudId.EstadoId
                        }
                    }
                }).filter((practicas: any) => (id == practicas.Id))

            }))
        }

        if (stateFilter) {
            return this.requestManager.get(endpoint).pipe(map((practica: any) => {
                return practica.Data.map((p: any) => {
                    return {
                        ...p,
                        ...{
                            TipoSolicitud: p.EstadoTipoSolicitudId.TipoSolicitud,
                            EstadoId: p.EstadoTipoSolicitudId.EstadoId
                        }
                    }
                }).filter((practicas: any) => {
                    return (stateFilter.includes(practicas.EstadoId.Nombre))
                })
            }))
        }

        return this.requestManager.get(endpoint).pipe(map((practica: any) => {
            return {
                ...practica.Data,
                ...{
                    TipoSolicitud: practica.Data.EstadoTipoSolicitudId.TipoSolicitud,
                    EstadoId: practica.Data.EstadoTipoSolicitudId.EstadoId
                }
            }
        }))
    }

    get(path, endpoint) {
        return this.http.get(path + endpoint, httpOptions).pipe(
            catchError(this.handleError),
        );
    }

    post(path, endpoint, element) {
        return this.http.post(path + endpoint, element, httpOptions).pipe(
            catchError(this.handleError),
        );
    }

    put(path, endpoint, element) {
        return this.http.put(path + endpoint + '/', element, httpOptions).pipe(
            catchError(this.handleError),
        ); // + element.Id
    }
    put2(path, endpoint, element) {
        return this.http.put(path + endpoint + '/' + element.Id, element, httpOptions).pipe(
            catchError(this.handleError),
        );
    }

    delete(path, endpoint, element) {
        return this.http.delete(path + endpoint + '/' + element.Id, httpOptions).pipe(
            catchError(this.handleError),
        );
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
