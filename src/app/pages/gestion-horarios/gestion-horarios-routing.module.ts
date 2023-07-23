import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionHorariosComponent } from './gestion-horarios.component';
import { DisponibilidadCuposComponent } from './disponibilidad-cupos/disponibilidad-cupos.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';


const routes: Routes = [{
  path: '',
  component: GestionHorariosComponent,
  children: [{
    path: 'crear-editar-horarios',
    component: DisponibilidadCuposComponent,
    canActivate: [AuthGuard]
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionHorariosRoutingModule { }

export const routedComponents = [
    GestionHorariosComponent,
    DisponibilidadCuposComponent
]