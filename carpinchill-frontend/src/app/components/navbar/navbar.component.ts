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
        <a routerLink="/viajes" class="logo">🦫 CarpinChill</a>
      </div>

      <ul class="navbar-links">
        <li>
          <a routerLink="/viajes" routerLinkActive="activo">Viajes</a>
        </li>
        <li *ngIf="!estaAutenticado()">
          <a routerLink="/login" routerLinkActive="activo" class="btn-login">Iniciar sesión</a>
        </li>
        <li *ngIf="estaAutenticado()" class="usuario-info">
          <span>👤 {{ getNombreUsuario() }}</span>
          <button (click)="cerrarSesion()" class="btn-logout">Salir</button>
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
      font-size: 20px;
      font-weight: bold;
      color: white;
      text-decoration: none;
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
      gap: 12px;
      font-size: 14px;
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
    .btn-logout:hover {
      background: rgba(255,255,255,0.25);
    }
  `]
})
export class NavbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  estaAutenticado(): boolean {
    return this.authService.estaAutenticado();
  }

  getNombreUsuario(): string {
    return this.authService.getUsuarioActual()?.username || '';
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/viajes']);
  }
}
