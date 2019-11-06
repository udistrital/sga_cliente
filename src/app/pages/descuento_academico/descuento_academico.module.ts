import { DescuentoAcademicoRoutingModule, routedComponents } from './descuento_academico-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudDescuentoAcademicoComponent } from './crud-descuento_academico/crud-descuento_academico.component';
import { ListDescuentoAcademicoComponent } from './list-descuento_academico/list-descuento_academico.component';
import { ViewDescuentoAcademicoComponent } from './view-descuento_academico/view-descuento_academico.component';
import { CampusMidService } from '../../@core/data/campus_mid.service';
import { DescuentoAcademicoService } from '../../@core/data/descuento_academico.service';
import { InscripcionService } from '../../@core/data/inscripcion.service';
import { ImplicitAutenticationService } from '../../@core/utils/implicit_autentication.service';
import { NuxeoService } from '../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../@core/data/documento.service';
import { UserService } from '../../@core/data/users.service';

@NgModule({
  imports: [
    ThemeModule,
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
    ImplicitAutenticationService,
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
