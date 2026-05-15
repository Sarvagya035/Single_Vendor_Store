import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-vendor-form-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="vendor-section rounded-[1.5rem] border border-[#e7dac9] bg-white p-4 shadow-[0_18px_40px_rgba(47,27,20,0.04)] sm:p-5 lg:p-6">
      <div class="border-b border-slate-100 pb-4" [ngClass]="headerLayout">
        <div>
          <p class="vendor-stat-label">{{ eyebrow }}</p>
          <h2 class="vendor-panel-title">{{ title }}</h2>
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
