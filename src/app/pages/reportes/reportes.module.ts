import { EventoRoutingModule, routedComponents } from './reportes-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from '../../@core/data/users.service';
import { VisualizacionComponent } from './visualizacion/visualizacion.component';

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
    VisualizacionComponent,
  ],
  providers: [
    UserService,
  ],
})
export class ReportesModule { }
