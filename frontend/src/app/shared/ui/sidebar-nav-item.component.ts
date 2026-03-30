import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-nav-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a
      [routerLink]="link"
      class="block w-full rounded-xl border border-transparent bg-white px-4 py-3 text-left text-slate-700 transition-all hover:border-slate-200 hover:bg-slate-50"
      [routerLinkActive]="activeClasses"
      [routerLinkActiveOptions]="{ exact: exact }"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="mt-1 text-base font-black">{{ label }}</p>
        </div>
        <span class="rounded-full px-3 py-1 text-xs font-black" [ngClass]="active ? activeCountClasses : 'bg-slate-100 text-slate-700'">
          {{ count }}
        </span>
      </div>
    </a>
  `
})
export class SidebarNavItemComponent {
  @Input() link = '/';
  @Input() label = '';
  @Input() count: string | number = '';
  @Input() active = false;
  @Input() exact = false;
  @Input() activeClasses = 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm';
  @Input() activeCountClasses = 'bg-indigo-600 text-white';
}
