import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdmisionComponent } from './admision.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { CriterioAdmisionComponent } from './criterio_admision/criterio_admision.component';

const routes: Routes = [{
  path: '',
  component: AdmisionComponent,
  children: [{
  path: 'criterio_admision',
  component: CriterioAdmisionComponent,
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

export class AdmisionRoutingModule { }

export const routedComponents = [
  AdmisionComponent,
  CriterioAdmisionComponent,
];
