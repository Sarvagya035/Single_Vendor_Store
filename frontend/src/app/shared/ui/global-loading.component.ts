import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="loadingService.isLoading$ | async"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-sm"
    >
      <div class="app-section w-full max-w-sm px-6 py-5">
        <div class="flex items-center gap-4">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
            <div class="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-black text-slate-900">Loading</p>
            <p class="mt-1 text-xs font-medium leading-5 text-slate-500">
              Please wait while we fetch the latest data.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GlobalLoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
