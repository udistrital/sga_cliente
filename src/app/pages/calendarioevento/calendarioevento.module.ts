import { CalendarioeventoRoutingModule, routedComponents } from './calendarioevento-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { OfertaAcademicaService } from '../../@core/data/oferta_academica.service';
import { ClienteHabilitarPeriodoService } from '../../@core/data/cliente_habilitar_periodo.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudCalendarioeventoComponent } from './crud-calendarioevento/crud-calendarioevento.component';
import { ToasterService} from 'angular2-toaster';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports: [
    ThemeModule,
    CalendarioeventoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    OfertaAcademicaService,
    HttpClient,
    ClienteHabilitarPeriodoService,
    ToasterService,
  ],
  exports: [
    CrudCalendarioeventoComponent,
  ],
})
export class CalendarioeventoModule { }
