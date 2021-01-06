import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbSpinnerModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../@theme/theme.module';
import { SolicitudesRoutingModule, routedComponents } from './solicitudes-routing.module';

import { PopUpManager } from '../../managers/popUpManager';

@NgModule({
  declarations: [
    routedComponents,
  ],
  imports: [
    ThemeModule,
    CommonModule,
    NbSpinnerModule,
    Ng2SmartTableModule,
    SolicitudesRoutingModule,
  ],
  exports: [
    routedComponents,
  ],
  providers: [
    PopUpManager,
  ]
})
export class SolicitudesModule { }
