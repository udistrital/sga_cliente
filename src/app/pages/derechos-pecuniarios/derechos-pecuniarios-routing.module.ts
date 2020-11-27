import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CopiarConceptosComponent } from './copiar-conceptos/copiar-conceptos.component';
import { CrudDerechosPecuniariosComponent } from './crud-derechos-pecuniarios/crud-derechos-pecuniarios.component';
import { DefinirConceptosComponent } from './definir-conceptos/definir-conceptos.component';
import { DerechosPecuniariosComponent } from './derechos-pecuniarios.component';
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
]
