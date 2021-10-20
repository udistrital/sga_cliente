import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import * as _ from 'lodash';
import { ImplicitAutenticationService } from '../../@core/utils/implicit_autentication.service';


/* use directive: 
*ngIsGranted="['rol1', 'rol2']"
*/

@Directive({ selector: '[ngIsGranted]' })
export class NgIsGrantedDirective implements OnDestroy {
    private destroy$ = new Subject<void>();
    private hasView = false;
    constructor(private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private autenticationService: ImplicitAutenticationService) {
    }

    isGrantedRole(role) {
        const accessChecker = new BehaviorSubject(false);
        const accessChecker$ = accessChecker.asObservable();
        this.autenticationService.getRole().then((roleSystem)=> {
            if(typeof roleSystem !== 'undefined' && roleSystem !== null) {
               const intersection =  _.intersection(role, roleSystem);
               if(intersection.length > 0 ) {
                   accessChecker.next(true)
               } else {
                accessChecker.next(false)
               }
            }
        })
        return accessChecker$
    }


    @Input() set ngIsGranted(roles: [string]) {
        this.isGrantedRole(roles)
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe((can: boolean) => {
                if (can && !this.hasView) {
                    this.viewContainer.createEmbeddedView(this.templateRef);
                    this.hasView = true;
                } else if (!can && this.hasView) {
                    this.viewContainer.clear();
                    this.hasView = false;
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}