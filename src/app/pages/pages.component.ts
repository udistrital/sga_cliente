import { AfterViewInit, Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { fromEvent } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-loading></ngx-loading>
    <div *ngIf="loaded" class="main-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./pages.component.scss']

})

export class PagesComponent implements OnInit {
  environment: any;
  loaded = false;
  userData: any;
  loadingRouter = false;
  constructor(
    private router: Router,
    private translateService: TranslateService,
  ) {
    this.environment = environment;
    router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        Swal.fire({
          title: 'Cargando módulo ...',
          html: `Por favor espere`,
          showConfirmButton: false,
          allowOutsideClick: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });
        this.loadingRouter = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loadingRouter = false;
        Swal.close();
      } else {
        Swal.close();
      }

    });
  }
  ngOnInit(): void {

    this.loaded = true;
    this.translateService.addLangs(['es', 'en']);
    this.translateService.setDefaultLang('es');
    this.translateService.use(this.translateService.getBrowserLang());
  }
}
