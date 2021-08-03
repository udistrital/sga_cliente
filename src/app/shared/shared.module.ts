import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';


const materialModules = [
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatCheckboxModule,
  MatButtonModule,
  MatDatepickerModule,
  MatCardModule
];
import {
  DinamicformComponent,
  LoadingComponent,
  ButtonPaymentComponent,
  LinkDownloadComponent,
} from '../shared/components';

const SharedComponents = [
  DinamicformComponent,
  LoadingComponent,
  ButtonPaymentComponent,
  LinkDownloadComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...materialModules,
  ],
  declarations: [...SharedComponents],
  exports: [
    ...SharedComponents,
    TranslateModule
  ],
  entryComponents: [],
})
export class SharedModule {
  static forRoot() {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}
