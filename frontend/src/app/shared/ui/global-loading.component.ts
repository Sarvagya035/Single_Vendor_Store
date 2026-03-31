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
      class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]"
    >
      <div class="rounded-3xl border border-white/70 bg-white px-6 py-5 shadow-2xl">
        <div class="flex items-center gap-3">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <div>
            <p class="text-sm font-black text-slate-900">Loading</p>
            <p class="text-xs font-medium text-slate-500">Please wait while we fetch the latest data.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GlobalLoadingComponent {
  constructor(public loadingService: LoadingService) {}
}
