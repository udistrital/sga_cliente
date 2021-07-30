import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';


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
  constructor(private router: Router,
  ) {
  }
  ngOnInit(): void {
    const oas = document.querySelector('ng-uui-oas');
    oas.addEventListener('user', (event: any) => {
      if (event.detail) {
        this.loadRouting = true;
      }
    });

    oas.addEventListener('option', (event: any) => {
      if (event.detail) {
        setTimeout(()=>(this.router.navigate([event.detail.Url])),50 )
        ;
      }
    });

  }
}
