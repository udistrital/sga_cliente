import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'summary-planes-estudio',
  templateUrl: './summary-planes-estudio.component.html',
  styleUrls: ['./summary-planes-estudio.component.scss']
})
export class SummaryPlanesEstudioComponent implements OnInit {
  
  @Input('dataPlanes') dataPlanes: any;
  
  constructor() { }

  ngOnInit() {
    console.log(this.dataPlanes)
  }

}
