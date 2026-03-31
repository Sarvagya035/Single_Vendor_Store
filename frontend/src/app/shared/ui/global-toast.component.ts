import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorService, ToastKind } from '../../core/services/error.service';
import { ToastBannerComponent } from './toast-banner.component';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [CommonModule, ToastBannerComponent],
  template: `
    <app-toast-banner
      [visible]="visible"
      [message]="message"
      [type]="type"
    />
  `
})
export class GlobalToastComponent implements OnInit, OnDestroy {
  visible = false;
  message = '';
  type: ToastKind = 'error';

  private subscription?: Subscription;

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.subscription = this.errorService.toast$.subscribe((toast) => {
      if (!toast) {
        this.visible = false;
        return;
      }

      this.message = toast.message;
      this.type = toast.type;
      this.visible = true;

      window.setTimeout(() => {
        this.visible = false;
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
