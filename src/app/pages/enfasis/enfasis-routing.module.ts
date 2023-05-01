import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnfasisComponent } from './enfasis.component';
import { ListEnfasisComponent } from './list-enfasis/list-enfasis.component';
import { CrudEnfasisComponent } from './crud-enfasis/crud-enfasis.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: EnfasisComponent,
  children: [{
    path: 'list-enfasis',
    component: ListEnfasisComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-enfasis',
    component: CrudEnfasisComponent,
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

export class EnfasisRoutingModule { }

export const routedComponents = [
  EnfasisComponent,
  ListEnfasisComponent,
  CrudEnfasisComponent,
];
