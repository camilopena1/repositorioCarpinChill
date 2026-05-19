import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="contenido-principal">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .contenido-principal {
      padding: 24px 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'CarpinChill';

  ngOnInit(): void {
    // Recuperar preferencia guardada al arrancar la app
    const modoOscuro = localStorage.getItem('carpinchill_dark') === 'true';
    if (modoOscuro) {
      document.body.classList.add('dark');
    }
  }
}
