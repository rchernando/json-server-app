import { Component, input, output } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

@Component({
  selector: 'rh-button',
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      (click)="handleClick($event)"
      [class]="buttonClasses()"
    >
      @if (icon()) {
        <lucide-icon
          [img]="icon()!"
          [size]="16"
          [class]="iconPosition() === 'left' ? 'mr-2' : 'ml-2'"
          [class.order-2]="iconPosition() === 'right'"
        />
      }
      <span [class.order-1]="iconPosition() === 'right'">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  imports: [LucideAngularModule],
})
export class ButtonComponent {
  public type = input<'button' | 'submit' | 'reset'>('button');
  public variant = input<'primary' | 'secondary' | 'outline'>('primary');
  public disabled = input<boolean>(false);
  public fullWidth = input<boolean>(false);

  public icon = input<LucideIconData | null>(null);
  public iconPosition = input<'left' | 'right'>('left');

  public clicked = output<MouseEvent>();

  public buttonClasses(): string {
    const base =
      'font-medium rounded-sm transition-colors duration-200 inline-flex items-center justify-center px-6 py-2 text-sm';

    const variantClasses: Record<'primary' | 'secondary' | 'outline', string> = {
      primary: 'bg-primary-light text-white hover:bg-primary-dark',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      outline:
        'border border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white',
    };

    const widthClass = this.fullWidth() ? 'w-full' : '';
    const disabledClass = this.disabled() ? 'opacity-50 cursor-not-allowed' : '';

    return `${base} ${variantClasses[this.variant()]} ${widthClass} ${disabledClass}`;
  }

  public handleClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.clicked.emit(event);
    }
  }
}
