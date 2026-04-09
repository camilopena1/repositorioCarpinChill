import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

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

  // Ruta no encontrada → redirige al catálogo
  { path: '**', redirectTo: '/viajes' }
];
