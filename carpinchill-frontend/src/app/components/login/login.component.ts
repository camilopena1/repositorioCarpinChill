import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-pagina">
      <div class="login-card">
        <img src="assets/carpinchoN-logo.png" alt="CarpinChill logo" class="login-logo"
             onerror="this.src='assets/carpincho-logo.png'" />
        <h1>CarpinChill</h1>
        <p class="login-subtitulo">Inicia sesión para continuar</p>
        <div *ngIf="errorMensaje" class="login-error">⚠️ {{ errorMensaje }}</div>
        <div class="login-form">
          <div class="campo">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" placeholder="tu@email.com"
                   [disabled]="cargando" (keyup.enter)="iniciarSesion()" />
          </div>
          <div class="campo">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" placeholder="••••••••"
                   [disabled]="cargando" (keyup.enter)="iniciarSesion()" />
          </div>
          <button class="btn-entrar" (click)="iniciarSesion()"
                  [disabled]="cargando || !email || !password">
            {{ cargando ? 'Entrando...' : 'Iniciar sesión' }}
          </button>
        </div>
        <div class="usuarios-prueba">
          <p>Usuarios de prueba:</p>
          <div class="prueba-chips">
            <span (click)="rellenar('admin@carpinchill.com', 'admin123')">Admin</span>
            <span (click)="rellenar('agente@carpinchill.com', 'admin123')">Agente</span>
          </div>
          <p class="prueba-hint" *ngIf="chipUsado">✓ Datos cargados — pulsa "Iniciar sesión"</p>
        </div>
        <p class="registro-link">¿No tienes cuenta? <a routerLink="/registro">Regístrate</a></p>
        <a routerLink="/viajes" class="link-volver">← Ver catálogo sin iniciar sesión</a>
      </div>
    </div>
  `,
  styles: [`
    .login-pagina {
      min-height: calc(100vh - 60px);
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-app, #f0f4f8);
      margin: -24px -16px; padding: 40px 16px;
    }
    .login-card {
      background: var(--bg-card, white);
      border-radius: 20px; padding: 40px 32px;
      width: 100%; max-width: 420px;
      box-shadow: 0 4px 24px var(--shadow, rgba(0,0,0,0.08));
      text-align: center;
    }
    .login-logo { width: 72px; height: 72px; object-fit: contain; margin-bottom: 12px; border-radius: 50%; }
    h1 { margin: 0 0 6px; color: var(--link-color, #1B4F72); font-size: 26px; }
    .login-subtitulo { color: var(--text-muted, #888); margin: 0 0 28px; font-size: 14px; }
    .login-error { background: #fef3f3; color: #c0392b; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
    .login-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
    .campo { text-align: left; }
    .campo label { display: block; font-size: 13px; font-weight: 600; color: var(--text-label, #555); margin-bottom: 5px; }
    .campo input {
      width: 100%; padding: 10px 12px; border: 1px solid var(--border, #ddd);
      border-radius: 8px; font-size: 14px; box-sizing: border-box;
      background: var(--bg-input, white); color: var(--text-primary, #333);
      transition: border-color 0.2s;
    }
    .campo input:focus { outline: none; border-color: #1B4F72; }
    .btn-entrar {
      width: 100%; padding: 12px; background: #1B4F72; color: white;
      border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-entrar:hover:not(:disabled) { background: #154360; }
    .btn-entrar:disabled { background: #aaa; cursor: not-allowed; }
    .usuarios-prueba { margin-bottom: 16px; }
    .usuarios-prueba p { color: var(--text-muted, #888); font-size: 12px; margin: 0 0 8px; }
    .prueba-chips { display: flex; gap: 8px; justify-content: center; }
    .prueba-chips span {
      background: var(--bg-muted, #eef2f7); color: var(--text-primary, #1B4F72);
      padding: 5px 16px; border-radius: 20px; font-size: 13px;
      cursor: pointer; font-weight: 600; transition: background 0.2s;
    }
    .prueba-chips span:hover { background: #1B4F72; color: white; }
    .prueba-hint { color: #27ae60; font-size: 12px; margin: 6px 0 0; }
    .registro-link { color: var(--text-muted, #888); font-size: 13px; margin: 0 0 8px; }
    .registro-link a { color: #1B4F72; font-weight: 600; text-decoration: none; }
    .link-volver { color: var(--text-muted, #aaa); font-size: 12px; text-decoration: none; }
  `]
})
export class LoginComponent {
  email = ''; password = ''; errorMensaje = ''; cargando = false; chipUsado = false;
  constructor(private authService: AuthService, private router: Router) {}
  rellenar(e: string, p: string): void { this.email = e; this.password = p; this.chipUsado = true; }
  iniciarSesion(): void {
    if (!this.email || !this.password) return;
    this.cargando = true; this.errorMensaje = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        const rol = res.rol || '';
        this.router.navigate(rol === 'ADMIN' || rol === 'AGENTE' ? ['/admin'] : ['/viajes']);
      },
      error: (err) => {
        this.errorMensaje = err.error?.error || 'Email o contraseña incorrectos.';
        this.cargando = false;
      }
    });
  }
}
