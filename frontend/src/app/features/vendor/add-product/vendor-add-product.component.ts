import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';
import {
  VendorCategoryRecord,
  VendorProductOptionForm,
  VendorProductVariantForm,
} from '../../../core/models/vendor.models';
import { VendorFormSectionComponent } from '../form-section/vendor-form-section.component';
import { VendorVariantEditorCardComponent } from '../variant-editor-card/vendor-variant-editor-card.component';
import { VendorVariantOptionRowComponent } from '../variant-option-row/vendor-variant-option-row.component';
import {
  FlatCategoryOption,
  buildFlatCategories,
  categoryOptionLabel,
  generateVariantCombinations,
  parseVariantAttributes,
} from '../product-management/vendor-product-management.utils';

interface WizardStep {
  key: 'basic' | 'images' | 'options' | 'variants' | 'review';
  title: string;
}

@Component({
  selector: 'app-vendor-add-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    VendorFormSectionComponent,
    VendorVariantEditorCardComponent,
    VendorVariantOptionRowComponent,
    PageHeaderComponent,
  ],
  template: `
    <section class="space-y-6">
      <div class="vendor-page-shell overflow-hidden">
        <div class="border-b border-slate-200 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">
          <app-page-header eyebrow="Vendor Products" title="Add Product" titleClass="!text-[1.8rem] md:!text-[2.2rem]">
            <a routerLink="/vendor/products" class="btn-secondary !px-6 !py-3">Back to Products</a>
          </app-page-header>
        </div>

        <div class="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-5 lg:px-6">
          <button
            *ngFor="let step of steps; let i = index; trackBy: trackByStep"
            type="button"
            (click)="goToStep(i)"
            class="min-w-0 rounded-[1.4rem] border px-4 py-4 text-left transition sm:min-h-[5.5rem]"
            [ngClass]="i === currentStep ? 'border-amber-300 bg-white text-slate-900 shadow-sm' : i < currentStep ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-white/70 bg-white/70 text-slate-500'"
          >
            <div class="flex items-center gap-3 sm:block">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-black transition"
                [ngClass]="i === currentStep ? 'border-amber-300 bg-amber-100 text-amber-800' : i < currentStep ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'"
              >
                {{ i + 1 }}
              </span>
              <div class="min-w-0">
                <p class="vendor-stat-label">Step {{ i + 1 }}</p>
                <h2 class="mt-1 text-sm font-bold text-slate-900">{{ step.title }}</h2>
              </div>
            </div>
          </button>
        </div>
        
        <div *ngIf="isLoadingCategories" class="border-t border-slate-200 px-6 py-20 text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
          <p class="mt-4 text-sm font-medium text-slate-500">Loading categories...</p>
        </div>

        <form *ngIf="!isLoadingCategories" class="border-t border-slate-200 px-4 py-4 sm:px-5 lg:px-6 lg:py-6" (ngSubmit)="submitProduct()">
          <div *ngIf="currentStep === 0" class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <app-vendor-form-section eyebrow="Step 1" title="Basic info">
              <div class="grid gap-5 md:grid-cols-2">
                <label class="space-y-2 md:col-span-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Product Name</span>
                  <input type="text" name="productName" [(ngModel)]="form.productName" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" placeholder="Single Origin Coffee" />
                </label>
                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Brand</span>
                  <input type="text" name="brand" [(ngModel)]="form.brand" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" placeholder="Roast Theory" />
                </label>
                <label class="space-y-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Category</span>
                  <select name="category" [(ngModel)]="form.category" class="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 font-bold text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100">
                    <option value="">Select category</option>
                    <option *ngFor="let option of flatCategories; trackBy: trackByCategory" [value]="option._id">{{ optionLabel(option) }}</option>
                  </select>
                </label>
                <label class="space-y-2 md:col-span-2">
                  <span class="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Description</span>
                  <textarea rows="7" name="productDescription" [(ngModel)]="form.productDescription" class="block w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 font-medium text-slate-900 shadow-inner outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100" placeholder="Describe the product clearly for customers."></textarea>
                </label>
              </div>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Preview" title="Draft summary">
              <div class="space-y-4 rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-5 text-sm font-medium text-slate-600">
                <h3 class="vendor-panel-title">{{ form.productName || 'Untitled product' }}</h3>
                <p>{{ form.brand || 'Generic brand' }}</p>
                <p>{{ form.productDescription || 'Your description will appear here as you fill the form.' }}</p>
                <p><span class="font-black text-slate-900">Category:</span> {{ categoryNamePreview }}</p>
                <p><span class="font-black text-slate-900">Images:</span> {{ mainImageFiles.length }}</p>
                <p><span class="font-black text-slate-900">Variants:</span> {{ variants.length }}</p>
              </div>
            </app-vendor-form-section>
          </div>

          <div *ngIf="currentStep === 1" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <app-vendor-form-section eyebrow="Step 2" title="Images">
              <div class="space-y-5">
                <label class="flex cursor-pointer flex-col items-center rounded-[1.8rem] border-2 border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center">
                  <span class="text-lg font-black text-slate-900">Drag files here or choose images</span>
                  <span class="mt-2 text-sm font-medium text-slate-500">The first image becomes the main catalog preview.</span>
                  <span class="btn-primary mt-5 !px-6 !py-3">Choose Images</span>
                  <input type="file" accept="image/*" multiple class="hidden" (change)="onMainImagesSelected($event)" />
                </label>

                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <article *ngFor="let preview of imagePreviews; let i = index; trackBy: trackByPreview" class="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                    <div class="aspect-square bg-slate-100"><img [src]="preview.url" [alt]="preview.file.name" class="h-full w-full object-cover" /></div>
                    <div class="p-4">
                      <p class="truncate text-sm font-bold text-slate-800">{{ preview.file.name }}</p>
                      <div class="mt-3 flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{{ i === 0 ? 'Primary' : 'Gallery' }}</span>
                        <button type="button" (click)="removeMainImage(i)" class="text-xs font-black uppercase tracking-[0.14em] text-rose-600">Remove</button>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Checklist" title="Image guidance">
              <div class="space-y-3 text-sm font-medium text-slate-600">
                <p>Use a clean main image first so your dashboard and storefront look polished.</p>
                <p>Show multiple angles or packaging shots for a more professional catalog.</p>
                <p>Upload at least one image before submitting the product.</p>
              </div>
            </app-vendor-form-section>
          </div>

          <div *ngIf="currentStep === 2" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <app-vendor-form-section eyebrow="Step 3" title="Variant options" [hasAction]="true" headerLayout="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button section-action type="button" (click)="addOption()" class="btn-secondary !py-3">Add Option</button>
              <div class="space-y-4">
                <app-vendor-variant-option-row *ngFor="let option of variantOptions; let i = index" [option]="option" [index]="i" (remove)="removeOption($event)" />
              </div>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Generator" title="Combinations preview">
              <div class="space-y-3">
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <h3 class="vendor-panel-title !text-xl">{{ generatedCombinations.length }} combinations ready</h3>
                  <p class="mt-2 text-sm font-medium text-slate-500">Examples generated from your option setup.</p>
                </div>
                <div *ngIf="generatedCombinations.length === 0" class="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-sm font-medium text-slate-500">
                  Add valid option names and values to generate combinations.
                </div>
                <div *ngFor="let combo of generatedCombinations.slice(0, 8); trackBy: trackByCombo" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  {{ combo.label }}
                </div>
              </div>
            </app-vendor-form-section>
          </div>

          <div *ngIf="currentStep === 3" class="space-y-6">
            <app-vendor-form-section eyebrow="Step 4" title="Variants" [hasAction]="true" headerLayout="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div section-action class="flex flex-wrap gap-3">
                <button type="button" (click)="generateVariants()" class="btn-secondary !py-3">Auto Generate</button>
                <button type="button" (click)="addManualVariant()" class="btn-secondary !py-3">Add Manual Variant</button>
              </div>
              <div *ngIf="variants.length === 0" class="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-500">
                Generate variants from the option step or add one manually.
              </div>
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
          </div>

          <div *ngIf="currentStep === 4" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <app-vendor-form-section eyebrow="Step 5" title="Review & submit">
              <div class="space-y-5">
                <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <h3 class="vendor-panel-title">{{ form.productName || 'Untitled product' }}</h3>
                  <p class="mt-2 text-sm font-semibold text-slate-500">{{ form.brand || 'Generic brand' }}</p>
                  <p class="mt-4 text-sm font-medium text-slate-600">{{ form.productDescription || 'No description yet.' }}</p>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <div class="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600">
                    <p><span class="font-black text-slate-900">Category:</span> {{ categoryNamePreview }}</p>
                    <p class="mt-2"><span class="font-black text-slate-900">Main Images:</span> {{ mainImageFiles.length }}</p>
                    <p class="mt-2"><span class="font-black text-slate-900">Variant Options:</span> {{ validOptionCount }}</p>
                  </div>
                  <div class="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600">
                    <p><span class="font-black text-slate-900">Variants:</span> {{ variants.length }}</p>
                    <p class="mt-2"><span class="font-black text-slate-900">Ready:</span> {{ isReviewReady ? 'Yes' : 'Needs attention' }}</p>
                  </div>
                </div>
                <div *ngFor="let variant of variants; let i = index; trackBy: trackByVariant" class="rounded-[1.4rem] border border-slate-200 bg-white p-4 text-sm font-medium text-slate-600">
                  <p class="font-black text-slate-900">{{ variantLabel(variant) || ('Variant ' + (i + 1)) }}</p>
                  <p class="mt-2">Price: {{ variant.productPrice ?? 'N/A' }} | Stock: {{ variant.productStock ?? 'N/A' }} | Discount: {{ variant.discountPercentage ?? 0 }}%</p>
                </div>
              </div>
            </app-vendor-form-section>

            <app-vendor-form-section eyebrow="Submit" title="Create product">
              <div class="space-y-5">
                <div class="rounded-[1.5rem] border px-5 py-4 text-sm font-bold" [ngClass]="isReviewReady ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'">
                  {{ isReviewReady ? 'Everything required is ready. Create the product when you are ready.' : 'Some required information is still missing from earlier steps.' }}
                </div>
                <button type="submit" [disabled]="isSubmitting || !isReviewReady" class="btn-primary w-full !px-8 !py-4 disabled:opacity-60">{{ isSubmitting ? 'Creating Product...' : 'Create Product' }}</button>
              </div>
            </app-vendor-form-section>
          </div>

          <div class="mt-6 flex flex-col gap-3 rounded-[1.8rem] border border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" (click)="previousStep()" [disabled]="currentStep === 0" class="btn-secondary w-full !px-6 !py-3 disabled:opacity-50 sm:w-auto">Previous</button>
            <p class="text-center text-xs font-black uppercase tracking-[0.18em] text-slate-400 sm:text-left">Step {{ currentStep + 1 }} of {{ steps.length }}</p>
            <button *ngIf="currentStep < steps.length - 1" type="button" (click)="nextStep()" class="btn-primary w-full !px-6 !py-3 sm:w-auto">Next</button>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class VendorAddProductComponent implements OnInit {
  steps: WizardStep[] = [
    { key: 'basic', title: 'Basic Info' },
    { key: 'images', title: 'Images' },
    { key: 'options', title: 'Variant Options' },
    { key: 'variants', title: 'Variants' },
    { key: 'review', title: 'Review & Submit' },
  ];

  currentStep = 0;
  categories: VendorCategoryRecord[] = [];
  flatCategories: FlatCategoryOption[] = [];
  isLoadingCategories = true;
  isSubmitting = false;

  form = { productName: '', productDescription: '', brand: '', category: '' };
  mainImageFiles: File[] = [];
  imagePreviews: Array<{ file: File; url: string }> = [];
  variantOptions: VendorProductOptionForm[] = [{ name: '', valuesText: '' }];
  variants: VendorProductVariantForm[] = [];

  constructor(
    private vendorService: VendorService,
    private router: Router,
    private errorService: ErrorService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  get generatedCombinations() {
    return generateVariantCombinations(this.variantOptions);
  }

  get validOptionCount(): number {
    return this.variantOptions.filter((option) => option.name.trim() && option.valuesText.trim()).length;
  }

  get categoryNamePreview(): string {
    return this.flatCategories.find((item) => item._id === this.form.category)?.name || 'Not selected';
  }

  get isReviewReady(): boolean {
    return !!this.form.productName.trim() && !!this.form.productDescription.trim() && !!this.form.category && this.mainImageFiles.length > 0 && this.variants.length > 0;
  }

  goToStep(index: number): void {
    this.currentStep = index;
    if (index === 3 && this.variants.length === 0 && this.generatedCombinations.length) {
      this.generateVariants();
    }
  }

  nextStep(): void {
    if (this.currentStep === 0 && !this.validateBasicInfo()) return;
    if (this.currentStep === 1 && this.mainImageFiles.length === 0) {
      this.errorService.showToast('Add at least one main image before continuing.', 'error');
      return;
    }
    if (this.currentStep === 2 && this.generatedCombinations.length === 0) {
      this.errorService.showToast('Add valid variant options before continuing.', 'error');
      return;
    }
    if (this.currentStep === 2 && this.variants.length === 0) this.generateVariants();
    if (this.currentStep === 3 && !this.validateVariants()) return;
    this.currentStep += 1;
  }

  previousStep(): void {
    if (this.currentStep > 0) this.currentStep -= 1;
  }

  optionLabel(option: FlatCategoryOption): string {
    return categoryOptionLabel(option);
  }

  onMainImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setMainImages(Array.from(input.files || []));
  }

  removeMainImage(index: number): void {
    const removed = this.imagePreviews[index];
    if (removed) URL.revokeObjectURL(removed.url);
    this.mainImageFiles = this.mainImageFiles.filter((_, i) => i !== index);
    this.imagePreviews = this.imagePreviews.filter((_, i) => i !== index);
  }

  addOption(): void {
    this.variantOptions = [...this.variantOptions, { name: '', valuesText: '' }];
  }

  removeOption(index: number): void {
    if (this.variantOptions.length === 1) return;
    this.variantOptions = this.variantOptions.filter((_, i) => i !== index);
  }

  generateVariants(): void {
    const combos = this.generatedCombinations;
    if (!combos.length) {
      this.errorService.showToast('Add valid variant options to generate combinations.', 'error');
      return;
    }
    const existing = new Map(this.variants.map((variant) => [variant.attributesText, variant]));
    this.variants = combos.map((combo) => existing.get(combo.attributesText) || this.createVariant(combo.attributesText));
  }

  addManualVariant(): void {
    this.variants = [...this.variants, this.createVariant('')];
  }

  removeVariant(index: number): void {
    this.variants = this.variants.filter((_, i) => i !== index);
  }

  onVariantImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    this.variants[index].imageFile = input.files?.[0] || null;
  }

  variantLabel(variant: VendorProductVariantForm): string {
    return Object.values(parseVariantAttributes(variant.attributesText)).join(' + ');
  }

  submitProduct(): void {
    if (!this.validateBasicInfo()) {
      this.currentStep = 0;
      return;
    }
    if (this.mainImageFiles.length === 0) {
      this.currentStep = 1;
      this.errorService.showToast('At least one main product image is required.', 'error');
      return;
    }
    if (!this.validateVariants()) {
      this.currentStep = 3;
      return;
    }

    try {
      const formData = new FormData();
      formData.append('productName', this.form.productName.trim());
      formData.append('productDescription', this.form.productDescription.trim());
      formData.append('brand', this.form.brand.trim());
      formData.append('category', this.form.category);
      formData.append('variantOptions', JSON.stringify(this.buildVariantOptionsPayload()));
      formData.append('variants', JSON.stringify(this.buildVariantsPayload()));
      this.mainImageFiles.forEach((file) => formData.append('mainImages', file));
      this.variants.forEach((variant) => {
        if (variant.imageFile) formData.append('variantImages', variant.imageFile);
      });

      this.isSubmitting = true;
      this.vendorService.createProduct(formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (!res?.success) {
            this.errorService.showToast(res?.message || 'Failed to create product.', 'error');
            return;
          }
          this.errorService.showToast('Product created successfully.', 'success');
          this.router.navigate(['/vendor/products']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorService.showToast(err?.error?.message || 'Failed to create product.', 'error');
        },
      });
    } catch (error) {
      this.errorService.showToast(error instanceof Error ? error.message : 'Invalid product form data.', 'error');
    }
  }

  trackByStep(_: number, step: WizardStep): string { return step.key; }
  trackByCategory(_: number, option: FlatCategoryOption): string { return option._id; }
  trackByCombo(_: number, item: { attributesText: string }): string { return item.attributesText; }
  trackByVariant(index: number): number { return index; }
  trackByPreview(_: number, item: { file: File }): string { return `${item.file.name}-${item.file.size}`; }

  private loadCategories(): void {
    this.vendorService.getCategoryTree().subscribe({
      next: (res) => {
        this.isLoadingCategories = false;
        this.categories = res?.data || [];
        this.flatCategories = buildFlatCategories(this.categories);
      },
      error: () => {
        this.isLoadingCategories = false;
        this.errorService.showToast('Failed to load categories.', 'error');
      },
    });
  }

  private validateBasicInfo(): boolean {
    if (!this.form.productName.trim() || !this.form.productDescription.trim() || !this.form.category) {
      this.errorService.showToast('Product name, description, and category are required.', 'error');
      return false;
    }
    return true;
  }

  private validateVariants(): boolean {
    if (!this.variants.length) {
      this.errorService.showToast('At least one variant is required.', 'error');
      return false;
    }
    for (const variant of this.variants) {
      if (!Object.keys(parseVariantAttributes(variant.attributesText)).length || variant.productPrice === null || variant.productStock === null) {
        this.errorService.showToast('Each variant needs attributes, price, and stock.', 'error');
        return false;
      }
    }
    return true;
  }

  private setMainImages(files: File[]): void {
    this.imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    this.mainImageFiles = files.slice(0, 5);
    this.imagePreviews = this.mainImageFiles.map((file) => ({ file, url: URL.createObjectURL(file) }));
  }

  private createVariant(attributesText: string): VendorProductVariantForm {
    return { attributesText, productPrice: null, discountPercentage: 0, productStock: null, sku: '', imageFile: null };
  }

  private buildVariantOptionsPayload() {
    const payload = this.variantOptions
      .map((option) => ({
        name: option.name.trim(),
        values: option.valuesText.split(',').map((value) => value.trim()).filter(Boolean),
      }))
      .filter((option) => option.name && option.values.length);
    if (!payload.length) throw new Error('At least one valid variant option is required.');
    return payload;
  }

  private buildVariantsPayload() {
    const variants = this.variants.map((variant) => {
      const attributes = parseVariantAttributes(variant.attributesText);
      if (!Object.keys(attributes).length) throw new Error('Each variant needs at least one attribute.');
      if (variant.productPrice === null || variant.productStock === null) throw new Error('Each variant needs price and stock.');
      return {
        attributes,
        productPrice: variant.productPrice,
        discountPercentage: variant.discountPercentage || 0,
        productStock: variant.productStock,
        sku: variant.sku.trim() || undefined,
        imageRef: variant.imageFile ? this.variantImageIndexFor(variant) : undefined,
      };
    });
    if (!variants.length) throw new Error('At least one variant is required.');
    return variants;
  }

  private variantImageIndexFor(targetVariant: VendorProductVariantForm): number {
    return this.variants.filter((variant) => variant.imageFile).findIndex((variant) => variant === targetVariant);
  }
}
