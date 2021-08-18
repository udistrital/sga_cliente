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
          return { title: notify.Content.Message, icon: 'fa fa-commenting-o'}
        });
        this.userMenu = [...temp.slice(0, 7), ...[{ title: 'ver todas', icon: 'fa fa-list' }]];
      });
    this.liveToken();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  liveToken() {
    if (this.autenticacion.live()) {
      this.liveTokenValue = this.autenticacion.live();
      this.username = (this.autenticacion.getPayload()).sub;
    }
    return this.autenticacion.live();
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
