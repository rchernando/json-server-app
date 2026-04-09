import { Component } from '@angular/core';
import { TopbarComponent } from './components/topbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'rh-layout',
  template: `
    <div class="flex h-screen flex-col">
      <div class="mx-auto w-full">
        <rh-topbar></rh-topbar>
      </div>
      <div class="mx-auto w-full max-w-7xl">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  imports: [TopbarComponent, RouterOutlet],
})
export class LayoutComponent {}
