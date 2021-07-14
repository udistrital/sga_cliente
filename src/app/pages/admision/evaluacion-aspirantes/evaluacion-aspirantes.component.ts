import { Component, OnInit, OnChanges } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UserService } from '../../../@core/data/users.service';
import { ProyectoAcademicoService } from '../../../@core/data/proyecto_academico.service' 
import { ParametrosService } from '../../../@core/data/parametros.service';
import { EvaluacionInscripcionService } from '../../../@core/data/evaluacion_inscripcion.service';
import { InscripcionService } from '../../../@core/data/inscripcion.service';
import { TercerosService } from '../../../@core/data/terceros.service';
import { SgaMidService } from '../../../@core/data/sga_mid.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inscripcion } from '../../../@core/data/models/inscripcion/inscripcion';
import { TipoCriterio } from '../../../@core/data/models/admision/tipo_criterio';
import { LocalDataSource } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { FormControl, Validators } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { CheckboxAssistanceComponent } from '../../../@theme/components/checkbox-assistance/checkbox-assistance.component';

@Component({
  selector: 'evaluacion-aspirantes',
  templateUrl: './evaluacion-aspirantes.component.html',
  styleUrls: ['./evaluacion-aspirantes.component.scss']
})
export class EvaluacionAspirantesComponent implements OnInit {
  toasterService: any;

  @Input('criterios_select')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === '0') {
      this.selectedValue = undefined;
      window.localStorage.setItem('programa', this.selectedValue);
    }
    if (this.inscripcion_id !== undefined && this.inscripcion_id !== 0 && this.inscripcion_id.toString() !== ''
      && this.inscripcion_id.toString() !== '0') {
      // this.getInfoInscripcion();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  inscripcion_id: number;
  info_persona_id: number;
  info_ente_id: number;
  estado_inscripcion: number;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion: Inscripcion;
  preinscripcion: boolean;
  step = 0;
  cambioTab = 0;
  nForms: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;

  percentage_info: number = 0;
  percentage_acad: number = 0;
  percentage_expe: number = 0;
  percentage_proy: number = 0;
  percentage_prod: number = 0;
  percentage_desc: number = 0;
  percentage_docu: number = 0;
  percentage_total: number = 0;

  total: boolean = false;

  percentage_tab_info = [];
  percentage_tab_expe = [];
  percentage_tab_acad = [];
  proyectos = [];
  criterios = [];
  periodos = [];
  show_icfes = false;
  show_profile = false;
  show_expe = false;
  show_acad = false;
  Aspirantes = [];

  notas: boolean;
  save: boolean;
  asistencia: boolean;
  info_persona: boolean;
  loading: boolean;
  ultimo_select: number;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  proyectos_selected: any[];
  criterio_selected: any[];
  selectTipoIcfes: any;
  selectTipoEntrevista: any;
  selectTipoPrueba: any;
  selectTipoHojaVida: any;
  selectTabView: any;
  showTab: any;
  tag_view_posg: boolean;
  tag_view_pre: boolean;
  selectprograma: boolean = true;
  selectcriterio: boolean = true;
  btnCalculo: boolean = true;
  loadICFES: boolean = false;
  loadEntrevista: boolean = false;
  loadPrueba: boolean = false;
  loadHV: boolean = false;
  periodo: any;
  nivel_load: any;
  selectednivel: any;
  tipo_criterio: TipoCriterio;
  dataSource: LocalDataSource;
  settings: any;
  columnas = [];
  criterio = [];

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);

  constructor( 
    private translate: TranslateService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private evaluacionService: EvaluacionInscripcionService,
    private tercerosService: TercerosService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService,) {
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
    this.total = true;
    this.save = true;
    this.notas = false;
    this.selectTipoIcfes = false;
    this.selectTipoEntrevista = false;
    this.selectTipoPrueba = false;
    this.selectTipoHojaVida = false;
    this.showTab = true;
    this.dataSource = new LocalDataSource();
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.createTable();
    });
  }


  activateTab() {
    this.showTab = true;
  }

  async loadData() {
    try {
      this.info_persona_id = this.userService.getPersonaId();
      await this.cargarPeriodo();
      await this.loadLevel();
    } catch (error) {
      Swal.fire({
        icon:'error',
        title: error.status + '',
        text: this.translate.instant('inscripcion.error_cargar_informacion'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1')
        .subscribe(res => {
          const r = <any>res;
          if (res !== null && r.Status === '200') {
            this.periodo = <any>res['Data'][0];
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            resolve(this.periodo);
            const periodos = <any[]>res['Data'];
            periodos.forEach(element => {
              this.periodos.push(element);
            });
          }
        },
          (error: HttpErrorResponse) => {
            reject(error);
          });
    });
  }

  loadLevel(){
    this.projectService.get('nivel_formacion?limit=2').subscribe(
      (response: any) => {
        if (response !== null || response !== undefined){
          this.nivel_load = <any>response;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        this.loading = false;
      },
    );
  }

  loadProyectos() {
    this.notas = false;
    this.selectprograma = false;
    this.selectTipoIcfes = false;
    this.selectTipoEntrevista = false;
    this.selectTipoPrueba = false;
    this.selectTipoHojaVida = false;
    this.criterio_selected = [];
    if (this.selectednivel !== NaN){
      this.projectService.get('proyecto_academico_institucion?query=NivelFormacionId:'+Number(this.selectednivel)+'&limit=0').subscribe(
        (response: any) => {
          if (response !== null || response !== undefined){
            this.proyectos = <any>response;
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          this.loading = false;
        },
      );
    }
  }

  loadCriterios() {
    this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:'+this.proyectos_selected+',PeriodoId:'+this.periodo.Id).subscribe(
      (response: any) => {
        if (response[0].Id !== undefined && response[0] !== '{}'){
          this.criterios = <any>response;
          this.btnCalculo = true;
          this.selectcriterio = false;
          this.notas = false;
          this.selectTipoIcfes = false;
          this.selectTipoEntrevista = false;
          this.selectTipoPrueba = false;
          this.selectTipoHojaVida = false;
          this.criterio_selected = [];
          this.loadHV = false;
          this.loadEntrevista = false;
          this.loadICFES = false;
          this.loadPrueba = false;
          this.criterios.forEach(async element => {
            await this.loadInfo(element.RequisitoId.Id);
          });
        } else {
          var Criterios = [];
          Criterios[0] = {
            RequisitoId: {
              Id: 0,
              Nombre: '',
            }
          }
          this.criterios = <any>Criterios;
          this.notas = false;
          this.selectTipoIcfes = false;
          this.selectTipoEntrevista = false;
          this.selectTipoPrueba = false;
          this.selectTipoHojaVida = false;
          this.loadHV = false;
          this.loadEntrevista = false;
          this.loadICFES = false;
          this.loadPrueba = false;
          this.popUpManager.showToast('info', this.translate.instant('admision.no_criterio'),this.translate.instant('GLOBAL.info'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      }
    );   
  }

  async createTable(){
    var data: any;
    const IdCriterio = sessionStorage.getItem('tipo_criterio')
    await this.loadColumn(IdCriterio).then(
      response => {
        data = response; 
      }
    )
    this.settings = {
      columns: data,
      actions: {
        edit: true,
        add: false,
        delete: false,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        width: '5%'
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark-circle"></i>',
        cancelButtonContent: '<i class="nb-close-circled"></i>',
      },
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  guardarEvaluacion(){
    var Evaluacion: any = {};
    Evaluacion.Aspirantes = this.Aspirantes;
    Evaluacion.PeriodoId = this.periodo.Id;
    Evaluacion.ProgramaId = this.proyectos_selected;
    Evaluacion.CriterioId = sessionStorage.getItem('tipo_criterio');
    var aux = Evaluacion.Aspirantes;
    // Bandera para campos vacios
    var vacio = false;
    // Bandera para solo numeros/rango 0-100
    var numero = false;
    const regex = /^[0-9]*$/;
    for (var i = 0; i < aux.length; i++){
      for (var j = 0; j < this.columnas.length; j++){
        if (aux[i][this.columnas[j]] === undefined || aux[i][this.columnas[j]] === ""){
          vacio = true;
          break;
        } else {
          if (regex.test(aux[i][this.columnas[j]]) === true){
            var auxNumero = parseInt(aux[i][this.columnas[j]])
            if (auxNumero >= 0 && auxNumero <= 100){
            } else {
              numero = true;
              break;
            }
          } else {
            numero = true;
            break;
          }
        }
      }
    }

    // Validaciones
    if (vacio === true){
      this.popUpManager.showToast('info', this.translate.instant('admision.vacio'),this.translate.instant('GLOBAL.info'));
    } else if (numero === true){
      this.popUpManager.showToast('info', this.translate.instant('admision.numero'),this.translate.instant('GLOBAL.info'));
    } else {
      console.info(Evaluacion)
      this.sgaMidService.post('admision/registrar_evaluacion', Evaluacion).subscribe(
        (response: any) => {
          if (response.Response.Code === "200"){
            this.loadInfo(parseInt(Evaluacion.CriterioId))
            this.popUpManager.showSuccessAlert(this.translate.instant('admision.registro_exito'));
          } else {
            this.popUpManager.showErrorToast(this.translate.instant('admision.registro_error'));
          }
        }, 
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
        }
      );
    }
  }

  async calcularEvaluacion(){
    var Evaluacion: any = {};
    Evaluacion.IdPersona = <Array<any>>[];
    Evaluacion.IdPeriodo = this.periodo.Id;
    Evaluacion.IdPrograma = this.proyectos_selected;
    this.ngOnChanges();
    await this.loadAspirantes();
    await this.loadInfo(this.criterios[0].RequisitoId.Id);
    for(var i = 0; i < this.Aspirantes.length; i++){
      Evaluacion.IdPersona[i] = {"Id": this.Aspirantes[i].Id};
    }
    console.info(Evaluacion)
    this.sgaMidService.put('admision/calcular_nota', Evaluacion).subscribe(
      (response: any) => {
        console.info(response)
        if(response.Response.Code === "200"){
          this.popUpManager.showSuccessAlert(this.translate.instant('admision.calculo_exito'));
        } else {
          this.popUpManager.showErrorToast(this.translate.instant('admision.calculo_error'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
      }
    );
  }

  verificarEvaluacion(){
    var auxICFES = false;
    var auxEntrevista = false;
    var auxPrueba = false;
    var auxHV = false;

    //Se validan cuales son los criterios del proyecto curricular
    for (var i = 0; i < this.criterios.length; i++){
      var auxCriterio = this.criterios[i].RequisitoId.Id;
      if (auxCriterio === 1){
        auxICFES = true;
      } else if (auxCriterio === 2){
        auxEntrevista = true;
      } else if (auxCriterio === 3){
        auxPrueba = true;
      } else if (auxCriterio === 11){
        auxHV = true;
      }
    }

    //Se verifican las banderas
    if (this.loadICFES === auxICFES){
      if (this.loadEntrevista === auxEntrevista){
        if (this.loadPrueba === auxPrueba){
          if (this.loadHV === auxHV){
            this.btnCalculo = false;
          }
        }
      }
    }
  }

  async perfil_editar(event) {
    this.save = true;
    this.tipo_criterio = new TipoCriterio();
    this.tipo_criterio.Periodo = this.periodo.Nombre;
    var proyecto;
    for (var i = 0; i < this.proyectos.length; i++){
      if (this.proyectos_selected === this.proyectos[i].Id){
        proyecto = this.proyectos[i].Nombre;
      }
    }
    this.tipo_criterio.ProgramaAcademico = proyecto; 
    switch (event) {
      case 'info_icfes':
        this.tipo_criterio.Nombre = this.criterios[0].RequisitoId.Nombre;
        sessionStorage.setItem('tipo_criterio', '1');
        this.ngOnChanges();
        await this.loadAspirantes();
        await this.loadInfo(1);
        await this.createTable();
        this.selectTipoIcfes = true;
        this.showTab = false;
        break;
      case 'info_entrevista':
        this.tipo_criterio.Nombre = 'Entrevista'//this.criterios[1].RequisitoId.Nombre;
        sessionStorage.setItem('tipo_criterio', '2');
        this.ngOnChanges();
        await this.loadAspirantes();
        await this.loadInfo(2);
        //await this.verificarEvaluacion();
        await this.createTable();
        this.selectTipoEntrevista = true;
        this.showTab = false;
        break;
      case 'info_prueba':
        this.tipo_criterio.Nombre = this.criterios[2].RequisitoId.Nombre;
        sessionStorage.setItem('tipo_criterio', '3');
        this.ngOnChanges();
        await this.loadAspirantes();
        await this.loadInfo(3);
        //await this.verificarEvaluacion();
        await this.createTable();
        this.selectTipoPrueba = true;
        this.showTab = false;
        break;
      case 'info_hoja':
        this.tipo_criterio.Nombre = 'Hoja de vida'//this.criterios[3].RequisitoId.Nombre;
        sessionStorage.setItem('tipo_criterio', '11');
        this.ngOnChanges();
        await this.loadAspirantes();
        await this.loadInfo(11);
        //await this.verificarEvaluacion();
        await this.createTable();
        this.selectTipoHojaVida = true;
        this.showTab = false;
        break;
      default:
        this.selectTipoIcfes = false;
        this.selectTipoEntrevista = false;
        this.selectTipoPrueba = false;
        this.selectTipoHojaVida = false;
        break;
    }
  }

  loadAspirantes(){
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=EstadoInscripcionId__Id:5,ProgramaAcademicoId:'+this.proyectos_selected+',PeriodoId:'+this.periodo.Id+'&sortby=Id&order=asc').subscribe(
        (response: any) => {
          if (response !== '[{}]') {
            const data = <Array<any>>response;
            data.forEach(element => {  
              if (element.PersonaId != undefined) {
                this.tercerosService.get('tercero/'+element.PersonaId).subscribe(
                  (res: any) => { 
                    var aspiranteAux = {
                      Id: res.Id,
                      Aspirantes: res.NombreCompleto
                    }
                    this.Aspirantes.push(aspiranteAux);
                    this.dataSource.load(this.Aspirantes);
                  }, 
                  error => {
                    this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
                    
                  }
                );
              }                
            });
            resolve(this.Aspirantes)
          } else {
            reject("Error");
            this.popUpManager.showErrorToast(this.translate.instant('admision.no_data'));
          }
        },
        error => {
          reject(error);
          this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
        }
      );
    });
    
  }

  loadInfo(IdCriterio: number){
    return new Promise((resolve, reject) => {
      this.sgaMidService.get('admision/consultar_evaluacion/'+this.proyectos_selected+'/'+this.periodo.Id+'/'+IdCriterio).subscribe(
        (response: any) => {
          if (response.Response.Code === "200"){
            const data = <Array<any>>response.Response.Body[0].areas;
            this.dataSource.load(data)
            this.save = false;
            if (IdCriterio === 1){
              this.loadICFES = true;
            } else if (IdCriterio === 2){
              this.loadEntrevista = true;
            } else if (IdCriterio === 3){
              this.loadPrueba = true;
            } else if (IdCriterio === 11){
              this.loadHV = true;
            }
            this.verificarEvaluacion();
            resolve(data)
          } else if (response.Response.Code === "404"){
            this.dataSource.load([]);
            resolve(response)
          } else {
            this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            this.dataSource.load([]);
            resolve("error")  
          }
        }, 
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error)
        }
      );
    });
  }

  itemSelect(event): void{    
    if (this.asistencia != undefined){
      event.data.Asistencia = this.asistencia;
    }
  }

  loadColumn(IdCriterio: any){
    return new Promise((resolve, reject) => {
      this.evaluacionService.get('requisito?query=RequisitoPadreId:'+IdCriterio+'&limit=0').subscribe(
        (response: any) => {
          this.evaluacionService.get('requisito/'+IdCriterio).subscribe(
            async (res: any) => {
              var data: any = {};
              var porcentaje: any;

                  //Columna de aspirantes
                  data.Aspirantes = {
                    title: this.translate.instant('admision.aspirante'),
                    editable: false,
                    filter: false,
                    width: '55%',
                    valuePrepareFunction: (value) => {
                      return value;
                    }
                  }

                  //Columna de asistencia si lo requiere
                  if (res.Asistencia === true){
                    data.Asistencia = {
                      title: this.translate.instant('admision.asistencia'),
                      editable: false,
                      filter: false,
                      width: '4%',
                      type: 'custom',
                      renderComponent: CheckboxAssistanceComponent,
                      onComponentInitFunction: (instance) => {
                        instance.save.subscribe(data => {
                          //sessionStorage.setItem('EstadoInscripcion', data);     
                          this.asistencia = data;
                        });
                      }                                     
                    }
                  }
          
                  if (response.length > 1){
                    await this.getPercentageSub(IdCriterio).then(
                      res => {
                        porcentaje = res;
                      }
                    )

                    for (var key in porcentaje.areas){
                      for (var key2 in porcentaje.areas[key]){
                        for (var i = 0; i < response.length; i++){    
                          if (key2 == response[i].Nombre){
                            this.columnas.push(response[i].Nombre);
                            data[response[i].Nombre] = {
                              title: response[i].Nombre + ' (' + porcentaje.areas[key][key2] + '%)', 
                              editable: true,
                              filter: false,      
                              valuePrepareFunction: (value) => {
                                return value;
                              }
                            }
                            break;
                          }
                        }
                      }
                    } 
                    
                  } else {
                    this.columnas.push("Puntuacion");
                    data.Puntuacion = {
                      title: 'Puntaje',
                      editable: true,
                      type: "number",
                      filter: false,
                      width: '35%',
                      valuePrepareFunction: (value) => {
                        return value;
                      }
                    }
                  }
                  resolve(data)
            }, 
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
              reject(error)
            }
          );
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
          reject(error)
        }
      );

    });
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.columnas = [];
    this.dataSource.load([]);
    this.Aspirantes = [];
    /*for (var i = 0; i < this.Aspirantes.length; i++){
      this.Aspirantes[i].Asistencia = false;
    }*/
  }

  getPercentageSub(IdCriterio: any){
    return new Promise((resolve, reject) => {
      this.evaluacionService.get('requisito_programa_academico?query=ProgramaAcademicoId:'+this.proyectos_selected+',PeriodoId:'+this.periodo.Id+',RequisitoId:'+IdCriterio).subscribe(
        (Res: any) => {
          var porcentaje = JSON.parse(Res[0].PorcentajeEspecifico)
          resolve(porcentaje)
                                 
        }, 
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error_cargar'));
          reject(error)
        }
      );
    });
  }

  viewtab() {
    this.notas = true;
    this.selectTipoIcfes = false;
    this.selectTipoEntrevista = false;
    this.selectTipoPrueba = false;
    this.selectTipoHojaVida = false;

    for (let i = 0; i < this.criterio_selected.length; i++) {
      switch (this.criterio_selected[i]) {
        case 1:
          this.selectTipoIcfes = true;
          break;
        case 2:
          this.selectTipoEntrevista = true;
          break;
        case 3:
          this.selectTipoPrueba = true;
          break;
        case 11:
          this.selectTipoHojaVida = true;
          break;
        default:
          this.selectTipoIcfes = false;
          this.selectTipoEntrevista = false;
          this.selectTipoPrueba = false;
          this.selectTipoHojaVida = false;
          break;
      }
    }
  }

}
