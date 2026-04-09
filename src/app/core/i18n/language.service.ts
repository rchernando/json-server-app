import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translateService = inject(TranslateService);
  private router = inject(Router);

  private _currentLanguage = signal<string>('en');
  private _availableLanguages = signal<string[]>(['en', 'es']);

  constructor() {
    const lang = this.getLangFromUrl();
    this._currentLanguage.set(lang);
    this.translateService.use(lang);

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe({
      next: () => {
        const newLang = this.getLangFromUrl();
        if (newLang !== this._currentLanguage()) {
          this._currentLanguage.set(newLang);
          this.translateService.use(newLang);
        }
      },
      error: () => toast.error(this.translateService.instant('common.error')),
    });
  }

  public get currentLanguage(): string {
    return this._currentLanguage();
  }

  public get availableLanguages(): string[] {
    return this._availableLanguages();
  }

  public changeLanguage(lang: string): void {
    const currentUrl = this.router.url.split('?')[0];
    const currentLang = this.getLangFromUrl();

    if (lang === currentLang) return;

    let newUrl: string;
    if (lang === 'en') {
      newUrl = currentUrl.replace(/^\/es(\/|$)/, '/');
    } else {
      const cleanUrl = currentUrl.replace(/^\/es(\/|$)/, '/');
      newUrl = cleanUrl === '/' ? '/es' : `/es${cleanUrl}`;
    }

    this.translateService.use(lang).subscribe({
      next: () => this.router.navigateByUrl(newUrl),
      error: () => toast.error(this.translateService.instant('common.error')),
    });
  }

  private getLangFromUrl(): string {
    const url = this.router.url;
    return url.startsWith('/es') ? 'es' : 'en';
  }

  public localize(path: string): string {
    const lang = this._currentLanguage();
    const clean = path.startsWith('/') ? path : `/${path}`;
    if (lang === 'en') return clean;
    return clean === '/' ? '/es' : `/es${clean}`;
  }
}
