import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { LocalDataSource } from 'ng2-smart-table';
import { CustomizeButtonComponent } from '../../../@theme/components/customize-button/customize-button.component';
import { LinkDownloadNuxeoComponent } from '../../../@theme/components/link-download-nuxeo/link-download-nuxeo.component';
import { FORM_TRANSFERENCIA_INTERNA } from './forms-transferencia';

@Component({
  selector: 'transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.scss']
})
export class TransferenciaComponent implements OnInit {

  formTransferencia : any = null;
  listadoSolicitudes: boolean = true;
  settings: any = null;
  uid = null;
  dataSource: LocalDataSource;
  constructor(
    private translate: TranslateService,
  ) {
    this.formTransferencia = FORM_TRANSFERENCIA_INTERNA;
    this.dataSource = new LocalDataSource();
    this.uid = localStorage.getItem('persona_id');
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateFields(this.formTransferencia, 'inscripcion.');
    });
    this.translateFields(this.formTransferencia, 'inscripcion.');
    this.createTable();

  }

  translateFields(form, prefix) {
    form.campos = form.campos.map((field: any) => {
      return {
        ...field,
        ...{
          label: this.translate.instant(prefix + field.label_i18n),
          placeholder: this.translate.instant(prefix + field.label_i18n)
        }
      }

    });
    console.log(form);
  }

  ngOnInit() {
    Swal.fire({
      icon: 'warning',
      text: this.translate.instant('inscripcion.alerta_transferencia'),
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    })
    this.loadData()
  }

  createTable() {
    this.settings = {
      actions: false,
      columns: {
        Recibo: {
          title: this.translate.instant('inscripcion.recibo'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Concepto: {
          title: this.translate.instant('inscripcion.concepto'),
          editable: false,
          width: '30%',
          filter: false,
        },
        Programa: {
          title: this.translate.instant('inscripcion.programa'),
          width: '10%',
          editable: false,
          filter: false,
        },
        FechaGeneracion: {
          title: this.translate.instant('inscripcion.fecha_generacion'),
          editable: false,
          width: '10%',
          filter: false,
        },
        Estado: {
          title: this.translate.instant('inscripcion.estado'),
          width: '15%',
          editable: false,
          filter: false,
        },
        Descargar: {
          title: this.translate.instant('derechos_pecuniarios.ver_respuesta'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: LinkDownloadNuxeoComponent,
          type: 'custom',
          // onComponentInitFunction: (instance) => {
          //   instance.save.subscribe((data) => this.descargarReciboPago(data))
          // },
        },
        Opcion: {
          title: this.translate.instant('derechos_pecuniarios.solicitar'),
          width: '5%',
          editable: false,
          filter: false,
          renderComponent: CustomizeButtonComponent,
          type: 'custom',
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((data) => console.log("implement here!", data))
          },
        },
      },
      mode: 'external',
    }
  }
  generarRecibo(){

  }

  loadData(){
    this.dataSource.load([{
      Recibo: 99999,
      Concepto:"Transferencia",
      Programa:"Maestría ingeniería industrial",
      FechaGeneracion: '12-01-01',
      Estado:"Pagado",
      Descargar: 140837,
      Opcion: {
        icon: 'fa fa-pencil fa-2x',
        label: 'Inscribirme',
        class: "btn btn-primary"
      },
    }]);
  }

  descargarNormativa() {
    console.log('Descargar normativa! ');
  }

}
