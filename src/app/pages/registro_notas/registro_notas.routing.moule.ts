import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CapturaNotasComponent } from './captura-notas/captura-notas.component';
import { CrudNotasComponent } from './crud-notas/crud-notas.component';
import { DefinicionCortesComponent } from './definicion-cortes/definicion-cortes.component';
import { ListNotasComponent } from './list-notas/list-notas.component';
import { RegistroNotasComponent } from './registro_notas.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: RegistroNotasComponent,
  children: [{
    path: 'list-notas',
    component: ListNotasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-notas',
    component: CrudNotasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'captura-notas',
    component: CapturaNotasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'definicion-cortes',
    component: DefinicionCortesComponent,
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

export class RegistroNotasRoutingModule { }

export const routedComponents = [
  ListNotasComponent,
  CrudNotasComponent,
  RegistroNotasComponent,
  CapturaNotasComponent,
  DefinicionCortesComponent
];
