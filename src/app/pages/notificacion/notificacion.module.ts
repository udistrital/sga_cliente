import { NotificacionRoutingModule, routedComponents } from './notificacion-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ConfiguracionService } from '../../@core/data/configuracion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudNotificacionComponent } from './crud-notificacion/crud-notificacion.component';
import { ToasterService} from 'angular2-toaster';
import { MomentModule } from 'ngx-moment';

@NgModule({
  imports: [
    ThemeModule,
    NotificacionRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    MomentModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ConfiguracionService,
    ToasterService,
  ],
  exports: [
    CrudNotificacionComponent,
  ],
})
export class NotificacionModule { }
