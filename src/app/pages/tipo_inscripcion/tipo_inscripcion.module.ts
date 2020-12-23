import { TipoInscripcionRoutingModule, routedComponents } from './tipo_inscripcion-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ClienteHabilitarPeriodoService } from '../../@core/data/cliente_habilitar_periodo.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudTipoInscripcionComponent } from './crud-tipo_inscripcion/crud-tipo_inscripcion.component';
import { ToasterService} from 'angular2-toaster';
import { OfertaAcademicaService } from '../../@core/data/oferta_academica.service';

@NgModule({
  imports: [
    ThemeModule,
    TipoInscripcionRoutingModule,
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
    CrudTipoInscripcionComponent,
  ],
})
export class TipoInscripcionModule { }
