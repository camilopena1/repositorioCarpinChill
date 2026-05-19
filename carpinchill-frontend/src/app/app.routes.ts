import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/viajes', pathMatch: 'full' },
  {
    path: 'viajes',
    loadComponent: () => import('./components/lista-viajes/lista-viajes.component').then(m => m.ListaViajesComponent)
  },
  {
    path: 'viajes/:id',
    loadComponent: () => import('./components/detalle-viaje/detalle-viaje.component').then(m => m.DetalleViajeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mis-reservas',
    loadComponent: () => import('./components/mis-reservas/mis-reservas.component').then(m => m.MisReservasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/viajes' }
];