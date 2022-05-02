import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { RenderDataComponent } from '../../../@theme/components';
import { ParametrosService } from '../../../@core/data/parametros.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { UserService } from '../../../@core/data/users.service';
import { InfoEstudianteNotas, NotasAsignaturas } from '../../../@core/data/models/registro-notas/estudiante_aisgnaturas';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'notas-parciales',
  templateUrl: './notas-parciales.component.html',
  styleUrls: ['./notas-parciales.component.scss']
})
export class NotasParcialesComponent implements OnInit {
  settings: Object;
  dataSource: LocalDataSource;

  ObservacionesNotas: any

  NotasEstudianteGET: NotasAsignaturas[] = []

  InfoEstudiante: InfoEstudianteNotas = {
    Nombre: "",
    Identificacion: "",
    Codigo: "",
    Codigo_programa: "",
    Nombre_programa: "",
    Promedio: "",
    Periodo: ""
  }

  loading: boolean = false;

  @ViewChild('HtmlPdf', {static: true}) HtmlPdf: ElementRef;

  deshabilit: boolean = false;

  constructor(
    private parametrosService: ParametrosService,
    private sgaMidService: SgaMidService,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    ) {
    this.dataSource = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    })
  }

  async ngOnInit() {
    this.loading = true;
    this.createTable();
    //this.dataSource.load(this.data1);
    try {
      await this.getObservaciones();
      await this.getDataNotasEstudent();
      this.formatNotasEstudiantesforTable();
      this.dataSource.load(this.NotasEstudianteGET);
      this.loading = false;
    } catch (error) {
      console.log(error)
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      this.loading = false;
      this.deshabilit = true;
    }
  }

  createTable() {
    this.settings = {
      columns: {
        Grupo: {
          title: this.translate.instant('asignaturas.grupo'),
          editable: false,
          width: '5%',
          filter: false,
        },
        Asignatura: {
          title: this.translate.instant('asignaturas.asignatura'),
          editable: false,
          width: '20%',
          filter: false,
        },
        Creditos: {
          title: this.translate.instant('asignaturas.creditos'),
          editable: false,
          width: '5%',
          filter: false,
        },
        CORTE_1: {
          title: this.translate.instant('notas.corte1'),
          editable: false,
          width: '15%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        CORTE_2: {
          title: this.translate.instant('notas.corte2'),
          editable: false,
          width: '20%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        EXAMEN: {
          title: this.translate.instant('notas.examen'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        HABILIT: {
          title: this.translate.instant('notas.habilitacion'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        VARIOS:{
          title: this.translate.instant('notas.varios'),
          editable: false,
          width: '15%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
        TOTAL: {
          title: this.translate.instant('notas.total'),
          editable: false,
          width: '5%',
          filter: false,
          type: 'custom',
          renderComponent: RenderDataComponent,
        },
      },
      hideSubHeader: false,
      mode: 'external',
      actions: false,
      noDataMessage: this.translate.instant('asignaturas.no_datos_notas_parciales')
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getObservaciones() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?query=TipoParametroId.Id:55&fields=Id,CodigoAbreviacion,Nombre&limit=0').subscribe(
        response => {
          if (response !== null && response.Status == '200') {
            this.ObservacionesNotas = response["Data"]
            sessionStorage.setItem('ObservacionesNotas', JSON.stringify(this.ObservacionesNotas));
            resolve(this.ObservacionesNotas)
          }
        },
        error => {
          reject("Fail_OBS")
        }
      )
    });
  }

  getDataNotasEstudent(){
    return new Promise((resolve, reject) => {

      var estudiante_id = this.userService.getPersonaId();

      this.sgaMidService.get('notas/InfoEstudianteNotas/'+estudiante_id).subscribe(
        response => {
          if (response !== null && response.Status == '200') {

            this.InfoEstudiante = response.Data;

            this.NotasEstudianteGET = response.Data.Espacios_academicos;
            resolve(this.NotasEstudianteGET)
          }
        },
        error => {
          reject("Fail_InfoEstudianteNotas")
        }
      )
    });
  }

  formatNotasEstudiantesforTable() {

    this.NotasEstudianteGET.forEach((asig: NotasAsignaturas) => {

        asig.CORTE_1 = { fields: [] };
        asig.CORTE_2 = { fields: [] };
        asig.EXAMEN = { fields: [] };
        asig.HABILIT = { fields: [] };
        asig.VARIOS = { fields: [] };
        asig.TOTAL = { fields: [] };

        asig.CORTE_1.fields = asig.Corte1.data.valor_nota;
        asig.CORTE_1.needEdit = false;

        asig.CORTE_2.fields = asig.Corte2.data.valor_nota;
        asig.CORTE_2.needEdit = false;

        asig.EXAMEN.fields = asig.Examen.data.valor_nota;
        asig.EXAMEN.needEdit = false;

        asig.HABILIT.fields = asig.Habilit.data.valor_nota;
        asig.HABILIT.needEdit = false;

        var fallasSuma = asig.Definitiva.data.fallas
        var Observacion = asig.Definitiva.data.observacion_nota_id
        
        asig.VARIOS.fields = [{ name: "Fallas", value: fallasSuma }, { name: "ACU", value: asig.Acumulado }, { name: "OBS", value: Observacion }];
        asig.VARIOS.needEdit = false;

        asig.TOTAL.fields = [{ name: "DEF", value: asig.Definitiva.data.nota_definitiva }];
        asig.TOTAL.needEdit = false;

    });

  }

  async exportar(){
    this.popUpManager.showConfirmAlert(this.translate.instant('notas.pregunta_generarPDF'),this.translate.instant('notas.reporte_captura_porcentajes')).then(accion => {
      if(accion.value){
        this.loading = true;
        this.generatePdf("Exportar").then(()=>{
          this.loading = false;
        }).catch(()=>{
          this.loading = false;
        });
      }
    });
  }

  async imprimir(){
    this.popUpManager.showConfirmAlert(this.translate.instant('notas.pregunta_generarPDF'),this.translate.instant('notas.reporte_captura_porcentajes')).then(accion => {
      if(accion.value){
        this.loading = true;
        this.generatePdf("Imprimir").then(()=>{
          this.loading = false;
        }).catch(()=>{
          this.loading = false;
        });
      }
    });
  }

  generatePdf(accion: string): Promise<any> {
    return new Promise((resolve, reject) => {
    console.log("generating file")
    let date = new Date()
    let dateinFile = 'Generado por Sistema de Gestión Académica\t\t\t'+date.toLocaleString()+'\n\r'
    let dateinFileName = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear()
    let docDefinition;
    html2canvas(this.HtmlPdf.nativeElement, {scrollX: -window.scrollX}).then(
      canvas => {
        docDefinition = {
          pageSize: 'LETTER',
          pageOrientation: 'landscape',
          pageMargins: [ 40, 40, 40, 40 ],
          content: [
            {
              text: dateinFile, fontSize: 8, alignment: 'center', color: 'gray',
            },
            {
              image: canvas.toDataURL('image/png'),
              width: 700,
              scale: 5,
              alignment: 'center',
            }
          ],
        };
        let namePdf = this.InfoEstudiante.Nombre+'_'+this.InfoEstudiante.Nombre_programa+'_'+this.InfoEstudiante.Periodo+'_'+dateinFileName+'.pdf';
        const pdfDoc = pdfMake.createPdf(docDefinition);

        console.log("renderizado ahora: "+accion)
        
        if(accion == "Exportar") {
          pdfDoc.download(namePdf);
        } else if (accion == "Imprimir"){
          pdfDoc.print();
        }
        resolve(true)
      }).catch(
        error => {
          reject(error)
        }
      );
    });
  }

}
