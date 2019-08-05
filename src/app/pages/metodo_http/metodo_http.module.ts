import { MetodoHttpRoutingModule, routedComponents } from './metodo_http-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ConfiguracionService } from '../../@core/data/configuracion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudMetodoHttpComponent } from './crud-metodo_http/crud-metodo_http.component';
import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    MetodoHttpRoutingModule,
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
    CrudMetodoHttpComponent,
  ],
})
export class MetodoHttpModule { }
