import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroNotasRoutingModule, routedComponents } from './registro_notas.routing.moule';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { EventoService } from '../../@core/data/evento.service';
import { RegistroNotasService } from '../../@core/data/registro_notas.service';



@NgModule({
  imports: [
    ThemeModule,
    RegistroNotasRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    EventoService,
    RegistroNotasService
  ]
})
export class RegistroNotasModule { }
