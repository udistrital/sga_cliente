import { PerfilXMenuOpcionRoutingModule, routedComponents } from './perfil_x_menu_opcion-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ConfiguracionService } from '../../@core/data/configuracion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudPerfilXMenuOpcionComponent } from './crud-perfil_x_menu_opcion/crud-perfil_x_menu_opcion.component';
import { ToasterService} from 'angular2-toaster';
import { TreeModule } from 'angular-tree-component';

@NgModule({
  imports: [
    ThemeModule,
    PerfilXMenuOpcionRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    TreeModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ConfiguracionService,
    ToasterService,
  ],
  exports: [
    CrudPerfilXMenuOpcionComponent,
  ],
})
export class PerfilXMenuOpcionModule { }
