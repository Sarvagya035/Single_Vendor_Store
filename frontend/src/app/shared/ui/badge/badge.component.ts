import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClasses">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  @Input() tone: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';
  @Input() badgeClass = '';

  get badgeClasses(): string[] {
    const base = 'app-badge';
    const toneClass = `app-badge--${this.tone}`;
    return [base, toneClass, this.badgeClass].filter(Boolean);
  }
}
