import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { CalendarioAcademicoRoutingModule, routedComponents } from './calendario-academico-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ListCalendarioAcademicoComponent } from './list-calendario-academico/list-calendario-academico.component';
import { DefCalendarioAcademicoComponent } from './def-calendario-academico/def-calendario-academico.component';



@NgModule({
  imports: [
    CalendarioAcademicoRoutingModule,
    SharedModule,
    ThemeModule,
    Ng2SmartTableModule,
    ToasterModule,
  ],
  declarations: [
    routedComponents
  ],
  exports: [
    ListCalendarioAcademicoComponent,
    DefCalendarioAcademicoComponent
  ]
})
export class CalendarioAcademicoModule { }
