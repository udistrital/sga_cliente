import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroNotasRoutingModule, routedComponents } from './registro_notas.routing.moule';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  imports: [
    ThemeModule,
    RegistroNotasRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class RegistroNotasModule { }