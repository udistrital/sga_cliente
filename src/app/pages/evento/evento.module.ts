import { EventoRoutingModule, routedComponents } from './evento-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { EventoService } from '../../@core/data/evento.service';
import { OikosService } from '../../@core/data/oikos.service';
import { CoreService } from '../../@core/data/core.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudEventoComponent } from './crud-evento/crud-evento.component';
import { ListEventoComponent } from './list-evento/list-evento.component';
import { UserService } from '../../@core/data/users.service';
import { PersonaService } from '../../@core/data/persona.service';

@NgModule({
  imports: [
    ThemeModule,
    EventoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    EventoService,
    UserService,
    PersonaService,
    OikosService,
    CoreService,
  ],
  exports: [
    CrudEventoComponent,
    ListEventoComponent,
  ],
})
export class EventoModule { }
