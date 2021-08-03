import { InformacionContactoRoutingModule, routedComponents } from './informacion_contacto-routing.module';
import { NgModule } from '@angular/core';
import { UbicacionService } from '../../@core/data/ubicacion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { UserService } from '../../@core/data/users.service';
import { CrudInformacionContactoComponent } from './crud-informacion_contacto/crud-informacion_contacto.component';
import { ViewInformacionContactoComponent } from './view-informacion_contacto/view-informacion_contacto.component';
import { CrudInformacionFamiliarComponent } from './crud-informacion_familiar/crud-informacion_familiar.component';
import { CrudInformacionContactoPregradoComponent } from './crud-informacion_contacto_pregrado/crud-informacion_contacto_pregrado.component';
import { CrudInformacionContactoExternaComponent } from './crud-informacion_contacto_externa/crud-informacion_contacto_externa.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [
    MatCardModule,
    MatTabsModule,
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
    UserService,
  ],
  exports: [
    CrudInformacionContactoComponent,
    CrudInformacionFamiliarComponent,
    CrudInformacionContactoPregradoComponent,
    CrudInformacionContactoExternaComponent,
    ViewInformacionContactoComponent,
  ],
})
export class InformacionContactoModule {
  static forRoot(): any[] | import('@angular/core').Type<any> | import('@angular/core').ModuleWithProviders<{}> {
    throw new Error('Method not implemented.');
  }
}
