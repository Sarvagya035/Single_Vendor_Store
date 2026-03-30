import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { AdminService } from '../../../core/services/admin.service';
import { AdminProductRecord, CategoryRecord, ToastType, VendorRecord } from '../../../core/models/admin.models';
import { ToastBannerComponent } from '../../../shared/ui/toast-banner.component';

interface FlatCategoryOption {
  _id: string;
  name: string;
  level: number;
}

interface ProductMessage {
  type: 'success' | 'error';
  text: string;
}

interface ProductOptionForm {
  name: string;
  valuesText: string;
}

interface ProductVariantForm {
  attributesText: string;
  productPrice: number | null;
  discountPercentage: number | null;
  productStock: number | null;
  sku: string;
  imageFile: File | null;
}

interface ProductEditForm {
  productName: string;
  productDescription: string;
  brand: string;
  category: string;
  isActive: boolean;
}

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastBannerComponent],
  templateUrl: './admin-products-page.component.html'
})
export class AdminProductsPageComponent implements OnInit {
  vendors: VendorRecord[] = [];
  categories: CategoryRecord[] = [];
  products: AdminProductRecord[] = [];

  isLoadingReferences = true;
  isLoadingProducts = true;
  isSubmitting = false;
  isUpdatingProduct = false;
  isRefreshing = false;
  isCreateFormOpen = false;
  isEditFormOpen = false;

  searchQuery = '';
  selectedFilter: 'all' | 'active' | 'inactive' = 'all';
  editingProductId: string | null = null;

  mainImageFiles: File[] = [];
  variantOptions: ProductOptionForm[] = [{ name: '', valuesText: '' }];
  variants: ProductVariantForm[] = [this.createEmptyVariant()];

  createError = '';
  editError = '';
  successMessage = '';

  form = {
    vendorId: '',
    productName: '',
    productDescription: '',
    brand: '',
    category: '',
    isActive: true
  };

  editForm: ProductEditForm = {
    productName: '',
    productDescription: '',
    brand: '',
    category: '',
    isActive: true
  };

  toast = {
    visible: false,
    message: '',
    type: 'success' as ToastType
  };

  productMessages: Record<string, ProductMessage | undefined> = {};
  busyStates: Record<string, boolean> = {};

  constructor(
    private adminService: AdminService,
    private router: Router,
    private appRefreshService: AppRefreshService
  ) {}

  ngOnInit(): void {
    this.loadReferences();
    this.loadProducts();
  }

  reloadAll(): void {
    this.loadReferences();
    this.loadProducts();
  }

  openCreateForm(): void {
    this.isEditFormOpen = false;
    this.editingProductId = null;
    this.isCreateFormOpen = true;
  }

  closeCreateForm(): void {
    this.isCreateFormOpen = false;
  }

  openEditForm(product: AdminProductRecord): void {
    this.isCreateFormOpen = false;
    this.editingProductId = product._id;
    this.editError = '';
    this.successMessage = '';
    this.editForm = {
      productName: product.productName || '',
      productDescription: product.productDescription || '',
      brand: product.brand || '',
      category: typeof product.category === 'string' ? product.category : product.category?._id || '',
      isActive: product.isActive !== false
    };
    this.isEditFormOpen = true;
  }

  closeEditForm(): void {
    this.isEditFormOpen = false;
    this.editingProductId = null;
    this.editError = '';
  }

  loadReferences(): void {
    this.isLoadingReferences = true;

    forkJoin({
      vendors: this.adminService.getActiveVendors(),
      categories: this.adminService.getCategoryTree()
    }).subscribe({
      next: ({ vendors, categories }) => {
        this.isLoadingReferences = false;
        this.vendors = Array.isArray(vendors?.data) ? vendors.data : [];
        this.categories = this.decorateCategories(Array.isArray(categories?.data) ? categories.data : []);
      },
      error: (err) => {
        this.isLoadingReferences = false;
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.showToast(err.error?.message || 'Failed to load vendors and categories.', 'error');
      }
    });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;

    this.adminService.getAllProducts().subscribe({
      next: (res) => {
        this.isLoadingProducts = false;
        this.products = Array.isArray(res?.data) ? res.data : [];
      },
      error: (err) => {
        this.isLoadingProducts = false;
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.products = [];
        this.showToast(err.error?.message || 'Failed to load products.', 'error');
      }
    });
  }

  onMainImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.mainImageFiles = Array.from(input.files || []);
  }

  onVariantImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    this.variants[index].imageFile = input.files?.[0] || null;
  }

  addOption(): void {
    this.variantOptions = [...this.variantOptions, { name: '', valuesText: '' }];
  }

  removeOption(index: number): void {
    if (this.variantOptions.length === 1) return;
    this.variantOptions = this.variantOptions.filter((_, currentIndex) => currentIndex !== index);
  }

  addVariant(): void {
    this.variants = [...this.variants, this.createEmptyVariant()];
  }

  removeVariant(index: number): void {
    if (this.variants.length === 1) return;
    this.variants = this.variants.filter((_, currentIndex) => currentIndex !== index);
  }

  submitProduct(): void {
    this.createError = '';
    this.successMessage = '';

    if (!this.form.vendorId || !this.form.productName.trim() || !this.form.productDescription.trim() || !this.form.category) {
      this.createError = 'Vendor, product name, description, and category are required.';
      return;
    }

    if (this.mainImageFiles.length === 0) {
      this.createError = 'At least one main product image is required.';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('vendorId', this.form.vendorId);
      formData.append('productName', this.form.productName.trim());
      formData.append('productDescription', this.form.productDescription.trim());
      formData.append('brand', this.form.brand.trim());
      formData.append('category', this.form.category);
      formData.append('isActive', String(this.form.isActive));
      formData.append('variantOptions', JSON.stringify(this.buildVariantOptionsPayload()));
      formData.append('variants', JSON.stringify(this.buildVariantsPayload()));

      for (const file of this.mainImageFiles) {
        formData.append('mainImages', file);
      }

      const imageVariants = this.variants.filter((variant) => variant.imageFile);
      imageVariants.forEach((variant) => {
        if (variant.imageFile) {
          formData.append('variantImages', variant.imageFile);
        }
      });

      this.isSubmitting = true;
      this.adminService.createProductForVendor(formData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (!res?.success) {
            this.createError = res?.message || 'Failed to create product.';
            return;
          }

          this.successMessage = 'Product created successfully.';
          this.showToast('Product created successfully.', 'success');
          this.resetForm();
          this.closeCreateForm();
          this.appRefreshService.notify('admin');
          this.loadProducts();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.createError = err.error?.message || 'Failed to create product.';
        }
      });
    } catch (error) {
      this.createError = error instanceof Error ? error.message : 'Invalid product form data.';
    }
  }

  submitEditProduct(): void {
    if (!this.editingProductId) return;

    this.editError = '';
    this.successMessage = '';

    if (!this.editForm.productName.trim() || !this.editForm.productDescription.trim() || !this.editForm.category) {
      this.editError = 'Product name, description, and category are required.';
      return;
    }

    this.isUpdatingProduct = true;
    this.adminService.updateProduct(this.editingProductId, {
      productName: this.editForm.productName.trim(),
      productDescription: this.editForm.productDescription.trim(),
      brand: this.editForm.brand.trim(),
      category: this.editForm.category,
      isActive: this.editForm.isActive
    }).subscribe({
      next: (res) => {
        this.isUpdatingProduct = false;
        if (!res?.success) {
          this.editError = res?.message || 'Failed to update product.';
          return;
        }

        this.showToast('Product updated successfully.', 'success');
        this.closeEditForm();
        this.appRefreshService.notify('admin');
        this.loadProducts();
      },
      error: (err) => {
        this.isUpdatingProduct = false;
        this.editError = err.error?.message || 'Failed to update product.';
      }
    });
  }

  toggleStatus(product: AdminProductRecord): void {
    this.setBusy(`status-${product._id}`, true);
    this.adminService.toggleProductStatus(product._id, !product.isActive).subscribe({
      next: (res) => {
        this.setBusy(`status-${product._id}`, false);
        if (!res?.success) {
          this.setMessage(product._id, 'error', res?.message || 'Unable to update status.');
          return;
        }

        this.setMessage(product._id, 'success', `Product ${product.isActive ? 'deactivated' : 'activated'} successfully.`);
        this.appRefreshService.notify('admin');
        this.loadProducts();
      },
      error: (err) => {
        this.setBusy(`status-${product._id}`, false);
        this.setMessage(product._id, 'error', err.error?.message || 'Unable to update status.');
      }
    });
  }

  deleteProduct(product: AdminProductRecord): void {
    if (!window.confirm(`Delete "${product.productName}"?`)) return;

    this.setBusy(`delete-${product._id}`, true);
    this.adminService.deleteProduct(product._id).subscribe({
      next: (res) => {
        this.setBusy(`delete-${product._id}`, false);
        if (!res?.success) {
          this.setMessage(product._id, 'error', res?.message || 'Unable to delete product.');
          return;
        }

        this.setMessage(product._id, 'success', 'Product deleted successfully.');
        this.appRefreshService.notify('admin');
        this.loadProducts();
      },
      error: (err) => {
        this.setBusy(`delete-${product._id}`, false);
        this.setMessage(product._id, 'error', err.error?.message || 'Unable to delete product.');
      }
    });
  }

  get flatCategories(): FlatCategoryOption[] {
    const flat: FlatCategoryOption[] = [];
    this.flattenCategories(this.categories, flat);
    return flat;
  }

  get filteredProducts(): AdminProductRecord[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.products.filter((product) => {
      const isActive = product.isActive !== false;
      const matchesFilter =
        this.selectedFilter === 'all' ||
        (this.selectedFilter === 'active' && isActive) ||
        (this.selectedFilter === 'inactive' && !isActive);

      const matchesSearch =
        !query ||
        product.productName.toLowerCase().includes(query) ||
        this.vendorName(product).toLowerCase().includes(query) ||
        this.categoryName(product).toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }

  vendorLabel(vendor: VendorRecord): string {
    return `${vendor.shopName || 'Unnamed vendor'}${vendor.verificationStatus ? ` · ${vendor.verificationStatus}` : ''}`;
  }

  categoryLabel(option: FlatCategoryOption): string {
    return `${'-- '.repeat(option.level)}${option.name}`;
  }

  vendorName(product: AdminProductRecord): string {
    if (typeof product.vendor === 'string') return 'Vendor linked';
    return product.vendor?.shopName || 'Unknown vendor';
  }

  categoryName(product: AdminProductRecord): string {
    if (typeof product.category === 'string') return 'Category linked';
    return product.category?.name || 'Uncategorized';
  }

  primaryImage(product: AdminProductRecord): string | undefined {
    return product.mainImages?.[0];
  }

  formatCurrency(value?: number): string {
    if (typeof value !== 'number') return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }

  messageFor(productId: string): ProductMessage | undefined {
    return this.productMessages[productId];
  }

  isBusy(key: string): boolean {
    return !!this.busyStates[key];
  }

  trackByProductId(_: number, product: AdminProductRecord): string {
    return product._id;
  }

  private buildVariantOptionsPayload(): Array<{ name: string; values: string[] }> {
    const payload = this.variantOptions
      .map((option) => ({
        name: option.name.trim(),
        values: option.valuesText.split(',').map((value) => value.trim()).filter(Boolean)
      }))
      .filter((option) => option.name && option.values.length);

    if (payload.length === 0) throw new Error('At least one valid variant option is required.');
    return payload;
  }

  private buildVariantsPayload() {
    const imageVariants = this.variants.filter((variant) => variant.imageFile);

    const payload = this.variants.map((variant) => {
      const attributes = this.parseAttributes(variant.attributesText);
      if (Object.keys(attributes).length === 0) throw new Error('Each variant needs at least one attribute.');
      if (variant.productPrice === null || variant.productStock === null) throw new Error('Each variant needs price and stock.');

      return {
        attributes,
        productPrice: variant.productPrice,
        discountPercentage: variant.discountPercentage || 0,
        productStock: variant.productStock,
        sku: variant.sku.trim() || undefined,
        imageRef: variant.imageFile ? imageVariants.findIndex((candidate) => candidate === variant) : undefined
      };
    });

    if (payload.length === 0) throw new Error('At least one variant is required.');
    return payload;
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
        if (key?.trim() && value) attributes[key.trim()] = value;
      });

    return attributes;
  }

  private resetForm(): void {
    this.form = {
      vendorId: '',
      productName: '',
      productDescription: '',
      brand: '',
      category: '',
      isActive: true
    };
    this.mainImageFiles = [];
    this.variantOptions = [{ name: '', valuesText: '' }];
    this.variants = [this.createEmptyVariant()];
  }

  private createEmptyVariant(): ProductVariantForm {
    return {
      attributesText: '',
      productPrice: null,
      discountPercentage: 0,
      productStock: null,
      sku: '',
      imageFile: null
    };
  }

  private flattenCategories(nodes: CategoryRecord[], target: FlatCategoryOption[]): void {
    for (const node of nodes) {
      target.push({ _id: node._id, name: node.name, level: node.level || 0 });
      if (node.children?.length) {
        this.flattenCategories(node.children, target);
      }
    }
  }

  private setBusy(key: string, value: boolean): void {
    this.busyStates[key] = value;
  }

  private setMessage(productId: string, type: 'success' | 'error', text: string): void {
    this.productMessages[productId] = { type, text };
  }

  private decorateCategories(categories: CategoryRecord[] = []): CategoryRecord[] {
    return categories.map((category) => ({
      ...category,
      children: this.decorateCategories(category.children || [])
    }));
  }

  private showToast(message: string, type: ToastType): void {
    this.toast = { visible: true, message, type };
    setTimeout(() => (this.toast.visible = false), 3500);
  }
}
