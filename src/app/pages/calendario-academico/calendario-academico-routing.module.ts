import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThemeModule } from '../../@theme/theme.module';

import { CalendarioAcademicoComponent } from './calendario-academico.component';
import { DefCalendarioAcademicoComponent } from './def-calendario-academico/def-calendario-academico.component';
import { ListCalendarioAcademicoComponent } from './list-calendario-academico/list-calendario-academico.component';
import { ProcesoCalendarioAcademicoComponent } from './proceso-calendario-academico/proceso-calendario-academico.component';
import { ActividadCalendarioAcademicoComponent } from './actividad-calendario-academico/actividad-calendario-academico.component';
import { DetalleCalendarioComponent } from './detalle-calendario/detalle-calendario.component';
import { AsignarCalendarioProyectoComponent } from './asignar-calendario-proyecto/asignar-calendario-proyecto.component';
import { CalendarioProyectoComponent } from './calendario-proyecto/calendario-proyecto.component';
import { EdicionActividadesProgramasComponent } from './edicion-actividades-programas/edicion-actividades-programas.component';
import { AdministracionCalendarioComponent } from './administracion-calendario/administracion-calendario.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
    path: '',
    component: CalendarioAcademicoComponent,
    children: [
        {
            path: 'list-calendario-academico',
            component: ListCalendarioAcademicoComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'def-calendario-academico',
            component: DefCalendarioAcademicoComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'proceso',
            component: ProcesoCalendarioAcademicoComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'actividad',
            component: ActividadCalendarioAcademicoComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'detalle-calendario',
            component: DetalleCalendarioComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'asignar-calendario-proyecto',
            component: AsignarCalendarioProyectoComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'calendario-proyecto',
            component: CalendarioProyectoComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'edit-actividad',
            component: EdicionActividadesProgramasComponent,
            canActivate: [AuthGuard],
        },
        {
            path: 'administracion-calendario',
            component: AdministracionCalendarioComponent,
            canActivate: [AuthGuard],
        }
    ],
}];

@NgModule({
    imports: [
        ThemeModule,
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
    CalendarioProyectoComponent,
    EdicionActividadesProgramasComponent,
    AdministracionCalendarioComponent
]
