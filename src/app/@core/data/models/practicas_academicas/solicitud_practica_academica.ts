import { TipoParametro } from "../parametro/tipo_parametro";
import { Periodo } from "../periodo/periodo";
import { Docente } from "./docente";

export class SolicitudPracticaAcademica {
    Id: number;
    SolicitanteId: number;
    Periodo: Periodo;
    Proyecto: {
        Codigo: String;
        CodigoSnies: String;
        Id: number;
        Nombre: string;
    };
    EspacioAcademico: {
        Nombre: string;
        Id: number;
    };
    Semestre: number;
    NumeroEstudiantes: number;
    NumeroGrupos: number;
    Duracion: number;
    FechaHoraSalida: string;
    FechaHoraRegreso: string;
    FechaRadicacion: string;
    NumeroVehiculos: number;
    TipoVehoculo: TipoParametro;
    DocenteSolicitante: Docente;
    DocentesInvitados: Docente[];
    Documentos: any[];
}