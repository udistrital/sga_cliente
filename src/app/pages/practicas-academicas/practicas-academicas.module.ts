import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../@theme/theme.module';
import { PracticasAcademicasRoutingModule, routedComponents } from './practicas-academicas-routing.module';
import { PracticasAcademicasService } from '../../@core/data/practicas_academicas.service';

@NgModule({
  declarations: [
    ...routedComponents,
  ],
  providers: [
    PracticasAcademicasService,
  ],
  imports: [
    PracticasAcademicasRoutingModule,
    CommonModule,
    TranslateModule,
    Ng2SmartTableModule,
    ThemeModule,
  ],
  exports: [
    routedComponents,
  ]
})
export class PracticasAcademicasModule { }
