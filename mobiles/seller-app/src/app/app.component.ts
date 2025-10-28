import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent {
  // On expose l'URL courante pour la clé d'animation
  public router = inject(Router);

  constructor() {
    // Optionnel : force un tick d'animation uniquement sur fin de navigation
    // this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe();
  }
}