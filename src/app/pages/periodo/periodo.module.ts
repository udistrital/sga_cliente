import { PeriodoRoutingModule, routedComponents } from './periodo-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ClienteHabilitarPeriodoService } from '../../@core/data/cliente_habilitar_periodo.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudPeriodoComponent } from './crud-periodo/crud-periodo.component';
import { ToasterService} from 'angular2-toaster';
import { OfertaAcademicaService } from '../../@core/data/oferta_academica.service';

@NgModule({
  imports: [
    ThemeModule,
    PeriodoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    OfertaAcademicaService,
    ClienteHabilitarPeriodoService,
    ToasterService,
  ],
  exports: [
    CrudPeriodoComponent,
  ],
})
export class PeriodoModule { }
