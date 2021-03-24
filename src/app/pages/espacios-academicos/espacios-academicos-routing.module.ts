import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EspaciosAcademicosComponent } from './espacios-academicos.component';
import { PreinscripcionEspaciosAcademicosComponent } from './preinscripcion-espacios-academicos/preinscripcion-espacios-academicos.component';

const routes: Routes = [{
    path: '',
    component: EspaciosAcademicosComponent,
    children: [
        {
            path: 'preinscripcion-espacios-academicos',
            component: PreinscripcionEspaciosAcademicosComponent,
        },
    ]
}]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EspaciosAcademicosRoutingModule {}

export const routedComponents = [
    EspaciosAcademicosComponent,
    PreinscripcionEspaciosAcademicosComponent,
]
