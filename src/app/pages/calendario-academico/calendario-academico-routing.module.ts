import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarioAcademicoComponent } from './calendario-academico.component';
import { DefCalendarioAcademicoComponent } from './def-calendario-academico/def-calendario-academico.component';
import { ListCalendarioAcademicoComponent } from './list-calendario-academico/list-calendario-academico.component';

const routes: Routes = [{
    path: '',
    component: CalendarioAcademicoComponent,
    children: [
        {
            path: 'list-calendario-academico',
            component: ListCalendarioAcademicoComponent
        },
        {
            path: 'def-calendario-academico',
            component: DefCalendarioAcademicoComponent
        }
    ],
}];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ]
})
export class CalendarioAcademicoRoutingModule { }

export const routedComponents = [
    CalendarioAcademicoComponent,
    ListCalendarioAcademicoComponent,
    DefCalendarioAcademicoComponent
]
