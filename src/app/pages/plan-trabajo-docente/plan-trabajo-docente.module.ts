import { NgModule } from '@angular/core';
import { PlanTrabajoDocenteRoutingModule, routedComponents } from './plan-trabajo-docente-routing.module';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [...routedComponents],
  imports: [
    ThemeModule,
    SharedModule,
    Ng2SmartTableModule,
    PlanTrabajoDocenteRoutingModule,
    DragDropModule
  ]
})
export class PlanTrabajoDocenteModule { }
