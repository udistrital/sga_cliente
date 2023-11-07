import { Component, Input, OnInit } from '@angular/core';
import { EspacioSummary, PlanEstudioSummary } from '../../../@core/data/models/plan_estudios/plan_estudio_summary';
import { PopUpManager } from '../../../managers/popUpManager';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { VisualizarDocumentoPlanComponent } from '../visualizar-documento-plan/visualizar-documento-plan.component';

@Component({
  selector: 'summary-planes-estudio',
  templateUrl: './summary-planes-estudio.component.html',
  styleUrls: ['./summary-planes-estudio.component.scss']
})
export class SummaryPlanesEstudioComponent implements OnInit {
  
  @Input('dataPlanes') dataPlanes: PlanEstudioSummary;

  defineCols: string = 'col-lg-12 col-md-12 col-sm-12 col-xs-12';

  Escuelas: any = {};
 
  constructor(
    public dialog: MatDialog,
  ) { }

  async ngOnInit() {
    if (this.dataPlanes.Planes.length > 2) {
      this.defineCols = "col-lg-4 col-md-4 col-sm-12 col-xs-12";
    } else if (this.dataPlanes.Planes.length > 1) {
      this.defineCols = "col-lg-6 col-md-6 col-sm-12 col-xs-12";
    } else {
      this.defineCols = "col-lg-12 col-md-12 col-sm-12 col-xs-12";
    }
    // ? Asegurar Orden de Planes
    this.dataPlanes.Planes.sort((a, b) => a.Orden - b.Orden);
    this.Escuelas = this.dataPlanes.Escuelas;

    // ? Para cada plan...
    const ObtenerOrdenEscuelas = new Promise(resolve => {
      const TotPlanes = this.dataPlanes.Planes.length;
      
      let offsetPeriodo = 0;
      this.dataPlanes.Planes.forEach((plan, idPlan) => {
        // ? Asegurar Orden de Periodos
        plan.InfoPeriodos.sort((a, b) => a.Orden - b.Orden);
        // ? Asignar consecutivo periodos
        const TotPeriodo = plan.InfoPeriodos.length;
        plan.InfoPeriodos.forEach((periodo, idPeriodo) => {
          periodo.Orden += offsetPeriodo;
          if ((idPlan === TotPlanes-1) && (idPeriodo === TotPeriodo-1)) {
            resolve(true)
          }
        });
        offsetPeriodo += TotPeriodo;
      });
    });

    await ObtenerOrdenEscuelas;

    // ? recorrer cada periodo para ir agrupando escuelas de + > -
    this.dataPlanes.Planes.forEach(plan => {
      plan.InfoPeriodos.forEach(periodo => {
        periodo.Espacios.sort((a, b) => OrdenarPorEscuelas(a, b, this.Escuelas));
      });
    });

    function OrdenarPorEscuelas(a: EspacioSummary, b: EspacioSummary, Escuelas: any): number {
      // ? Ordenador de escuelas de mayor a menor cantidad de apariciones de la escuela
      const ordenA = Escuelas[a.Escuela].Cantidad || 0;
      const ordenB = Escuelas[b.Escuela].Cantidad || 0;
      if (ordenA > ordenB) {
        return -1;
      } else if (ordenA < ordenB) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  getGrupos(InfoColorCode) {
    let asArray = []
    Object.keys(InfoColorCode).forEach(k => {
      asArray.push(InfoColorCode[k]);
    })
    return asArray;
  }

  printRequired(codes: string[]): string {
    let formated = "";
    codes.forEach((code, i) => {
      formated += code;
      if (i < codes.length - 1) {
        formated += ", ";
      }
    });
    return formated;
  }

  mouseHoverIn(event, req: string[]) {
    let ep: HTMLElement = event.target;
    ep.style.boxShadow = `0 0 2px 2px rgba(3, 103, 143, 0.75),
    0 13px 5px -5px rgba(0, 0, 0, 0.5)`;
    ep.style.transform = `translate(0, -3px)`

    req.forEach(r => {
      let e: HTMLElement = document.getElementById(r);
      if (e != undefined && e != null) {
        e.style.boxShadow = ep.style.boxShadow;
        e.style.transform = ep.style.transform;
      }
    });
  }

  mouseHoverOut(event, req: string[]) {
    let ep: HTMLElement = event.target;
    ep.style.boxShadow = `0 10px 5px -5px rgba(0, 0, 0, 0.2)`
    ep.style.transform = `translate(0, 0)`

    req.forEach(r => {
      let e: HTMLElement = document.getElementById(r);
      if (e != undefined && e != null) {
        e.style.boxShadow = ep.style.boxShadow;
        e.style.transform = ep.style.transform;
      }
    });
  }

  generateStudyPlanDocument() {
    const dialogVisualizadorDocumento = new MatDialogConfig();
    dialogVisualizadorDocumento.width = '80vw';
    dialogVisualizadorDocumento.height = '90vh';
    dialogVisualizadorDocumento.data = {
      "dataPlanes": this.dataPlanes
    };
    this.dialog.open(VisualizarDocumentoPlanComponent, dialogVisualizadorDocumento);
  }
}
