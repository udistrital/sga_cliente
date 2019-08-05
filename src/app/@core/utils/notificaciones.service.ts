import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { environment } from './../../../environments/environment';
import { ConfiguracionService } from './../data/configuracion.service';
import { from, interval } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { map } from 'rxjs-compat/operators/map';
import { ImplicitAutenticationService } from './implicit_autentication.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotificacionEstadoUsuario } from '../data/models/notificacion_estado_usuario';

const { NOTIFICACION_SERVICE, production } = environment;

@Injectable({
    providedIn: 'root',
})
export class NotificacionesService {
    public messagesSubject: Subject<any>;

    public listMessage: any;
    public payload: any;
    private notificacion_estado_usuario: any

    private noNotifySubject = new Subject();
    public noNotify$ = this.noNotifySubject.asObservable();

    private arrayMessagesSubject = new Subject();
    public arrayMessages$ = this.arrayMessagesSubject.asObservable();
    private autenticacion = new ImplicitAutenticationService;
    timerPing$ = interval(30000);
    roles: any;


    constructor(
        private confService: ConfiguracionService,
    ) {
        this.listMessage = [];
        this.notificacion_estado_usuario = []
        this.connect();
        if (this.autenticacion.live()) {
            this.payload = this.autenticacion.getPayload();
            this.queryNotification();
        }
    }

    getNotificaciones() {
        this.noNotifySubject.next((this.listMessage.filter(data => data.Estado === 'enviada')).length)
        this.arrayMessagesSubject.next(this.listMessage);
    }

    getNotificacionEstadoUsuario(id) {
       return this.notificacion_estado_usuario.filter(data => data.Id === id)
    }

    send_ping() {
        this.timerPing$.subscribe(() => (this.messagesSubject.next('ping')));
    }

    connect() {
        if (this.autenticacion.live() && production) {
            this.payload = this.autenticacion.getPayload();
            this.roles = (JSON.parse(atob(localStorage.getItem('id_token').split('.')[1])).role).filter((data: any) => (data.indexOf('/') === -1));
            this.messagesSubject = webSocket(`${NOTIFICACION_SERVICE}?id=${this.payload.sub}&profiles=${this.roles}`);
            this.messagesSubject
                .pipe(
                    map((msn) => {
                        if (msn.Estado === 'conected') {
                            this.send_ping();
                        } else {
                            this.listMessage = [...[msn], ...this.listMessage];
                            this.noNotifySubject.next(this.listMessage.length);
                            this.arrayMessagesSubject.next(this.listMessage);
                        }
                        return msn
                    }),
                )
                .subscribe(
                    (msg: any) => this.send_ping(),
                    err => {
                        console.info(err);
                        // this.connect();
                    },
                    () => console.info('complete'),
                );
        }
    }

    close() {
        this.messagesSubject.unsubscribe();
    }

    addMessage(message) {
        this.listMessage = [...[message], ...this.listMessage];
        this.noNotifySubject.next((this.listMessage.filter(data => data.Estado === 'enviada')).length);
        this.arrayMessagesSubject.next(this.listMessage);
        console.info(this.listMessage)
    }

    changeStateNoView(user) {
        if (this.listMessage.filter(data => data.Estado === 'enviada').length >= 1) {
            this.confService.post('notificacion_estado_usuario/changeStateNoView/' + user, {})
                .subscribe(res => {
                    this.listMessage = [];
                    this.queryNotification();
                });
        }
    }

    changeStateToView(id) {
        var notificacion = this.getNotificacionEstadoUsuario(id);
        notificacion[0].Activo = false
        this.confService.put('notificacion_estado_usuario',notificacion[0])
                .subscribe(res => {
        });  
        notificacion[0].Id = null
        notificacion[0].Activo = true
        notificacion[0].NotificacionEstado = {
            Id: 3,
        }
        this.confService.post('notificacion_estado_usuario',notificacion[0])
                .subscribe(res => {
                    this.listMessage = [];
                    this.queryNotification();
        }); 
    }

    queryNotification() {
        this.confService.get('notificacion_estado_usuario?query=Usuario:' + this.payload.sub + ',Activo:true&sortby=id&order=asc&limit=-1')
            .subscribe((resp: any) => {
                if (resp !== null) {
                    this.notificacion_estado_usuario = resp
                    from(resp)
                        .subscribe((notify: any) => {
                            if (typeof notify.Notificacion !== 'undefined') {
                                const message = {
                                    Id: notify.Id,
                                    Type: notify.Notificacion.NotificacionConfiguracion.Tipo.Id,
                                    Content: JSON.parse(notify.Notificacion.CuerpoNotificacion),
                                    User: notify.Notificacion.NotificacionConfiguracion.Aplicacion.Nombre,
                                    Alias: notify.Notificacion.NotificacionConfiguracion.Aplicacion.Alias,
                                    EstiloIcono: notify.Notificacion.NotificacionConfiguracion.Aplicacion.EstiloIcono,
                                    FechaCreacion: new Date(notify.Notificacion.FechaCreacion),
                                    FechaEdicion: new Date(notify.Fecha),
                                    Estado: notify.NotificacionEstado.CodigoAbreviacion,
                                };
                                this.addMessage(message);
                            }
                        });
                }

            });

    }

}
