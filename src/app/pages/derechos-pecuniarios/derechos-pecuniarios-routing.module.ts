import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrudDerechosPecuniariosComponent } from './crud-derechos-pecuniarios/crud-derechos-pecuniarios.component';
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
        }
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
]
