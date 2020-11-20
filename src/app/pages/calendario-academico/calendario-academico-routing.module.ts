import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarioAcademicoComponent } from './calendario-academico.component';
import { DefCalendarioAcademicoComponent } from './def-calendario-academico/def-calendario-academico.component';
import { ListCalendarioAcademicoComponent } from './list-calendario-academico/list-calendario-academico.component';
import { ProcesoCalendarioAcademicoComponent } from './proceso-calendario-academico/proceso-calendario-academico.component';
import { ActividadCalendarioAcademicoComponent } from './actividad-calendario-academico/actividad-calendario-academico.component';
import { DetalleCalendarioComponent } from './detalle-calendario/detalle-calendario.component';
import { AsignarCalendarioProyectoComponent } from './asignar-calendario-proyecto/asignar-calendario-proyecto.component';

const routes: Routes = [{
    path: '',
    component: CalendarioAcademicoComponent,
    children: [
        {
            path: 'list-calendario-academico',
            component: ListCalendarioAcademicoComponent,
        },
        {
            path: 'def-calendario-academico',
            component: DefCalendarioAcademicoComponent,
        },
        {
            path: 'proceso',
            component: ProcesoCalendarioAcademicoComponent,
        },
        {
            path: 'actividad',
            component: ActividadCalendarioAcademicoComponent,
        },
        {
            path: 'detalle-calendario',
            component: DetalleCalendarioComponent,
        },
        {
            path: 'asignar-calendario-proyecto',
            component: AsignarCalendarioProyectoComponent,
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
export class CalendarioAcademicoRoutingModule { }

export const routedComponents = [
    CalendarioAcademicoComponent,
    ListCalendarioAcademicoComponent,
    DefCalendarioAcademicoComponent,
    ProcesoCalendarioAcademicoComponent,
    ActividadCalendarioAcademicoComponent,
    DetalleCalendarioComponent,
    AsignarCalendarioProyectoComponent,
]
