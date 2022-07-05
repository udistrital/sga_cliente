import { Fields } from "./fields";

export class PorcentajesAsignatura {
    editExtemporaneo: boolean;//1
    editporTiempo: boolean;
    estadoRegistro: number;//2
    finalizado: boolean;//5
    id: string;//6
    porcentaje: number;
    fields: { //3
        name: string,
        field: Fields[];
        porcentaje: number; //4
    };
}

/* export interface PorcentajesAsignatura {
    editExtemporaneo: boolean;
    editporTiempo: boolean;
    estadoRegistro: number;
    finalizado: boolean;
    id: string;
    porcentaje: number;
    fields: Object;
} */