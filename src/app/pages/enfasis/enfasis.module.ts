import { EnfasisRoutingModule, routedComponents } from './enfasis-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ProyectoAcademicoService } from '../../@core/data/proyecto_academico.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudEnfasisComponent } from './crud-enfasis/crud-enfasis.component';
import { ListEnfasisComponent } from './list-enfasis/list-enfasis.component';
import { ToasterService} from 'angular2-toaster';
import { NbDialogRef } from '@nebular/theme';

@NgModule({
  imports: [
    ThemeModule,
    EnfasisRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ProyectoAcademicoService,
    ToasterService,
    {
      provide: NbDialogRef,
      useValue: {
        close: (dialogResult: any) => { },
      },
    },
  ],
  exports: [
    CrudEnfasisComponent,
    ListEnfasisComponent,
  ],
})
export class EnfasisModule { }
