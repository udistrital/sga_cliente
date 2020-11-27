import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'crud-derechos-pecuniarios',
  templateUrl: './crud-derechos-pecuniarios.component.html',
  styleUrls: ['../derechos-pecuniarios.component.scss']
})
export class CrudDerechosPecuniariosComponent {

  constructor(private router: Router, private route: ActivatedRoute) { }

  copiarDerechos() {
    this.router.navigate(['../copiar-conceptos'], {relativeTo: this.route});
  }

  definirDerechos() {
    this.router.navigate(['../definir-conceptos'], {relativeTo: this.route});
  }

}
