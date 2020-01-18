import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CriterioIcfesComponent } from './criterio_icfes.component';
import { CrudCriterioIcfesComponent } from './crud-criterio_icfes/crud-criterio_icfes.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: CriterioIcfesComponent,
  children: [ {
    path: 'crud-criterio_icfes',
    component: CrudCriterioIcfesComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
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

export class CriterioIcfesRoutingModule { }

export const routedComponents = [
  CriterioIcfesComponent,
  CrudCriterioIcfesComponent,
];
