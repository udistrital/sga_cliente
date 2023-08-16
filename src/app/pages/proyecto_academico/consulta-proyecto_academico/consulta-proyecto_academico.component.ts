import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { OikosService } from "../../../@core/data/oikos.service";

import { TranslateService } from '@ngx-translate/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import 'style-loader!angular2-toaster/toaster.css';
import { Validators, FormBuilder, FormGroup,FormControl } from '@angular/forms';
import { Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ListRegistroProyectoAcademicoComponent } from '../list-registro_proyecto_academico/list-registro_proyecto_academico.component';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { take } from 'rxjs/operators';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'ngx-consulta-proyecto-academico',
  templateUrl: './consulta-proyecto_academico.component.html',
  styleUrls: ['./consulta-proyecto_academico.component.scss'],
  })
export class ConsultaProyectoAcademicoComponent implements OnInit {

  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  basicform: FormGroup;
  source_emphasys: LocalDataSource = new LocalDataSource();
  settings_emphasys: any;
  espacio= [];
  opcionSeleccionadoEspacio: any;
  CampoControl_espacio = new FormControl("", [Validators.required]);


  constructor(private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private _ngZone: NgZone,
    public dialogRef: MatDialogRef<ConsultaProyectoAcademicoComponent>,
    private routerService: Router,
    private oikosService: OikosService,
    private newNuxeoService: NewNuxeoService,
    private formBuilder: FormBuilder) {
      this.source_emphasys.load(data.enfasis);
      this.settings_emphasys = {
        actions: false,
        mode: 'external',
        hideSubHeader: true,
        columns: {
          EnfasisId: {
            title: this.translate.instant('GLOBAL.nombre'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value.Nombre;
            },
            width: '80%',
          },
          Activo: {
            title: this.translate.instant('GLOBAL.activo'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value ? translate.instant('GLOBAL.si') : translate.instant('GLOBAL.no');
            },
            width: '20%',
          },
        },
      };
    }


    onclick(): void {
      this.dialogRef.close();
    }

  downloadActoFile(project: any) {
    const filesToGet = [
      {
        Id: project.id_documento_acto,
        key: project.id_documento_acto,
      },
    ];
    this.newNuxeoService.get(filesToGet).subscribe(
      response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          // console.log("files", filesResponse);
          filesToGet.forEach((file: any) => {
            const url = filesResponse[0].url;
            window.open(url);
          });
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon:'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  cloneProject(project: any): void {
    this.routerService.navigateByUrl(`pages/proyecto_academico/crud-proyecto_academico/${project.Id}`);
    this.dialogRef.close();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.loadespacio();
    this.basicform = this.formBuilder.group({
      codigo_interno: ['', Validators.required],
      codigo_snies: ['', Validators.required],
      facultad: ['', Validators.required],
      espacio: ['', Validators.required],
      nivel_proyecto: ['', Validators.required],
      metodologia_proyecto: ['', Validators.required],
      nombre_proyecto: ['', Validators.required],
      abreviacion_proyecto: ['', Validators.required],
      correo_proyecto: ['', [Validators.required, Validators.email]],
      numero_proyecto: ['', Validators.required],
      creditos_proyecto: ['', [Validators.required, Validators.maxLength(4)]],
      duracion_proyecto: ['', Validators.required],
      tipo_duracion_proyecto: ['', Validators.required],
      ciclos_proyecto: ['', Validators.required],
      ofrece_proyecto: ['', Validators.required],
      enfasis_proyecto: ['', Validators.required],
      proyecto_padre_id: ['', Validators.required],
   })

  }

  prueba() {
    this.openDialogRegistro()
  }

  openDialogRegistro(): void {
    const dialogRef = this.dialog.open(ListRegistroProyectoAcademicoComponent, {
      width: '1900px',
      height: '700px',
      data: {Id: this.data.Id},
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  loadespacio() {
    this.oikosService
      .get("dependencia_tipo_dependencia/?query=TipoDependenciaId:1&limit=0")
      .subscribe(
        (res: any) => {
          const r = <any>res;
          if (res !== null && r.Type !== "error") {
            this.espacio = res.map((data: any) => data.DependenciaId);
            
            this.espacio.forEach((esp: any) => {
              if (esp.Id === Number(this.data.iddependencia)) {
                 this.opcionSeleccionadoEspacio = esp;
               }
             });
          }
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: "error",
            title: error.status + "",
            text: this.translate.instant("ERROR." + error.status),
            confirmButtonText: this.translate.instant("GLOBAL.aceptar")
          });
        }
      );
  }

}
