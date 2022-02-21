import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrudNotasComponent } from './crud-notas/crud-notas.component';
import { ListNotasComponent } from './list-notas/list-notas.component';
import { RegistroNotasComponent } from './registro_notas.component';



const routes: Routes = [{
  path: '',
  component: RegistroNotasComponent,
  children: [{
    path: 'list-notas',
    component: ListNotasComponent ,
  }, {
    path: 'crud-notas/:process',
    component: CrudNotasComponent,
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
];
