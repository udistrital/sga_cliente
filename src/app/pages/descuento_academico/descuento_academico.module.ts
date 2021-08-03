import { DescuentoAcademicoRoutingModule, routedComponents } from './descuento_academico-routing.module';
import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudDescuentoAcademicoComponent } from './crud-descuento_academico/crud-descuento_academico.component';
import { ListDescuentoAcademicoComponent } from './list-descuento_academico/list-descuento_academico.component';
import { ViewDescuentoAcademicoComponent } from './view-descuento_academico/view-descuento_academico.component';
import { CampusMidService } from '../../@core/data/campus_mid.service';
import { DescuentoAcademicoService } from '../../@core/data/descuento_academico.service';
import { InscripcionService } from '../../@core/data/inscripcion.service';
import { NuxeoService } from './../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../@core/data/documento.service';
import { UserService } from '../../@core/data/users.service';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  imports: [
    MatCardModule,
    MatTabsModule,
    DescuentoAcademicoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    CampusMidService,
    DescuentoAcademicoService,
    InscripcionService,
    NuxeoService,
    DocumentoService,
    UserService,
  ],
  exports: [
    CrudDescuentoAcademicoComponent,
    ListDescuentoAcademicoComponent,
    ViewDescuentoAcademicoComponent,
  ],
})
export class DescuentoAcademicoModule { }
