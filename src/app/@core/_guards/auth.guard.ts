import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MenuService } from '../data/menu.service';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(
    private menu: MenuService,
    private pUpManager: PopUpManager,
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

    this.pUpManager.showErrorAlert('No tiene permisos');
    return false;

  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

}
