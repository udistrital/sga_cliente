import { PagoLineaRoutingModule, routedComponents } from './pago_linea-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../../shared/shared.module';
import { ToasterModule } from 'angular2-toaster';
import { MatExpansionModule } from '@angular/material/expansion';
import { PagoInscripcionComponent } from './pago_inscripcion/pago_inscripcion.component';
import { PagoComprobanteComponent } from './pago_comprobante/pago_comprobante.component';
import { NuxeoService } from './../../@core/utils/nuxeo.service';
import { ImplicitAutenticationService } from './../../@core/utils/implicit_autentication.service';
import { OikosService } from '../../@core/data/oikos.service';
import { PersonaService } from '../../@core/data/persona.service';
import { CoreService } from '../../@core/data/core.service';
import { InscripcionService } from '../../@core/data/inscripcion.service';
import { CampusMidService } from '../../@core/data/campus_mid.service';
import { PagoService } from '../../@core/data/pago.service';
import { ReciboService } from '../../@core/data/recibo.service';

@NgModule({
  imports: [
    ThemeModule,
    PagoLineaRoutingModule,
    MatExpansionModule,
    SharedModule,
    ToasterModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ImplicitAutenticationService,
    NuxeoService,
    OikosService,
    PersonaService,
    CampusMidService,
    PagoService,
    CoreService,
    ReciboService,
    InscripcionService,
  ],
  entryComponents: [
  ],
  exports: [
    PagoInscripcionComponent,
    PagoComprobanteComponent,
  ],
})
export class PagoLineaModule { }
