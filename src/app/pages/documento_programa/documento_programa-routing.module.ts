import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentoProgramaComponent } from './documento_programa.component';
import { ListDocumentoProgramaComponent } from './list-documento_programa/list-documento_programa.component';
import { CrudDocumentoProgramaComponent } from './crud-documento_programa/crud-documento_programa.component';
import { ViewDocumentoProgramaComponent } from './view-documento_programa/view-documento_programa.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: DocumentoProgramaComponent,
  children: [{
    path: 'list-documento_programa',
    component: ListDocumentoProgramaComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  }, {
    path: 'crud-documento_programa',
    component: CrudDocumentoProgramaComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
  }, {
    path: 'view-documento_programa',
    component: ViewDocumentoProgramaComponent,
    canActivate: [AuthGuard],
    data: {
      roles: [
        'ADMIN_CAMPUS',
        'ASPIRANTE',
        'Internal/selfsignup',
        'Internal/everyone',
      ],
    },
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

export class DocumentoProgramaRoutingModule { }

export const routedComponents = [
  DocumentoProgramaComponent,
  ListDocumentoProgramaComponent,
  CrudDocumentoProgramaComponent,
  ViewDocumentoProgramaComponent,
];
