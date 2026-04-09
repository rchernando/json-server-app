import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { form, required } from '@angular/forms/signals';
import { ArrowRight, Lock, User as UserIcon } from 'lucide-angular';
import { toast } from 'ngx-sonner';

import { ButtonComponent } from '../../../shared/components/button';
import { SwitchLanguageComponent } from '../../../shared/components/language';
import { InputFormComponent } from '../../../shared/components/input-form';
import { AuthService } from '../service/auth.service';
import { LanguageService } from '../../../core/i18n/language.service';

interface LoginModel {
  name: string;
  password: string;
}

@Component({
  selector: 'rh-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <nav class="p-4 md:p-6 flex items-center justify-between">
        <h1 class="font-semibold text-lg md:text-xl">TechPoC</h1>
        <rh-switch-language></rh-switch-language>
      </nav>

      <div class="flex-1 flex items-center justify-center px-4 py-6 md:py-0">
        <div class="w-full max-w-md">
          <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 md:space-y-8"
          >
            <div class="text-center space-y-2">
              <h1 class="text-xl md:text-2xl font-bold text-gray-900">
                {{ 'auth.welcome' | translate }}
              </h1>
              <p class="text-sm text-gray-500">
                {{ 'auth.welcomeSubtitle' | translate }}
              </p>
            </div>

            <form class="space-y-6" (submit)="onSubmit($event)" novalidate>
              <div class="space-y-3">
                <label for="login-name" class="block text-xs font-medium text-gray-700 uppercase">
                  {{ 'auth.username' | translate }}
                </label>
                <rh-input-form
                  id="login-name"
                  type="text"
                  [iconImg]="userIcon"
                  autocomplete="username"
                  [formField]="loginForm.name"
                  [placeholder]="'auth.usernamePlaceholder' | translate"
                  [invalid]="nameInvalid()"
                />
                @if (nameInvalid()) {
                  <p class="text-xs pt-1 text-red-600">
                    {{ 'validation.required' | translate }}
                  </p>
                }
              </div>

              <div class="space-y-3">
                <label
                  for="login-password"
                  class="block text-xs font-medium text-gray-700 uppercase"
                >
                  {{ 'auth.password' | translate }}
                </label>
                <rh-input-form
                  id="login-password"
                  type="password"
                  [iconImg]="lockIcon"
                  autocomplete="current-password"
                  [formField]="loginForm.password"
                  [placeholder]="'auth.passwordPlaceholder' | translate"
                  [invalid]="passwordInvalid()"
                />
                @if (passwordInvalid()) {
                  <p class="text-xs pt-1 text-red-600">
                    {{ 'validation.required' | translate }}
                  </p>
                }
              </div>

              <rh-button
                type="button"
                variant="primary"
                [fullWidth]="true"
                [icon]="arrowRightIcon"
                iconPosition="right"
                [disabled]="submitting()"
                (clicked)="onSubmit($event)"
              >
                {{ 'auth.loginButton' | translate }}
              </rh-button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  imports: [TranslateModule, ButtonComponent, InputFormComponent, SwitchLanguageComponent],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);

  public readonly userIcon = UserIcon;
  public readonly lockIcon = Lock;
  public readonly arrowRightIcon = ArrowRight;

  private model = signal<LoginModel>({ name: '', password: '' });

  public loginForm = form(this.model, (path) => {
    required(path.name);
    required(path.password);
  });

  public submitting = signal(false);

  public nameInvalid = computed(
    () => this.loginForm.name().touched() && !this.loginForm.name().valid(),
  );
  public passwordInvalid = computed(
    () => this.loginForm.password().touched() && !this.loginForm.password().valid(),
  );

  public onSubmit(event: Event): void {
    event.preventDefault();
    if (this.submitting()) return;

    if (!this.loginForm().valid()) {
      this.loginForm.name().markAsDirty();
      this.loginForm.password().markAsDirty();
      return;
    }

    this.submitting.set(true);
    const { name, password } = this.model();
    this.authService.login(name, password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl(this.languageService.localize('/'));
      },
      error: () => {
        this.submitting.set(false);
        toast.error(this.translateService.instant('auth.loginError'));
      },
    });
  }
}
