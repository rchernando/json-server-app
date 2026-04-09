import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  public searchQuery = signal<string>('');

  public setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  public clearSearch(): void {
    this.searchQuery.set('');
  }
}
