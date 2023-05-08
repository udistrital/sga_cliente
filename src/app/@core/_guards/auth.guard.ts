import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MenuService } from '../data/menu.service';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private menu: MenuService,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (!!this.menu.getRoute(state.url)) {
      return true;
    } else if (route.params && route.params.id) {
      const route_ = state.url.replace(route.params.id, ':id');
      if (!!this.menu.getRoute(route_)) {
        return true;
      }
    }

    this.pUpManager.showErrorAlert(this.translate.instant('ERROR.rol_insuficiente_titulo'));
    return false;

  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

}
