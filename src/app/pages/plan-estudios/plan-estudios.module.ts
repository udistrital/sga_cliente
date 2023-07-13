import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanEstudiosRoutingModule, routedComponents } from './plan-estudios-routing.module';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';


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

  ]
})
export class PlanEstudiosModule { }
