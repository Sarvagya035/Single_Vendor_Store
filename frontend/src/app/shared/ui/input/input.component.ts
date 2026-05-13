import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

let nextInputId = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="fieldClasses">
      <label *ngIf="label" class="app-form-label" [attr.for]="inputId" [ngClass]="labelClass">
        {{ label }}
        <span *ngIf="required" aria-hidden="true" class="text-rose-500"> *</span>
      </label>

      <div class="app-input-shell">
        <span *ngIf="leadingIcon" class="app-input-icon app-input-icon--leading">
          <ng-content select="[appInputLeading]" />
        </span>

        <textarea
          *ngIf="textarea; else textInput"
          [id]="inputId"
          [name]="name || inputId"
          [rows]="rows"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [autocomplete]="autocomplete || null"
          [attr.aria-invalid]="error ? 'true' : null"
          [attr.aria-describedby]="describedBy || null"
          [ngClass]="inputClasses"
          [value]="value"
          (input)="onInput($event)"
        ></textarea>

        <ng-template #textInput>
          <input
            [id]="inputId"
            [name]="name || inputId"
            [type]="type"
            [placeholder]="placeholder"
            [disabled]="disabled"
            [readonly]="readonly"
            [autocomplete]="autocomplete || null"
            [attr.aria-invalid]="error ? 'true' : null"
            [attr.aria-describedby]="describedBy || null"
            [ngClass]="inputClasses"
            [value]="value"
            (input)="onInput($event)"
          />
        </ng-template>

        <span *ngIf="trailingIcon" class="app-input-icon app-input-icon--trailing">
          <ng-content select="[appInputTrailing]" />
        </span>
      </div>

      <p *ngIf="error" [id]="errorId" class="app-form-error" [ngClass]="errorClass">
        {{ error }}
      </p>
      <p *ngIf="!error && helperText" [id]="helperId" class="app-form-helper" [ngClass]="helperClass">
        {{ helperText }}
      </p>
    </div>
  `,
})
export class InputComponent {
  @Input() label = '';
  @Input() type: 'text' | 'search' | 'email' | 'password' = 'text';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() textarea = false;
  @Input() rows = 4;
  @Input() name = '';
  @Input() autocomplete = '';
  @Input() helperText = '';
  @Input() error = '';
  @Input() value = '';
  @Input() inputClass = '';
  @Input() labelClass = '';
  @Input() helperClass = '';
  @Input() errorClass = '';
  @Input() fieldClass = '';
  @Input() leadingIcon = false;
  @Input() trailingIcon = false;

  @Output() valueChange = new EventEmitter<string>();

  readonly inputId = `app-input-${++nextInputId}`;
  readonly helperId = `${this.inputId}-helper`;
  readonly errorId = `${this.inputId}-error`;

  get describedBy(): string | null {
    if (this.error) {
      return this.errorId;
    }

    if (this.helperText) {
      return this.helperId;
    }

    return null;
  }

  get fieldClasses(): string[] {
    return ['app-form-field', this.fieldClass].filter(Boolean);
  }

  get inputClasses(): string[] {
    return [
      'app-input',
      this.textarea ? 'app-input--textarea' : '',
      this.leadingIcon ? 'app-input--with-leading-icon' : '',
      this.trailingIcon ? 'app-input--with-trailing-icon' : '',
      this.disabled ? 'app-input--disabled' : '',
      this.error ? 'app-input--error' : '',
      this.inputClass,
    ].filter(Boolean);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
  }
}
