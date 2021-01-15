import { Component, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ActualizacionDatos } from '../../../@core/data/models/solicitudes/actualizacion-datos';
import { Solicitante } from '../../../@core/data/models/solicitudes/solicitante';
import { ACTUALIZAR_DATOS } from './form-actualizacion-datos';
import { DialogoSoporteComponent } from '../dialogo-soporte/dialogo-soporte.component';
import { TercerosService } from '../../../@core/data/terceros.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-actualizacion-datos',
  templateUrl: './actualizacion-datos.component.html',
  styleUrls: ['../solicitudes.component.scss']
})
export class ActualizacionDatosComponent implements OnInit {

  solicitante: Solicitante;
  solicitudForm: any;
  solicitudDatos: ActualizacionDatos;
  tipoDocumento: any[];
  

  constructor(
    private translate: TranslateService,
    private dialogo: MatDialog,
    private tercerosService: TercerosService,
    private popUpManager: PopUpManager,
  ) {
    this.solicitudForm = ACTUALIZAR_DATOS;
    this.tercerosService.get('tipo_documento').subscribe(
      response => {
        this.tipoDocumento = response;
        this.construirForm();
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
    
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
      if (campo.etiqueta === 'select') {
        campo.opciones = this.tipoDocumento;
      }
      campo.label = this.translate.instant('solicitudes.' + campo.label_i18n);
    })
  }

  enviarSolicitud(event) {
    console.log(event)
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
