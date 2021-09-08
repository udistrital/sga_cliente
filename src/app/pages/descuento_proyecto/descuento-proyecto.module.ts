import { DescuentoProyectoRoutingModule, routedComponents } from './descuento-proyecto-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ProyectoAcademicoService } from '../../@core/data/proyecto_academico.service';
import { DocumentoProgramaService } from '../../@core/data/documento_programa.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudDescuentoProyectoComponent } from './crud-descuento-proyecto/crud-descuento-proyecto.component';
import { ListDescuentoProyectoComponent } from './list-descuento-proyecto/list-descuento-proyecto.component';
import { NbSpinnerModule } from '@nebular/theme';
import { SelectDescuentoProyectoComponent } from './select-descuento-proyecto/select-descuento-proyecto.component';
import { ToasterService } from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    DescuentoProyectoRoutingModule,
    Ng2SmartTableModule,
    NbSpinnerModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ProyectoAcademicoService,
    ToasterService,
    DocumentoProgramaService,
  ],
  exports: [
    CrudDescuentoProyectoComponent,
    ListDescuentoProyectoComponent,
    SelectDescuentoProyectoComponent,
  ],
})
export class DescuentoProyectoModule { }
