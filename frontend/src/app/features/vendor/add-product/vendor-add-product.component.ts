import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import {
  VendorCategoryRecord,
  VendorProductOptionForm,
  VendorProductVariantForm
} from '../../../core/models/vendor.models';
import { VendorFormSectionComponent } from '../form-section/vendor-form-section.component';
import { VendorVariantEditorCardComponent } from '../variant-editor-card/vendor-variant-editor-card.component';
import { VendorVariantOptionRowComponent } from '../variant-option-row/vendor-variant-option-row.component';

interface FlatCategoryOption {
  _id: string;
  name: string;
  level: number;
}

@Component({
  selector: 'app-vendor-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorFormSectionComponent, VendorVariantEditorCardComponent, VendorVariantOptionRowComponent],
  template: `
    <div class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_28%,#f8fafc_100%)] pt-8 pb-12">
      <main class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 class="mt-3 text-4xl font-black tracking-tight text-slate-900">Add Product</h1>
          </div>

          <a routerLink="/vendor/dashboard" class="btn-secondary !py-3">
            Back to Dashboard
          </a>
        </div>

        <div *ngIf="isLoadingCategories" class="glass-card py-20">
          <div class="flex flex-col items-center gap-4">
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600"></div>
            <p class="font-medium text-slate-500">Loading categories...</p>
          </div>
        </div>

        <form *ngIf="!isLoadingCategories" class="space-y-8" (ngSubmit)="submitProduct()">
          <div class="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <app-vendor-form-section eyebrow="Core Product" title="Basic details">
              <div class="grid gap-5 md:grid-cols-2">
                <div class="space-y-2 md:col-span-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    [(ngModel)]="form.productName"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                    placeholder="Wireless Headphones Pro"
                  >
                </div>

                <div class="space-y-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    [(ngModel)]="form.brand"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                    placeholder="SoundSphere"
                  >
                </div>

                <div class="space-y-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</label>
                  <select
                    name="category"
                    [(ngModel)]="form.category"
                    class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner transition-all focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                  >
                    <option value="">Select category</option>
                    <option *ngFor="let option of flatCategories" [value]="option._id">
                      {{ optionLabel(option) }}
                    </option>
                  </select>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <label class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Description</label>
                  <textarea
                    rows="5"
                    name="productDescription"
                    [(ngModel)]="form.productDescription"
                    class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 font-medium text-slate-900 shadow-inner transition-all focus:border-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                    placeholder="Describe the product, features, materials, and buying value."
                  ></textarea>
                </div>
              </div>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Media" title="Main images">
              <div class="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600"
                  (change)="onMainImagesSelected($event)"
                >
                <div class="grid gap-3">
                  <div *ngFor="let file of mainImageFiles" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    {{ file.name }}
                  </div>
                </div>
                <p class="text-xs font-semibold text-slate-500">At least one main image is required by the backend.</p>
              </div>
            </app-vendor-form-section>
          </div>

          <app-vendor-form-section
            eyebrow="Variant Options"
            title="Option definitions"
            [hasAction]="true"
            headerLayout="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <button section-action type="button" (click)="addOption()" class="btn-secondary !py-3">
              Add Option
            </button>

            <div class="space-y-4">
              <app-vendor-variant-option-row
                *ngFor="let option of variantOptions; let i = index"
                [option]="option"
                [index]="i"
                (remove)="removeOption($event)"
              />
            </div>
          </app-vendor-form-section>

          <app-vendor-form-section
            eyebrow="Variants"
            title="Variant inventory"
            [hasAction]="true"
            headerLayout="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <button section-action type="button" (click)="addVariant()" class="btn-secondary !py-3">
              Add Variant
            </button>

            <div class="space-y-5">
              <app-vendor-variant-editor-card
                *ngFor="let variant of variants; let i = index"
                [variant]="variant"
                [index]="i"
                (remove)="removeVariant($event)"
                (imageSelected)="onVariantImageSelected($event.event, $event.index)"
              />
            </div>
          </app-vendor-form-section>

          <div *ngIf="errorMessage" class="rounded-3xl border border-rose-100 bg-rose-50/80 px-5 py-4 text-sm font-bold text-rose-700">
            {{ errorMessage }}
          </div>

          <div *ngIf="successMessage" class="rounded-3xl border border-emerald-100 bg-emerald-50/80 px-5 py-4 text-sm font-bold text-emerald-700">
            {{ successMessage }}
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" [disabled]="isSubmitting" class="btn-primary !px-8 !py-4">
              {{ isSubmitting ? 'Creating Product...' : 'Create Product' }}
            </button>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Products save directly to your vendor inventory
            </p>
          </div>
        </form>
      </main>
    </div>
  `
})
export class VendorAddProductComponent implements OnInit {
  categories: VendorCategoryRecord[] = [];
  isLoadingCategories = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  form = {
    productName: '',
    productDescription: '',
    brand: '',
    category: ''
  };

  mainImageFiles: File[] = [];
  variantOptions: VendorProductOptionForm[] = [
    { name: '', valuesText: '' }
  ];
  variants: VendorProductVariantForm[] = [
    this.createEmptyVariant()
  ];

  constructor(private vendorService: VendorService, private router: Router) {}

  ngOnInit() {
    this.loadCategories();
  }

  get flatCategories(): FlatCategoryOption[] {
    const flat: FlatCategoryOption[] = [];
    this.flattenCategories(this.categories, flat);
    return flat;
  }

  optionLabel(option: FlatCategoryOption): string {
    return `${'-- '.repeat(option.level)}${option.name}`;
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.vendorService.getCategoryTree().subscribe({
      next: (res) => {
        this.isLoadingCategories = false;
        this.categories = res?.data || [];
      },
      error: () => {
        this.isLoadingCategories = false;
        this.errorMessage = 'Failed to load categories.';
      }
    });
  }

  onMainImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.mainImageFiles = Array.from(input.files || []);
  }

  onVariantImageSelected(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    this.variants[index].imageFile = input.files?.[0] || null;
  }

  addOption() {
    this.variantOptions = [...this.variantOptions, { name: '', valuesText: '' }];
  }

  removeOption(index: number) {
    if (this.variantOptions.length === 1) {
      return;
    }
    this.variantOptions = this.variantOptions.filter((_, i) => i !== index);
  }

  addVariant() {
    this.variants = [...this.variants, this.createEmptyVariant()];
  }

  removeVariant(index: number) {
    if (this.variants.length === 1) {
      return;
    }
    this.variants = this.variants.filter((_, i) => i !== index);
  }

  submitProduct() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.productName.trim() || !this.form.productDescription.trim() || !this.form.category) {
      this.errorMessage = 'Product name, description, and category are required.';
      return;
    }

    if (this.mainImageFiles.length === 0) {
      this.errorMessage = 'At least one main product image is required.';
      return;
    }

    try {
      const variantOptions = this.buildVariantOptionsPayload();
      const variants = this.buildVariantsPayload();

      const formData = new FormData();
      formData.append('productName', this.form.productName.trim());
      formData.append('productDescription', this.form.productDescription.trim());
      formData.append('brand', this.form.brand.trim());
      formData.append('category', this.form.category);
      formData.append('variantOptions', JSON.stringify(variantOptions));
      formData.append('variants', JSON.stringify(variants));

      for (const file of this.mainImageFiles) {
        formData.append('mainImages', file);
      }

      this.variants.forEach((variant) => {
        if (variant.imageFile) {
          formData.append('variantImages', variant.imageFile);
        }
      });

      this.isSubmitting = true;
      this.vendorService.createProduct(formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (!res?.success) {
            this.errorMessage = res?.message || 'Failed to create product.';
            return;
          }

          this.successMessage = 'Product created successfully.';
          this.resetForm();
          setTimeout(() => {
            this.router.navigate(['/vendor/dashboard']);
          }, 1200);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Failed to create product.';
        }
      });
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Invalid product form data.';
    }
  }

  private buildVariantOptionsPayload() {
    const payload = this.variantOptions
      .map((option) => ({
        name: option.name.trim(),
        values: option.valuesText
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      }))
      .filter((option) => option.name && option.values.length);

    if (payload.length === 0) {
      throw new Error('At least one valid variant option is required.');
    }

    return payload;
  }

  private buildVariantsPayload() {
    const variants = this.variants.map((variant) => {
      const attributes = this.parseAttributes(variant.attributesText);

      if (Object.keys(attributes).length === 0) {
        throw new Error('Each variant needs at least one attribute, for example "Color:Black".');
      }

      if (variant.productPrice === null || variant.productStock === null) {
        throw new Error('Each variant needs price and stock.');
      }

      return {
        attributes,
        productPrice: variant.productPrice,
        discountPercentage: variant.discountPercentage || 0,
        productStock: variant.productStock,
        sku: variant.sku.trim() || undefined,
        imageRef: variant.imageFile ? this.variantImageIndexFor(variant) : undefined
      };
    });

    if (variants.length === 0) {
      throw new Error('At least one variant is required.');
    }

    return variants;
  }

  private variantImageIndexFor(targetVariant: VendorProductVariantForm): number {
    const imageVariants = this.variants.filter((variant) => variant.imageFile);
    return imageVariants.findIndex((variant) => variant === targetVariant);
  }

  private parseAttributes(input: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [key, ...rest] = pair.split(':');
        const value = rest.join(':').trim();
        if (key?.trim() && value) {
          attributes[key.trim()] = value;
        }
      });

    return attributes;
  }

  private resetForm() {
    this.form = {
      productName: '',
      productDescription: '',
      brand: '',
      category: ''
    };
    this.mainImageFiles = [];
    this.variantOptions = [{ name: '', valuesText: '' }];
    this.variants = [this.createEmptyVariant()];
  }

  private createEmptyVariant(): VendorProductVariantForm {
    return {
      attributesText: '',
      productPrice: null,
      discountPercentage: 0,
      productStock: null,
      sku: '',
      imageFile: null
    };
  }

  private flattenCategories(nodes: VendorCategoryRecord[], target: FlatCategoryOption[]) {
    for (const node of nodes) {
      target.push({
        _id: node._id,
        name: node.name,
        level: node.level || 0
      });

      if (node.children?.length) {
        this.flattenCategories(node.children, target);
      }
    }
  }
}
