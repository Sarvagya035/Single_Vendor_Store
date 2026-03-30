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
  @Input() tone: 'indigo' | 'emerald' | 'rose' | 'sky' | 'amber' = 'indigo';

  readonly toneClasses: Record<string, string> = {
    indigo: 'border-l-indigo-500',
    emerald: 'border-l-emerald-500',
    rose: 'border-l-rose-500',
    sky: 'border-l-sky-500',
    amber: 'border-l-amber-500'
  };
}
