import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Rutas de la aplicación.
 *
 * Actualizado en entrega 3 (rama feature/panel-admin):
 *   - Añadida ruta /admin protegida por authGuard
 */
export const routes: Routes = [
  // Ruta raíz → redirige al catálogo
  { path: '', redirectTo: '/viajes', pathMatch: 'full' },

  // Catálogo de viajes (público)
  {
    path: 'viajes',
    loadComponent: () =>
      import('./components/lista-viajes/lista-viajes.component')
        .then(m => m.ListaViajesComponent)
  },

  // Detalle de un viaje (público)
  {
    path: 'viajes/:id',
    loadComponent: () =>
      import('./components/detalle-viaje/detalle-viaje.component')
        .then(m => m.DetalleViajeComponent)
  },

  // Login (público)
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component')
        .then(m => m.LoginComponent)
  },

  // Panel de administración (requiere autenticación)
  // Solo accesible para usuarios con rol ADMIN o AGENTE
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin.component')
        .then(m => m.AdminComponent),
    canActivate: [authGuard]
  },

  // Ruta no encontrada → redirige al catálogo
  { path: '**', redirectTo: '/viajes' }
];
