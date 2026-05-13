import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <ng-container [ngSwitch]="resolvedAs">
      <button
        *ngSwitchCase="'button'"
        [type]="type"
        [disabled]="disabled"
        [ngClass]="buttonClasses"
      >
        <ng-content />
      </button>

      <a
        *ngSwitchCase="'link'"
        [routerLink]="routerLink ?? null"
        [attr.href]="href || null"
        [attr.aria-disabled]="disabled || null"
        [attr.tabindex]="disabled ? -1 : null"
        [ngClass]="buttonClasses"
      >
        <ng-content />
      </a>
    </ng-container>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() href = '';
  @Input() routerLink: string | any[] | null = null;
  @Input() buttonClass = '';

  get resolvedAs(): 'button' | 'link' {
    return this.href || this.routerLink ? 'link' : 'button';
  }

  get buttonClasses(): string[] {
    const base = 'app-button';
    const variant = `app-button--${this.variant}`;
    const disabled = this.disabled ? 'app-button--disabled pointer-events-none' : '';
    return [base, variant, disabled, this.buttonClass].filter(Boolean);
  }
}
