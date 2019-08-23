import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagesRoutingModule } from './pages-routing.module';
import { ThemeModule } from '../@theme/theme.module';
import { SharedModule } from '../shared/shared.module';
import { ConfiguracionService } from '../@core/data/configuracion.service';
import { MenuService } from '../@core/data/menu.service';
import { CampusMidService } from '../@core/data/campus_mid.service';
import { SgaMidService } from '../@core/data/sga_mid.service';
import { DocumentoService } from '../@core/data/documento.service';

const PAGES_COMPONENTS = [
  PagesComponent,
];

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    DashboardModule,
    SharedModule,
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
  providers: [
    ConfiguracionService,
    MenuService,
    CampusMidService,
    SgaMidService,
    DocumentoService,
  ],
})
export class PagesModule {
}
