import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from '../shared/shared.module';

export const httpLoaderFactory = (http: HttpClient) => new TranslateHttpLoader(http, './../assets/i18n/', '.json');

const PAGES_COMPONENTS = [
  PagesComponent,
];

@NgModule({
  imports: [
    MatCardModule,
    CommonModule,
    HttpClientModule,
    PagesRoutingModule,
    DashboardModule,
    SharedModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
  providers: [
  ],
})
export class PagesModule {
}
