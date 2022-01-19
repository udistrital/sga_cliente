import {Component, OnDestroy} from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators' ;

interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {

  private alive = true;

  settings = {
    name:'Corte 1',
    percentage: 30,
    fields: [
      {placeholder: '% P1', label:'P1', name: 'p1'},
      {placeholder: '% P2', label:'P2', name: 'p2'},
      {placeholder: '% P3', label:'P3', name: 'p3'},
      {placeholder: '% LAB', label:'LAB', name: 'lab'},
    ]
  }


  settings2 = {
    name:'Corte 2',
    percentage: 35,
    fields: [
      {placeholder: '% P1', label:'P1', name: 'p1'},
      {placeholder: '% P2', label:'P2', name: 'p2'},
      {placeholder: '% P3', label:'P3', name: 'p3'},
    ]
  }

  settings3 = {
    name:'Examen',
    percentage: 30,
    fields: [
      {placeholder: '% P1', label:'P1', name: 'p1', value: 30},
    ]
  }

  settings4 = {
    name:'Habilitación',
    percentage: 70,
    fields: [
      {placeholder: '% P1', label:'P1', name: 'p1', value: 70},
    ]
  }

  lightCard: CardSettings = {
    title: 'Light',
    iconClass: 'nb-lightbulb',
    type: 'primary',
  };
  rollerShadesCard: CardSettings = {
    title: 'Roller Shades',
    iconClass: 'nb-roller-shades',
    type: 'success',
  };
  wirelessAudioCard: CardSettings = {
    title: 'Wireless Audio',
    iconClass: 'nb-audio',
    type: 'info',
  };
  coffeeMakerCard: CardSettings = {
    title: 'Coffee Maker',
    iconClass: 'nb-coffee-maker',
    type: 'warning',
  };

  statusCards: string;

  commonStatusCardsSet: CardSettings[] = [
    this.lightCard,
    this.rollerShadesCard,
    this.wirelessAudioCard,
    this.coffeeMakerCard,
  ];

  statusCardsByThemes: {
    default: CardSettings[];
    cosmic: CardSettings[];
    corporate: CardSettings[];
    ud: CardSettings[];
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    ud: this.commonStatusCardsSet,
    corporate: [
      {
        ...this.lightCard,
        type: 'warning',
      },
      {
        ...this.rollerShadesCard,
        type: 'primary',
      },
      {
        ...this.wirelessAudioCard,
        type: 'danger',
      },
      {
        ...this.coffeeMakerCard,
        type: 'secondary',
      },
    ],
  };

  constructor(private themeService: NbThemeService) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name];
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
