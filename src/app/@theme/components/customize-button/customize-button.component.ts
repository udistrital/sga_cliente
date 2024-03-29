import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'customize-button',
  templateUrl: './customize-button.component.html',
  styleUrls: ['./customize-button.component.scss']
})
export class CustomizeButtonComponent implements ViewCell, OnInit{

  @Input() value: any;
  @Input() rowData: any;
  @Output() save: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService) {}

  ngOnInit() {
  }

  clickEvent(){
    this.save.emit(this.rowData);
  }
  
  showExpired(){

  }
}
