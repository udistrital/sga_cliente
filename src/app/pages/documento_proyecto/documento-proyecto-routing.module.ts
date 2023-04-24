import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentoProyectoComponent } from './documento_proyecto.component';
import { SelectDocumentoProyectoComponent } from './select-documento-proyecto/select-documento-proyecto.component';
import { ListDocumentoProyectoComponent } from './list-documento-proyecto/list-documento-proyecto.component';
import { CrudDocumentoProyectoComponent } from './crud-documento-proyecto/crud-documento-proyecto.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: DocumentoProyectoComponent,
  children: [{
    path: 'select-documento-proyecto',
    component: SelectDocumentoProyectoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'list-documento-proyecto',
    component: ListDocumentoProyectoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-documento-proyecto',
    component: CrudDocumentoProyectoComponent,
    canActivate: [AuthGuard],
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
