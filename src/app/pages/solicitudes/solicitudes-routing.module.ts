import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudesComponent } from './solicitudes.component';
import { ActualizacionDatosComponent } from './actualizacion-datos/actualizacion-datos.component';
import { ActualizacionNombresComponent } from './actualizacion-nombres/actualizacion-nombres.component';
import { ListSolicitudesEstudianteComponent } from './list-solicitudes-estudiante/list-solicitudes-estudiante.component';
import { DatosSolicitanteComponent } from './datos-solicitante/datos-solicitante.component';
import { DialogoSoporteComponent } from "./dialogo-soporte/dialogo-soporte.component";

const routes: Routes = [{
    path: '',
    component: SolicitudesComponent,
    children : [
        {
            path: 'actualizacion-datos',
            component: ActualizacionDatosComponent,
        },
        {
            path: 'actualizacion-nombres',
            component: ActualizacionNombresComponent,
        },
        {
            path: 'list-solicitudes-estudiante',
            component: ListSolicitudesEstudianteComponent,
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
export class SolicitudesRoutingModule { }

export const routedComponents = [
    SolicitudesComponent,
    ActualizacionDatosComponent,
    ActualizacionNombresComponent,
    ListSolicitudesEstudianteComponent,
    DatosSolicitanteComponent,
    DialogoSoporteComponent,
]
