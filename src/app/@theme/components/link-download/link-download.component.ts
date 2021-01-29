import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'link-download',
  templateUrl: './link-download.component.html',
  styleUrls: ['./link-download.component.scss']
})
export class LinkDownloadComponent implements ViewCell, OnInit{

  download: boolean;
  expired: boolean;

  @Input() value: string | number;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    if(this.rowData.Estado === 'Pendiente pago'){
      this.download = true;
      this.expired = false;
    } else if (this.rowData.Estado === 'Pago'){
      this.download = true;
      this.expired = false;
    } else{
      this.download = false;
      this.expired = true;
    }
  }

  showDownload(){
    this.save.emit(this.rowData);
  }
  
  showExpired(){

  }
}
