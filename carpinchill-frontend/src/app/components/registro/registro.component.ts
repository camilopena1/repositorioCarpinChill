import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pagina">
      <div class="card">
        <img [src]="modoOscuro ? 'assets/carpinchoN-logo.png' : 'assets/carpincho-logo.png'"
             alt="CarpinChill" class="logo-img"
             onerror="this.src='assets/carpincho-logo.png'" />
        <h1>CarpinChill</h1>
        <p class="sub">Crea tu cuenta gratuita</p>
        <div *ngIf="error" class="error">⚠️ {{ error }}</div>
        <div class="campo"><label>Nombre</label><input [(ngModel)]="form.nombre" placeholder="Tu nombre"/></div>
        <div class="campo"><label>Apellidos</label><input [(ngModel)]="form.apellidos" placeholder="Tus apellidos"/></div>
        <div class="campo"><label>Email</label><input [(ngModel)]="form.email" type="email" placeholder="tu@email.com"/></div>
        <div class="campo"><label>Contraseña</label><input [(ngModel)]="form.password" type="password" placeholder="Mínimo 6 caracteres"/></div>
        <button class="btn" (click)="registrar()" [disabled]="cargando">
          {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
        <p class="link">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
      </div>
    </div>
  `,
  styles: [`
    .pagina { display:flex; align-items:center; justify-content:center; min-height:80vh; padding:20px; background:var(--bg-app, #f0f4f8); margin:-24px -16px; }
    .card { background:var(--bg-card, white); border-radius:16px; padding:36px 30px; width:100%; max-width:390px; box-shadow:0 4px 20px var(--shadow, rgba(0,0,0,.1)); text-align:center; }
    .logo-img { width:64px; height:64px; object-fit:contain; border-radius:50%; margin-bottom:8px; }
    h1 { font-size:22px; color:var(--link-color, #1B4F72); margin:0 0 4px; }
    .sub { color:var(--text-muted, #888); font-size:13px; margin:0 0 22px; }
    .error { background:#fdecea; color:#c0392b; padding:9px 12px; border-radius:7px; margin-bottom:14px; font-size:13px; }
    .campo { text-align:left; margin-bottom:12px; }
    .campo label { display:block; font-size:12px; font-weight:600; color:var(--text-label, #555); margin-bottom:5px; }
    .campo input { width:100%; padding:9px 11px; border:1px solid var(--border, #ddd); border-radius:7px; font-size:13px; box-sizing:border-box; background:var(--bg-input, white); color:var(--text-primary, #333); }
    .campo input:focus { outline:none; border-color:#1B4F72; }
    .btn { width:100%; padding:12px; background:#1B4F72; color:white; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; margin-top:4px; }
    .btn:disabled { background:#aaa; cursor:not-allowed; }
    .link { color:var(--text-muted, #888); font-size:13px; margin:14px 0 0; }
    .link a { color:#1B4F72; font-weight:600; text-decoration:none; }
  `]
})
export class RegistroComponent {
  form = { nombre: '', apellidos: '', email: '', password: '' };
  error = ''; cargando = false;
  modoOscuro = localStorage.getItem('carpinchill_dark') === 'true';
  constructor(private authService: AuthService, private router: Router) {}
  registrar(): void {
    if (!this.form.nombre || !this.form.apellidos || !this.form.email || !this.form.password) {
      this.error = 'Todos los campos son obligatorios.'; return;
    }
    if (this.form.password.length < 6) { this.error = 'Mínimo 6 caracteres.'; return; }
    this.cargando = true; this.error = '';
    this.authService.registro(this.form).subscribe({
      next: () => this.router.navigate(['/viajes']),
      error: e => { this.error = e.error?.error || 'Error al crear la cuenta.'; this.cargando = false; }
    });
  }
}