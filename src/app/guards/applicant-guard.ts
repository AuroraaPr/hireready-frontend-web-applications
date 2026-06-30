import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';
import { inject } from '@angular/core';

export const applicantGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.estaLogueado() && userService.esApplicant()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
