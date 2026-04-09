import { Component, inject, computed } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { LanguageService } from '../../core/i18n/language.service';
import { NgClass, NgStyle } from '@angular/common';

@Component({
  selector: 'rh-switch-language',
  template: `
    <div class="relative inline-flex rounded-sm bg-gray-100 p-1">
      <div
        class="absolute inset-1 bg-primary-light rounded-sm transition-all duration-300 ease-in-out pointer-events-none"
        [ngStyle]="sliderStyles()"
      ></div>
      <a
        [routerLink]="enRoute()"
        [ngClass]="{
          'text-white': 'en' === languageService.currentLanguage,
          'text-gray-700': 'en' !== languageService.currentLanguage,
        }"
        class="relative z-10 flex-1 px-4 py-1.5 cursor-pointer rounded-sm text-sm font-medium transition-colors duration-300 text-center"
      >
        EN
      </a>
      <a
        [routerLink]="esRoute()"
        [ngClass]="{
          'text-white': 'es' === languageService.currentLanguage,
          'text-gray-700': 'es' !== languageService.currentLanguage,
        }"
        class="relative z-10 flex-1 px-4 py-1.5 cursor-pointer rounded-sm text-sm font-medium transition-colors duration-300 text-center"
      >
        ES
      </a>
    </div>
  `,
  imports: [NgClass, NgStyle, RouterLink],
})
export class SwitchLanguageComponent {
  public languageService = inject(LanguageService);
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  public sliderStyles = computed(() => {
    const index = this.languageService.availableLanguages.indexOf(
      this.languageService.currentLanguage,
    );
    const count = this.languageService.availableLanguages.length;

    return {
      transform: `translateX(${index * 100}%)`,
      width: `calc((100% - 0.5rem) / ${count})`,
    };
  });

  public enRoute = computed(() => {
    const url = this.currentUrl().split('?')[0];
    return url.replace(/^\/es(\/|$)/, '/');
  });

  public esRoute = computed(() => {
    const url = this.currentUrl().split('?')[0];
    const cleanUrl = url.replace(/^\/es(\/|$)/, '/');
    return cleanUrl === '/' ? '/es' : `/es${cleanUrl}`;
  });
}
