import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.estaLogueado() && userService.esAdmin()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
