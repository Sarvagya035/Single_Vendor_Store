import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
      <div class="app-card overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h3 class="mt-2 text-2xl font-black tracking-tight text-slate-900">Manage category tree</h3>
          </div>
          <div class="flex flex-wrap gap-3">
            <button type="button" (click)="toggleCreateForm()" class="btn-primary !px-5 !py-3">
              {{ showCreateForm ? 'Close Form' : 'Add Category' }}
            </button>
            <button type="button" (click)="refresh.emit()" [disabled]="isLoading" class="btn-secondary !py-3">
              {{ isLoading ? 'Refreshing...' : 'Refresh Categories' }}
            </button>
          </div>
        </div>

        <div *ngIf="showCreateForm" class="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
          <form class="grid gap-4 lg:grid-cols-2" (ngSubmit)="submitCreate.emit()">
            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category Name</label>
              <input
                type="text"
                name="name"
                [ngModel]="createForm.name"
                (ngModelChange)="updateCreateField('name', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Electronics"
              >
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Description</label>
              <textarea
                rows="3"
                name="description"
                [ngModel]="createForm.description"
                (ngModelChange)="updateCreateField('description', $event)"
                class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
                placeholder="Short category description"
              ></textarea>
            </div>

            <div class="space-y-2">
              <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Parent Category</label>
              <select
                name="parentCategory"
                [ngModel]="createForm.parentCategory"
                (ngModelChange)="updateCreateField('parentCategory', $event)"
                class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 shadow-inner transition-all focus:border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-100"
              >
                <option value="">Root Category</option>
                <option *ngFor="let option of flattenedCategories" [value]="option._id">
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

        <div *ngIf="!isLoading && categories.length === 0" class="app-card-soft mx-6 my-6 px-8 py-20 text-center">
          <h3 class="text-2xl font-black text-slate-900">No Categories Yet</h3>
          <p class="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
            Categories from your backend will appear here once they are created.
          </p>
        </div>

        <div *ngIf="!isLoading && categories.length > 0" class="divide-y divide-slate-200">
          <ng-container *ngFor="let category of categories">
            <ng-container *ngTemplateOutlet="categoryNode; context: { $implicit: category }"></ng-container>
          </ng-container>
        </div>
      </div>

      <ng-template #categoryNode let-category>
        <div class="group">
          <div
            class="flex cursor-pointer items-center gap-4 px-6 py-4 transition hover:bg-slate-50/80"
            [class.pl-6]="(category.level || 0) === 0"
            [style.padding-left.px]="24 + ((category.level || 0) * 36)"
            (click)="toggleExpanded(category)"
          >
            <div class="w-[180px] shrink-0 text-xl font-black tracking-tight text-slate-900">
              {{ category.name }}
            </div>

            <div class="min-w-0 flex-1 text-sm font-medium text-slate-500">
              <span *ngIf="category.children?.length; else noChildren">
                {{ isExpanded(category._id) ? 'Click to hide child categories' : 'Click to show child categories' }}
              </span>
              <ng-template #noChildren>
                <span>{{ category.slug }}</span>
              </ng-template>
            </div>

            <div class="flex items-center gap-2 opacity-0 transition group-hover:opacity-100" (click)="$event.stopPropagation()">
              <button type="button" (click)="toggleEdit(category)" class="btn-secondary !px-4 !py-2">
                {{ editingId === category._id ? 'Close' : 'Edit' }}
              </button>
              <button
                type="button"
                (click)="deleteCategory.emit(category)"
                [disabled]="category._processing"
                class="btn-secondary !border-rose-100 !px-4 !py-2 !text-rose-600 hover:!bg-rose-50"
              >
                {{ category._processing ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>

          <div *ngIf="editingId === category._id" class="app-card-soft mx-6 my-4 border-t border-slate-200 px-6 py-5" [style.padding-left.px]="24 + ((category.level || 0) * 36)">
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
            <ng-container *ngFor="let child of category.children">
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
  @Output() createFormChange = new EventEmitter<CategoryCreateForm>();
  @Output() selectCreateImage = new EventEmitter<Event>();
  @Output() submitCreate = new EventEmitter<void>();
  @Output() submitUpdate = new EventEmitter<{ categoryId: string; payload: { name: string; description: string; parentCategory: string; isActive: boolean } }>();
  @Output() deleteCategory = new EventEmitter<CategoryRecord>();
  @Output() refresh = new EventEmitter<void>();

  showCreateForm = false;
  editingId: string | null = null;
  expandedCategoryIds = new Set<string>();
  editForm = {
    name: '',
    description: '',
    parentCategory: '',
    isActive: true
  };

  get flattenedCategories(): CategoryFlatOption[] {
    const flat: CategoryFlatOption[] = [];
    this.flattenTree(this.categories, flat);
    return flat;
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  updateCreateField(field: keyof CategoryCreateForm, value: string) {
    this.createFormChange.emit({ ...this.createForm, [field]: value });
  }

  updateEditField(field: 'name' | 'description' | 'parentCategory' | 'isActive', value: string | boolean) {
    this.editForm = { ...this.editForm, [field]: value };
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

