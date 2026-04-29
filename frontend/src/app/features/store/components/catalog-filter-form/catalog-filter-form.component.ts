import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerLandingCategory } from '../../../../core/models/customer.models';

@Component({
  selector: 'app-catalog-filter-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .price-range {
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      outline: none;
    }

    .price-range::-webkit-slider-runnable-track {
      background: transparent;
      border: none;
      height: 100%;
    }

    .price-range::-moz-range-track {
      background: transparent;
      border: none;
      height: 100%;
    }

    .price-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      border: 1px solid #d1d5db;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
      cursor: pointer;
      margin-top: -6px;
    }

    .price-range::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      border: 1px solid #d1d5db;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
      cursor: pointer;
    }

    .price-range:disabled::-webkit-slider-thumb,
    .price-range:disabled::-moz-range-thumb {
      cursor: not-allowed;
    }
  `],
  template: `
    <div class="space-y-4">
      <section *ngIf="selectedFilterChips().length" class="border-b border-slate-200 pb-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Selected filters</p>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <button
            *ngFor="let chip of selectedFilterChips(); trackBy: trackByChip"
            type="button"
            class="inline-flex items-center gap-1 rounded-md bg-[#e8e2da] px-2.5 py-1.5 text-xs text-slate-700 transition hover:bg-[#ddd5ca]"
            (click)="removeChip(chip)"
          >
            <span class="text-slate-500">×</span>
            <span>{{ chip.label }}</span>
          </button>
        </div>
      </section>

      <section class="border-b border-slate-200 pb-4">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 text-left"
          [attr.aria-expanded]="categoryExpanded"
          (click)="toggleCategorySection()"
        >
          <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            CATEGORY
            <span *ngIf="selectedCategoryIds.length" class="text-xs font-semibold text-[#8a4f2a]">
              ({{ selectedCategoryIds.length }})
            </span>
          </span>
          <svg
            class="h-4 w-4 text-slate-400 transition-transform duration-200"
            [class.rotate-180]="categoryExpanded"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div *ngIf="categoryExpanded" class="mt-3 space-y-3">
          <input
            [(ngModel)]="categorySearch"
            name="categorySearch"
            type="text"
            placeholder="Search Category"
            class="w-full border-b border-slate-300 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-amber-400"
          />

          <div class="max-h-56 space-y-0.5 overflow-y-auto pr-1">
            <label class="flex items-center gap-2 py-1.5 text-sm text-slate-800">
              <input
                type="checkbox"
                class="h-4 w-4 rounded-[2px] border border-slate-300 accent-[#8a4f2a]"
                [checked]="isAllCategoriesSelected()"
                (change)="clearCategorySelections()"
              />
              <span>All categories</span>
            </label>

            <label *ngFor="let category of filteredSidebarCategories(); trackBy: trackByCategoryId" class="flex items-center gap-2 py-1.5 text-sm text-slate-800">
              <input
                type="checkbox"
                class="h-4 w-4 rounded-[2px] border border-slate-300 accent-[#8a4f2a]"
                [checked]="isCategorySelected(category)"
                (change)="toggleCategorySelection(category.slug || category.name)"
              />
              <span>{{ categoryLabel(category) }}</span>
            </label>
          </div>
        </div>
      </section>

      <section class="border-b border-slate-200 pb-4">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 text-left"
          [attr.aria-expanded]="brandExpanded"
          (click)="toggleBrandSection()"
        >
          <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            BRAND
            <span *ngIf="selectedBrandIds.length" class="text-xs font-semibold text-[#8a4f2a]">
              ({{ selectedBrandIds.length }})
            </span>
          </span>
          <svg
            class="h-4 w-4 text-slate-400 transition-transform duration-200"
            [class.rotate-180]="brandExpanded"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div *ngIf="brandExpanded" class="mt-3 space-y-3">
          <input
            [(ngModel)]="brandSearch"
            name="brandSearch"
            type="text"
            placeholder="Search Brand"
            class="w-full border-b border-slate-300 bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-amber-400"
          />

          <div class="max-h-56 space-y-0.5 overflow-y-auto pr-1">
            <label class="flex items-center gap-2 py-1.5 text-sm text-slate-800">
              <input
                type="checkbox"
                class="h-4 w-4 rounded-[2px] border border-slate-300 accent-[#8a4f2a]"
                [checked]="isAllBrandsSelected()"
                (change)="clearBrandSelections()"
              />
              <span>All brands</span>
            </label>

            <label *ngFor="let brand of filteredBrandOptions(); trackBy: trackByValue" class="flex items-center gap-2 py-1.5 text-sm text-slate-800">
              <input
                type="checkbox"
                class="h-4 w-4 rounded-[2px] border border-slate-300 accent-[#8a4f2a]"
                [checked]="isBrandSelected(brand)"
                (change)="toggleBrandSelection(brand)"
              />
              <span>{{ brand }}</span>
            </label>
          </div>
        </div>
      </section>

      <section class="border-b border-slate-200 pb-4">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 text-left"
          [attr.aria-expanded]="sortExpanded"
          (click)="toggleSortSection()"
        >
          <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">SORT BY</span>
          <svg
            class="h-4 w-4 text-slate-400 transition-transform duration-200"
            [class.rotate-180]="sortExpanded"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div *ngIf="sortExpanded" class="mt-3 space-y-2">
          <label
            *ngFor="let option of sortOptions; trackBy: trackBySortOption"
            class="flex items-center gap-2 py-1.5 text-sm text-slate-700"
            [class.font-medium]="sortBy === option.value"
            [class.text-[#8a4f2a]]="sortBy === option.value"
          >
            <input
              type="radio"
              class="h-4 w-4 border-slate-300 accent-[#8a4f2a]"
              name="sortByOptions"
              [checked]="sortBy === option.value"
              (change)="selectSortOption(option.value)"
            />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </section>

      <section class="border-b border-slate-200 pb-4">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">PRICE</span>
          <button
            type="button"
            class="text-xs font-semibold uppercase tracking-wide text-blue-600 transition hover:text-blue-700"
            (click)="clearPriceFilter()"
          >
            Clear
          </button>
        </div>

        <div class="mt-3 space-y-4">
          <div class="space-y-2">
            <div class="flex items-end gap-1.5">
              <div class="flex-1 space-y-1.5">
                <div class="grid grid-cols-12 gap-1">
                  <span *ngFor="let bar of priceHistogramBars" [class]="bar"></span>
                </div>
                <div class="relative h-8">
                  <div class="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200"></div>
                  <div class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-amber-400" [ngStyle]="priceTrackFillStyle()"></div>
                  <input
                    type="range"
                    class="price-range absolute inset-0 z-20 h-8 w-full"
                    min="0"
                    max="1500"
                    step="50"
                    [ngModel]="priceMinValue()"
                    (ngModelChange)="onPriceMinRangeChange($event)"
                    aria-label="Minimum price range"
                  />
                  <input
                    type="range"
                    class="price-range absolute inset-0 z-30 h-8 w-full"
                    min="0"
                    max="1500"
                    step="50"
                    [ngModel]="priceMaxValue()"
                    (ngModelChange)="onPriceMaxRangeChange($event)"
                    aria-label="Maximum price range"
                  />
                </div>
                <div class="flex justify-between px-1">
                  <span *ngFor="let _ of priceTickMarks" class="h-1 w-1 rounded-full bg-slate-300"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <div class="relative w-full">
              <select
                [ngModel]="minPrice"
                name="minPrice"
                (ngModelChange)="onMinPriceChange($event)"
                class="h-8 w-full appearance-none rounded-sm border border-slate-300 bg-white px-2 text-xs sm:text-sm text-slate-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                <option *ngFor="let option of priceMinOptions; trackBy: trackByFilterOption" [value]="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <span class="px-1 text-sm font-medium text-slate-500">to</span>

            <div class="relative w-full">
              <select
                [ngModel]="maxPrice"
                name="maxPrice"
                (ngModelChange)="onMaxPriceChange($event)"
                class="h-8 w-full appearance-none rounded-sm border border-slate-300 bg-white px-2 text-xs sm:text-sm text-slate-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              >
                <option *ngFor="let option of priceMaxOptions; trackBy: trackByFilterOption" [value]="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="border-b border-slate-200 pb-4">
        <button
          type="button"
          class="flex w-full items-center justify-between gap-3 text-left"
          [attr.aria-expanded]="ratingExpanded"
          (click)="toggleRatingSection()"
        >
          <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">CUSTOMER RATING</span>
          <svg
            class="h-4 w-4 text-slate-400 transition-transform duration-200"
            [class.rotate-180]="ratingExpanded"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div *ngIf="ratingExpanded" class="mt-3 space-y-2">
          <label
            *ngFor="let option of ratingOptions; trackBy: trackByFilterOption"
            class="flex items-center gap-2 py-1.5 text-sm text-slate-700"
            [class.font-medium]="ratingFilter === option.value"
            [class.text-[#8a4f2a]]="ratingFilter === option.value"
          >
            <input
              type="radio"
              class="h-4 w-4 border-slate-300 accent-[#8a4f2a]"
              name="ratingOptions"
              [checked]="ratingFilter === option.value"
              (change)="selectRatingOption(option.value)"
            />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </section>
    </div>
  `
})
export class CatalogFilterFormComponent {
  @Input() selectedCategorySlug = 'all';
  @Input() selectedBrand = 'all';
  @Input() sortBy = 'relevance';
  @Input() minPrice = '';
  @Input() maxPrice = '';
  @Input() ratingFilter = 'all';
  @Input() selectedCategoryIds: string[] = [];
  @Input() selectedBrandIds: string[] = [];
  @Input() set resetToken(value: number) {
    if (value !== this._resetToken) {
      this._resetToken = value;
      this.categorySearch = '';
      this.brandSearch = '';
    }
  }
  @Input() sidebarCategories: CustomerLandingCategory[] = [];
  @Input() brandOptions: string[] = [];
  @Input() sortOptions: Array<{ value: string; label: string }> = [];
  @Input() ratingOptions: Array<{ value: string; label: string }> = [];
  readonly priceMinOptions = [
    { value: '', label: 'Min' },
    { value: '250', label: '₹250' },
    { value: '500', label: '₹500' },
    { value: '1000', label: '₹1000' },
    { value: '1500', label: '₹1500+' }
  ];
  readonly priceMaxOptions = [
    { value: '', label: '₹1500+' },
    { value: '250', label: '₹250' },
    { value: '500', label: '₹500' },
    { value: '1000', label: '₹1000' },
    { value: '1500', label: '₹1500+' }
  ];
  readonly priceSteps = [0, 250, 500, 1000, 1500];
  readonly priceHistogramBars = [
    'h-3 w-full rounded-sm bg-slate-300/70',
    'h-4 w-full rounded-sm bg-slate-300/70',
    'h-5 w-full rounded-sm bg-slate-300/70',
    'h-3 w-full rounded-sm bg-slate-300/70',
    'h-6 w-full rounded-sm bg-slate-300/70',
    'h-4 w-full rounded-sm bg-slate-300/70',
    'h-5 w-full rounded-sm bg-slate-300/70',
    'h-3 w-full rounded-sm bg-slate-300/70',
    'h-4 w-full rounded-sm bg-slate-300/70',
    'h-5 w-full rounded-sm bg-slate-300/70',
    'h-3 w-full rounded-sm bg-slate-300/70',
    'h-4 w-full rounded-sm bg-slate-300/70'
  ];
  readonly priceTickMarks = Array.from({ length: 5 });

  private _resetToken = 0;
  categoryExpanded = true;
  brandExpanded = true;
  sortExpanded = true;
  ratingExpanded = true;
  categorySearch = '';
  brandSearch = '';

  @Output() selectedCategoryIdsChange = new EventEmitter<string[]>();
  @Output() selectedBrandIdsChange = new EventEmitter<string[]>();
  @Output() sortByChange = new EventEmitter<string>();
  @Output() minPriceChange = new EventEmitter<string>();
  @Output() maxPriceChange = new EventEmitter<string>();
  @Output() ratingFilterChange = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<void>();

  onSortByChange(value: string): void {
    this.sortByChange.emit(value);
    this.filterChange.emit();
  }

  selectSortOption(value: string): void {
    this.sortByChange.emit(value);
    this.sortExpanded = false;
    this.filterChange.emit();
  }

  onMinPriceChange(value: string): void {
    const nextMin = this.normalizePriceValue(value, 0);
    const currentMax = this.priceMaxValue();

    if (nextMin > currentMax) {
      const fixedMax = nextMin >= 1500 ? '' : String(nextMin);
      this.maxPrice = fixedMax;
      this.maxPriceChange.emit(fixedMax);
    }

    const minValue = nextMin <= 0 ? '' : String(nextMin);
    this.minPrice = minValue;
    this.minPriceChange.emit(minValue);
    this.filterChange.emit();
  }

  onMaxPriceChange(value: string): void {
    const nextMax = this.normalizePriceValue(value, 1500);
    const currentMin = this.priceMinValue();

    if (nextMax < currentMin) {
      const fixedMin = nextMax <= 0 ? '' : String(nextMax);
      this.minPrice = fixedMin;
      this.minPriceChange.emit(fixedMin);
    }

    const maxValue = nextMax >= 1500 ? '' : String(nextMax);
    this.maxPrice = maxValue;
    this.maxPriceChange.emit(maxValue);
    this.filterChange.emit();
  }

  onRatingFilterChange(value: string): void {
    this.ratingFilterChange.emit(value);
    this.filterChange.emit();
  }

  priceMinValue(): number {
    return this.normalizePriceValue(this.minPrice, 0);
  }

  priceMaxValue(): number {
    const value = this.normalizePriceValue(this.maxPrice, 1500);
    return value < this.priceMinValue() ? this.priceMinValue() : value;
  }

  onPriceMinRangeChange(value: string | number): void {
    const nextMin = this.normalizePriceValue(String(value), 0);
    const nextMax = this.priceMaxValue();
    const boundedMin = Math.min(nextMin, nextMax);

    if (nextMin > nextMax) {
      const fixedMax = boundedMin >= 1500 ? '' : String(boundedMin);
      this.maxPrice = fixedMax;
      this.maxPriceChange.emit(fixedMax);
    }

    const minValue = boundedMin <= 0 ? '' : String(boundedMin);
    this.minPrice = minValue;
    this.minPriceChange.emit(minValue);
    this.filterChange.emit();
  }

  onPriceMaxRangeChange(value: string | number): void {
    const nextMax = this.normalizePriceValue(String(value), 1500);
    const nextMin = this.priceMinValue();
    const boundedMax = Math.max(nextMax, nextMin);

    if (nextMax < nextMin) {
      const fixedMin = boundedMax <= 0 ? '' : String(boundedMax);
      this.minPrice = fixedMin;
      this.minPriceChange.emit(fixedMin);
    }

    const maxValue = boundedMax >= 1500 ? '' : String(boundedMax);
    this.maxPrice = maxValue;
    this.maxPriceChange.emit(maxValue);
    this.filterChange.emit();
  }

  selectRatingOption(value: string): void {
    this.ratingFilterChange.emit(value);
    this.ratingExpanded = false;
    this.filterChange.emit();
  }

  clearPriceFilter(): void {
    this.minPrice = '';
    this.maxPrice = '';
    this.minPriceChange.emit('');
    this.maxPriceChange.emit('');
    this.filterChange.emit();
  }

  toggleCategorySection(): void {
    this.categoryExpanded = !this.categoryExpanded;
  }

  toggleBrandSection(): void {
    this.brandExpanded = !this.brandExpanded;
  }

  toggleSortSection(): void {
    this.sortExpanded = !this.sortExpanded;
  }

  toggleRatingSection(): void {
    this.ratingExpanded = !this.ratingExpanded;
  }

  toggleCategorySelection(value: string): void {
    const normalizedValue = this.normalizeFilterValue(value);
    if (!normalizedValue) {
      return;
    }

    const current = this.selectedCategoryIds.map((item) => this.normalizeFilterValue(item)).filter(Boolean);
    const index = current.indexOf(normalizedValue);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(normalizedValue);
    }

    this.selectedCategoryIdsChange.emit(current);
    this.filterChange.emit();
  }

  clearCategorySelections(): void {
    this.selectedCategoryIdsChange.emit([]);
    this.filterChange.emit();
  }

  toggleBrandSelection(value: string): void {
    const normalizedValue = this.normalizeFilterValue(value);
    if (!normalizedValue) {
      return;
    }

    const current = this.selectedBrandIds.map((item) => this.normalizeFilterValue(item)).filter(Boolean);
    const index = current.indexOf(normalizedValue);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(normalizedValue);
    }

    this.selectedBrandIdsChange.emit(current);
    this.filterChange.emit();
  }

  clearBrandSelections(): void {
    this.selectedBrandIdsChange.emit([]);
    this.filterChange.emit();
  }

  clearAllFilters(): void {
    this.categorySearch = '';
    this.brandSearch = '';
    this.clearAll.emit();
  }

  removeChip(chip: CatalogFilterChip): void {
    const chipValue = this.normalizeFilterValue(chip.value || '');

    switch (chip.kind) {
      case 'category':
        this.selectedCategoryIdsChange.emit(
          this.selectedCategoryIds.filter((value) => this.normalizeFilterValue(value) !== chipValue)
        );
        this.filterChange.emit();
        return;
      case 'brand':
        this.selectedBrandIdsChange.emit(
          this.selectedBrandIds.filter((value) => this.normalizeFilterValue(value) !== chipValue)
        );
        this.filterChange.emit();
        return;
      case 'sort':
        this.sortByChange.emit('relevance');
        this.filterChange.emit();
        return;
      case 'rating':
        this.ratingFilterChange.emit('all');
        this.filterChange.emit();
        return;
      case 'price':
        this.minPriceChange.emit('');
        this.maxPriceChange.emit('');
        this.filterChange.emit();
        return;
    }
  }

  isAllCategoriesSelected(): boolean {
    return this.selectedCategoryIds.length === 0;
  }

  isAllBrandsSelected(): boolean {
    return this.selectedBrandIds.length === 0;
  }

  isCategorySelected(category: CustomerLandingCategory): boolean {
    const value = this.normalizeFilterValue(category.slug || category.name);
    return this.selectedCategoryIds.map((item) => this.normalizeFilterValue(item)).includes(value);
  }

  isBrandSelected(brand: string): boolean {
    return this.selectedBrandIds.map((item) => this.normalizeFilterValue(item)).includes(this.normalizeFilterValue(brand));
  }

  filteredSidebarCategories(): CustomerLandingCategory[] {
    const query = this.normalizeFilterValue(this.categorySearch);
    if (!query) {
      return this.sidebarCategories;
    }

    return this.sidebarCategories.filter((category) => {
      const label = this.normalizeFilterValue(this.categoryLabel(category));
      const name = this.normalizeFilterValue(category.name);
      const slug = this.normalizeFilterValue(category.slug || '');
      return label.includes(query) || name.includes(query) || slug.includes(query);
    });
  }

  filteredBrandOptions(): string[] {
    const query = this.normalizeFilterValue(this.brandSearch);
    if (!query) {
      return this.brandOptions;
    }

    return this.brandOptions.filter((brand) => this.normalizeFilterValue(brand).includes(query));
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

  trackByChip(_: number, chip: CatalogFilterChip): string {
    return `${chip.kind}:${chip.value || chip.label}`;
  }

  selectedFilterChips(): CatalogFilterChip[] {
    const chips: CatalogFilterChip[] = [];

    this.selectedCategoryIds.forEach((categoryValue) => {
      chips.push({
        kind: 'category',
        value: categoryValue,
        label: this.categoryChipLabel(categoryValue)
      });
    });

    this.selectedBrandIds.forEach((brandValue) => {
      chips.push({
        kind: 'brand',
        value: brandValue,
        label: this.brandChipLabel(brandValue)
      });
    });

    if (this.sortBy !== 'relevance') {
      chips.push({
        kind: 'sort',
        value: this.sortBy,
        label: this.sortChipLabel(this.sortBy)
      });
    }

    if (this.minPrice !== '' || this.maxPrice !== '') {
      chips.push({
        kind: 'price',
        label: this.priceChipLabel()
      });
    }

    if (this.ratingFilter !== 'all') {
      chips.push({
        kind: 'rating',
        value: this.ratingFilter,
        label: this.ratingChipLabel(this.ratingFilter)
      });
    }

    return chips;
  }

  private normalizeFilterValue(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private normalizePriceValue(value: string, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.min(1500, Math.max(0, Math.round(parsed)));
  }

  private categoryChipLabel(value: string): string {
    const normalized = this.normalizeFilterValue(value);
    const match = this.sidebarCategories.find((category) =>
      [category.slug, category.name].some((candidate) => this.normalizeFilterValue(String(candidate || '')) === normalized)
    );

    if (!match) {
      return value;
    }

    return this.categoryLabel(match).replace(/^\s+/, '').replace(/^-+\s*/, '');
  }

  private brandChipLabel(value: string): string {
    const normalized = this.normalizeFilterValue(value);
    return this.brandOptions.find((brand) => this.normalizeFilterValue(brand) === normalized) || value;
  }

  private sortChipLabel(value: string): string {
    return this.sortOptions.find((option) => option.value === value)?.label || value;
  }

  private ratingChipLabel(value: string): string {
    return this.ratingOptions.find((option) => option.value === value)?.label || value;
  }

  private priceChipLabel(): string {
    const minLabel = this.priceLabel(this.minPrice, 'Min');
    const maxLabel = this.priceLabel(this.maxPrice, '₹1500+');

    if (this.minPrice && this.maxPrice) {
      return `${minLabel} to ${maxLabel}`;
    }

    if (this.minPrice) {
      return `Price: ${minLabel}+`;
    }

    return `Price: Up to ${maxLabel}`;
  }

  private priceLabel(value: string, fallback: string): string {
    const match = [...this.priceMinOptions, ...this.priceMaxOptions].find((option) => option.value === value);
    return match?.label || fallback;
  }

  priceTrackStart(): number {
    return this.priceValueToPercent(this.minPrice, 0);
  }

  priceTrackEnd(): number {
    const end = this.priceValueToPercent(this.maxPrice, 100);
    return Math.max(end, this.priceTrackStart());
  }

  priceTrackFillStyle(): Record<string, string> {
    const start = this.priceTrackStart();
    const end = this.priceTrackEnd();

    return {
      left: `${start}%`,
      width: `${Math.max(0, end - start)}%`
    };
  }

  private priceValueToPercent(value: string, fallbackPercent: number): number {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return fallbackPercent;
    }

    const index = this.priceSteps.indexOf(parsedValue);
    if (index < 0) {
      return fallbackPercent;
    }

    if (this.priceSteps.length <= 1) {
      return fallbackPercent;
    }

    return (index / (this.priceSteps.length - 1)) * 100;
  }

  categoryLabel(category: CustomerLandingCategory): string {
    const level = Number(category.level || 0);
    const indent = level > 0 ? `${'  '.repeat(level)}- ` : '';
    return `${indent}${category.name}`;
  }
}

interface CatalogFilterChip {
  kind: 'category' | 'brand' | 'sort' | 'price' | 'rating';
  label: string;
  value?: string;
}
