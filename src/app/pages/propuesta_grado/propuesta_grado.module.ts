import { PropuestaGradoRoutingModule, routedComponents } from './propuesta_grado-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { InscripcionService } from '../../@core/data/inscripcion.service';
import { CoreService } from '../../@core/data/core.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudPropuestaGradoComponent } from './crud-propuesta_grado/crud-propuesta_grado.component';
import { ViewPropuestaGradoComponent } from './view-propuesta_grado/view-propuesta_grado.component';
import { UserService } from '../../@core/data/users.service';

@NgModule({
  imports: [
    ThemeModule,
    PropuestaGradoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    InscripcionService,
    CoreService,
    UserService,
  ],
  exports: [
    CrudPropuestaGradoComponent,
    ViewPropuestaGradoComponent,
  ],
})
export class PropuestaGradoModule { }
