import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MenuItem } from './menu-item';
import { MenuService } from '../@core/data/menu.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { ImplicitAutenticationService } from './../@core/utils/implicit_autentication.service';
import { environment } from '../../environments/environment';
import { NbSidebarService } from '@nebular/theme';
import { RouteConfigLoadStart, Router } from '@angular/router';
import { MENU_ITEMS } from './pages-menu';


@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-sample-layout>
      <nb-menu [items]='menu'></nb-menu>
      <router-outlet></router-outlet>
    </ngx-sample-layout>
    <floating-button-iris></floating-button-iris>
  `,
})

export class PagesComponent implements OnInit {

  public menu = [];
  hijo: MenuItem;
  hijo2: MenuItem;
  rol: String;
  dataMenu: any;
  roles: any;

  constructor(
    public menuws: MenuService,
    private autenticacion: ImplicitAutenticationService,
    protected sidebarService: NbSidebarService,
    private router: Router,
    private translate: TranslateService) {
    router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.sidebarService.collapse('menu-sidebar');
      }
    });
  }

  translateTree(tree: any) {
    const trans = tree.map((n: any) => {
      let node = {};
      if (!n.Url.indexOf('http')) {
        node = {
          title: n.Nombre,
          icon: 'file-outline',
          url: n.Url,
          home: false,
          key: n.Nombre,
          children: [],
        };
      } else {
        node = {
          title: n.Nombre,
          icon: 'file-outline',
          link: n.Url,
          home: false,
          key: n.Nombre,
        };
      }
      if (n.hasOwnProperty('Opciones')) {
        if (n.Opciones !== null) {
          const children = this.translateTree(n.Opciones);
          node = { ...node, ...{ children: children }, ...{ icon: 'folder-outline' } };
        }
        return node;
      } else {
        return node;
      }
    });
    return trans;
  }

  getMenu(roles) {
    this.roles = roles
    const homeOption = {
      title: 'dashboard',
      icon: 'home',
      url: '#/pages/dashboard',
      home: true,
      key: 'dashboard',
    }
    this.menu = [homeOption]

    if (this.roles.length === 0) {
      this.roles = 'ASPIRANTE';
    }
    const menuStorage = localStorage.getItem('menu');
    if (menuStorage) {
      this.dataMenu = JSON.parse(atob(menuStorage));
      this.menuws.setPermisos(this.dataMenu);
      this.menu = this.translateTree(this.dataMenu)
      this.menu.unshift(homeOption);
      this.translateMenu();
      // this.menu = MENU_ITEMS;
    } else {
      this.menuws.get(this.roles + '/SGA').subscribe(
        data => {
          this.dataMenu = <any>data;
          this.menuws.setPermisos(this.dataMenu);
          localStorage.setItem('menu', btoa(JSON.stringify(data)));
          this.menu = this.translateTree(this.dataMenu)
          this.menu.unshift(homeOption);
          this.translateMenu();
        },
        (error: HttpErrorResponse) => {

          if (this.dataMenu === undefined) {
            Swal.fire({
              icon: 'info',
              title: this.translate.instant('ERROR.rol_insuficiente_titulo'),
              text: this.translate.instant('ERROR.rol_insuficiente'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              onAfterClose: () => {
                window.location.href =
                  environment.TOKEN.SIGN_OUT_URL +
                  '?id_token_hint=' +
                  window.localStorage.getItem('id_token') +
                  '&post_logout_redirect_uri=' +
                  environment.TOKEN.SIGN_OUT_REDIRECT_URL +
                  '&state=' +
                  window.localStorage.getItem('state');
              },
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.menu'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }

          // this.menu = MENU_ITEMS;
          this.translateMenu();
        });
    }
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.translateMenu();
    });
  }


  ngOnInit() {
    this.autenticacion.user$.subscribe((data: any) => {
      const { user, userService } = data;
      const roleUser = typeof user.role !== 'undefined' ? user.role : [];
      const roleUserService = typeof userService.role !== 'undefined' ? userService.role : [];
      const roles = (roleUser.concat(roleUserService)).filter((data: any) => (data.indexOf('/') === -1))
      const defaultRoles = (roleUser.concat(roleUserService)).filter((data: any) => (data.indexOf('/')!== -1))
      if (defaultRoles.length > 0) {
        roles.push("ASPIRANTE")
      }
      this.getMenu(roles);
    })


  }

  private translateMenu(): void {
    this.menu.forEach((menuItem: MenuItem) => {
      this.translateMenuTitle(menuItem);
    });
  }

  /**
   * Translates one root menu item and every nested children
   * @param menuItem
   * @param prefix
   */
  private translateMenuTitle(menuItem: MenuItem, prefix: string = ''): void {
    let key = '';
    try {
      key = (prefix !== '')
        ? PagesComponent.getMenuItemKey(menuItem, prefix)
        : PagesComponent.getMenuItemKey(menuItem);
    } catch (e) {
      // Key not found, don't change the menu item
      return;
    }

    this.translate.get(key).subscribe((translation: string) => {
      menuItem.title = translation;
    });
    if (menuItem.children != null) {
      // apply same on every child
      menuItem.children.forEach((childMenuItem: MenuItem) => {
        // We remove the nested key and then use it as prefix for every child
        this.translateMenuTitle(childMenuItem, PagesComponent.trimLastSelector(key));
      });
    }
  }

  /**
   * Resolves the translation key for a menu item. The prefix must be supplied for every child menu item
   * @param menuItem
   * @param prefix
   * @returns {string}
   */
  private static getMenuItemKey(menuItem: MenuItem, prefix: string = 'MENU'): string {
    if (menuItem.key == null) {
      throw new Error('Key not found');
    }

    const key = menuItem.key.toLowerCase();
    if (menuItem.children != null) {
      return prefix + '.' + key + '.' + key; // Translation is nested
    }
    return prefix + '.' + key;
  }

  /**
   * Used to remove the nested key for translations
   * @param key
   * @returns {string}
   */
  private static trimLastSelector(key: string): string {
    const keyParts = key.split('.');
    keyParts.pop();
    return keyParts.join('.');
  }
}
