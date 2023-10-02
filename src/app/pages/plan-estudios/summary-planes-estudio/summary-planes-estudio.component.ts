import { Component, Input, OnInit } from '@angular/core';
import { EspacioSummary, PlanEstudioSummary } from '../../../@core/data/models/plan_estudios/plan_estudio_summary';
import { EspaciosAcademicosService } from '../../../@core/data/espacios_academicos.service';

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
    private espaciosAcademicosService: EspaciosAcademicosService,
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

    // ? Para cada plan...
    const ObtenerOrdenEscuelas = new Promise(resolve => {
    const TotPlanes = this.dataPlanes.Planes.length;
    
    let offsetPeriodo = 0;
    this.dataPlanes.Planes.forEach((plan, idPlan) => {
      // ? Asegurar Orden de Periodos
      plan.InfoPeriodos.sort((a, b) => a.Orden - b.Orden);
      // ? Calcular Creditos periodo y sacar la cantidad de espacios por escuela
      const TotPeriodo = plan.InfoPeriodos.length;
      plan.InfoPeriodos.forEach((periodo, idPeriodo) => {
        periodo.Orden += offsetPeriodo;
        periodo.Creditos = 0;
        const TotEspacios = periodo.Espacios.length;
        periodo.Espacios.forEach((espacio, idEspacio) => {
          periodo.Creditos += espacio.Creditos;
          if (this.Escuelas.hasOwnProperty(espacio.Escuela)) {
            this.Escuelas[espacio.Escuela].Cantidad++;
          } else {
            this.Escuelas[espacio.Escuela] = {
              Cantidad: 1,
              Nombre: "",
              Color:""
            }
          }
          if ((idPlan === TotPlanes-1) && (idPeriodo === TotPeriodo-1) && (idEspacio === TotEspacios-1)) {
            resolve(true)
          }
        });
      });
      offsetPeriodo += TotPeriodo;
    });
    });

    await ObtenerOrdenEscuelas;

    const ObtenerColorEscuelas = new Promise((resolve) => {
      const totKeys = Object.keys(this.Escuelas).length;
      Object.keys(this.Escuelas).forEach((key, idKey) => {
        // TODO: Esto se cambia por la consulta a escuelas para los colores desde espacios acad
        this.espaciosAcademicosService.get('espacio-academico'/* +key */).subscribe(
          resp => {

            // ? aquí momentaneamente pongo la respuesta con color aleatorio
            // ? provisional 
            const colorAleatorio = (function() {
              const letrasHex = "0123456789ABCDEF";
              let color = "#";
              for (let i = 0; i < 6; i++) {
                const indiceAleatorio = Math.floor(Math.random() * 16);
                color += letrasHex.charAt(indiceAleatorio);
              }
              return color;
            })();
            // --------------

            this.Escuelas[key].Color = colorAleatorio;
            this.Escuelas[key].Nombre = colorAleatorio;
            this.Escuelas[key].TxtColor = this.calculateTextColor(colorAleatorio);
            if (idKey === totKeys-1) {
              resolve(true);
            }
          }, err => {
            this.Escuelas[key].Color = "#FFFFFF";
            this.Escuelas[key].Nombre = "...";
            this.Escuelas[key].TxtColor = "#000000";
            if (idKey === totKeys-1) {
              resolve(true);
            }
          }
        );
      });
    });

    await ObtenerColorEscuelas;

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

    console.log(this.Escuelas)
  }

  calculateTextColor(backgroundColor: string): string {
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);

    // Calcula el valor de luminosidad (brillo) del fondo
    const luminosidad = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Elige el color de texto en función de la luminosidad del fondo
    return luminosidad > 0.5 ? "#000000" : "#FFFFFF";
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
      e.style.boxShadow = ep.style.boxShadow;
      e.style.transform = ep.style.transform;
    })
  }

  mouseHoverOut(event, req: string[]) {
    let ep: HTMLElement = event.target;
    ep.style.boxShadow = `0 10px 5px -5px rgba(0, 0, 0, 0.2)`
    ep.style.transform = `translate(0, 0)`
    req.forEach(r => {
      let e: HTMLElement = document.getElementById(r);
      e.style.boxShadow = ep.style.boxShadow;
      e.style.transform = ep.style.transform;
    })
  }

}
