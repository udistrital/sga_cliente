import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Actividad } from '../../../@core/data/models/calendario-academico/actividad';
import { CoreService } from '../../../@core/data/core.service';
import { EventoService } from '../../../@core/data/evento.service';
import { PopUpManager } from '../../../managers/popUpManager';
import * as moment from 'moment';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'ngx-actividad-calendario-academico',
  templateUrl: './actividad-calendario-academico.component.html',
  styleUrls: ['../calendario-academico.component.scss'],
})
export class ActividadCalendarioAcademicoComponent {

  activity: Actividad;
  processName: string;
  period: string;
  activityForm: FormGroup;
  responsables: any;
  publicTypeForm: FormGroup;
  addPublic: boolean = false;
  publicTable: any;
  tableSource: LocalDataSource;

  constructor(
    public dialogRef: MatDialogRef<ActividadCalendarioAcademicoComponent>,
    private builder: FormBuilder,
    private coreService: CoreService,
    private eventoService: EventoService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.processName = this.data.process.Nombre;
    this.period = '';
    this.tableSource = new LocalDataSource();
    this.fetchSelectData(this.data.calendar.PeriodoId);
    this.createActivityForm();
    this.createPublicTable();
    this.createPublicTypeForm();
    this.dialogRef.backdropClick().subscribe(() => this.closeDialog());
    if (this.data.editActivity !== undefined) {
      this.activityForm.setValue({
        Nombre: this.data.editActivity.Nombre,
        Descripcion: this.data.editActivity.Descripcion,
        FechaInicio: moment(this.data.editActivity.FechaInicio, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        FechaFin: moment(this.data.editActivity.FechaFin, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        responsable: 0,
      });
    }
  }

  saveActivity() {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('calendario.seguro_registrar_actividad')
    ).then((ok) => {
      if (ok.value) {
        this.activity = this.activityForm.value;
        this.activity.TipoEventoId = {Id: this.data.process.procesoId};
        this.activity.FechaInicio = moment(this.activity.FechaInicio).format('YYYY-MM-DDTHH:mm') + ':00Z';
        this.activity.FechaFin = moment(this.activity.FechaFin).format('YYYY-MM-DDTHH:mm') + ':00Z';
        this.activity.Activo = true;
        this.tableSource.getAll().then(
          data => {
            this.activity.responsable = data.map(
              item => {
                return {IdPublico: item.Id}
              }
            );
            if (this.activity.responsable.length > 0) {
              this.dialogRef.close(this.activity);
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('calendario.no_publico'))
            }
          },
        );
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  createActivityForm() {
    this.activityForm = this.builder.group({
      Nombre: ['', Validators.required],
      Descripcion: ['', Validators.required],
      FechaInicio: ['', Validators.required],
      FechaFin: ['', Validators.required],
      responsable: [[], Validators.required],
    })
  }

  createPublicTypeForm() {
    this.publicTypeForm = this.builder.group({
      Nombre: ['', Validators.required],
      CodigoAbreviacion: ['', Validators.required],
      Activo: [true, Validators.required],
      NumeroOrden: ['', Validators.required],
    })
  }

  fetchSelectData(period) {
    this.coreService.get('periodo/' + period ).subscribe(
      response => this.period = response['Nombre'],
    );
    this.updateSelect();
  }

  updateSelect() {
    this.eventoService.get('tipo_publico?limit=0').subscribe(
      data => {
        this.responsables = data;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  createPublicTable() {
    this.publicTable = {
      columns: {
        Nombre: {
          title: this.translate.instant('calendario.nombre'),
          width: '80%',
          editable: false,
        },
      },
      mode: 'external',
      actions : {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        add: false,
        edit: false,
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
      },
      hideSubHeader: true,
    }
  }

  deletePublic(event: any) {
    this.tableSource.remove(event.data)
  }

  onSelectChange(event: any) {
    const data: any = this.responsables.filter((row) => row.Id === event.value)[0]
    this.tableSource.find(data).then(
      val => this.popUpManager.showErrorAlert(this.translate.instant('calendario.publico_repetido')),
      err => this.tableSource.append(data),
    );
  }

  addPublicType() {
    const newPublicType = this.publicTypeForm.value;
    this.eventoService.post('tipo_publico', newPublicType).subscribe(
      response => {
        this.updateSelect();
        this.popUpManager.showSuccessAlert(this.translate.instant('calendario.responsable_exito'));
        this.publicTypeForm.reset({
          Nombre: '',
          CodigoAbreviacion: '',
          Activo: true,
          NumeroOrden: '',
        });
        this.addPublic = false;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  openForm() {
    this.addPublic = true;
  }

  closeForm() {
    this.addPublic = false;
  }

}
