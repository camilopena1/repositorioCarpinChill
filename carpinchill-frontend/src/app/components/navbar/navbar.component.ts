import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-marca">
        <a routerLink="/viajes" class="logo">
          <img src="assets/carpincho-logo.png" alt="CarpinChill" class="logo-img" />
          <span class="logo-texto">CarpinChill</span>
        </a>
      </div>

      <ul class="navbar-links">
        <li>
          <a routerLink="/viajes" routerLinkActive="activo">Viajes</a>
        </li>
        <li *ngIf="!estaAutenticado()">
          <a routerLink="/registro" routerLinkActive="activo">Registrarse</a>
        </li>
        <li *ngIf="estaAutenticado()">
          <a routerLink="/mis-reservas" routerLinkActive="activo">Mis Reservas</a>
        </li>
        <li *ngIf="estaAutenticado()">
          <a routerLink="/perfil" routerLinkActive="activo">Mi Perfil</a>
        </li>
        <li *ngIf="esAdminOAgente()">
          <a routerLink="/admin" routerLinkActive="activo">⚙️ Admin</a>
        </li>
        <li *ngIf="!estaAutenticado()">
          <a routerLink="/login" routerLinkActive="activo" class="btn-login">Iniciar sesión</a>
        </li>
        <li *ngIf="estaAutenticado()" class="usuario-info">
          <span>👤 {{ getNombreUsuario() }}</span>
          <span class="rol-badge">{{ getRol() }}</span>
          <button (click)="cerrarSesion()" class="btn-logout">Salir</button>
        </li>
        <!-- Botón modo oscuro/claro — siempre visible -->
        <li>
          <button (click)="toggleModo()" class="btn-modo" [title]="modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
            {{ modoOscuro ? '☀️' : '🌙' }}
          </button>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 60px;
      background-color: #1B4F72;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .logo-img {
      width: 36px;
      height: 36px;
      object-fit: contain;
      border-radius: 50%;
      background: white;
      padding: 2px;
    }
    .logo-texto {
      font-size: 20px;
      font-weight: bold;
      color: white;
    }
    .navbar-links {
      display: flex;
      align-items: center;
      gap: 24px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .navbar-links a {
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      font-size: 15px;
      transition: color 0.2s;
    }
    .navbar-links a:hover, .navbar-links a.activo {
      color: white;
      font-weight: 600;
    }
    .btn-login {
      background: rgba(255,255,255,0.15);
      padding: 6px 16px;
      border-radius: 20px;
    }
    .usuario-info {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }
    .rol-badge {
      background: rgba(255,255,255,0.15);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      text-transform: uppercase;
    }
    .btn-logout {
      background: rgba(255,255,255,0.15);
      color: white;
      border: none;
      padding: 5px 12px;
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-logout:hover { background: rgba(255,255,255,0.25); }
    .btn-modo {
      background: rgba(255,255,255,0.15);
      border: none; color: white; font-size: 18px;
      width: 36px; height: 36px; border-radius: 50%;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .btn-modo:hover { background: rgba(255,255,255,0.25); }
  `]
})
export class NavbarComponent {

  modoOscuro = document.body.classList.contains('dark');

  constructor(private authService: AuthService, private router: Router) {}

  estaAutenticado(): boolean { return this.authService.estaAutenticado(); }
  esAdminOAgente(): boolean { return this.authService.esAdminOAgente(); }
  getNombreUsuario(): string { return this.authService.getUsuarioActual()?.nombre || ''; }
  getRol(): string { return (this.authService.getUsuarioActual()?.rol || '').replace('ROLE_', ''); }
  cerrarSesion(): void { this.authService.logout(); this.router.navigate(['/viajes']); }

  toggleModo(): void {
    this.modoOscuro = !this.modoOscuro;
    document.body.classList.toggle('dark', this.modoOscuro);
    localStorage.setItem('carpinchill_dark', String(this.modoOscuro));
  }
}