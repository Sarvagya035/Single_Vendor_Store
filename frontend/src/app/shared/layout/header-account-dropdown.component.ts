import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface HeaderDropdownItem {
  label: string;
  route?: string;
  action?: string;
  tone?: 'default' | 'accent' | 'danger';
}

type HeaderDropdownTheme = 'customer' | 'vendor' | 'admin';

@Component({
  selector: 'app-header-account-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative" data-account-dropdown>
      <button
        type="button"
        [class]="desktop ? desktopTriggerClasses() : mobileTriggerClasses()"
        (click)="toggle.emit($event)"
        [attr.aria-expanded]="open"
        aria-haspopup="menu"
      >
        <div class="relative">
          <img
            *ngIf="avatarUrl"
            [src]="avatarUrl"
            [alt]="displayName + ' avatar'"
            [class]="desktop ? 'h-11 w-11 rounded-full object-cover ring-2 ring-white' : 'h-10 w-10 rounded-full object-cover'"
          />
          <div *ngIf="!avatarUrl" [class]="avatarClasses()">
            {{ initials }}
          </div>
          <span
            *ngIf="theme === 'customer' && desktop"
            class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-400"
          ></span>
        </div>

        <div *ngIf="desktop" class="hidden min-w-0 lg:block">
          <p class="truncate text-sm font-black text-slate-900">{{ displayName }}</p>
          <p class="truncate text-xs font-bold" [ngClass]="subtitleClass()">{{ subtitle }}</p>
        </div>

        <svg
          class="h-4 w-4 text-slate-400 transition duration-200"
          [ngClass]="open ? chevronOpenClass() : 'rotate-0'"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        [class]="panelClasses()"
        [ngClass]="open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0'"
      >
        <div [class]="heroClasses()">
          <div class="flex items-center gap-3">
            <img
              *ngIf="avatarUrl"
              [src]="avatarUrl"
              [alt]="displayName + ' avatar'"
              [class]="desktop ? 'h-12 w-12 rounded-full object-cover' : 'h-11 w-11 rounded-full object-cover'"
            />
            <div *ngIf="!avatarUrl" [class]="heroAvatarClasses()">
              {{ initials }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-black text-slate-900">{{ displayName }}</p>
              <p class="truncate text-xs font-semibold text-slate-500">{{ email || 'No email available' }}</p>
            </div>
          </div>
        </div>

        <div class="mt-3 space-y-1">
          <ng-container *ngFor="let item of items">
            <a
              *ngIf="item.route; else actionButton"
              [routerLink]="item.route"
              [class]="desktop ? rowLinkClasses(item.tone || 'default') : mobileRowLinkClasses(item.tone || 'default')"
              (click)="itemSelected.emit(item)"
            >
              <span>{{ item.label }}</span>
              <span *ngIf="desktop" [ngClass]="arrowClass(item.tone || 'default')">&rarr;</span>
            </a>
            <ng-template #actionButton>
              <button
                type="button"
                [class]="desktop ? rowButtonClasses(item.tone || 'default') : mobileRowButtonClasses(item.tone || 'default')"
                (click)="itemSelected.emit(item)"
              >
                <span>{{ item.label }}</span>
                <span *ngIf="desktop" [ngClass]="arrowClass(item.tone || 'default')">&rarr;</span>
              </button>
            </ng-template>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class HeaderAccountDropdownComponent {
  @Input() open = false;
  @Input() desktop = true;
  @Input() theme: HeaderDropdownTheme = 'customer';
  @Input() subtitle = 'Account';
  @Input() avatarUrl = '';
  @Input() initials = 'U';
  @Input() displayName = 'User';
  @Input() email = '';
  @Input() items: HeaderDropdownItem[] = [];

  @Output() toggle = new EventEmitter<Event>();
  @Output() itemSelected = new EventEmitter<HeaderDropdownItem>();

  desktopTriggerClasses(): string {
    const themeClasses: Record<HeaderDropdownTheme, string> = {
      customer: 'group inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50',
      vendor: 'group inline-flex items-center gap-3 rounded-full border border-[#e7dac9] bg-white/95 px-2.5 py-2 pr-4 text-left shadow-[0_16px_40px_rgba(111,78,55,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d4a017] hover:shadow-[0_20px_44px_rgba(111,78,55,0.18)]',
      admin: 'group inline-flex items-center gap-3 rounded-full border border-[#e7dac9] bg-white/95 px-2.5 py-2 pr-4 text-left shadow-[0_16px_40px_rgba(111,78,55,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d4a017] hover:shadow-[0_20px_44px_rgba(111,78,55,0.18)]'
    };
    return themeClasses[this.theme];
  }

  mobileTriggerClasses(): string {
    const themeClasses: Record<HeaderDropdownTheme, string> = {
      customer: 'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition hover:border-slate-300',
      vendor: 'inline-flex items-center gap-2 rounded-full border border-[#e7dac9] bg-white px-2.5 py-2 shadow-[0_16px_32px_rgba(111,78,55,0.12)] transition-all duration-200 hover:border-[#d4a017]',
      admin: 'inline-flex items-center gap-2 rounded-full border border-[#e7dac9] bg-white px-2.5 py-2 shadow-[0_16px_32px_rgba(111,78,55,0.12)] transition-all duration-200 hover:border-[#d4a017]'
    };
    return themeClasses[this.theme];
  }

  avatarClasses(): string {
    if (this.desktop) {
      const desktopClasses: Record<HeaderDropdownTheme, string> = {
        customer: 'flex h-11 w-11 items-center justify-center rounded-full text-sm font-black uppercase text-white ring-2 ring-white',
        vendor: 'flex h-11 w-11 items-center justify-center rounded-full text-sm font-black uppercase tracking-[0.12em] text-white ring-2 ring-white',
        admin: 'flex h-11 w-11 items-center justify-center rounded-full text-sm font-black uppercase tracking-[0.12em] text-white ring-2 ring-white'
      };
      return desktopClasses[this.theme];
    }

    const mobileClasses: Record<HeaderDropdownTheme, string> = {
      customer: 'flex h-10 w-10 items-center justify-center rounded-full text-sm font-black uppercase text-white',
      vendor: 'flex h-10 w-10 items-center justify-center rounded-full text-sm font-black uppercase tracking-[0.12em] text-white',
      admin: 'flex h-10 w-10 items-center justify-center rounded-full text-sm font-black uppercase tracking-[0.12em] text-white'
    };
    return mobileClasses[this.theme];
  }

  heroClasses(): string {
    const tone: Record<HeaderDropdownTheme, string> = {
      customer: 'rounded-[1.25rem] bg-slate-50 p-4',
      vendor: 'rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(255,249,242,0.95),rgba(245,230,211,0.95))] p-4',
      admin: 'rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(255,249,242,0.95),rgba(245,230,211,0.95))] p-4'
    };
    return tone[this.theme];
  }

  heroAvatarClasses(): string {
    const size = this.desktop ? 'h-12 w-12' : 'h-11 w-11';
    const tone: Record<HeaderDropdownTheme, string> = {
      customer: `flex ${size} items-center justify-center rounded-full text-sm font-black uppercase text-white`,
      vendor: `flex ${size} items-center justify-center rounded-full text-sm font-black uppercase tracking-[0.12em] text-white`,
      admin: `flex ${size} items-center justify-center rounded-full text-sm font-black uppercase tracking-[0.12em] text-white`
    };
    return tone[this.theme];
  }

  subtitleClass(): string {
    const tone: Record<HeaderDropdownTheme, string> = {
      customer: 'text-slate-400',
      vendor: 'uppercase tracking-[0.18em] text-amber-700',
      admin: 'uppercase tracking-[0.18em] text-amber-700'
    };
    return tone[this.theme];
  }

  chevronOpenClass(): string {
    const tone: Record<HeaderDropdownTheme, string> = {
      customer: 'rotate-180 text-slate-700',
      vendor: 'rotate-180 text-amber-700',
      admin: 'rotate-180 text-amber-700'
    };
    return tone[this.theme];
  }

  panelClasses(): string {
    const width = this.desktop ? 'w-[320px]' : 'w-[290px]';
    const tone: Record<HeaderDropdownTheme, string> = {
      customer: `absolute right-0 top-[calc(100%+12px)] ${width} origin-top-right rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.16)] transition-all duration-200`,
      vendor: `absolute right-0 top-[calc(100%+12px)] ${width} origin-top-right rounded-[1.5rem] border border-[#e7dac9] bg-white/95 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur transition-all duration-200`,
      admin: `absolute right-0 top-[calc(100%+12px)] ${width} origin-top-right rounded-[1.5rem] border border-[#e7dac9] bg-white/95 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur transition-all duration-200`
    };
    return tone[this.theme];
  }

  rowLinkClasses(tone: 'default' | 'accent' | 'danger'): string {
    const classes: Record<string, string> = {
      default: 'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900',
      accent: this.theme === 'vendor'
        ? 'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800'
        : 'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800',
      danger: 'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50'
    };
    return classes[tone];
  }

  rowButtonClasses(tone: 'default' | 'accent' | 'danger'): string {
    return `flex w-full items-center justify-between ${this.rowLinkClasses(tone)}`;
  }

  mobileRowLinkClasses(tone: 'default' | 'accent' | 'danger'): string {
    const classes: Record<string, string> = {
      default: 'block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50',
      accent: this.theme === 'vendor'
        ? 'block rounded-xl px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50'
        : 'block rounded-xl px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50',
      danger: 'block rounded-xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50'
    };
    return classes[tone];
  }

  mobileRowButtonClasses(tone: 'default' | 'accent' | 'danger'): string {
    return `block w-full text-left ${this.mobileRowLinkClasses(tone)}`;
  }

  arrowClass(tone: 'default' | 'accent' | 'danger'): string {
    const classes: Record<string, string> = {
      default: 'text-slate-300',
      accent: this.theme === 'vendor' ? 'text-amber-300' : 'text-amber-300',
      danger: 'text-rose-300'
    };
    return classes[tone];
  }
}
