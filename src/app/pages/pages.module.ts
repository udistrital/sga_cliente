import { NgModule, Optional, SkipSelf } from '@angular/core';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from '../shared/shared.module';
import {ToasterModule} from 'angular2-toaster'
import { CoreModule, throwIfAlreadyLoaded } from '../@core/core.module';
export const httpLoaderFactory = (http: HttpClient) => new TranslateHttpLoader(http, './../assets/i18n/', '.json');

const PAGES_COMPONENTS = [
  PagesComponent,
];

@NgModule({
  imports: [
    CoreModule,
    MatCardModule,
    CommonModule,
    HttpClientModule,
    PagesRoutingModule,
    DashboardModule,
    ToasterModule.forRoot(),
    SharedModule.forRoot(),
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
