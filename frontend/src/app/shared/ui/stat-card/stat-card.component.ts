import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article [ngClass]="cardClasses">
      <div class="app-stat-card__eyebrow-row">
        <ng-content select="[appStatCardIcon]"></ng-content>
        <p *ngIf="resolvedEyebrow" class="app-stat-card__eyebrow" [ngClass]="eyebrowClass">
          {{ resolvedEyebrow }}
        </p>
      </div>

      <p class="app-stat-card__value" [ngClass]="valueClass">
        {{ value }}
      </p>

      <p *ngIf="copy" class="app-stat-card__copy" [ngClass]="copyClass">
        {{ copy }}
      </p>

      <div class="app-stat-card__trend">
        <ng-content select="[appStatCardTrend]"></ng-content>
      </div>

      <ng-content select="[appStatCardBody]"></ng-content>
    </article>
  `,
})
export class StatCardComponent {
  @Input() eyebrow = '';
  @Input() label = '';
  @Input() value = '';
  @Input() copy = '';
  @Input() cardClass = '';
  @Input() eyebrowClass = '';
  @Input() valueClass = '';
  @Input() copyClass = '';

  get resolvedEyebrow(): string {
    return this.eyebrow || this.label;
  }

  get cardClasses(): string[] {
    return ['app-stat-card', this.cardClass].filter(Boolean);
  }
}
