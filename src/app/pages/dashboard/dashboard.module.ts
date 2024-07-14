import { NgModule } from '@angular/core';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NewsComponent } from './news/news.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    ThemeModule,
    SharedModule
  ],
  declarations: [
    DashboardComponent,
    CarouselComponent,
    NewsComponent,
  ],
})
export class DashboardModule { }
