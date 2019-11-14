import { NotificacionRoutingModule, routedComponents } from './notificacion-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
// import { NotificacionesService } from '../../@core/utils/notificaciones.service';

@NgModule({
  imports: [
    ThemeModule,
    NotificacionRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  // providers: [
  //   NotificacionesService,
  // ],
})
export class NotificacionModule { }
