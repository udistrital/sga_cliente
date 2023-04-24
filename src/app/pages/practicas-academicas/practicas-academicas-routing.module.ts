import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PracticasAcademicasComponent } from './practicas-academicas.component';
import { NuevaSolicitudComponent } from './nueva-solicitud/nueva-solicitud.component';
import { SolicitantePracticaComponent } from './solicitante-practica/solicitante-practica.component';
import { ListPracticasAcademicasComponent } from './list-practicas-academicas/list-practicas-academicas.component';
import { DetallePracticaAcademicaComponent } from './detalle-practica-academica/detalle-practica-academica.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
    path: '',
    component: PracticasAcademicasComponent,
    children: [
        {
            path: 'nueva-solicitud',
            component: NuevaSolicitudComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'nueva-solicitud/:id/:process',
            component: NuevaSolicitudComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'lista-practicas/:process',
            component: ListPracticasAcademicasComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'detalle-practica-academica/:id/:process',
            component: DetallePracticaAcademicaComponent,
            canActivate: [AuthGuard],
        }
    ]
}];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class PracticasAcademicasRoutingModule { }

export const routedComponents = [
    PracticasAcademicasComponent,
    NuevaSolicitudComponent,
    SolicitantePracticaComponent,
    ListPracticasAcademicasComponent,
    DetallePracticaAcademicaComponent,
]
