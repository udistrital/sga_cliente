import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificacionesService } from '../../../@core/utils/notificaciones.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss'],
})

export class ListadoComponent {

  baseUrl: string = 'https://api.cdnjs.com/libraries';
  queryUrl: string = '?search=';

  searchTerm$ = new Subject<string>();

  notificaciones: any;
  constructor(private notificacionService: NotificacionesService,    private router: Router) {
    this.notificaciones = [];
    this.notificacionService.arrayMessages$
      .subscribe((notification: any) => {
        this.notificaciones = notification;
      });
    this.searchTerm$
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap(query => this.searchEntries(query)),
      ).subscribe(response => {
        this.notificaciones = response;
      })
    this.notificacionService.getNotificaciones();

  }

  searchEntries(term) {
    const array = []
    array.push(this.notificacionService.listMessage.filter(notify => notify.Content.Message.indexOf(term) !== -1 || notify.User.indexOf(term) !== -1));
    return array
  }

  redirect(content: any, id: any) {
    this.router.navigate([content]);
    this.notificacionService.changeStateToView(id);
  }

}
