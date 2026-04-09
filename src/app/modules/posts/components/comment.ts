import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'rh-comment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CapitalizePipe, DateFormatPipe],
  template: `
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h4 class="font-semibold text-gray-900">{{ author() | capitalize }}</h4>
        <span class="text-xs sm:text-sm text-gray-500">{{ createdAt() | dateFormat }}</span>
      </div>
      <p class="text-sm sm:text-base text-gray-700 leading-relaxed break-words">{{ content() }}</p>
    </div>
  `,
})
export class CommentComponent {
  public author = input.required<string>();
  public createdAt = input.required<string>();
  public content = input.required<string>();
}
