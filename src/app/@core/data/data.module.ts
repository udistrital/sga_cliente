import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './state.service';
import { MenuService } from './menu.service';
import { ConfiguracionService } from './configuracion.service';

const SERVICES = [
  StateService,
  ConfiguracionService,
  MenuService,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    ...SERVICES,
  ],
})
export class DataModule {
  constructor(@Optional() @SkipSelf() parentModule?: DataModule) {
    if (parentModule) {
      throw new Error(
        'DataModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders<DataModule> {
    return <ModuleWithProviders>{
      ngModule: DataModule,
      providers: [
        ...SERVICES,
      ],
    };
  }
}
