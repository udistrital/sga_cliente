import { NotificacionConfiguracionPerfilRoutingModule, routedComponents } from './notificacion_configuracion_perfil-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ConfiguracionService } from '../../@core/data/configuracion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudNotificacionConfiguracionPerfilComponent } from './crud-notificacion_configuracion_perfil/crud-notificacion_configuracion_perfil.component';
import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    NotificacionConfiguracionPerfilRoutingModule,
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
    CrudNotificacionConfiguracionPerfilComponent,
  ],
})
export class NotificacionConfiguracionPerfilModule { }
