import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'copiar-conceptos',
  templateUrl: './copiar-conceptos.component.html',
  styleUrls: ['../derechos-pecuniarios.component.scss']
})
export class CopiarConceptosComponent implements OnInit {

  vigenciaElegida: FormControl;
  vigencias: any[];
  tablaConceptos: any;
  datosConceptos: LocalDataSource;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.vigenciaElegida = new FormControl('');
  }

  ngOnInit() {
    //traer las vigencias disponibles con un GET
    this.vigencias = [{Id: 1, Nombre: '2020'}, {Id: 2, Nombre: '2019'}, {Id: 3, Nombre: '2018'}]
    this.crearTablaConceptos();
    this.datosConceptos = new LocalDataSource();
  }

  crearTablaConceptos() {
    this.tablaConceptos = {
      columns: {
        Codigo: {
          title: this.translate.instant('derechos_pecuniarios.codigo'),
          editable: false,
          width: '40%',
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          width: '40%',
          editable: false,
        },
        Factor: {
          title: this.translate.instant('derechos_pecuniarios.factor'),
          editable: false,
          width: '20%',
          filter: false,
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
      },
      noDataMessage: this.translate.instant('derechos_pecuniarios.no_data'),
    };
  }

  copiarConceptos() {
    //copiar conceptos
    // redirige a la de definir con los datos copiados
    this.router.navigate(['../definir-conceptos'], {relativeTo: this.route});
  }

  cambiarVigencia() {
    //traer los datos de la vigencia seleccionada con un GET
    const id = this.vigenciaElegida.value;
    console.log(id);
    const data = [
      {
        Codigo: 8672,
        Nombre: 'Inscripción Pregrado',
        Factor: 3,
      },
      {
        Codigo: 12,
        Nombre: 'Inscripción Postgrado',
        Factor: 4,
      },
      {
        Codigo: 40,
        Nombre: 'Certificado de notas',
        Factor: 0.5,
      },
    ];
    this.datosConceptos.load(data);
  }

}
