import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanEstudiosRoutingModule, routedComponents } from './plan-estudios-routing.module';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PlanEstudiosService } from '../../@core/data/plan_estudios.service';
import { EspaciosAcademicosService } from '../../@core/data/espacios_academicos.service';

@NgModule({
  declarations: [...routedComponents],
  imports: [
    CommonModule,
    PlanEstudiosRoutingModule,
    ThemeModule,
    SharedModule,
    Ng2SmartTableModule
  ],
  providers: [
    PlanEstudiosService,
    EspaciosAcademicosService,
  ]
})
export class PlanEstudiosModule { }
