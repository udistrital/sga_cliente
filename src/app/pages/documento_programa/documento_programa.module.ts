import { DocumentoProgramaRoutingModule, routedComponents } from './documento_programa-routing.module';
import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { SharedModule } from '../../shared/shared.module';
import { DocumentoProgramaService } from '../../@core/data/documento_programa.service';
import { InscripcionService } from '../../@core/data/inscripcion.service';
import { DocumentoService } from '../../@core/data/documento.service';
import { CrudDocumentoProgramaComponent } from './crud-documento_programa/crud-documento_programa.component';
import { ListDocumentoProgramaComponent } from './list-documento_programa/list-documento_programa.component';
import { ViewDocumentoProgramaComponent } from './view-documento_programa/view-documento_programa.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    BrowserModule,
    MatCardModule,
    MatTabsModule,
    DocumentoProgramaRoutingModule,
    Ng2SmartTableModule,
    SharedModule,
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
