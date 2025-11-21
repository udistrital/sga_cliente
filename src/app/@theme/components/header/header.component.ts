import { Component, Input, OnInit } from '@angular/core';
import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AnalyticsService } from '../../../@core/utils/analytics.service';
// import { AutenticationService } from '../../../@core/utils/autentication.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NotificacionesService } from '../../../@core/utils/notificaciones.service';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { UserService } from '../../../@core/data/users.service';
import { userInfo } from 'os';


@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent {

  @Input() position = 'normal';
  itemClick: Subscription;
  liveTokenValue: boolean = false;
  user: any;
  title: any;
  username = '';
  // roles_sga = '';
  roles_sga = [];
  rolSeleccionado:string = 'string';
  userMenu = [{ title: 'ver todas', icon: 'fa fa-list' }];
  public noNotify: any = '0';

  constructor(private sidebarService: NbSidebarService,
    private autenticacion: ImplicitAutenticationService,
    private menuService: NbMenuService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private userService: UserService, // NO BORRAR PORQUE ES PARA QUE SE INICIALICE EL ID DEL USUARIO EN LOCAL STORAGE
    public notificacionService: NotificacionesService,
    public translate: TranslateService) {
    this.translate = translate;
    this.itemClick = this.menuService.onItemClick()
      .subscribe((event) => {
        this.onContecxtItemSelection(event.item.title);
      });

    this.notificacionService.arrayMessages$
      .subscribe((notification: any) => {
        const temp = notification.map((notify: any) => {
          return { title: notify.Content.Message, icon: 'fa fa-commenting-o' }
        });
        this.userMenu = [...temp.slice(0, 7), ...[{ title: 'ver todas', icon: 'fa fa-list' }]];
      });
    this.autenticacion.user$.subscribe((data: any) => {
      const { user, userService } = data;
      // console.log({ user, userService });
      const roleUser = typeof user.role !== 'undefined' ? user.role : [];
      const roleUserService = typeof userService.role !== 'undefined' ? userService.role : [];
      const roles = (roleUser.concat(roleUserService)).filter((dato: any) => (dato.indexOf('/') === -1))
      const defaultRoles = (roleUser.concat(roleUserService)).filter((data1: any) => (data1.indexOf('/')!== -1))
      if (defaultRoles.length > 0) {
        roles.push("ASPIRANTE")
      }
      const roles_unicos = [...(new Set(roles))];

      // this.roles_sga = String(roles_unicos).replace(/,/g, ', ');
      this.roles_sga = roles_unicos;
      // this.rolSeleccionado = String(roles_unicos[0]);
      // const listaRoles = [
      //   "ADMIN_SGA","ADMIN_CAMPUS",
      //   "VICERRECTOR", "ASESOR_VICE",
      //   "COORDINADOR", "ASIS_PROYECTO",
      //   "DOCENTE", "ESTUDIANTE", "ASPIRANTE",
      //   "SOPORTE_OAS", "SOPORTE_NIVEL2",
      //   "PROVEEDOR", "CONTRATISTA",
      //   "ABOGADO_CONTRATACION_RECTOR",
      //   "JEFE_CONTROL_INTERNO",
      //   "SECRETARIO_AUDITOR",
      //   "AUDITOR_EXPERTO",
      //   "ADMISIONES_REG"
      // ];
      // let imp_r = [];
      // roles_unicos.forEach((rol: string)=> {
      //   imp_r.push( listaRoles.indexOf(rol) );
      // });
      // // console.log(roles_unicos);
      // // console.log(imp_r);
      // let min_rol = [];
      // if (imp_r.length > 3){
      //   for (let i = 0; i < 3; i++) {
      //     let m = Math.min(...imp_r);
      //     min_rol.push( m );
      //     let rol_aux = imp_r.filter(num => num !== min_rol[i]);
      //     imp_r = rol_aux;
      //   }
      // } else {
      //   min_rol = imp_r;
      // }

      // let roles_finales = [];
      // for (let i = 0; i < min_rol.length; i++) {
      //   roles_finales.push( listaRoles[ min_rol[i] ] );
      // }
      
      // this.roles_sga = String(roles_finales).replace(/,/g, ', ');
      this.username = typeof user.email !== 'undefined' ? user.email : typeof userService.email !== 'undefined' ? userService.email : '';
      this.liveTokenValue = this.username !== '';
    })
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  onContecxtItemSelection(title) {
    if (title === 'ver todas') {
      this.router.navigate(['/pages/notificacion/listado']);
    }
  }

  changeStateNoView(): void {
    this.notificacionService.changeStateNoView(this.username)
  }

  logout() {
    this.autenticacion.logout('from header');
    // this.liveTokenValue = auth.live(true);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }

  toggleNotifications(): boolean {
    this.sidebarService.toggle(false, 'notifications-sidebar');
    this.changeStateNoView()
    return false;
  }

  goToHome() {
    this.menuService.navigateHome();
  }

  startSearch() {
    this.analyticsService.trackEvent('startSearch');
  }
}
