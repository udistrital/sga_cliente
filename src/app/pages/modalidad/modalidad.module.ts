import { NgModule } from '@angular/core';

import { ModalidadRoutingModule, routedComponents } from './modalidad-routing.module';
import { CrudModalidadComponent } from './crud-modalidad/crud-modalidad.component';
import { ListModalidadComponent } from './list-modalidad/list-modalidad.component';
import { ThemeModule } from '../../@theme/theme.module';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { ProyectoAcademicoService } from '../../@core/data/proyecto_academico.service';
import { MatInputModule, MatPaginatorModule, MatSortModule, MatTableModule } from '@angular/material';


@NgModule({
  imports: [
    ThemeModule,
    ModalidadRoutingModule,
    ToasterModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ProyectoAcademicoService,
    ToasterService
  ],
  exports: [
    CrudModalidadComponent,
    ListModalidadComponent
  ],
})
export class ModalidadModule { }
