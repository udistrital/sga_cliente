import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'render-data',
  templateUrl: './render-data.component.html',
  styleUrls: ['./render-data.component.scss']
})
export class RenderDataComponent implements OnInit {

  ObjectData: Object[];
  needPercent: boolean = true;

  @Input() value: string | any ;
  
  constructor() { }

  ngOnInit() {
    this.ObjectData = this.value;
    this.ObjectData.forEach( (data) => {
      if(data.hasOwnProperty("Perc")){
        data["needPercent"] = true;
      }
      else{
        data["needPercent"] = false;
      }
    });
  }

}
