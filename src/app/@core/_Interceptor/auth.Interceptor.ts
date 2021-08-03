import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';

import { tap, finalize, takeUntil } from 'rxjs/operators';
import { PopUpManager } from './../../managers/popUpManager';
import { LoaderService } from '../utils/load.service';
import { Observable } from 'rxjs';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  header: any = null;
  accessToken: any;
  constructor(private router: Router,
    private pUpManager: PopUpManager,
    public loaderService: LoaderService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.
    const acccess_token = this.accessToken?this.accessToken:localStorage.getItem('access_token');
    if(acccess_token) {
      this.accessToken = acccess_token?acccess_token:null;
      this.loaderService.show();
      const authReq =  req.clone({
        headers: new HttpHeaders({
          // 'Accept-Encoding': 'gzip, compress, br',
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken?this.accessToken:localStorage.getItem('access_token')}`,
        }),
      });

      // Clone the request and replace the original headers with
      // cloned headers, updated with the authorization.

      // send cloned request with header to the next handler.
      return next.handle(authReq).pipe(
        tap((event: any) => {
          // There may be other events besides the response.
          if (event instanceof HttpErrorResponse) {
            // cache.put(req, event); // Update the cache.
            this.router.navigate(['/']);
            this.pUpManager.showErrorToast(`${event.status}`);
          } else {
            if (event.body) {
              if (event.body !== null) {
                if (event.body.Body !== undefined && event.body.Body === null) {
                  this.pUpManager.showInfoToast('No se encontraron Datos');
                }
              } else {
                this.pUpManager.showInfoToast('No se encontraron Datos');
              }
            }
          }
        },
          (error: any) => {
            // console.info(error);
            this.pUpManager.showErrorToast(`${error.status}`);
          },
        ),
        finalize(() => this.loaderService.hide()),
      );
    } else {
      return next.handle(req).pipe(
        tap((event: any) => {
          // There may be other events besides the response.
          if (event instanceof HttpErrorResponse) {
            // cache.put(req, event); // Update the cache.
            // this.snackBar.open('test', undefined, { duration: 5000 });
            this.pUpManager.showErrorToast(`${event.status}`);
          } else {

            if (event.body) {

              if (event.body !== null) {

                if (event.body.Body !== undefined && event.body.Body === null) {
                  this.pUpManager.showInfoToast('No se encontraron Datos');
                }

              } else {
                this.pUpManager.showInfoToast('No se encontraron Datos');
              }
            }
          }
        },
          (error: any) => {
            this.pUpManager.showErrorToast(`${error.status}`);
          },
        ));
    }
  }
}
