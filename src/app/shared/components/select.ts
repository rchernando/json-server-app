import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string | number | null;
}

@Component({
  selector: 'rh-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <ng-select
        [items]="options()"
        bindLabel="label"
        bindValue="value"
        [placeholder]="placeholder()"
        [searchable]="searchable()"
        [clearable]="false"
        [(ngModel)]="selectedValue"
        (ngModelChange)="onValueChange($event)"
        class="custom-ng-select"
      >
      </ng-select>
    }
  `,
  imports: [NgSelectModule, FormsModule],
})
export class SelectComponent {
  public placeholder = input<string>('Seleccionar...');
  public options = input.required<SelectOption[]>();
  public value = input<string | number | null>(null);
  public searchable = input<boolean>(true);

  public valueChange = output<string | number | null>();

  public selectedValue: string | number | null = null;
  public visible = signal(true);

  constructor() {
    effect(() => {
      this.selectedValue = this.value();
    });

    let firstRun = true;
    effect(() => {
      this.options();
      if (firstRun) {
        firstRun = false;
        return;
      }
      this.visible.set(false);
      queueMicrotask(() => this.visible.set(true));
    });
  }

  public onValueChange(value: string | number | null): void {
    this.valueChange.emit(value);
  }
}
