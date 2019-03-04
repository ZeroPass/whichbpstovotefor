import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard {

    constructor(private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('activeUser')) {
            return true;
        }

        // redirect if not logged in
        this.router.navigate(['/bp'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}