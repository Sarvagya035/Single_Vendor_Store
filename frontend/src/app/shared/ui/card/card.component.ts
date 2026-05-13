import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="cardClasses">
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  @Input() variant: 'default' | 'soft' | 'bordered' = 'default';
  @Input() cardClass = '';

  get cardClasses(): string[] {
    return ['app-card', `app-card--${this.variant}`, this.cardClass].filter(Boolean);
  }
}
