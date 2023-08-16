import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TercerosService } from '../../../../@core/data/terceros.service';
import { NewNuxeoService } from '../../../../@core/utils/new_nuxeo.service';
import { SgaMidService } from '../../../../@core/data/sga_mid.service';

@Component({
  selector: 'dialogo-firma-ptd',
  templateUrl: './dialogo-firma-ptd.component.html',
  styleUrls: ['./dialogo-firma-ptd.component.scss']
})
export class DialogoFirmaPtdComponent implements OnInit {

  firmantes: any[] = [];
  representantes: any[] = [];

  miniSearch: boolean = false;

  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogoFirmaPtdComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tercerosService: TercerosService,
    private GestorDocumental: NewNuxeoService,
    private sgaMidService: SgaMidService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.loading = true;
    this.tercerosService.get(`datos_identificacion?query=Activo:true,TerceroId__Id:${this.data.docenteId}`+
    `&fields=TerceroId,Numero,TipoDocumentoId&sortby=FechaExpedicion,Id&order=desc&limit=1`).subscribe(
      (resp: any[]) => {
        this.loading = false;
        if (Object.keys(resp[0]).length > 0) {
          this.firmantes.push({
            nombre: resp[0].TerceroId.NombreCompleto,
            cargo: "Docente",
            tipoId: resp[0].TipoDocumentoId.CodigoAbreviacion,
            identificacion: resp[0].Numero,
          });
        } else {
          console.warn("empty response");
          this.dialogRef.close({error: "empty response", from: "Datos Identificacion"})
        }
      }, err => {
        this.loading = false;
        console.warn(err);
        this.dialogRef.close({error: err, from: "Datos Identificacion"})
      }
    );
    this.tercerosService.get(`datos_identificacion?query=Activo:true,TerceroId__Id:${this.data.responsableId}`+
    `&fields=TerceroId,Numero,TipoDocumentoId&sortby=FechaExpedicion,Id&order=desc&limit=1`).subscribe(
      (resp: any[]) => {
        this.loading = false;
        if (Object.keys(resp[0]).length > 0) {
          this.firmantes.push({
            nombre: resp[0].TerceroId.NombreCompleto,
            cargo: "Coordinador",
            tipoId: resp[0].TipoDocumentoId.CodigoAbreviacion,
            identificacion: resp[0].Numero,
          });
        } else {
          console.warn("empty response");
          this.dialogRef.close({error: "empty response", from: "Datos Identificacion"})
        }
      }, err => {
        this.loading = false;
        console.warn(err);
        this.dialogRef.close({error: err, from: "Datos Identificacion"})
      }
    );
  }

  buscarTercero(docTercero) {
    this.tercerosService.get(`datos_identificacion?query=Activo:true,Numero:${docTercero}`+
    `&fields=TerceroId,Numero,TipoDocumentoId&sortby=FechaExpedicion,Id&order=desc&limit=1`).subscribe(
      (resp: any[]) => {
        this.loading = false;
        if (Object.keys(resp[0]).length > 0) {
          this.representantes.push({
            nombre: resp[0].TerceroId.NombreCompleto,
            cargo: "Representante",
            tipoId: resp[0].TipoDocumentoId.CodigoAbreviacion,
            identificacion: resp[0].Numero,
          });
        } else {
          console.warn("empty response");
          this.dialogRef.close({error: "empty response", from: "Datos Identificacion"})
        }
        this.miniSearch = false;
      }, err => {
        this.loading = false;
        console.warn(err);
        this.dialogRef.close({error: err, from: "Datos Identificacion"})
      }
    );
  }

  cancelar() {
    this.dialogRef.close({cancel: true})
  }

  firmar() {
    this.loading = true;
    this.sgaMidService.post(`reportes/plan_trabajo_docente/${this.data.docenteId}/${this.data.vinculacionId}/${this.data.periodoId}/CA`, {}).subscribe(
      respMid => {
        this.GestorDocumental.uploadFilesElectronicSign([{
          IdDocumento: 73, // ? Id Documentos PTD
          nombre: `PTD_Firmado_IdDoce_${this.data.docenteId}_IdCoor_${this.data.responsableId}`,
          base64: respMid.Data.pdf,
          firmantes: this.firmantes,
          representantes: this.representantes
        }]).subscribe((respGD: any[]) => {
          this.loading = false;
          this.dialogRef.close({document: respGD[0].res.Id})
        }, err => {
          this.loading = false;
          console.warn(err)
          this.dialogRef.close({error: err, from: "Gestor Documental"})
        })
      }, errMid => {
        this.loading = false;
        console.warn(errMid);
        this.dialogRef.close({error: errMid, from: "Reporte PTD"})
      }
    );

    
  }

}
