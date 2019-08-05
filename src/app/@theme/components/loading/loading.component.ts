import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { LoaderService } from '../../../@core/utils/load.service';

@Component({
  selector: 'ngx-loading',
  styleUrls: ['./loading.component.scss'],
  templateUrl: './loading.component.html',
})

export class LoadingComponent {
  color = 'primary';
  mode = 'indeterminate';
  value = 50;
  isLoading: Subject<boolean> = this.loaderService.isLoading;
  constructor(public loaderService: LoaderService) {
  }
}
