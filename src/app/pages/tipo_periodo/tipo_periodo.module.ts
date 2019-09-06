import { TipoPeriodoRoutingModule, routedComponents } from './tipo_periodo-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ClienteHabilitarPeriodoService } from '../../@core/data/cliente_habilitar_periodo.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudTipoPeriodoComponent } from './crud-tipo_periodo/crud-tipo_periodo.component';
import { ToasterService} from 'angular2-toaster';
import { OfertaAcademicaService } from '../../@core/data/oferta_academica.service';

@NgModule({
  imports: [
    ThemeModule,
    TipoPeriodoRoutingModule,
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
    CrudTipoPeriodoComponent,
  ],
})
export class TipoPeriodoModule { }
