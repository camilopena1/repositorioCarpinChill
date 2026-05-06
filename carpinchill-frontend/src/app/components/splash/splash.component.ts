import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-overlay" [class.fade-out]="fadeOut" *ngIf="visible">
      <div class="splash-contenido" [class.zoom-in]="zoomed">
        <img
          src="assets/carpincho-avion.png"
          alt="CarpinChill"
          class="splash-img"
          [class.vuela]="vuela"
        />
        <div class="splash-titulo" [class.visible]="mostrarTexto">
          <h1>CarpinChill</h1>
          <p>Tu agencia de viajes favorita ✈️</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .splash-overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #1B4F72 0%, #2E86C1 60%, #AED6F1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 1;
      transition: opacity 0.8s ease-out;
    }
    .splash-overlay.fade-out { opacity: 0; pointer-events: none; }
    .splash-contenido {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      transform: scale(0.5);
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .splash-contenido.zoom-in { transform: scale(1); }
    .splash-img {
      width: 220px;
      height: 220px;
      object-fit: cover;
      border-radius: 50%;
      background: white;
      padding: 12px;
      box-sizing: border-box;
      filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3));
      transform: translateX(-400px) rotate(-15deg);
      transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .splash-img.vuela { transform: translateX(0) rotate(0deg); }
    .splash-titulo {
      text-align: center;
      color: white;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .splash-titulo.visible { opacity: 1; transform: translateY(0); }
    .splash-titulo h1 {
      font-size: 42px;
      margin: 0;
      font-weight: 800;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .splash-titulo p { font-size: 16px; margin: 8px 0 0; opacity: 0.85; }
  `]
})
export class SplashComponent implements OnInit {
  @Output() done = new EventEmitter<void>();

  visible = true;
  zoomed = false;
  vuela = false;
  mostrarTexto = false;
  fadeOut = false;

  ngOnInit(): void {
    setTimeout(() => this.zoomed = true, 100);
    setTimeout(() => this.vuela = true, 300);
    setTimeout(() => this.mostrarTexto = true, 900);
    setTimeout(() => this.fadeOut = true, 2400);
    setTimeout(() => {
      this.visible = false;
      this.done.emit();
    }, 3100);
  }
}