import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que protege rutas que requieren autenticación.
 * Si el usuario no está logueado, lo redirige al login.
 *
 * Uso en app.routes.ts:
 *   { path: 'admin', component: AdminComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  // No autenticado → redirige al login
  router.navigate(['/login']);
  return false;
};
