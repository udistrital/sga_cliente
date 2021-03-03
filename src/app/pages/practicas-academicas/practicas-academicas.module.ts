import { NgModule } from '@angular/core';
import { NuevaSolicitudComponent } from './nueva-solicitud/nueva-solicitud.component';
import { PracticasAcademicasRoutingModule, routedModules } from './practicas-academicas-routing.module';

@NgModule({
  declarations: [
    ...routedModules,
  ],
  imports: [
    PracticasAcademicasRoutingModule,
  ],
  exports: [
    NuevaSolicitudComponent,
  ]
})
export class PracticasAcademicasModule { }
