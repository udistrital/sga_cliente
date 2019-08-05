import { NotificacionConfiguracionRoutingModule, routedComponents } from './notificacion_configuracion-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ConfiguracionService } from '../../@core/data/configuracion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudNotificacionConfiguracionComponent } from './crud-notificacion_configuracion/crud-notificacion_configuracion.component';
import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    NotificacionConfiguracionRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ConfiguracionService,
    ToasterService,
  ],
  exports: [
    CrudNotificacionConfiguracionComponent,
  ],
})
export class NotificacionConfiguracionModule { }
