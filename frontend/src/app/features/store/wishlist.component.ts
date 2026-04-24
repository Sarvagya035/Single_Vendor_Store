import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { ErrorService } from '../../core/services/error.service';
import { CustomerWishlist, CustomerWishlistProduct } from '../../core/models/customer.models';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="app-shell-width min-h-[calc(100vh-72px)] py-8 lg:py-10">
      <div class="rounded-[2rem] border border-[#eadcc9] bg-white/90 app-card-body shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
        <div class="flex flex-col gap-4 border-b border-[#f1e4d4] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[11px] font-black uppercase tracking-[0.26em] text-amber-700">Saved items</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">My Wishlist</h1>
          </div>

          <a routerLink="/products" class="btn-secondary w-full justify-center !px-5 !py-3 sm:w-auto">
            Continue Shopping
          </a>
        </div>

        <div *ngIf="loading" class="py-16 text-center text-sm font-semibold text-slate-500">
          Loading your wishlist...
        </div>

        <div *ngIf="!loading && wishlistItems.length === 0" class="py-16 text-center">
          <h2 class="text-2xl font-black text-slate-900">Your wishlist is empty</h2>
          <p class="mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-500">
            Save products from product pages to compare them later or come back when you're ready to buy.
          </p>
          <a routerLink="/products" class="btn-primary mt-6 inline-flex !px-6 !py-3">
            Browse Products
          </a>
        </div>

        <div *ngIf="!loading && wishlistItems.length > 0" class="mt-8 grid gap-4">
          <article
            *ngFor="let item of wishlistItems; trackBy: trackByWishlistItem"
            [routerLink]="['/products', item._id]"
            role="link"
            tabindex="0"
            class="cursor-pointer overflow-hidden rounded-[1.4rem] border border-[#e7dac9] bg-[#fffaf5] shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.06)]"
          >
            <div class="flex flex-col gap-4 app-card-tight sm:flex-row sm:items-center">
              <div class="block shrink-0">
                <div class="h-24 w-full overflow-hidden rounded-[1.2rem] bg-slate-100 sm:h-20 sm:w-20">
                  <img
                    [src]="productImage(item)"
                    [alt]="item.productName || 'Wishlist product'"
                    class="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      {{ item.brand || 'Product' }}
                    </p>
                    <h2 class="mt-1 line-clamp-1 text-base font-black text-slate-900 sm:text-lg">
                      {{ item.productName || 'Wishlist item' }}
                    </h2>
                  </div>

                  <span class="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-slate-900">
                    {{ formatCurrency(item.basePrice || 0) }}
                  </span>
                </div>

                <p class="mt-2 text-sm font-semibold text-slate-500">
                  {{ item.categoryDetails?.name || 'General Category' }}
                </p>

                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {{ (item.variants || []).length }} variant{{ (item.variants || []).length === 1 ? '' : 's' }}
                  </span>
                  <span
                    class="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]"
                    [ngClass]="item.isActive === false ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'"
                  >
                    {{ item.isActive === false ? 'Inactive' : 'Active' }}
                  </span>
                </div>
              </div>

            </div>

            <div class="border-t border-[#f1e4d4] px-4 py-3">
              <button
                type="button"
                class="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="busyId === item._id"
                (click)="$event.stopPropagation(); removeItem(item)"
              >
                {{ busyId === item._id ? 'Removing...' : 'Remove' }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  `
})
export class WishlistComponent implements OnInit {
  loading = true;
  busyId = '';
  wishlist: CustomerWishlist | null = null;
  wishlistItems: CustomerWishlistProduct[] = [];

  constructor(
    private wishlistService: WishlistService,
    private errorService: ErrorService,
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;

    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.loading = false;
        this.wishlist = wishlist;
        this.wishlistItems = Array.isArray(wishlist?.products) ? wishlist.products : [];
      },
      error: (error) => {
        this.loading = false;
        this.wishlist = null;
        this.wishlistItems = [];
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
  }

  removeItem(item: CustomerWishlistProduct): void {
    if (!item?._id) {
      return;
    }

    this.busyId = item._id;
    this.wishlistService.toggleWishlist(item._id).subscribe({
      next: () => {
        this.busyId = '';
        this.errorService.showToast('Wishlist updated successfully.', 'success');
        this.loadWishlist();
      },
      error: (error) => {
        this.busyId = '';
        this.errorService.showToast(this.errorService.extractErrorMessage(error), 'error');
      }
    });
  }

  productImage(item: CustomerWishlistProduct): string {
    return item.mainImages?.[0] || 'https://via.placeholder.com/640x640?text=Wishlist';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  trackByWishlistItem(_: number, item: CustomerWishlistProduct): string {
    return item._id || item.productName || '';
  }
}
