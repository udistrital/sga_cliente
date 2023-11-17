import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GestionHorariosRoutingModule, routedComponents } from './gestion-horarios-routing.module';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { EspaciosAcademicosService } from '../../@core/data/espacios_academicos.service';

@NgModule({
  declarations: [...routedComponents],
  imports: [
    CommonModule,
    GestionHorariosRoutingModule,
    ThemeModule,
    SharedModule,
    Ng2SmartTableModule,
    DragDropModule
  ],
  providers: [
    EspaciosAcademicosService
  ]
})
export class GestionHorariosModule { }