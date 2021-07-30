import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes, {
      // enableTracing: true,
      useHash: true,
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
