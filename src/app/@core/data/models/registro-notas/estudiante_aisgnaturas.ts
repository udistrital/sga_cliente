import { FormatForTable } from "./format-for-table";
import { RegistroNotaEstado } from "./registro-nota-estado";

export class InfoEstudianteNotas {
    Nombre: string;
    Identificacion: string | number;
    Codigo: string;
    Codigo_programa: string;
    Nombre_programa: string;
    Promedio: string | number;
    Periodo: string;
}

export class NotasAsignaturas {
    Grupo: string;
    Asignatura: string;
    Creditos: number | string;
    Corte1: RegistroNotaEstado;
    Corte2: RegistroNotaEstado;
    Examen: RegistroNotaEstado;
    Habilit: RegistroNotaEstado;
    Definitiva: RegistroNotaEstado;
    CORTE_1?: FormatForTable;
    CORTE_2?: FormatForTable;
    EXAMEN?: FormatForTable;
    HABILIT?: FormatForTable;
    VARIOS?: FormatForTable;
    TOTAL?: FormatForTable;
    Acumulado?: number;
}

