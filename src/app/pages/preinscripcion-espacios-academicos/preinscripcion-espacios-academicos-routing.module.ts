import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreinscripcionEspaciosAcademicosComponent } from './preinscripcion-espacios-academicos.component';
import { PreinscripcionEspaciosAcademicosComponentSub } from './preinscripcion-espacios-academicos-sub/preinscripcion-espacios-academicos-sub.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
    path: '',
    component: PreinscripcionEspaciosAcademicosComponent,
    children: [
        {
            path: 'preinscripcion',
            component: PreinscripcionEspaciosAcademicosComponentSub,
            canActivate: [AuthGuard],
        },
    ]
}]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EspaciosAcademicosRoutingModule { }

export const routedComponents = [
    PreinscripcionEspaciosAcademicosComponent,
    PreinscripcionEspaciosAcademicosComponentSub,
]
