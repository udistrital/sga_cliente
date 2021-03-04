import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PracticasAcademicasComponent } from './practicas-academicas.component';
import { NuevaSolicitudComponent } from './nueva-solicitud/nueva-solicitud.component';

const routes: Routes = [{
    path: '',
    component: PracticasAcademicasComponent,
    children: [
        {
            path: 'nueva-solicitud',
            component: NuevaSolicitudComponent,
        },
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
]
  