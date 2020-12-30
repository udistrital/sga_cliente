import { NgModule } from '@angular/core';
import { NbSpinnerModule } from '@nebular/theme';
import { DerechosPecuniariosComponent } from './derechos-pecuniarios.component';
import { DerechosPecuniariosRoutingComponent, routedComponents } from './derechos-pecuniarios-routing.module';
import { CrudDerechosPecuniariosComponent } from './crud-derechos-pecuniarios/crud-derechos-pecuniarios.component';
import { ListDerechosPecuniariosComponent } from './list-derechos-pecuniarios/list-derechos-pecuniarios.component'
import { CopiarConceptosComponent } from './copiar-conceptos/copiar-conceptos.component';
import { PopUpManager } from '../../managers/popUpManager';
import { SharedModule } from '../../shared/shared.module';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DefinirConceptosComponent } from './definir-conceptos/definir-conceptos.component';
import { DialogoConceptosComponent } from './dialogo-conceptos/dialogo-conceptos.component';
import { ParametrosService } from '../../@core/data/parametros.service';
import { ConsultarConceptosComponent } from './consultar-conceptos/consultar-conceptos.component';

@NgModule({
  declarations: [
    routedComponents,
  ],
  imports: [
    SharedModule,
    ThemeModule,
    NbSpinnerModule,
    Ng2SmartTableModule,
    FormsModule,
    ReactiveFormsModule,
    DerechosPecuniariosRoutingComponent,
  ],
  exports: [
    DerechosPecuniariosComponent,
    CrudDerechosPecuniariosComponent,
    ListDerechosPecuniariosComponent,
    CopiarConceptosComponent,
    DefinirConceptosComponent,
    ConsultarConceptosComponent,
  ],
  providers: [
    PopUpManager,
    ParametrosService,
  ],
  entryComponents: [
    DialogoConceptosComponent,
  ],
})
export class DerechosPecuniariosModule { }
