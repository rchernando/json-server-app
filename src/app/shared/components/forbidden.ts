import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule, ShieldAlert } from 'lucide-angular';

import { ButtonComponent } from './button';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'rh-forbidden',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div class="max-w-md w-full text-center space-y-4 md:space-y-6">
        <div class="flex justify-center">
          <lucide-icon [img]="shieldIcon" [size]="72" class="text-red-500" />
        </div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
          {{ 'forbidden.title' | translate }}
        </h1>
        <p class="text-sm md:text-base text-gray-600">
          {{ 'forbidden.description' | translate }}
        </p>
        <div class="flex justify-center">
          <a [routerLink]="homeLink()">
            <rh-button variant="primary">
              {{ 'forbidden.backHome' | translate }}
            </rh-button>
          </a>
        </div>
      </div>
    </div>
  `,
  imports: [TranslateModule, LucideAngularModule, ButtonComponent, RouterLink],
})
export class ForbiddenComponent {
  private languageService = inject(LanguageService);

  public readonly shieldIcon = ShieldAlert;
  public homeLink = computed(() => this.languageService.localize('/'));
}
