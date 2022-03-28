import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { RenderDataComponent } from '../../../@theme/components';
import { PopUpManager } from '../../../managers/popUpManager';
import { data1, settings1, settings2, settings3, settings4, notes1, notes2, notes3, notes4, students } from './settings-forms';

interface DocenteAsignatura {
  Docente: string;
  Identificacion: string;
  Codigo: string;
  Asignatura: string;
  Nivel: string;
  Grupo: string;
  Inscritos: number;
  Creditos: number;
  Periodo: string;
}

interface EstructuraNota {
  Estado: string,
  EstructuraNota: {
    Corte1: {
      P1: number,
      P2: number,
      P3: number
    },
    Corte2: {
      P4: number,
      P5: number,
      P6: number,
      LAB: number
    },
    EXA: number,
    HAB: number,
  },
  RegistroId: string
}

@Component({
  selector: 'crud-notas',
  templateUrl: './crud-notas.component.html',
  styleUrls: ['./crud-notas.component.scss']
})

export class CrudNotasComponent implements OnInit {
  totalPercentage = 0;
  parcialPercentage = [0, 0, 0]

  cajaPorcentajesVer: boolean = false;
  Corte1 = null;
  Corte2 = null;
  Examen = null;
  Habilit = null;
  notes1 = null;
  notes2 = null;
  notes3 = null;
  notes4 = null;
  students = null;
  matrixForm: any = [];

  dataDocente: DocenteAsignatura;

  dataEstructuraNota: EstructuraNota;
  EstructuraPorDefecto = {
    EstructuraNota: {
      Corte1: {
        P1: 0,
        P2: 0,
        P3: 0
      },
      Corte2: {
        P4: 0,
        P5: 0,
        P6: 0,
        LAB: 20
      },
      EXA: 30,
      HAB: 70
    }
  }

  GuardarEstructuraNota: boolean = false;

  settings: Object;
  dataSource: LocalDataSource;
  data1 = null;

  constructor(
    private route: ActivatedRoute,
    private sgaMidService: SgaMidService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
  ) {
    this.Corte1 = settings1;
    this.Corte2 = settings2;
    this.Examen = settings3;
    this.Habilit = settings4;
    this.notes1 = notes1;
    this.notes2 = notes2;
    this.notes3 = notes3;
    this.notes4 = notes4;
    this.students = students.map((student) => {
      return {
        ...student,
        ...{ notes1: { ...notes1, ...{ importantValue: student.code } } },
        ...{ notes2: { ...notes2, ...{ importantValue: student.code } } },
        ...{ notes3: { ...notes3, ...{ importantValue: student.code } } },
        ...{ notes4: { ...notes4, ...{ importantValue: student.code } } },
      }
    });
    //console.log(this.students);
    this.dataDocente = {
      Docente: "",
      Identificacion: "",
      Codigo: "",
      Asignatura: "string",
      Nivel: "",
      Grupo: "",
      Inscritos: null,
      Creditos: null,
      Periodo: ""
    };

    this.data1 = data1;
    this.dataSource = new LocalDataSource();

  }

  async ngOnInit() {
    this.createTable();
    var asignaturaId = this.route.snapshot.paramMap.get('process');
    try {
      
      await this.cargarDocente(asignaturaId);
      await this.cargarEstructuraNota(asignaturaId);
      
    } catch(error) {
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
    }

    if (this.dataEstructuraNota.Estado == "Definida") {
      this.Corte1 = {
        name: 'Corte 1',
        percentage: 35,
        type: 'percentage',
        fields: [
            { placeholder: '% P1', label: 'P1', name: 'p1', value: this.dataEstructuraNota.EstructuraNota.Corte1.P1 },
            { placeholder: '% P2', label: 'P2', name: 'p2', value: this.dataEstructuraNota.EstructuraNota.Corte1.P2 },
            { placeholder: '% P3', label: 'P3', name: 'p3', value: this.dataEstructuraNota.EstructuraNota.Corte1.P3 },
        ]
      };

      this.Corte2 = {
        name: 'Corte 2',
        type: 'percentage',
        percentage: 35,
        fields: [
            { placeholder: '% P4', label: 'P4', name: 'p4', value: this.dataEstructuraNota.EstructuraNota.Corte2.P4 },
            { placeholder: '% P5', label: 'P5', name: 'p5', value: this.dataEstructuraNota.EstructuraNota.Corte2.P5 },
            { placeholder: '% P6', label: 'P6', name: 'p6', value: this.dataEstructuraNota.EstructuraNota.Corte2.P6 },
            { placeholder: '% LAB', label: 'LAB', name: 'lab', value: this.dataEstructuraNota.EstructuraNota.Corte2.LAB },
        ]
      };

      this.Examen = {
        name: 'Examen final',
        type: 'percentage',
        percentage: 30,
        fields: [
            { placeholder: '% Exam', label: 'EXAM', name: 'ex', value: this.dataEstructuraNota.EstructuraNota.EXA },
        ]
      };

      this.Habilit = {
        name: 'Habilitación',
        type: 'percentage',
        percentage: 70,
        fields: [
            { placeholder: '% Hab', label: 'HAB', name: 'hab', value: this.dataEstructuraNota.EstructuraNota.HAB },
        ]
      }
        
    } else {
      this.popUpManager.showAlert(this.translate.instant('notas.sin_definir_estructuraNota'),this.translate.instant('notas.peticion_definir_estructura'));
      let registroId = this.dataEstructuraNota.RegistroId;
      this.dataEstructuraNota = {
        Estado: "Por Definir",
        EstructuraNota: {
          Corte1: {
            P1: 0,
            P2: 0,
            P3: 0
          },
          Corte2: {
            P4: 0,
            P5: 0,
            P6: 0,
            LAB: 20,
          },
          EXA: 30,
          HAB: 70
        },
        RegistroId: registroId
      }
      
    }

    this.cajaPorcentajesVer = true;
    

    
    this.dataSource.load(this.data1);

  }

  cargarDocente(asignaturaId){
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('notas/DocenteAsignatura/' + asignaturaId).subscribe(
        (response: any) => {
          if (response !== null && response.Status == '404') {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_informacion_docente_asignatura'));
          } else {
            this.dataDocente = response.Data[0]; 
          }
          resolve(this.dataDocente)
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error)
        }
      );
    });
  }

  cargarEstructuraNota(asignaturaId){
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('notas/PorcentajeAsignatura/' + asignaturaId).subscribe(
        (response: any) => {
          if (response !== null && response.Status == '404') {
            this.popUpManager.showErrorAlert(this.translate.instant('notas.sin_info_porcentajes'));
          } else {
            this.dataEstructuraNota = response.Data[0];
          }
          resolve(this.dataEstructuraNota)
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(error)
        }
      );
    });
  }

  updateEstructuraNota(){
    var putBody = { estructura_nota: this.dataEstructuraNota.EstructuraNota};
    this.sgaMidService.put('notas/PorcentajeAsignatura/' + this.dataEstructuraNota.RegistroId, putBody).subscribe(
      (response: any) => {
        if (response !== null && response.Status == '200') {
          this.popUpManager.showSuccessAlert(this.translate.instant('notas.nota_definida_ok'))
          this.GuardarEstructuraNota = false;
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('notas.fallo_definir_nota'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  formSettings1(form: FormGroup) {
    //console.log(form.valid)
    form.valueChanges.subscribe((data) => {
      
      if (form.valid) {
        this.dataEstructuraNota.EstructuraNota.Corte1.P1=data.fields[0].p1
        this.dataEstructuraNota.EstructuraNota.Corte1.P2=data.fields[1].p2
        this.dataEstructuraNota.EstructuraNota.Corte1.P3=data.fields[2].p3
        this.updateSumPercentage(0, data)
      } else {
        this.updateSumPercentage(0, 0);
      }
    })
  }

  formSettings2(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.dataEstructuraNota.EstructuraNota.Corte2.P4=data.fields[0].p4
        this.dataEstructuraNota.EstructuraNota.Corte2.P5=data.fields[1].p5
        this.dataEstructuraNota.EstructuraNota.Corte2.P6=data.fields[2].p6
        this.dataEstructuraNota.EstructuraNota.Corte2.LAB=data.fields[3].lab
        this.updateSumPercentage(1, data)
      } else {
        this.updateSumPercentage(1, 0);
      }
    })
  }

  formSettings3(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.dataEstructuraNota.EstructuraNota.EXA=data.fields[0].ex
        this.updateSumPercentage(2, data)
      } else {
        this.updateSumPercentage(2, 0);
      }
    })
  }

  formSettings4(form: FormGroup) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        this.dataEstructuraNota.EstructuraNota.HAB=data.fields[0].hab
      }
    })
  }

  updateSumPercentage(index, value) {
    const { fields } = value;
    if (fields && JSON.stringify(fields) !== '[]') {
      this.parcialPercentage[index] = fields.map((f) => {
        let data = 0;
        for (let key in f) {
          data = f[key];
        }
        return data
      }).reduce((a: number, b: number) => a + b, 0);
      this.totalPercentage = this.parcialPercentage.reduce((a, b) => a + b)
    } else {
      this.parcialPercentage[index] = value;
      this.totalPercentage = this.parcialPercentage.reduce((a, b) => a + b);
    }
    if (this.totalPercentage == 100 && this.dataEstructuraNota.Estado == "Por Definir"){
      this.GuardarEstructuraNota = true;
    } else {
      this.GuardarEstructuraNota = false;
    }
  }

  formNotes(form) {
    form.valueChanges.subscribe((data) => {
      if (form.valid) {
        //console.log(data);
      }
    })
  }


  createTable() {
    this.settings = {
      columns: {
        Codigo: {
          title: "codigo",//this.translate.instant('asignaturas.grupo'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Nombre: {
          title: "Nombre",//this.translate.instant('asignaturas.asignatura'),
          editable: false,
          width: '7%',
          filter: false,
        },
        Apellido: {
          title: "Apellido",//this.translate.instant('asignaturas.creditos'),
          editable: false,
          width: '7%',
          filter: false,
        },
        Corte1: {
          title: "Corte1",//this.translate.instant('asignaturas.corte1'),
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        Corte2: {
          title: "Corte2",//this.translate.instant('asignaturas.corte2'),
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        LabExamHabAcu: {
          title: "",
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        Varios: {
          title: "Varios",//this.translte...
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        Total: {
          title: "Total",//this.translate...
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        }
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('asignaturas.no_datos_notas_parciales')
    };
  }
  
}
