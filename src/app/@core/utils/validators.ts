import { AbstractControl } from "@angular/forms";

export class MyValidators {

    static isPercentageValid(control: AbstractControl) {
        const { fields, maxPercentage } = control.value;
        if (fields && maxPercentage) {
            if ((fields.map((f) => {
                let data = 0;
                for (let key in f) {
                    data = f[key];
                }
                return data
            }).reduce((a, b) => a + b, 0)) !== maxPercentage) {
                return { 'invalid_percentage': true }
            }
        }
        return null;
    }

}