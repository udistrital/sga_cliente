import { InformacionContactoRoutingModule, routedComponents } from './informacion_contacto-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { UbicacionService } from '../../@core/data/ubicacion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudInformacionContactoComponent } from './crud-informacion_contacto/crud-informacion_contacto.component';
import { ViewInformacionContactoComponent } from './view-informacion_contacto/view-informacion_contacto.component';

@NgModule({
  imports: [
    ThemeModule,
    InformacionContactoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    UbicacionService,
  ],
  exports: [
    CrudInformacionContactoComponent,
    ViewInformacionContactoComponent,
  ],
})
export class InformacionContactoModule { }
