import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-card border-l-4 p-6" [ngClass]="toneClasses[tone]">
      <p class="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{{ label }}</p>
      <p class="mt-3 font-black text-slate-900" [ngClass]="compact ? 'text-base leading-7' : 'text-3xl'">
        {{ value }}
      </p>
      <p *ngIf="hint" class="mt-2 text-sm font-medium leading-6 text-slate-500">
        {{ hint }}
      </p>
    </div>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() hint = '';
  @Input() compact = false;
  @Input() tone: 'primary' | 'accent' | 'rose' | 'cream' | 'amber' = 'primary';

  readonly toneClasses: Record<string, string> = {
    primary: 'border-l-[#6f4e37]',
    accent: 'border-l-[#d4a017]',
    rose: 'border-l-rose-500',
    cream: 'border-l-[#f5e6d3]',
    amber: 'border-l-amber-500'
  };
}
