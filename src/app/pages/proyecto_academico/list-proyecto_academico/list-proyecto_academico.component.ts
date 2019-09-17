import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CampusMidService } from '../../../@core/data/campus_mid.service';
import { UserService } from '../../../@core/data/users.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { UserService } from '../../../@core/data/users.service';
import { ProduccionAcademicaPost } from '../../../@core/data/models/produccion_academica/produccion_academica';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-list-proyecto-academico',
  templateUrl: './list-proyecto_academico.component.html',
  styleUrls: ['./list-proyecto_academico.component.scss'],
  })
export class ListProyectoAcademicoComponent implements OnInit {
  prod_selected: ProduccionAcademicaPost;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;

  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
    private campusMidService: CampusMidService,
    private user: UserService,
    private toasterService: ToasterService) {
  }

  cargarCampos() {
    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      mode: 'external',
      columns: {
        // Persona: {
        //   title: this.translate.instant('GLOBAL.persona'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Titulo: {
          title: this.translate.instant('produccion_academica.titulo_produccion_academica'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '20%',
        },
        SubtipoProduccionId: {
          title: this.translate.instant('produccion_academica.tipo_produccion_academica'),
          // type: 'tipo_produccion_academica;',
          valuePrepareFunction: (value) => {
            return value.Nombre;
          },
          width: '15%',
        },
        Resumen: {
          title: this.translate.instant('produccion_academica.resumen'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '30%',
        },
        EstadoEnteAutorId: {
          title: this.translate.instant('produccion_academica.estado_autor'),
          // type: 'string',
          valuePrepareFunction: (value) => {
            return value.EstadoAutorProduccionId.Nombre;
          },
          width: '15%',
        },
        Fecha: {
          title: this.translate.instant('produccion_academica.fecha_publicacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return ((value) + '').substring(0, 10);
          },
          width: '10%',
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.campusMidService.get('produccion_academica/' + this.user.getPersonaId()).subscribe((res: any) => {
    // this.campusMidService.get('produccion_academica/' + 5).subscribe((res: any) => {
      if (res !== null) {
        if (Object.keys(res.Body[0]).length > 0 && res.Type !== 'error') {
          const data = <Array<ProduccionAcademicaPost>>res.Body;
          this.source.load(data);
        } else {
           Swal({
            type: 'error',
            title: '404',
            text: this.translate.instant('ERROR.404'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      }
    }, (error: HttpErrorResponse) => {
      Swal({
        type: 'error',
        title: error.status + '',
        text: this.translate.instant('ERROR.' + error.status),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    });
  }

  ngOnInit() {
  }



  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }


  itemselec(event): void {
    // console.log("afssaf");
  }


}
