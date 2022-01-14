import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ImplicitAutenticationService } from '../@core/utils/implicit_autentication.service';

@Component({
  selector: 'ng-uui-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private autenticacion: ImplicitAutenticationService) { }
  appname = 'sga';
  basePathAssets = 'https://pruebasassets.portaloas.udistrital.edu.co/'
  @Input('isloading') isloading: boolean = false;
  @Output('loginEvent') loginEvent: EventEmitter<any> = new EventEmitter();

  login() {
    this.isloading = true;
    this.loginEvent.next('clicked');
    this.autenticacion.login(false);
  }
  
  ngOnInit(): void {

  }

}
