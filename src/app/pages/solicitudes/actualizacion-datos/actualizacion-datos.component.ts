import { Component, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ActualizacionDatos } from '../../../@core/data/models/solicitudes/actualizacion-datos';
import { Solicitante } from '../../../@core/data/models/solicitudes/solicitante';
import { ACTUALIZAR_DATOS } from './form-actualizacion-datos';
import { DialogoSoporteComponent } from '../dialogo-soporte/dialogo-soporte.component';

@Component({
  selector: 'ngx-actualizacion-datos',
  templateUrl: './actualizacion-datos.component.html',
  styleUrls: ['../solicitudes.component.scss']
})
export class ActualizacionDatosComponent implements OnInit {

  solicitante: Solicitante;
  solicitudForm: any;
  solicitudDatos: ActualizacionDatos;
  tipoDocumento: any;
  

  constructor(
    private translate: TranslateService,
    private dialogo: MatDialog,
  ) {
    this.solicitudForm = ACTUALIZAR_DATOS;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.solicitante = new Solicitante();
    this.solicitante.Carrera = "Ingenieria de Sistemas"
    this.solicitante.Codigo = "20111020005"
    this.solicitante.CorreoInstitucional = "correo@udistrital.edu.co"
    this.solicitante.CorreoPersonal = "correo@gmail.com"
    this.solicitante.Nombre = "Nombre de prueba"
    this.solicitante.Telefono = "+57 000-000-0000"
    this.tipoDocumento = [
      {}
    ]
  }

  construirForm() {
    this.solicitudForm.titulo = this.translate.instant('solicitudes.solicitud_encabezado');

    this.solicitudForm.campos.forEach(campo => {
      if (campo.etiqueta === 'button') {
        campo.info = this.translate.instant('solicitudes.' + campo.label_i18n)
      }
      campo.label = this.translate.instant('solicitudes.' + campo.label_i18n);
    })
  }

  enviarSolicitud(event) {
    console.log(event.data)
  }

  abrirDialogoArchivo() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.height = '300px';
    const dialogo = this.dialogo.open(DialogoSoporteComponent, dialogConfig);
    dialogo.afterClosed().subscribe(archivo => {
      
    });
  }

}
