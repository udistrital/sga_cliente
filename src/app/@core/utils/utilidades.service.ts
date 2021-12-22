import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/add/observable/of';


@Injectable({
    providedIn: 'root',
})
export class UtilidadesService {

    static userArray: any[];
    static jsonArray: any[];

    constructor(
        private translate: TranslateService,
    ) {
    }

    static getSumArray(array): any {
        let sum = 0;
        array.forEach(element => {
            sum += element;
        });
        return sum;
    }

    translateTree(tree: any) {
        const trans = tree.map((n: any) => {
            let node = {};
            node = {
                id: n.Id,
                name: n.Nombre,
            }
            if (n.hasOwnProperty('Opciones')) {
                if (n.Opciones !== null) {
                    const children = this.translateTree(n.Opciones);
                    node = { ...node, ...{ children: children } };
                }
                return node;
            } else {
                return node;
            }
        });
        return trans;
    }


  translateFields(form, prefix, prefix_placeholder) {
    form.campos = form.campos.map((field: any) => {
      return {
        ...field,
        ...{
          label: this.translate.instant(prefix + field.label_i18n),
          placeholder: this.translate.instant(prefix + field.label_i18n)
        }
      }

    });
    console.log(form);
  }

}
