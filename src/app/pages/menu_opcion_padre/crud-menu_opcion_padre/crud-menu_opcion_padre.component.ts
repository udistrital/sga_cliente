import { MenuOpcion } from './../../../@core/data/models/menu_opcion';

import { MenuOpcionPadre } from './../../../@core/data/models/menu_opcion_padre';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { FORM_MENU_OPCION_PADRE } from './form-menu_opcion_padre';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-menu-opcion-padre',
  templateUrl: './crud-menu_opcion_padre.component.html',
  styleUrls: ['./crud-menu_opcion_padre.component.scss'],
})
export class CrudMenuOpcionPadreComponent implements OnInit {
  config: ToasterConfig;
  menu_opcion_padre_id: number;

  @Input('menu_opcion_padre_id')
  set name(menu_opcion_padre_id: number) {
    this.menu_opcion_padre_id = menu_opcion_padre_id;
    this.loadMenuOpcionPadre();
  }

  @Output() eventChange = new EventEmitter();

  info_menu_opcion_padre: MenuOpcionPadre;
  formMenuOpcionPadre: any;
  regMenuOpcionPadre: any;
  clean: boolean;

  constructor(private translate: TranslateService, private configuracionService: ConfiguracionService, private toasterService: ToasterService) {
    this.formMenuOpcionPadre = FORM_MENU_OPCION_PADRE;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsPadre();
    this.loadOptionsHijo();
   }

  construirForm() {
    this.formMenuOpcionPadre.titulo = this.translate.instant('GLOBAL.menu_opcion_padre');
    this.formMenuOpcionPadre.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formMenuOpcionPadre.campos.length; i++) {
      this.formMenuOpcionPadre.campos[i].label = this.translate.instant('GLOBAL.' + this.formMenuOpcionPadre.campos[i].label_i18n);
      this.formMenuOpcionPadre.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formMenuOpcionPadre.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsPadre(): void {
    let padre: Array<any> = [];
      this.configuracionService.get('menu_opcion/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            padre = <Array<MenuOpcion>>res;
          }
          this.formMenuOpcionPadre.campos[ this.getIndexForm('Padre') ].opciones = padre;
        });
  }
  loadOptionsHijo(): void {
    let hijo: Array<any> = [];
      this.configuracionService.get('menu_opcion/?limit=0')
        .subscribe(res => {
          if (res !== null) {
            hijo = <Array<MenuOpcion>>res;
          }
          this.formMenuOpcionPadre.campos[ this.getIndexForm('Hijo') ].opciones = hijo;
        });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formMenuOpcionPadre.campos.length; index++) {
      const element = this.formMenuOpcionPadre.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadMenuOpcionPadre(): void {
    if (this.menu_opcion_padre_id !== undefined && this.menu_opcion_padre_id !== 0) {
      this.configuracionService.get('menu_opcion_padre/?query=id:' + this.menu_opcion_padre_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_menu_opcion_padre = <MenuOpcionPadre>res[0];
          }
        });
    } else  {
      this.info_menu_opcion_padre = undefined;
      this.clean = !this.clean;
    }
  }

  updateMenuOpcionPadre(menuOpcionPadre: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update MenuOpcionPadre!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_menu_opcion_padre = <MenuOpcionPadre>menuOpcionPadre;
        this.configuracionService.put('menu_opcion_padre', this.info_menu_opcion_padre)
          .subscribe(res => {
            this.loadMenuOpcionPadre();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'MenuOpcionPadre updated');
          });
      }
    });
  }

  createMenuOpcionPadre(menuOpcionPadre: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create MenuOpcionPadre!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_menu_opcion_padre = <MenuOpcionPadre>menuOpcionPadre;
        this.configuracionService.post('menu_opcion_padre', this.info_menu_opcion_padre)
          .subscribe(res => {
            this.info_menu_opcion_padre = <MenuOpcionPadre><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'MenuOpcionPadre created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadMenuOpcionPadre();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_menu_opcion_padre === undefined) {
        this.createMenuOpcionPadre(event.data.MenuOpcionPadre);
      } else {
        this.updateMenuOpcionPadre(event.data.MenuOpcionPadre);
      }
    }
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }

}
