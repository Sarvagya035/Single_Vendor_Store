import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import { ToastBannerComponent } from '../../../shared/ui/toast-banner.component';
import { VendorCategoriesPanelComponent } from '../categories-panel/vendor-categories-panel.component';
import { CategoryRecord } from '../../../core/models/store.models';
import { ToastType } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-categories-page',
  standalone: true,
  imports: [CommonModule, VendorCategoriesPanelComponent, PageHeaderComponent, ToastBannerComponent],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <app-page-header
            eyebrow="Vendor Category Management"
            title="Manage your store categories"
            titleClass="!text-[1.8rem] md:!text-[2.2rem]"
          />
        </div>

        <app-vendor-categories-panel
          [categories]="categories"
          [isLoading]="isCategorySyncing"
          [isCreating]="isCreatingCategory"
          [isUpdating]="isUpdatingCategory"
          [createForm]="categoryCreateForm"
          [createError]="categoryCreateError"
          [createImageName]="selectedCategoryImage?.name || ''"
          (selectCreateImage)="onCategoryImageSelected($event)"
          (submitCreate)="createCategory($event)"
          (submitUpdate)="updateCategory($event.categoryId, $event.payload)"
          (deleteCategory)="deleteCategory($event)"
          (refresh)="loadCategories()"
        />
      </div>

      <app-toast-banner [visible]="toast.visible" [message]="toast.message" [type]="toast.type" />
    </section>
  `,
})
export class VendorCategoriesPageComponent implements OnInit {
  categories: CategoryRecord[] = [];
  isCategorySyncing = false;
  isCreatingCategory = false;
  isUpdatingCategory = false;
  selectedCategoryImage: File | null = null;
  categoryCreateError = '';
  categoryCreateForm = {
    name: '',
    description: '',
    parentCategory: ''
  };

  toast = {
    visible: false,
    message: '',
    type: 'success' as ToastType
  };

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isCategorySyncing = true;

    this.vendorService.getCategoryTree().subscribe({
      next: (res) => {
        this.isCategorySyncing = false;
        this.categories = this.decorateCategories(res?.data || []);
      },
      error: (err) => {
        this.isCategorySyncing = false;
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.showToast(err.error?.message || 'Failed to load categories.', 'error');
      }
    });
  }

  onCategoryImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedCategoryImage = input.files?.[0] || null;
    this.categoryCreateError = '';
  }

  createCategory(form: { name: string; description: string; parentCategory: string }): void {
    if (!form.name.trim()) {
      this.categoryCreateError = 'Category name is required.';
      return;
    }

    if (!this.selectedCategoryImage) {
      this.categoryCreateError = 'Category image is required.';
      return;
    }

    const payload = new FormData();
    payload.append('name', form.name.trim());
    payload.append('description', form.description.trim());
    payload.append('image', this.selectedCategoryImage);
    if (form.parentCategory) {
      payload.append('parentCategory', form.parentCategory);
    }

    this.isCreatingCategory = true;
    this.categoryCreateError = '';

    this.vendorService.createCategory(payload).subscribe({
      next: (res) => {
        this.isCreatingCategory = false;
        if (!res?.success) {
          this.categoryCreateError = res?.message || 'Unable to create category.';
          return;
        }

        this.categoryCreateForm = {
          name: '',
          description: '',
          parentCategory: ''
        };
        this.selectedCategoryImage = null;
        this.showToast('Category created successfully.', 'success');
        this.loadCategories();
      },
      error: (err) => {
        this.isCreatingCategory = false;
        this.categoryCreateError = err.error?.message || 'Failed to create category.';
      }
    });
  }

  updateCategory(categoryId: string, payload: { name: string; description: string; parentCategory: string; isActive: boolean }): void {
    this.isUpdatingCategory = true;

    this.vendorService.updateCategory(categoryId, {
      name: payload.name.trim(),
      description: payload.description.trim(),
      parentCategory: payload.parentCategory || null,
      isActive: payload.isActive
    }).subscribe({
      next: (res) => {
        this.isUpdatingCategory = false;
        if (!res?.success) {
          this.showToast(res?.message || 'Unable to update category.', 'error');
          return;
        }

        this.showToast('Category updated successfully.', 'success');
        this.loadCategories();
      },
      error: (err) => {
        this.isUpdatingCategory = false;
        this.showToast(err.error?.message || 'Failed to update category.', 'error');
      }
    });
  }

  deleteCategory(category: CategoryRecord): void {
    category._processing = true;

    this.vendorService.deleteCategory(category._id).subscribe({
      next: (res) => {
        category._processing = false;
        if (!res?.success) {
          this.showToast(res?.message || 'Unable to delete category.', 'error');
          return;
        }

        this.showToast(`${category.name} deleted successfully.`, 'success');
        this.loadCategories();
      },
      error: (err) => {
        category._processing = false;
        this.showToast(err.error?.message || 'Failed to delete category.', 'error');
      }
    });
  }

  private decorateCategories(categories: CategoryRecord[] = []): CategoryRecord[] {
    return categories.map((category) => ({
      ...category,
      _processing: false,
      children: this.decorateCategories(category.children || [])
    }));
  }

  private showToast(message: string, type: ToastType): void {
    this.toast = { visible: true, message, type };
    setTimeout(() => {
      this.toast.visible = false;
    }, 3500);
  }
}
