import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DescuentoProyectoComponent } from './descuento_proyecto.component';
import { SelectDescuentoProyectoComponent } from './select-descuento-proyecto/select-descuento-proyecto.component';
import { ListDescuentoProyectoComponent } from './list-descuento-proyecto/list-descuento-proyecto.component';
import { CrudDescuentoProyectoComponent } from './crud-descuento-proyecto/crud-descuento-proyecto.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';


const routes: Routes = [{
  path: '',
  component: DescuentoProyectoComponent,
  children: [{
    path: 'select-descuento-proyecto',
    component: SelectDescuentoProyectoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'list-descuento-proyecto',
    component: ListDescuentoProyectoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-descuento-proyecto',
    component: CrudDescuentoProyectoComponent,
    canActivate: [AuthGuard],
  }],
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class DescuentoProyectoRoutingModule { }

export const routedComponents = [
  DescuentoProyectoComponent,
  ListDescuentoProyectoComponent,
  SelectDescuentoProyectoComponent,
  CrudDescuentoProyectoComponent,
];
