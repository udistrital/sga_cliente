import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArchivoIcfesComponent } from './archivo_icfes.component';
import { ListArchivoIcfesComponent } from './list-archivo_icfes/list-archivo_icfes.component';
import { CrudArchivoIcfesComponent } from './crud-archivo_icfes/crud-archivo_icfes.component';



const routes: Routes = [{
  path: '',
  component: ArchivoIcfesComponent,
  children: [{
    path: 'list-archivo_icfes',
    component: ListArchivoIcfesComponent,
  }, {
    path: 'crud-archivo_icfes',
    component: CrudArchivoIcfesComponent,
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

export class ArchivoIcfesRoutingModule { }

export const routedComponents = [
  ArchivoIcfesComponent,
  ListArchivoIcfesComponent,
  CrudArchivoIcfesComponent,
];
