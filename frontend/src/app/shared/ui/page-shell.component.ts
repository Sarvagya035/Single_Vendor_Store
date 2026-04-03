import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PageHeaderComponent } from './page-header.component';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <section class="space-y-6">
      <div class="app-section overflow-hidden" [ngClass]="shellClass">
        <div class="border-b border-slate-200 px-6 py-6 lg:px-8">
          <app-page-header
            [eyebrow]="eyebrow"
            [title]="title"
            [description]="description"
            [eyebrowClass]="eyebrowClass"
            [titleClass]="titleClass"
          >
            <ng-content select="[page-shell-actions]" />
          </app-page-header>
        </div>

        <div class="px-6 py-6 lg:px-8">
          <ng-content select="[page-shell-content]" />
        </div>
      </div>
    </section>
  `
})
export class PageShellComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() description = '';
  @Input() eyebrowClass = 'text-slate-400';
  @Input() titleClass = '';
  @Input() shellClass = '';
}
