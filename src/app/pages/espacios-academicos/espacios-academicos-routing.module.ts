import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspaciosAcademicosComponent } from './espacios-academicos.component';
import { CreacionEspaciosAcademicosComponent } from './creacion-espacios-academicos/creacion-espacios-academicos.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';


const routes: Routes = [{
  path: '',
  component: EspaciosAcademicosComponent,
  children: [{
    path: 'crear-editar',
    component: CreacionEspaciosAcademicosComponent,
    canActivate: [AuthGuard]
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