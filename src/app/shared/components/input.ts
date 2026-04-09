import { Component, input, model } from '@angular/core';
import { LucideAngularModule, Search } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'rh-input',
  template: `
    <div class="relative w-full">
      <lucide-icon
        [img]="iconImg()"
        [size]="16"
        class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        [placeholder]="placeholder()"
        [(ngModel)]="value"
        class="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-sm text-sm focus:outline-none"
      />
    </div>
  `,
  imports: [LucideAngularModule, FormsModule],
})
export class InputComponent {
  public placeholder = input<string>('Buscar posts');
  public iconImg = input(Search);
  public value = model<string>('');
}
