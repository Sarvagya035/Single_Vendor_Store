import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-vendor-form-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="app-section p-8">
      <div class="border-b border-slate-100 pb-4" [ngClass]="headerLayout">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{{ eyebrow }}</p>
          <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-900">{{ title }}</h2>
        </div>
        <div *ngIf="hasAction" class="flex items-center">
          <ng-content select="[section-action]" />
        </div>
      </div>

      <div class="mt-6">
        <ng-content />
      </div>
    </section>
  `
})
export class VendorFormSectionComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() hasAction = false;
  @Input() headerLayout = '';
}
