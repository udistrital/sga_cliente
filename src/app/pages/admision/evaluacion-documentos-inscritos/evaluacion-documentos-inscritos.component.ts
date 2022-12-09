import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { LocalDataSource } from 'ng2-smart-table';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PopUpManager } from '../../../managers/popUpManager';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoDocumentosComponent } from '../dialogo-documentos/dialogo-documentos.component';
import { Documento } from '../../../@core/data/models/documento/documento';
import { GoogleService } from '../../../@core/data/google.service';
import { Invitacion } from '../../../@core/data/models/correo/invitacion';
import { InvitacionTemplate } from '../../../@core/data/models/correo/invitacionTemplate';
import Swal from 'sweetalert2';
import { PivotDocument } from '../../../@core/utils/pivot_document.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'evaluacion-documentos-inscritos',
  templateUrl: './evaluacion-documentos-inscritos.component.html',
  styleUrls: ['./evaluacion-documentos-inscritos.component.scss'],
})
export class EvaluacionDocumentosInscritosComponent implements OnInit {

  loading: boolean = false;
  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  settings: any;
  dataSource: LocalDataSource;
  info_persona_id: any;
  periodo: any;
  nivel_load: any;
  selectednivel: any;
  proyectos_selected: any[];
  inscripcion_id: any;
  showProfile: boolean;
  invitacion: Invitacion;
  invitacionTemplate: InvitacionTemplate;
  cantidad_aspirantes: number = 0;
  cantidad_admitidos: number = 0;
  cantidad_inscritos: number = 0;
  mostrarConteos: boolean = false;

  periodos = [];
  proyectos = [];
  Aspirantes = [];

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService,
    private tercerosService: TercerosService,
    private documentoService: DocumentoService,
    private dialog: MatDialog,
    private googleMidService: GoogleService,
    private pivotDocument: PivotDocument,
    private sgaMidService: SgaMidService,
  ) {
    this.invitacion = new Invitacion();
    this.invitacionTemplate = new InvitacionTemplate();
    this.dataSource = new LocalDataSource();
    this.showProfile = true;
    this.loadData();
    this.createTable()
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
  }

  ngOnInit() {
    this.pivotDocument.document$.subscribe((document: any) => {
      if (document) {
        this.revisarDocumento(document)
      }
    })
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();
      await this.cargarPeriodo();
      await this.loadLevel();
    } catch (error) {
      this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.error_cargar_informacion'));
    }
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = <any>res['Data'][0];
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  loadLevel() {
    this.projectService.get('nivel_formacion?limit=0').subscribe(
      (response: any) => {
        if (response !== null || response !== undefined) {
          this.nivel_load = <any>response;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  filtrarProyecto(proyecto) {
    if (this.selectednivel === proyecto['NivelFormacionId']['Id']) {
      return true
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] === this.selectednivel) {
        return true
      }
    } else {
      return false
    }
  }

  loadProyectos() {
    this.dataSource.load([]);
    this.Aspirantes = [];
    if (this.selectednivel !== NaN) {
      this.projectService.get('proyecto_academico_institucion?limit=0').subscribe(
        (response: any) => {
          this.proyectos = <any[]>response.filter(
            proyecto => this.filtrarProyecto(proyecto),
          );
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    }
  }

  loadInscritos() {
    this.loading = true;
    this.dataSource.load([]);
    this.Aspirantes = [];
    this.sgaMidService.get('admision/getlistaaspirantespor?id_periodo='+this.periodo.Id+'&id_proyecto='+this.proyectos_selected+'&tipo_lista=1')
      .subscribe(
        (response: any) => {
          if (response.Success && response.Status == "200") {
            this.Aspirantes = response.Data;
            this.cantidad_inscritos = this.Aspirantes.filter(aspirante => aspirante.Estado == "INSCRITO").length;
            this.cantidad_admitidos = this.Aspirantes.filter(aspirante => aspirante.Estado == "ADMITIDO").length;
            this.cantidad_aspirantes = this.cantidad_inscritos + this.cantidad_inscritos;
            this.dataSource.load(this.Aspirantes);
            this.loading = false;
            this.mostrarConteos = true;
          }
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.mostrarConteos = false;
          Swal.fire({
            icon: 'warning',
            title: this.translate.instant('admision.titulo_no_aspirantes'),
            text: this.translate.instant('admision.error_no_aspirantes'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      );

    /* this.inscripcionService.get('inscripcion?query=EstadoInscripcionId__Id:5,ProgramaAcademicoId:' +
      this.proyectos_selected + ',PeriodoId:' + this.periodo.Id +
      '&sortby=Id&order=asc').subscribe(
        (response: any) => {
          if (Object.keys(response[0]).length !== 0) {
            const data = <Array<any>>response;
            data.forEach(element => {
              if (element.PersonaId !== undefined) {
                this.tercerosService.get('datos_identificacion?query=TerceroId:' + element.PersonaId).subscribe(
                  (res: any) => {
                    const aspiranteAux = {
                      Credencial: element.Id,
                      Identificacion: res[0].Numero,
                      Nombre: res[0].TerceroId.NombreCompleto,
                      Estado: element.EstadoInscripcionId.Nombre,
                    }
                    this.Aspirantes.push(aspiranteAux);
                    this.dataSource.load(this.Aspirantes);
                  },
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));

                  },
                );
              }
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: this.translate.instant('admision.titulo_no_aspirantes'),
              text: this.translate.instant('admision.error_no_aspirantes'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
        },
      ); */
  }

  activateTab() {
    this.showProfile = true;
  }

  loadPerfil(event) {
    this.tercerosService.get('datos_identificacion?query=Activo:true,numero:' + event.data.Identificacion).subscribe(
      (response: any) => {
        this.projectService.get('proyecto_academico_institucion/' + this.proyectos_selected).subscribe(
          (res: any) => {
            this.inscripcion_id = event.data['Credencial'];
            this.inscripcionService.get('inscripcion?query=Id:' + this.inscripcion_id).subscribe(
              (resp: any[]) => {

                this.info_persona_id = response[0].TerceroId.Id;
                this.pivotDocument.updateInfo({
                  TerceroId: response[0].TerceroId.Id,
                  IdInscripcion: event.data['Credencial'],
                  ProgramaAcademicoId: this.proyectos_selected.toString(),
                  ProgramaAcademico: res.Nombre,
                  IdPeriodo: this.periodo.Id
                })
                sessionStorage.setItem('TerceroId', response[0].TerceroId.Id);
                sessionStorage.setItem('IdInscripcion', event.data['Credencial']);
                sessionStorage.setItem('ProgramaAcademicoId', this.proyectos_selected.toString());
                sessionStorage.setItem('ProgramaAcademico', res.Nombre);
                sessionStorage.setItem('IdPeriodo', this.periodo.Id);
                sessionStorage.setItem('IdTipoInscripcion', resp[0].TipoInscripcionId.Id);
                this.showProfile = false;

              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
              },
            );
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
          },
        );
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      },
    );
  }

  createTable() {
    this.settings = {
      columns: {
        Credencial: {
          title: this.translate.instant('admision.credencial'),
          width: '20%',
          editable: false,
        },
        Identificacion: {
          title: this.translate.instant('admision.id'),
          width: '20%',
          editable: false,
        },
        Nombre: {
          title: this.translate.instant('admision.nombre'),
          width: '35%',
          editable: false,
        },
        Estado: {
          title: this.translate.instant('admision.estado'),
          width: '20%',
          editable: false,
        },
      },
      mode: 'external',
      filter: false,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        custom: [
          {
            name: 'view',
            title:
              '<i class="nb-search" title="' +
              this.translate.instant('admision.tooltip_ver_registro') +
              '"></i>',
          },
        ],
      },
    };
  }

  revisarDocumento(doc: any) {
    const assignConfig = new MatDialogConfig();
    assignConfig.width = '1300px';
    assignConfig.height = '750px';
    assignConfig.data = { documento: doc }
    const dialogo = this.dialog.open(DialogoDocumentosComponent, assignConfig);
    dialogo.afterClosed().subscribe(data => {
      if (data) {
        this.documentoService.get('documento/' + doc.DocumentoId).subscribe(
          (documento: Documento) => {
            this.showProfile = true
            documento.Metadatos = JSON.stringify(data);
            this.documentoService.put('documento', documento).subscribe(
              response => {
                this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'))
                if (!data.aprobado && data.observacion !== '') {
                  // llamar funcion que envia correo con la observacion
                  // enviarCorreo(data.observacion);
                  const correo = JSON.parse(atob(localStorage.getItem('id_token').split('.')[1])).email;
                  if (correo !== undefined) {
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    this.invitacionTemplate.Fecha = new Date().toLocaleDateString('es-CO', options);
                    this.invitacionTemplate.ContenidoProduccion = this.makeHtmlTemplate(data);
                    this.invitacion.to = [];
                    this.invitacion.to.push(correo);
                    this.invitacion.cc = [];
                    this.invitacion.bcc = [];
                    this.invitacion.subject = 'Observación documento solicitado';
                    this.invitacion.templateName = 'observacion_documento.html';
                    this.invitacion.templateData = this.invitacionTemplate;
                    this.sendCorreo();
                  }
                }
                this.showProfile = false
              },
              error => {
                this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
              },
            )
          },
          error => {
            this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
          },
        )
      }
    })
  }

  sendCorreo() {
    this.googleMidService.post('notificacion', this.invitacion)
      .subscribe((res: any) => {
        Swal.fire({
          title: `Éxito al enviar observación.`,
        });
        this.invitacion.to = [];
        this.invitacion.templateData = null;
      });
  }

  makeHtmlTemplate(data: any) {
    return `
    <div class=\"row\">
      <div class=\"encabezado\">
        Título:
      </div>
      <div class=\"dato\">
        Revisión de documentos
      </div>
    </div>
    <div class=\"row\">
      <div class=\"encabezado\">
        Observación:
      </div>
      <div class=\"dato\">
        ${data.observacion}
      </div>
    </div>
    `
    // + this.makeRowMetadato();
  }

  // makeRowMetadato(): string {
  //   let metadatoList: string = ``;
  //   this.solicitud_selected.ProduccionAcademica.Metadatos.forEach(metadato => {
  //     if (JSON.parse(metadato.MetadatoSubtipoProduccionId.TipoMetadatoId.FormDefinition).etiqueta === 'input' &&
  //       metadato.Valor) {
  //       metadatoList += `
  //           <div class=\"row\">
  //             <div class=\"encabezado\">
  //               ${this.translate
  //           .instant('produccion_academica.labels.' + JSON.parse(metadato.MetadatoSubtipoProduccionId.TipoMetadatoId.FormDefinition).label_i18n)
  //         }
  //             </div>
  //             <div class=\"dato\">
  //               ${metadato.Valor}
  //             </div>
  //           </div>

  //           `
  //     }
  //   })
  //   return metadatoList;
  // }

}
