import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';
import { NbSpinnerModule } from '@nebular/theme';
import { SharedModule } from '../../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { EspaciosAcademicosRoutingModule, routedComponents } from './espacios-academicos-routing.module';
import { CheckboxAssistanceComponent } from '../../@theme/components/checkbox-assistance/checkbox-assistance.component';

@NgModule({
  declarations: [
    routedComponents,
  ],
  imports: [
    ThemeModule,
    CommonModule,
    SharedModule,
    NbSpinnerModule,
    Ng2SmartTableModule,
    EspaciosAcademicosRoutingModule,
  ],
  exports: [
    routedComponents,
  ],
  entryComponents: [
    CheckboxAssistanceComponent,
  ]
})
export class EspaciosAcademicosModule { }
