import { PeriodoRoutingModule, routedComponents } from './periodo-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { SharedModule } from '../../shared/shared.module';
import { CrudPeriodoComponent } from './crud-periodo/crud-periodo.component';
import { OfertaAcademicaService } from '../../@core/data/oferta_academica.service';
import { ParametrosService } from '../../@core/data/parametros.service';

@NgModule({
  imports: [
    ThemeModule,
    PeriodoRoutingModule,
    Ng2SmartTableModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    OfertaAcademicaService,
    ParametrosService,
  ],
  exports: [
    CrudPeriodoComponent,
  ],
})
export class PeriodoModule { }
