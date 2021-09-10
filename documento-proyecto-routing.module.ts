import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentoProyectoComponent } from './documento_proyecto.component';
import { SelectDocumentoProyectoComponent } from './select-documento-proyecto/select-documento-proyecto.component';
import { ListDocumentoProyectoComponent } from './list-documento-proyecto/list-documento-proyecto.component';
import { CrudDocumentoProyectoComponent } from './crud-documento-proyecto/crud-documento-proyecto.component';


const routes: Routes = [{
  path: '',
  component: DocumentoProyectoComponent,
  children: [{
    path: 'select-documento-proyecto',
    component: SelectDocumentoProyectoComponent,
  }, {
    path: 'list-documento-proyecto',
    component: ListDocumentoProyectoComponent,
  }, {
    path: 'crud-documento-proyecto',
    component: CrudDocumentoProyectoComponent,
  }],
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class DocumentoProyectoRoutingModule { }

export const routedComponents = [
  DocumentoProyectoComponent,
  ListDocumentoProyectoComponent,
  SelectDocumentoProyectoComponent,
  CrudDocumentoProyectoComponent,
];
