import { DocumentoProgramaRoutingModule, routedComponents } from './documento_programa-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NbSpinnerModule } from '@nebular/theme';
import { SharedModule } from '../../shared/shared.module';
import { DocumentoProgramaService } from '../../@core/data/documento_programa.service';
import { InscripcionService } from '../../@core/data/inscripcion.service';
import { DocumentoService } from '../../@core/data/documento.service';
import { CrudDocumentoProgramaComponent } from './crud-documento_programa/crud-documento_programa.component';
import { ListDocumentoProgramaComponent } from './list-documento_programa/list-documento_programa.component';
import { ViewDocumentoProgramaComponent } from './view-documento_programa/view-documento_programa.component';

@NgModule({
  imports: [
    ThemeModule,
    DocumentoProgramaRoutingModule,
    Ng2SmartTableModule,
    SharedModule,
    NbSpinnerModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    DocumentoProgramaService,
    InscripcionService,
    DocumentoService,
  ],
  exports: [
    CrudDocumentoProgramaComponent,
    ListDocumentoProgramaComponent,
    ViewDocumentoProgramaComponent,
  ],
})
export class DocumentoProgramaModule { }
