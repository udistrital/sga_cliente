import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../@theme/theme.module';
import { PracticasAcademicasRoutingModule, routedComponents } from './practicas-academicas-routing.module';

@NgModule({
  declarations: [
    ...routedComponents,
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
