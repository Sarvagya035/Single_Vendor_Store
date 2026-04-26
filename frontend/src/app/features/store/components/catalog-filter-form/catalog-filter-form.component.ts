import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerLandingCategory } from '../../../../core/models/customer.models';

@Component({
  selector: 'app-catalog-filter-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mt-4 space-y-4">
      <label class="block">
        <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</span>
        <select
          [ngModel]="selectedCategorySlug"
          name="selectedCategorySlug"
          (ngModelChange)="onSelectedCategorySlugChange($event)"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
        >
          <option value="all">All categories</option>
          <option *ngFor="let category of sidebarCategories; trackBy: trackByCategoryId" [value]="category.slug || category.name">
            {{ categoryLabel(category) }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</span>
        <select
          [ngModel]="selectedBrand"
          name="selectedBrand"
          (ngModelChange)="onSelectedBrandChange($event)"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
        >
          <option value="all">All brands</option>
          <option *ngFor="let brand of brandOptions; trackBy: trackByValue" [value]="brand">
            {{ brand }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Sort by</span>
        <select
          [ngModel]="sortBy"
          name="sidebarSortBy"
          (ngModelChange)="onSortByChange($event)"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
        >
          <option *ngFor="let option of sortOptions; trackBy: trackBySortOption" [value]="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="block">
          <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Min price</span>
          <input
            [ngModel]="minPrice"
            name="minPrice"
            (ngModelChange)="onMinPriceChange($event)"
            type="number"
            min="0"
            placeholder="0"
            class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
          />
        </label>

        <label class="block">
          <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Max price</span>
          <input
            [ngModel]="maxPrice"
            name="maxPrice"
            (ngModelChange)="onMaxPriceChange($event)"
            type="number"
            min="0"
            placeholder="Any"
            class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
          />
        </label>
      </div>

      <label class="block">
        <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Availability</span>
        <select
          [ngModel]="availabilityFilter"
          name="availabilityFilter"
          (ngModelChange)="onAvailabilityFilterChange($event)"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
        >
          <option *ngFor="let option of availabilityOptions; trackBy: trackByFilterOption" [value]="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Minimum rating</span>
        <select
          [ngModel]="ratingFilter"
          name="ratingFilter"
          (ngModelChange)="onRatingFilterChange($event)"
          class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
        >
          <option *ngFor="let option of ratingOptions; trackBy: trackByFilterOption" [value]="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>
  `
})
export class CatalogFilterFormComponent {
  @Input() selectedCategorySlug = 'all';
  @Input() selectedBrand = 'all';
  @Input() sortBy = 'relevance';
  @Input() minPrice = '';
  @Input() maxPrice = '';
  @Input() availabilityFilter = 'all';
  @Input() ratingFilter = 'all';
  @Input() sidebarCategories: CustomerLandingCategory[] = [];
  @Input() brandOptions: string[] = [];
  @Input() sortOptions: Array<{ value: string; label: string }> = [];
  @Input() availabilityOptions: Array<{ value: string; label: string }> = [];
  @Input() ratingOptions: Array<{ value: string; label: string }> = [];

  @Output() selectedCategorySlugChange = new EventEmitter<string>();
  @Output() selectedBrandChange = new EventEmitter<string>();
  @Output() sortByChange = new EventEmitter<string>();
  @Output() minPriceChange = new EventEmitter<string>();
  @Output() maxPriceChange = new EventEmitter<string>();
  @Output() availabilityFilterChange = new EventEmitter<string>();
  @Output() ratingFilterChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<void>();

  onSelectedCategorySlugChange(value: string): void {
    this.selectedCategorySlugChange.emit(value);
    this.filterChange.emit();
  }

  onSelectedBrandChange(value: string): void {
    this.selectedBrandChange.emit(value);
    this.filterChange.emit();
  }

  onSortByChange(value: string): void {
    this.sortByChange.emit(value);
    this.filterChange.emit();
  }

  onMinPriceChange(value: string): void {
    this.minPriceChange.emit(value);
    this.filterChange.emit();
  }

  onMaxPriceChange(value: string): void {
    this.maxPriceChange.emit(value);
    this.filterChange.emit();
  }

  onAvailabilityFilterChange(value: string): void {
    this.availabilityFilterChange.emit(value);
    this.filterChange.emit();
  }

  onRatingFilterChange(value: string): void {
    this.ratingFilterChange.emit(value);
    this.filterChange.emit();
  }

  trackByCategoryId(_: number, category: CustomerLandingCategory): string {
    return category._id;
  }

  trackByValue(_: number, value: string): string {
    return value;
  }

  trackBySortOption(_: number, option: { value: string; label: string }): string {
    return option.value;
  }

  trackByFilterOption(_: number, option: { value: string; label: string }): string {
    return option.value;
  }

  categoryLabel(category: CustomerLandingCategory): string {
    const level = Number(category.level || 0);
    const indent = level > 0 ? `${'  '.repeat(level)}- ` : '';
    return `${indent}${category.name}`;
  }
}
