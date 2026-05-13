import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-page-header-content">
      <div>
        <p *ngIf="eyebrow" class="app-page-eyebrow" [ngClass]="eyebrowClass">
          {{ eyebrow }}
        </p>
        <h1 class="app-page-title" [ngClass]="titleClass">
          {{ title }}
        </h1>
        <p *ngIf="description" class="app-page-description">
          {{ description }}
        </p>
      </div>

      <div class="app-page-header-actions">
        <ng-content />
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
  @Input() eyebrowClass = 'text-amber-700';
  @Input() titleClass = '';
}
