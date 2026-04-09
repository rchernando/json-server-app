import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  template: `
    <router-outlet></router-outlet>
    @if (isBrowser) {
      <ngx-sonner-toaster position="top-right" richColors />
    }
  `,
})
export class App {
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
}
