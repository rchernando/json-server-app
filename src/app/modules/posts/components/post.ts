import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'rh-post',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CapitalizePipe, DateFormatPipe],
  template: `
    <a
      [routerLink]="postLink()"
      class="block bg-white cursor-pointer hover:bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6 no-underline text-inherit transition-colors"
    >
      <article>
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-4"
        >
          <h3
            class="text-lg sm:text-xl font-bold text-gray-900 hover:text-primary-dark transition-colors break-words m-0"
          >
            {{ title() }}
          </h3>
          <span class="text-xs sm:text-sm text-gray-500 shrink-0">
            {{ createdAt() | dateFormat }}
          </span>
        </div>

        <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {{ content() }}
        </p>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <div
              class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0"
            >
              {{ authorInitials() }}
            </div>
            <span class="text-sm font-medium text-gray-900 truncate">
              {{ author() | capitalize }}
            </span>
          </div>

          <div class="flex flex-wrap gap-2">
            @for (tag of tags(); track tag) {
              <span
                class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full uppercase"
              >
                {{ tag }}
              </span>
            }
          </div>
        </div>
      </article>
    </a>
  `,
})
export class PostComponent {
  private languageService = inject(LanguageService);

  public id = input.required<string | number>();
  public title = input.required<string>();
  public author = input.required<string>();
  public createdAt = input.required<string>();
  public tags = input.required<string[]>();
  public content = input.required<string>();

  public postLink = computed(() => this.languageService.localize(`/posts/${this.id()}`));

  public authorInitials(): string {
    return this.author().substring(0, 2).toUpperCase();
  }
}
