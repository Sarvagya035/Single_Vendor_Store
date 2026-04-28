import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="relative w-full" (ngSubmit)="searchSubmit.emit(searchQuery)">
      <div class="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm transition focus-within:border-amber-500 focus-within:bg-white">
        <span class="text-slate-400">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m20 20-3.5-3.5"></path>
          </svg>
        </span>
        <input
          name="searchQuery"
          [(ngModel)]="searchQuery"
          (ngModelChange)="searchChange.emit($event)"
          type="text"
          [placeholder]="placeholder"
          class="w-full border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </form>
  `
})
export class CatalogSearchBarComponent {
  @Input() searchQuery = '';
  @Input() placeholder = 'Search dry fruits, nuts and healthy packs';
  @Input() loading = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();
}
