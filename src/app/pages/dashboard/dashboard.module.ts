import { NgModule } from '@angular/core';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { CarouselComponent } from './carousel/carousel.component';
import { NewsComponent } from './news/news.component';
import { VideoModalComponent } from '../../@theme/components/video-modal/video-modal.component';


@NgModule({
  imports: [
    ThemeModule,
  ],
  declarations: [
    DashboardComponent,
    CarouselComponent,
    NewsComponent,
  ],
  entryComponents: [
    VideoModalComponent,
  ],
})
export class DashboardModule { }
