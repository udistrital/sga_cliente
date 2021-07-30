import { AuthInterceptor } from './_Interceptor/auth.Interceptor';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { AuthGuard } from './_guards/auth.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const throwIfAlreadyLoaded = (parentModule: any, moduleName: string) => {
  if (parentModule) {
    throw new Error(`${moduleName} has already been loaded. Import Core modules in the AppModule only.`);
  }
};

@NgModule({
  imports: [
    CommonModule,

  ],
  exports: [
  ],
  declarations: [],
  providers: [
    // AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(){
    return {
      ngModule: CoreModule,
      providers: [],
    };
  }
}
