import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ActualizacionNombre } from '../../../@core/data/models/solicitudes/actualizacion-nombre';
import { Solicitante } from '../../../@core/data/models/solicitudes/solicitante';
import { DialogoSoporteComponent } from '../dialogo-soporte/dialogo-soporte.component';
import { ACTUALIZAR_NOMBRE } from './form-actualizacion-nombres';


@Component({
  selector: 'actualizacion-nombres',
  templateUrl: './actualizacion-nombres.component.html',
  styleUrls: ['../solicitudes.component.scss']
})
export class ActualizacionNombresComponent implements OnInit {

  solicitante: Solicitante;
  solicitudForm: any;
  solicitudDatos: ActualizacionNombre;

  constructor(
    private translate: TranslateService,
    private dialogo: MatDialog,
  ) {
    this.solicitudForm = ACTUALIZAR_NOMBRE;
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
    // console.log(event.data)
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
