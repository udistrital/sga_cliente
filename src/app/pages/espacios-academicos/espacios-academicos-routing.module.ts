import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspaciosAcademicosComponent } from './espacios-academicos.component';
import { CreacionEspaciosAcademicosComponent } from './creacion-espacios-academicos/creacion-espacios-academicos.component';


const routes: Routes = [{
  path: '',
  component: EspaciosAcademicosComponent,
  children: [{
    path: 'crear-editar',
    component: CreacionEspaciosAcademicosComponent,

  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EspaciosAcademicosRoutingModule { }

export const routedComponents = [
  EspaciosAcademicosComponent,
  CreacionEspaciosAcademicosComponent
]