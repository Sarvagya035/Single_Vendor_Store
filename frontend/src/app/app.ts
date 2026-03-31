import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/layout/header.component';
import { GlobalToastComponent } from './shared/ui/global-toast.component';
import { GlobalLoadingComponent } from './shared/ui/global-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, GlobalToastComponent, GlobalLoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
