import { AbstractControl } from "@angular/forms";

export class MyValidators {

    static isPercentageValid(control: AbstractControl) {
        const { percentages, maxPercentage } = control.value;
        if (percentages && maxPercentage) {
            if (percentages.map(p => p.field).reduce((a, b) => a + b, 0) !== maxPercentage) {
                return { 'invalid_percentage': true }
            }
        }
        return null;
    }

}