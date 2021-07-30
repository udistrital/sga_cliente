import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
// import { ToastrService } from 'ngx-toastr';


@Injectable({
    providedIn: 'root',
})
export class PopUpManager {
    constructor(
         // private toastr: ToastrService
    ) {
    }
    /**
     * showToast
     */
    public showToast(message: string, tittle = '') {
        console.log('success',message, tittle);
    }

    public showErrorToast(message: string) {
        const status: any = 'danger';
        // this.toastr.error('Hello world!', 'Toastr fun!');

    }

    public showInfoToast(message: string) {
        const status: any = 'info';
        const duration: any = 0;
         console.log('info', message, 'Info');
        //  this.toastr.success('Hello world!', 'Toastr fun!');

    }

    public showAlert(status, text) {
        Swal.fire({
            icon: 'info',
            title: status,
            text,
            confirmButtonText: 'Aceptar',
        });
    }

    public showSuccessAlert(text) {
        Swal.fire({
            icon: 'success',
            title: 'Operación Exitosa',
            text,
            confirmButtonText: 'Aceptar',
        });
    }

    public showErrorAlert(text) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text,
            confirmButtonText: 'Aceptar',
        });
    }
}
