import { EventoRoutingModule, routedComponents } from './reportes-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { InscritosProyectoComponent } from './inscripciones/inscritos-proyecto/inscritos-proyecto.component';
import { UserService } from '../../@core/data/users.service';

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
    UserService,
  ],
  exports: [
    InscritosProyectoComponent,
  ],
})
export class ReportesModule { }
