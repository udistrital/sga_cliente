import { Component, Input, ViewChild } from '@angular/core';
import { NbPopoverDirective } from '@nebular/theme';
import { NbJSThemeOptions } from '@nebular/theme/services/js-themes/theme.options';
import { ThemeSwitcherListComponent } from './themes-switcher-list/themes-switcher-list.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
})
export class ThemeSwitcherComponent {
  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;

  @Input() showTitle: boolean = true;

  switcherListComponent = ThemeSwitcherListComponent;
  theme: NbJSThemeOptions;

  constructor(public translate: TranslateService) {
    this.translate = translate;
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }
}
