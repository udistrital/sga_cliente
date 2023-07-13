import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EspaciosAcademicosRoutingModule, routedComponents } from './espacios-academicos-routing.module';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { EspaciosAcademicosService } from '../../@core/data/espacios_academicos.service';

@NgModule({
  declarations: [...routedComponents],
  imports: [
    CommonModule,
    EspaciosAcademicosRoutingModule,
    ThemeModule,
    SharedModule,
    Ng2SmartTableModule
  ],
  providers: [
    EspaciosAcademicosService
  ]
})
export class EspaciosAcademicosModule { }
