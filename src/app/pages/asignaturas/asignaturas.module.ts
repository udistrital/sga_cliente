import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsignaturasRoutingModule, routedComponents } from './asignaturas.routing.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { ThemeModule } from '../../@theme/theme.module';


@NgModule({
  imports: [
    ThemeModule,
    AsignaturasRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule
  ],
  declarations: [
    ...routedComponents,
  ]
})
export class AsignaturasModule { }
