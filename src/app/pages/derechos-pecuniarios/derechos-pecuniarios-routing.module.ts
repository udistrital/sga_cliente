import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultarConceptosComponent } from './consultar-conceptos/consultar-conceptos.component';
import { CopiarConceptosComponent } from './copiar-conceptos/copiar-conceptos.component';
import { CrudDerechosPecuniariosComponent } from './crud-derechos-pecuniarios/crud-derechos-pecuniarios.component';
import { DefinirConceptosComponent } from './definir-conceptos/definir-conceptos.component';
import { DerechosPecuniariosComponent } from './derechos-pecuniarios.component';
import { DialogoConceptosComponent } from './dialogo-conceptos/dialogo-conceptos.component';
import { ListDerechosPecuniariosComponent } from './list-derechos-pecuniarios/list-derechos-pecuniarios.component';
import { GeneracionRecibosDerechosPecuniarios } from './generacion-recibos-derechos-pecuniarios/generacion-recibos-derechos-pecuniarios.component';
import { ConsultarSolicitudesDerechosPecuniarios } from './consultar-solicitudes/consultar-solicitudes.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
    path: '',
    component: DerechosPecuniariosComponent,
    children: [
        {
            path: 'list-derechos-pecuniarios',
            component: ListDerechosPecuniariosComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'crud-derechos-pecuniarios',
            component: CrudDerechosPecuniariosComponent,
            //canActivate: [AuthGuard],
        },
        {
            path: 'copiar-conceptos',
            component: CopiarConceptosComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'definir-conceptos',
            component: DefinirConceptosComponent,
            //canActivate: [AuthGuard],
        },
        {
            path: 'consultar-conceptos',
            component: ConsultarConceptosComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'generacion-recibos-derechos-pecuniarios',
            component: GeneracionRecibosDerechosPecuniarios,
            canActivate: [AuthGuard],
        },
        {
            path: 'consultar-solicitudes',
            component: ConsultarSolicitudesDerechosPecuniarios,
            canActivate: [AuthGuard],
        },
    ],
}];


@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class DerechosPecuniariosRoutingComponent { }

export const routedComponents = [
    DerechosPecuniariosComponent,
    CrudDerechosPecuniariosComponent,
    ListDerechosPecuniariosComponent,
    CopiarConceptosComponent,
    DefinirConceptosComponent,
    DialogoConceptosComponent,
    ConsultarConceptosComponent,
    GeneracionRecibosDerechosPecuniarios,
    ConsultarSolicitudesDerechosPecuniarios,
]
