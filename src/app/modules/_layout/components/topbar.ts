import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LogOut, Plus, Search } from 'lucide-angular';

import { InputComponent } from '../../../shared/components/input';
import { SwitchLanguageComponent } from '../../../shared/components/language';
import { ButtonComponent } from '../../../shared/components/button';
import { AuthService } from '../../auth/service/auth.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'rh-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <a
        [routerLink]="homeLink()"
        class="font-semibold text-lg md:text-xl cursor-pointer hover:text-primary-dark transition-colors"
      >
        TechPoC
      </a>
      <div class="flex flex-col md:flex-row gap-3 md:gap-6 md:items-center">
        <div class="w-full md:w-64">
          <rh-input
            [iconImg]="searchIcon"
            [(value)]="searchQuery"
            (valueChange)="onSearchChange($event)"
            [placeholder]="'posts.searchPlaceholder' | translate"
          />
        </div>
        <div class="flex items-center justify-between md:justify-start gap-2 md:gap-6">
          <rh-switch-language></rh-switch-language>
          @if (authService.currentUser(); as user) {
            <a [routerLink]="newPostLink()" class="flex-1 md:flex-none">
              <rh-button variant="primary" [icon]="plusIcon" [fullWidth]="true">
                <span class="hidden sm:inline">{{ 'topbar.createPost' | translate }}</span>
                <span class="sm:hidden">+</span>
              </rh-button>
            </a>
            <span class="text-sm text-gray-700 hidden lg:inline whitespace-nowrap">
              {{ 'topbar.hello' | translate }}, {{ capitalizeFirstLetter(user.name) }}
            </span>
            <rh-button variant="outline" [icon]="logoutIcon" (clicked)="onLogout()">
              <span class="hidden sm:inline">{{ 'auth.logout' | translate }}</span>
            </rh-button>
          }
        </div>
      </div>
    </nav>
  `,
  imports: [InputComponent, SwitchLanguageComponent, ButtonComponent, TranslateModule, RouterLink],
})
export class TopbarComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  private searchService = inject(SearchService);

  public readonly plusIcon = Plus;
  public readonly logoutIcon = LogOut;
  public readonly searchIcon = Search;

  public searchQuery = '';

  public homeLink = computed(() => this.languageService.localize('/'));
  public newPostLink = computed(() => this.languageService.localize('/posts/new'));

  public onSearchChange(value: string): void {
    this.searchService.setSearchQuery(value);
  }

  public capitalizeFirstLetter(name: string): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  public async onLogout(): Promise<void> {
    this.authService.logout();
    await this.router.navigateByUrl(this.languageService.localize('/login'));
  }
}
