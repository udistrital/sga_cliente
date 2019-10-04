import { Component, OnInit} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import 'style-loader!angular2-toaster/toaster.css';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Inject } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'ngx-consulta-proyecto-academico',
  templateUrl: './consulta-proyecto_academico.component.html',
  styleUrls: ['./consulta-proyecto_academico.component.scss'],
  })
export class ConsultaProyectoAcademicoComponent implements OnInit {
  basicform: FormGroup;

  source_emphasys: LocalDataSource = new LocalDataSource();
  settings_emphasys: any;


  constructor(private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ConsultaProyectoAcademicoComponent>,
    private routerService: Router,
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

  cloneProject(project: any): void {
    this.routerService.navigateByUrl(`pages/proyecto_academico/crud-proyecto_academico/${project.Id}`);
    this.dialogRef.close();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.basicform = this.formBuilder.group({
      codigo_snies: ['', Validators.required],
      facultad: ['', Validators.required],
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
   })

  }



}
