import { TipoContribuyente } from '../terceros/tipo_contribuyente';

export class Autor {
  Id: number;
  NombreCompleto: string;
  TipoContribuyenteId: TipoContribuyente;
  TipoDocumentoId: string;
  Documento: string;
}
