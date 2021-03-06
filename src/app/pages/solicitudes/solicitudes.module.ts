import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { NbSpinnerModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../@theme/theme.module';
import { SolicitudesRoutingModule, routedComponents } from './solicitudes-routing.module';
import { NuxeoService } from '../../@core/utils/nuxeo.service';
import { SgaMidService } from '../../@core/data/sga_mid.service';
import { TercerosService } from '../../@core/data/terceros.service';

import { PopUpManager } from '../../managers/popUpManager';
import { DialogoSoporteComponent } from './dialogo-soporte/dialogo-soporte.component';

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
    SolicitudesRoutingModule,
  ],
  exports: [
    routedComponents,
  ],
  providers: [
    PopUpManager,
    NuxeoService,
    SgaMidService,
    TercerosService,
  ],
  entryComponents: [
    DialogoSoporteComponent,
  ]
})
export class SolicitudesModule { }
