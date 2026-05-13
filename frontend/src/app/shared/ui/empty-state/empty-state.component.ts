import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="['app-empty-state', cardClass]">
      <div class="app-empty-state__inner">
        <p *ngIf="eyebrow" class="app-empty-state__eyebrow" [ngClass]="eyebrowClass">
          {{ eyebrow }}
        </p>
        <h3 class="app-empty-state__title" [ngClass]="titleClass">
          {{ title }}
        </h3>
        <p *ngIf="displayDescription" class="app-empty-state__description">
          {{ displayDescription }}
        </p>
        <div class="app-empty-state__actions">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() message = '';
  @Input() eyebrow = '';
  @Input() eyebrowClass = 'text-amber-700';
  @Input() titleClass = '';
  @Input() cardClass = '';

  get displayDescription(): string {
    return this.description || this.message;
  }
}
