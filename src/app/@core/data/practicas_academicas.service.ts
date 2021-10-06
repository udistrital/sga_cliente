import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

@Injectable({
    providedIn: 'root',
})

export class PracticasAcademicasService {
    practicas = [{
        Numero: 123,
        FechaSolicitud: '05/03/2021',
        TipoSolicitud: 'Prácticas académicas 1',
        EstadoSolicitud: 'Radicada',
        estados: [{
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 1',
            EstadoSolicitud: 'Radicada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 2',
            EstadoSolicitud: 'Aprobada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 3',
            EstadoSolicitud: 'Rechazada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 4',
            EstadoSolicitud: 'Devuelta',
        }]

    }, {
        Numero: 456,
        FechaSolicitud: '05/03/2021',
        TipoSolicitud: 'Prácticas académicas 2',
        EstadoSolicitud: 'Aprobada',
        estados: [{
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 1',
            EstadoSolicitud: 'Radicada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 2',
            EstadoSolicitud: 'Aprobada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 3',
            EstadoSolicitud: 'Rechazada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 4',
            EstadoSolicitud: 'Devuelta',
        }]
    }, {
        Numero: 789,
        FechaSolicitud: '05/03/2021',
        TipoSolicitud: 'Prácticas académicas 3',
        EstadoSolicitud: 'Rechazada',
        estados: [{
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 1',
            EstadoSolicitud: 'Radicada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 2',
            EstadoSolicitud: 'Aprobada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 3',
            EstadoSolicitud: 'Rechazada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 4',
            EstadoSolicitud: 'Devuelta',
        }]
    }, {
        Numero: 101,
        FechaSolicitud: '05/03/2021',
        TipoSolicitud: 'Prácticas académicas 4',
        EstadoSolicitud: 'Devuelta',
        estados: [{
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 1',
            EstadoSolicitud: 'Radicada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 2',
            EstadoSolicitud: 'Aprobada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 3',
            EstadoSolicitud: 'Rechazada',
        }, {
            FechaSolicitud: '05/03/2021',
            observaciones: 'Prácticas académicas 4',
            EstadoSolicitud: 'Devuelta',
        }]
    }]

    constructor(private http: HttpClient) {
    }

    getPracticas(id = null, stateFilter = null) {
        if (id) {
            return this.practicas.filter((practicas) => (id == practicas.Numero))
        }
        if (stateFilter) {
            return this.practicas.filter((practicas) => (stateFilter.includes(practicas.EstadoSolicitud)))
        }
        return this.practicas;
    }

    getEstados(id = null, stateFilter = null) {
        if (id) {
            return this.practicas.filter((practicas) => (id === practicas.Numero))
        }
        if (stateFilter) {
            return this.practicas.filter((practicas) => (stateFilter.includes(practicas.EstadoSolicitud)))
        }
        return this.practicas;
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
