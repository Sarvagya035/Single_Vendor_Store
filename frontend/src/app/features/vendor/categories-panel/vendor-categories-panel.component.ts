import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryRecord } from '../../../core/models/store.models';

interface CategoryFlatOption {
  _id: string;
  name: string;
  level: number;
}

interface CategoryCreateForm {
  name: string;
  description: string;
  parentCategory: string;
}

@Component({
  selector: 'app-vendor-categories-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="app-page-eyebrow">Category Management</p>
              <h3 class="app-page-title !text-[1.8rem] md:!text-[2.2rem]">Category Tree</h3>
              <p class="app-page-description !mt-2 !max-w-2xl">
                Manage your category hierarchy. Click the arrow to expand/collapse subcategories.
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <button type="button" (click)="toggleCreateForm()" class="btn-secondary w-full !px-5 !py-3 sm:w-auto">
                {{ showCreateForm ? 'Close Form' : 'Add Category' }}
              </button>
              <button type="button" (click)="refresh.emit()" [disabled]="isLoading" class="btn-secondary w-full !py-3 sm:w-auto">
                {{ isLoading ? 'Refreshing...' : 'Refresh Categories' }}
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="showCreateForm" class="border-b border-slate-200 bg-[#fffaf4] px-6 py-5">
          <form class="grid gap-4 lg:grid-cols-2" (ngSubmit)="submitCreateForm()">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category Name</label>
              <input
                type="text"
                name="name"
                [(ngModel)]="localCreateForm.name"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Electronics"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Description</label>
              <textarea
                rows="3"
                name="description"
                [(ngModel)]="localCreateForm.description"
                class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Short category description"
              ></textarea>
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Parent Category</label>
              <select
                name="parentCategory"
                [(ngModel)]="localCreateForm.parentCategory"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              >
                <option value="">Root Category</option>
                <option *ngFor="let option of flattenedCategories; trackBy: trackByOptionId" [value]="option._id">
                  {{ optionLabel(option) }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category Image</label>
              <input
                type="file"
                accept="image/*"
                class="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600"
                (change)="selectCreateImage.emit($event)"
              >
              <p class="text-xs font-semibold text-slate-500">
                {{ createImageName || 'Select an image for the category.' }}
              </p>
            </div>

            <div *ngIf="createError" class="lg:col-span-2 text-sm font-semibold text-rose-600">{{ createError }}</div>

            <div class="lg:col-span-2">
              <button type="submit" [disabled]="isCreating" class="btn-primary !px-5 !py-3">
                {{ isCreating ? 'Creating Category...' : 'Save Category' }}
              </button>
            </div>
          </form>
        </div>

        <div *ngIf="isLoading" class="px-6 py-16">
          <div class="flex flex-col items-center gap-4">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
            <p class="font-medium text-slate-500">Loading categories...</p>
          </div>
        </div>

        <div *ngIf="!isLoading && categories.length === 0" class="mx-6 my-6 rounded-[1.6rem] border border-slate-200 bg-white px-8 py-20 text-center shadow-[0_10px_30px_rgba(47,27,20,0.04)]">
          <h3 class="vendor-empty-title">No Categories Yet</h3>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
            Categories from your backend will appear here once they are created.
          </p>
        </div>

        <div *ngIf="!isLoading && categories.length > 0" class="divide-y divide-slate-200">
          <ng-container *ngFor="let category of categories; trackBy: trackByCategoryId">
            <ng-container *ngTemplateOutlet="categoryNode; context: { $implicit: category }"></ng-container>
          </ng-container>
        </div>
      </div>

      <ng-template #categoryNode let-category>
        <div class="group">
          <div
            class="flex items-center gap-3 px-6 py-5 transition hover:bg-[#fffaf4]"
            [style.padding-left.px]="24 + ((category.level || 0) * 36)"
          >
            <button
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8a5f44] transition hover:bg-[#f5ede5]"
              (click)="toggleExpanded(category); $event.stopPropagation()"
              [disabled]="!category.children?.length"
              aria-label="Toggle subcategories"
            >
              <svg *ngIf="category.children?.length" class="h-4 w-4 transition-transform" [class.rotate-90]="isExpanded(category._id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
              <span *ngIf="!category.children?.length" class="h-4 w-4"></span>
            </button>

            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5ede5] text-[#7c5646]">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 6h5v5H4z" />
                <path d="M15 6h5v5h-5z" />
                <path d="M9 13h6v5H9z" />
                <path d="M6.5 11V9.5h11V11" />
                <path d="M12 11v2" />
              </svg>
            </div>

            <div class="min-w-0 flex-1">
              <div class="text-lg font-black text-slate-900">
                {{ category.name }}
              </div>
            </div>

            <span
              class="inline-flex rounded-full px-3 py-1 text-xs font-black"
              [ngClass]="category.isActive === false ? 'bg-[#f2ebe7] text-[#8c6c5d]' : 'bg-emerald-100 text-emerald-700'"
            >
              {{ category.isActive === false ? 'Inactive' : 'Active' }}
            </span>

            <div class="flex items-center gap-2 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100" (click)="$event.stopPropagation()">
              <button
                type="button"
                (click)="toggleEdit(category)"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#7c5646] transition hover:border-[#d8c4b0] hover:bg-[#fffaf4]"
                [attr.aria-label]="editingId === category._id ? 'Close edit' : 'Edit category'"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 20h4l10-10a1.5 1.5 0 0 0-4-4L4 16v4Z" />
                  <path d="M13.5 6.5l4 4" />
                </svg>
              </button>
              <button
                type="button"
                (click)="deleteCategory.emit(category)"
                [disabled]="category._processing"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-500 transition hover:bg-rose-50"
                aria-label="Delete category"
              >
                <svg *ngIf="!category._processing" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 7h16" />
                  <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
                  <path d="M8 7h8l-.7 12.2A1.5 1.5 0 0 1 13.8 20h-3.6a1.5 1.5 0 0 1-1.5-1.8L8 7Z" />
                  <path d="M10.5 10v6" />
                  <path d="M13.5 10v6" />
                </svg>
                <svg *ngIf="category._processing" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-3.2-6.9" />
                </svg>
              </button>
            </div>
          </div>

          <div *ngIf="editingId === category._id" class="mx-6 my-4 rounded-[1.5rem] border border-slate-200 bg-[#fffaf4] px-6 py-5" [style.padding-left.px]="24 + ((category.level || 0) * 36)">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2 md:col-span-1">
                <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category Name</label>
                <input
                  type="text"
                  [ngModel]="editForm.name"
                  (ngModelChange)="updateEditField('name', $event)"
                  class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                >
              </div>

              <div class="space-y-2 md:col-span-1">
                <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Parent Category</label>
                <select
                  [ngModel]="editForm.parentCategory"
                  (ngModelChange)="updateEditField('parentCategory', $event)"
                  class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                >
                  <option value="">Root Category</option>
                  <option *ngFor="let option of flattenedCategories" [value]="option._id" [disabled]="option._id === category._id">
                    {{ optionLabel(option) }}
                  </option>
                </select>
              </div>

              <div class="space-y-2 md:col-span-2">
                <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Description</label>
                <textarea
                  rows="3"
                  [ngModel]="editForm.description"
                  (ngModelChange)="updateEditField('description', $event)"
                  class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                ></textarea>
              </div>
            </div>

            <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" [ngModel]="editForm.isActive" (ngModelChange)="updateEditField('isActive', $event)" class="h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-600">
                Active category
              </label>
              <button type="button" (click)="submitUpdate.emit({ categoryId: category._id, payload: editForm })" [disabled]="isUpdating" class="btn-primary !px-5 !py-2.5">
                {{ isUpdating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>

          <div *ngIf="isExpanded(category._id) && category.children?.length" class="app-card-soft border-t border-slate-200 bg-slate-50/40">
            <ng-container *ngFor="let child of category.children; trackBy: trackByCategoryId">
              <ng-container *ngTemplateOutlet="categoryNode; context: { $implicit: child }"></ng-container>
            </ng-container>
          </div>
        </div>
      </ng-template>
    </section>
  `
})
export class VendorCategoriesPanelComponent {
  @Input() categories: CategoryRecord[] = [];
  @Input() isLoading = false;
  @Input() isCreating = false;
  @Input() isUpdating = false;
  @Input() createError = '';
  @Input() createImageName = '';
  @Input() createForm: CategoryCreateForm = { name: '', description: '', parentCategory: '' };
  @Output() selectCreateImage = new EventEmitter<Event>();
  @Output() submitCreate = new EventEmitter<CategoryCreateForm>();
  @Output() submitUpdate = new EventEmitter<{ categoryId: string; payload: { name: string; description: string; parentCategory: string; isActive: boolean } }>();
  @Output() deleteCategory = new EventEmitter<CategoryRecord>();
  @Output() refresh = new EventEmitter<void>();

  showCreateForm = false;
  editingId: string | null = null;
  expandedCategoryIds = new Set<string>();
  localCreateForm: CategoryCreateForm = { name: '', description: '', parentCategory: '' };
  editForm = {
    name: '',
    description: '',
    parentCategory: '',
    isActive: true
  };
  private cachedFlattenedCategories: CategoryFlatOption[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['createForm']) {
      this.localCreateForm = { ...(this.createForm || { name: '', description: '', parentCategory: '' }) };
    }

    if (changes['categories']) {
      const flat: CategoryFlatOption[] = [];
      this.flattenTree(this.categories, flat);
      this.cachedFlattenedCategories = flat;
    }
  }

  get flattenedCategories(): CategoryFlatOption[] {
    return this.cachedFlattenedCategories;
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  updateEditField(field: 'name' | 'description' | 'parentCategory' | 'isActive', value: string | boolean) {
    this.editForm = { ...this.editForm, [field]: value };
  }

  submitCreateForm(): void {
    this.submitCreate.emit({ ...this.localCreateForm });
  }

  toggleEdit(category: CategoryRecord) {
    if (this.editingId === category._id) {
      this.editingId = null;
      return;
    }

    this.editingId = category._id;
    this.editForm = {
      name: category.name || '',
      description: category.description || '',
      parentCategory: category.parentCategory || '',
      isActive: category.isActive ?? true
    };
  }

  toggleExpanded(category: CategoryRecord) {
    if (!category.children?.length) {
      return;
    }

    if (this.expandedCategoryIds.has(category._id)) {
      this.expandedCategoryIds.delete(category._id);
      return;
    }

    this.expandedCategoryIds.add(category._id);
  }

  isExpanded(categoryId: string): boolean {
    return this.expandedCategoryIds.has(categoryId);
  }

  optionLabel(option: CategoryFlatOption): string {
    return `${'-- '.repeat(option.level)}${option.name}`;
  }

  trackByCategoryId(_: number, category: CategoryRecord): string {
    return category._id;
  }

  trackByOptionId(_: number, option: CategoryFlatOption): string {
    return option._id;
  }

  private flattenTree(nodes: CategoryRecord[], target: CategoryFlatOption[]) {
    for (const node of nodes) {
      target.push({
        _id: node._id,
        name: node.name,
        level: node.level || 0
      });

      if (node.children?.length) {
        this.flattenTree(node.children, target);
      }
    }
  }
}

