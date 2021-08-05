import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UserDataService } from './pages/services/userDataService';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loadRouting = false;
  environment = environment;
  loadingRouter: boolean;
  title = 'configuracion-cliente';
  constructor(
    private router: Router,
    private userService: UserDataService,
    private translateService: TranslateService
  ) {}
  
  ngOnInit(): void {
    const oas = document.querySelector('ng-uui-oas');

    this.translateService.addLangs(['es', 'en']);
    this.translateService.setDefaultLang('es');
    this.translateService.use(this.translateService.getBrowserLang());

    oas.addEventListener('user', (event: any) => {
      if (event.detail) {
        this.loadRouting = true;
        this.userService.updateUser(event.detail);
      }
    });

    oas.addEventListener('option', (event: any) => {
      if (event.detail) {
        setTimeout(()=>(this.router.navigate([event.detail.Url])),50 );
      }
    });

    oas.addEventListener('logout', (event: any) => {
      if (event.detail) {
        console.log(event.detail);
      }
    });

  }
}
