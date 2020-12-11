import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultarConceptosComponent } from './consultar-conceptos/consultar-conceptos.component';
import { CopiarConceptosComponent } from './copiar-conceptos/copiar-conceptos.component';
import { CrudDerechosPecuniariosComponent } from './crud-derechos-pecuniarios/crud-derechos-pecuniarios.component';
import { DefinirConceptosComponent } from './definir-conceptos/definir-conceptos.component';
import { DerechosPecuniariosComponent } from './derechos-pecuniarios.component';
import { DialogoConceptosComponent } from './dialogo-conceptos/dialogo-conceptos.component';
import { ListDerechosPecuniariosComponent } from './list-derechos-pecuniarios/list-derechos-pecuniarios.component';

const routes: Routes = [{
    path: '',
    component: DerechosPecuniariosComponent,
    children: [
        {
            path: 'list-derechos-pecuniarios',
            component: ListDerechosPecuniariosComponent,
        },
        {
            path: 'crud-derechos-pecuniarios',
            component: CrudDerechosPecuniariosComponent,
        },
        {
            path: 'copiar-conceptos',
            component: CopiarConceptosComponent
        },
        {
            path: 'definir-conceptos',
            component: DefinirConceptosComponent,
        },
        {
            path: 'consultar-conceptos',
            component: ConsultarConceptosComponent,
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
]
