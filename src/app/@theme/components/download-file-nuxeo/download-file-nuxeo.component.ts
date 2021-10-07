import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { DocumentoService } from './../../../@core/data/documento.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';


@Component({
  selector: 'ngx-download-file-nuxeo',
  templateUrl: './download-file-nuxeo.component.html',
  styleUrls: ['./download-file-nuxeo.component.scss']
})
export class DownloadFileNuxeo implements  OnInit {
  
  @Input('idDoc')
  set name(idDoc: number) {
    this.documentoService.get('documento/' + idDoc)
    .subscribe((data)=>{
      this.documentoData = data;
      console.log(data);
    })
  }
  @Input('label') label: any;
  @Output() event: EventEmitter<any> = new EventEmitter();
  documentoData: any;
  documentoFile: any;
  constructor(
    private documentoService: DocumentoService,
    private nuxeoService: NuxeoService,
    ) {}

  ngOnInit()  {
  }


  openFile(){
    if(!this.documentoFile){
      if(this.documentoData) {
        this.nuxeoService.getDocByInfo(this.documentoData)
        .subscribe((docFile)=> {
          this.documentoFile = docFile;
          this.open();
        })
      }
    }else {
      this.open();
    }
  }

  open(){
      const w = 500;
      const h = 500;
      const left = (screen.width / 2) - (w / 2);
      const top = (screen.height / 2) - (h / 2);
      window.open(this.documentoFile.urlUnsafe, this.documentoFile, 'toolbar=no,' +
        'location=no, directories=no, status=no, menubar=no,' +
        'scrollbars=no, resizable=no, copyhistory=no, ' +
        'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }
}
