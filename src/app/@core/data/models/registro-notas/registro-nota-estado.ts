import { Fields } from "./fields";

export class RegistroNotaEstado {
    id: string;
    data: {
        fallas: number;
        nota_definitiva: number;
        observacion_nota_id: number;
        valor_nota: Fields[];
    }
}