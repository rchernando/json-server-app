import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateFormat',
  pure: true,
})
export class DateFormatPipe implements PipeTransform {
  private translateService = inject(TranslateService);

  public transform(value: string | Date): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return this.translateService.instant('date.justNow');
    } else if (diffMins < 60) {
      return this.translateService.instant('date.minutesAgo', { count: diffMins });
    } else if (diffHours < 24) {
      return this.translateService.instant('date.hoursAgo', { count: diffHours });
    } else if (diffDays < 7) {
      return this.translateService.instant('date.daysAgo', { count: diffDays });
    } else {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
}
