import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { NbToastrConfig } from '@nebular/theme/components/toastr/toastr-config';


@Injectable({
    providedIn: 'root',
})
export class PopUpManager {
    constructor(
        private toast: NbToastrService,
        private translate: TranslateService,
    ) { }
    /**
     * showToast
     */
    public showToast(status, message: string, tittle = '') {
        this.toast.show(message, tittle, { status });
    }

    public showErrorToast(message: string) {
        let status: any = 'danger';
        if (message === 'ERROR.200') {
            this.toast.show('', this.translate.instant('GLOBAL.no_informacion_registrada'),{status: 'warning'});
        } else {
            this.toast.show(message, this.translate.instant('GLOBAL.error'), { status });
        }
    }

    public showInfoToast(message: string, duration: number = 0) {
        const status: any = 'info';
        this.toast.show(message, this.translate.instant('GLOBAL.info'), { status, duration });
    }

    public showAlert(status, text) {
        Swal.fire({
            icon: 'info',
            title: status,
            text: text,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
    }

    public showSuccessAlert(text) {
        return Swal.fire({
            icon: 'success',
            title: this.translate.instant('GLOBAL.operacion_exitosa'),
            text: text,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
    }

    public showErrorAlert(text) {
        Swal.fire({
            icon: 'error',
            title: this.translate.instant('GLOBAL.error'),
            text: text,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
    }

    public showConfirmAlert(text, title = this.translate.instant('GLOBAL.atencion')): Promise<any> {
        const options: any = {
            title: title,
            text: text,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
        };
        return Swal.fire(options);
    }

    public showPopUpGeneric(title, text, type, cancelar): Promise<any> {
        const opt: any = {
            title: title,
            html: text,
            icon: type,
            showCancelButton: cancelar,
            allowOutsideClick: !cancelar,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
        };
        return Swal.fire(opt);
    }
}
