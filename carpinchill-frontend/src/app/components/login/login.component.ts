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

        <img src="assets/carpincho-logo.png" alt="CarpinChill logo" class="login-logo" />
        <h1>CarpinChill</h1>
        <p class="login-subtitulo">Inicia sesión para continuar</p>

        <div *ngIf="errorMensaje" class="login-error">
          ⚠️ {{ errorMensaje }}
        </div>

        <div class="login-form">
          <div class="campo">
            <label>Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              placeholder="tu@email.com"
              [disabled]="cargando"
              (keyup.enter)="iniciarSesion()"
            />
          </div>

          <div class="campo">
            <label>Contraseña</label>
            <input
              type="password"
              [(ngModel)]="password"
              placeholder="••••••••"
              [disabled]="cargando"
              (keyup.enter)="iniciarSesion()"
            />
          </div>

          <button
            class="btn-entrar"
            (click)="iniciarSesion()"
            [disabled]="cargando || !email || !password"
          >
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
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f4f8;
      margin: -24px -16px;
      padding: 40px 16px;
    }
    .login-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      text-align: center;
    }
    .login-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      margin-bottom: 8px;
    }
    h1 { margin: 0 0 8px; color: #1B4F72; font-size: 26px; }
    .login-subtitulo { color: #888; margin: 0 0 28px; font-size: 14px; }
    .login-error {
      background: #fef3f3;
      color: #c0392b;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .login-form { text-align: left; }
    .campo { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .campo label { font-size: 13px; font-weight: 600; color: #555; }
    .campo input {
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 15px;
      transition: border-color 0.2s;
      width: 100%;
      box-sizing: border-box;
    }
    .campo input:focus { outline: none; border-color: #1B4F72; }
    .password-wrapper { position: relative; }
    .password-wrapper input { padding-right: 44px; }
    .ojo {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
    }
    .btn-entrar {
      width: 100%;
      padding: 12px;
      background: #1B4F72;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.2s;
    }
    .btn-entrar:hover:not(:disabled) { background: #154360; }
    .btn-entrar:disabled { background: #aaa; cursor: not-allowed; }
    .usuarios-prueba {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .usuarios-prueba p { color: #888; font-size: 12px; margin: 0 0 10px; }
    .prueba-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .prueba-chips span {
      background: #EBF5FB;
      color: #1B4F72;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
      font-weight: 600;
    }
    .prueba-chips span:hover { background: #D6EAF8; }
    .prueba-hint { color: #1e8449; font-size: 12px; margin-top: 8px !important; }
    .registro-link { color: #888; font-size: 13px; margin: 16px 0 0; }
    .registro-link a { color: #1B4F72; font-weight: 600; text-decoration: none; }
    .link-volver {
      display: block;
      margin-top: 12px;
      color: #888;
      font-size: 13px;
      text-decoration: none;
    }
    .link-volver:hover { color: #1B4F72; text-decoration: underline; }
  `]
})
export class LoginComponent {

  email = '';
  password = '';
  cargando = false;
  errorMensaje = '';
  verPassword = false;
  chipUsado = false;

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(): void {
    if (!this.email || !this.password) return;
    this.cargando = true;
    this.errorMensaje = '';
    this.chipUsado = false;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.cargando = false;
        // Borrar el flag para que la animación splash salga al llegar a viajes
        sessionStorage.removeItem('splash_visto');
        this.router.navigate(['/viajes']);
      },
      error: () => {
        this.cargando = false;
        this.errorMensaje = 'Email o contraseña incorrectos.';
      }
    });
  }

  rellenar(email: string, pass: string): void {
    this.email = email;
    this.password = pass;
    this.errorMensaje = '';
    this.chipUsado = true;
  }
}