import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdmisionComponent } from './admision.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { CriterioAdmisionComponent } from './criterio_admision/criterio_admision.component';
import { AsignacionCuposComponent } from './asignacion_cupos/asignacion_cupos.component';
import { ActualizacionEstadoComponent } from './actualizacion_estado/actualizacion_estado.component';
import { ListadoAspiranteComponent } from './listado_aspirantes/listado_aspirante.component';
import { AdministradorCriteriosComponent } from './administrador-criterios/administrador-criterios.component';
import { DialogoCriteriosComponent } from './dialogo-criterios/dialogo-criterios.component';
import { EvaluacionAspirantesComponent } from './evaluacion-aspirantes/evaluacion-aspirantes.component';
import { DialogoDocumentosComponent } from './dialogo-documentos/dialogo-documentos.component';

const routes: Routes = [{
  path: '',
  component: AdmisionComponent,
  children: [
    {
      path: 'criterio_admision',
      component: CriterioAdmisionComponent,
    },
    {
      path: 'asignacion_cupos',
      component: AsignacionCuposComponent,
    },
    {
      path: 'actualizacion_estado',
      component: ActualizacionEstadoComponent,
    },
    {
      path: 'listado_aspirante',
      component: ListadoAspiranteComponent,
    },
    {
      path: 'administrar-criterios',
      component: AdministradorCriteriosComponent,
    },
    {
      path: 'evaluacion-aspirantes',
      component: EvaluacionAspirantesComponent,
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

export class AdmisionRoutingModule { }

export const routedComponents = [
  AdmisionComponent,
  CriterioAdmisionComponent,
  AsignacionCuposComponent,
  ActualizacionEstadoComponent,
  ListadoAspiranteComponent,
  AdministradorCriteriosComponent,
  DialogoCriteriosComponent,
  EvaluacionAspirantesComponent,
  DialogoDocumentosComponent,
];
