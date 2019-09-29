import { Component, OnInit} from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import 'style-loader!angular2-toaster/toaster.css';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Inject } from '@angular/core';



@Component({
  selector: 'ngx-modificar-proyecto-academico',
  templateUrl: './modificar-proyecto_academico.component.html',
  styleUrls: ['./modificar-proyecto_academico.component.scss'],
  })
export class ModificarProyectoAcademicoComponent implements OnInit {
  basicform: FormGroup;

  source: LocalDataSource = new LocalDataSource();


  constructor(private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ModificarProyectoAcademicoComponent>,
    private formBuilder: FormBuilder) {
    }

    onclick(): void {
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
