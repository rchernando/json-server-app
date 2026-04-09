import { Component, input } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'rh-input-form',
  template: `
    <div class="relative w-full">
      <lucide-icon
        [img]="iconImg()"
        [size]="16"
        class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        [type]="type()"
        [placeholder]="placeholder()"
        [formField]="formField()"
        [attr.autocomplete]="autocomplete()"
        [attr.id]="id()"
        [class]="inputClasses()"
        class="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-sm text-sm focus:outline-none transition-shadow"
      />
    </div>
  `,
  imports: [LucideAngularModule, FormField],
})
export class InputFormComponent {
  public placeholder = input<string>('');
  public type = input<string>('text');
  public iconImg = input.required<LucideIconData>();
  public autocomplete = input<string>('off');
  public id = input<string>('');
  public formField = input.required<any>();
  public invalid = input<boolean>(false);

  public inputClasses(): string {
    return this.invalid() ? 'ring-2 ring-red-500' : '';
  }
}
