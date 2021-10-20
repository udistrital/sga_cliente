import { DocumentoProyectoRoutingModule, routedComponents } from './documento-proyecto-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ProyectoAcademicoService } from '../../@core/data/proyecto_academico.service';
import { DocumentoProgramaService } from '../../@core/data/documento_programa.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudDocumentoProyectoComponent } from './crud-documento-proyecto/crud-documento-proyecto.component';
import { ListDocumentoProyectoComponent } from './list-documento-proyecto/list-documento-proyecto.component';
import { NbSpinnerModule } from '@nebular/theme';
import { SelectDocumentoProyectoComponent } from './select-documento-proyecto/select-documento-proyecto.component';
import { ToasterService } from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    DocumentoProyectoRoutingModule,
    Ng2SmartTableModule,
    NbSpinnerModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ProyectoAcademicoService,
    ToasterService,
    DocumentoProgramaService,
  ],
  exports: [
    CrudDocumentoProyectoComponent,
    ListDocumentoProyectoComponent,
    SelectDocumentoProyectoComponent,
  ],
})
export class DocumentoProyectoModule { }
