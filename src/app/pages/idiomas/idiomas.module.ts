import { IdiomasRoutingModule, routedComponents } from './idiomas-routing.module';
import { NgModule } from '@angular/core';
import { IdiomaService } from '../../@core/data/idioma.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudIdiomasComponent } from './crud-idiomas/crud-idiomas.component';
import { ListIdiomasComponent } from './list-idiomas/list-idiomas.component';
import { ViewIdiomasComponent } from './view-idiomas/view-idiomas.component';
import { UserService } from '../../@core/data/users.service';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
@NgModule({
  imports: [
    MatCardModule,
    MatTabsModule,
    IdiomasRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    UserService,
    IdiomaService,
  ],
  exports: [
    CrudIdiomasComponent,
    ListIdiomasComponent,
    ViewIdiomasComponent,
  ],
})
export class IdiomasModule { }
