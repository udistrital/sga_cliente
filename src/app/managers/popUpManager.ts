import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ToasterService, Toast } from 'angular2-toaster';


@Injectable({
    providedIn: 'root',
})
export class PopUpManager {

    constructor(
        private toasterService: ToasterService,
        private translate: TranslateService,
    ) { }
    /**
     * showToast
     */
    public showToast(status, message: string, title = '') {
        const toastSuccess: Toast = {
            type: 'success',
            title: title,
            body: message,
            showCloseButton: true
        };
        this.toasterService.pop(toastSuccess);
    }

    public showErrorToast(message: string) {
        let status: any = 'danger';
        if (message === 'ERROR.200') {
            const toastSuccess: Toast = {
                type: 'warning',
                title: this.translate.instant('GLOBAL.no_informacion_registrada'),
                showCloseButton: true
            };
            this.toasterService.pop(toastSuccess);

        } else {
            const toastSuccess: Toast = {
                type: 'warning',
                title: this.translate.instant('GLOBAL.error'),
                showCloseButton: true
            };
            this.toasterService.pop(toastSuccess);
        }
    }

    public showInfoToast(message: string) {

        const toastSuccess: Toast = {
            type: 'info',
            title: this.translate.instant('GLOBAL.info'),
            body: message,
            showCloseButton: true
        };
        this.toasterService.pop(toastSuccess);
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
        Swal.fire({
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
}
