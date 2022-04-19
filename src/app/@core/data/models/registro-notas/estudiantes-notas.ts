import { FormatForTable } from "./format-for-table";
import { RegistroNotaEstado } from "./registro-nota-estado";

export class EstudiantesNotas {
    Id: number;
    Codigo: string;
    Nombre: string;
    Apellido: string;
    Corte1?: RegistroNotaEstado;
    Corte2?: RegistroNotaEstado;
    Examen?: RegistroNotaEstado;
    Habilit?: RegistroNotaEstado;
    Definitiva?: RegistroNotaEstado;
    CORTE_1?: FormatForTable;
    CORTE_2?: FormatForTable;
    EXA_HAB_ACU?: FormatForTable;
    VARIOS?: FormatForTable;
    TOTAL?: FormatForTable;
}

export function setHeader(){
    let h: EstudiantesNotas = {
        Id: 0,
        Codigo: "",
        Nombre: "",
        Apellido: "",
        CORTE_1: {
            forTitle: true,
            fields: [
                {name: "P1", value: 0, perc: 0},
                {name: "P2", value: 0, perc: 0},
                {name: "P3", value: 0, perc: 0}
            ]
        },
        CORTE_2: {
            forTitle: true,
            fields: [
                {name: "P4", value: 0, perc: 0},
                {name: "P5", value: 0, perc: 0},
                {name: "P6", value: 0, perc: 0},
                {name: "Lab", value: 0, perc: 0}
            ]
        },
        EXA_HAB_ACU: {
            forTitle: true,
            fields: [
                {name: "Exam", value: 0, perc: 0},
                {name: "Hab", value: 0, perc: 0},
                {name: "ACU", value: 0}
            ]
        },
        VARIOS: {
            forTitle: true,
            fields: [
                {name: "Fallas", value: 0},
                {name: "OBS", value: 0}
            ]
        },
        TOTAL: {
            forTitle: true,
            fields: [
                {name: "DEF", value: 0}
            ]
        }
    };
    
    return h
}


export function setFooter(){
    let f: EstudiantesNotas = {
        Id: 0,
        Codigo: "",
        Nombre: "",
        Apellido: "",
        CORTE_1: {
            forClose: true,
            canEdit: true,
            fields: [
                {name: "Corte 1", value: false}
            ]
        },
        CORTE_2: {
            forClose: true,
            canEdit: true,
            fields: [
                {name: "Corte 2", value: false}
            ]
        },
        EXA_HAB_ACU: {},
        VARIOS: {},
        TOTAL: {}
    }
    return f

}