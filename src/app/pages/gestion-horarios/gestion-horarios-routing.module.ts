import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionHorariosComponent } from './gestion-horarios.component';
import { DisponibilidadCuposComponent } from './disponibilidad-cupos/disponibilidad-cupos.component';
import { HorariosGruposComponent } from './horarios-grupos/horarios-grupos.component';
import { GestionHorarioComponent } from './gestion-horario/gestion-horario.component';
import { GestionGruposComponent } from './gestion-grupos/gestion-grupos.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { RegistroHorariosComponent } from './registro-horarios/registro-horarios.component';


const routes: Routes = [{
  path: '',
  component: GestionHorariosComponent,
  children: [{
    path: 'disponibilidad-cupos',
    component: DisponibilidadCuposComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'horarios-grupos',
    component: HorariosGruposComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'gestion-horario',
    component: GestionHorarioComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'gestion-grupos',
    component: GestionGruposComponent,
    //canActivate: [AuthGuard],
  },
  {
    path: 'registro-horarios',
    component: RegistroHorariosComponent,
    //canActivate: [AuthGuard],
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionHorariosRoutingModule { }

export const routedComponents = [
    GestionHorariosComponent,
    DisponibilidadCuposComponent,
    HorariosGruposComponent,
    GestionHorarioComponent,
    GestionGruposComponent,
    RegistroHorariosComponent
]