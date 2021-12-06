import { Component, OnInit, Input, Output, EventEmitter, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Swal from 'sweetalert2';
import { DocumentoService } from '../../../@core/data/documento.service';
import { NewNuxeoService } from '../../../@core/utils/new_nuxeo.service';

@Component({
  selector: 'link-download-nuxeo',
  templateUrl: './link-download-nuxeo.component.html',
  styleUrls: ['./link-download-nuxeo.component.scss']
})
export class LinkDownloadNuxeoComponent implements ViewCell, AfterViewInit {
  label = 'No encontrado';
  @Output() event: EventEmitter<any> = new EventEmitter();
  documentoData: any = null;
  documentoFile: any;
  @Input() value: string | number;
  @Input() rowData: any;
  errorDocument: boolean = false;

  constructor(
    private documentoService: DocumentoService,
    private nuxeoService: NewNuxeoService,
  ) { }

  ngAfterViewInit(): void {
    console.log(this.value);

    this.documentoService.get('documento/' + this.value)
      .subscribe((data) => {
        this.documentoData = data;
        console.log(this.documentoData);
      }, (error) => {
        this.errorDocument = true;
        this.label = 'No encontrado'
      },
      )
  }


  ngOnInit() {
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  openFile() {
    if (!this.documentoFile) {
      if (this.documentoData) {
        this.nuxeoService.getByUUID(this.documentoData.Enlace)
          .subscribe((docFile: any) => {
            if(docFile.status){
              this.label = 'No encontrado'
              this.errorDocument = true;
            }else {              
              this.documentoFile = docFile;
              console.log('doc', docFile)

              this.open();
            }
          })
      }
    } else {
      this.open();
    }
  }

  async open() {

    await this.sleep(100)
    const w = 500;
    const h = 500;
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(this.documentoFile, this.documentoFile, 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }
}
