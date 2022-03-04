import { Calendario } from "../calendario-academico/calendario";
import { Periodo } from "../periodo/periodo";
import { ProyectoAcademicoInstitucion } from "../proyecto_academico/proyecto_academico_institucion";
import { InfoComplementariaTercero } from "../terceros/info_complementaria_tercero";
import { TipoInscripcion } from "./tipo_inscripcion";

export class TransferenciaInterna {
    Periodo: Periodo;
    CalendarioAcademico: Calendario;
    TipoInscripcion: TipoInscripcion;
    CodigoEstudiante: InfoComplementariaTercero;
    ProyectoCurricular: ProyectoAcademicoInstitucion;
}
