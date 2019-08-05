import { MenuOpcionRoutingModule, routedComponents } from './menu_opcion-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ConfiguracionService } from '../../@core/data/configuracion.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudMenuOpcionComponent } from './crud-menu_opcion/crud-menu_opcion.component';
import { ToasterService} from 'angular2-toaster';
import { NbTreeGridModule, NbSelectModule } from '@nebular/theme';
import { TreeModule } from 'angular-tree-component';

@NgModule({
  imports: [
    ThemeModule,
    MenuOpcionRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    NbTreeGridModule,
    NbSelectModule,
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
    CrudMenuOpcionComponent,
  ],
})
export class MenuOpcionModule { }
