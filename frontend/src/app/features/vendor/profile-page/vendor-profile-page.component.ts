import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorBankModalComponent } from '../bank-modal/vendor-bank-modal.component';
import { VendorDetailsModalComponent } from '../details-modal/vendor-details-modal.component';
import { VendorEmptyStateComponent } from '../empty-state/vendor-empty-state.component';
import { VendorLogoModalComponent } from '../logo-modal/vendor-logo-modal.component';
import { VendorProfileCardComponent } from '../profile-card/vendor-profile-card.component';
import { VendorBankDetailsForm, VendorDetailsForm, VendorProfile } from '../../../core/models/vendor.models';

@Component({
  selector: 'app-vendor-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    VendorBankModalComponent,
    VendorProfileCardComponent,
    VendorDetailsModalComponent,
    VendorLogoModalComponent,
    VendorEmptyStateComponent
  ],
  template: `
    <div *ngIf="isLoading" class="flex flex-col items-center gap-4 py-20">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
      <p class="font-medium text-slate-500">Loading store data...</p>
    </div>

    <div *ngIf="!isLoading && vendor" class="space-y-10">
      <app-vendor-profile-card
        [vendor]="vendor"
        [logoPreview]="logoPreview"
        [isEditDetailsOpen]="isEditDetailsOpen"
        [isEditBankOpen]="isEditBankOpen"
        [isEditLogoOpen]="isEditLogoOpen"
        (editDetails)="toggleDetailsEditor()"
        (editBank)="toggleBankEditor()"
        (editLogo)="toggleLogoEditor()"
      />
    </div>

    <app-vendor-empty-state *ngIf="!isLoading && !vendor" />

    <app-vendor-details-modal
      [open]="isEditDetailsOpen"
      [form]="form"
      [isSaving]="isSavingDetails"
      (formChange)="updateForm($event)"
      (close)="toggleDetailsEditor()"
      (submit)="onUpdateDetails()"
    />

    <app-vendor-bank-modal
      [open]="isEditBankOpen"
      [form]="bankForm"
      [isSaving]="isSavingBank"
      (formChange)="updateBankForm($event)"
      (close)="toggleBankEditor()"
      (submit)="onUpdateBankDetails()"
    />

    <app-vendor-logo-modal
      [open]="isEditLogoOpen"
      [vendor]="vendor"
      [logoPreview]="logoPreview"
      [selectedLogoName]="selectedLogo?.name || ''"
      [isUploading]="isUploadingLogo"
      (close)="toggleLogoEditor()"
      (selectLogo)="onLogoSelected($event)"
      (submit)="onUpdateLogo()"
    />
  `
})
export class VendorProfilePageComponent implements OnInit {
  vendor: VendorProfile | null = null;
  form: VendorDetailsForm = {
    vendorAddress: '',
    vendorDescription: ''
  };
  bankForm: VendorBankDetailsForm = {
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  };

  selectedLogo: File | null = null;
  logoPreview: string | null = null;
  isLoading = true;
  isSavingDetails = false;
  isSavingBank = false;
  isUploadingLogo = false;
  isEditDetailsOpen = false;
  isEditBankOpen = false;
  isEditLogoOpen = false;

  constructor(
    private vendorService: VendorService,
    private appRefreshService: AppRefreshService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.loadVendorProfile();
  }

  loadVendorProfile() {
    this.isLoading = true;
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success) {
          this.vendor = res.data;
          this.form = {
            vendorAddress: res.data.vendorAddress || '',
            vendorDescription: res.data.vendorDescription || ''
          };
          this.bankForm = {
            accountHolderName: res.data.bankDetails?.accountHolderName || '',
            accountNumber: res.data.bankDetails?.accountNumber || '',
            ifscCode: res.data.bankDetails?.ifscCode || '',
            bankName: res.data.bankDetails?.bankName || '',
            upiId: res.data.bankDetails?.upiId || ''
          };
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateForm(form: VendorDetailsForm) {
    this.form = form;
  }

  updateBankForm(form: VendorBankDetailsForm) {
    this.bankForm = form;
  }

  onUpdateDetails() {
    this.isSavingDetails = true;

    this.vendorService
      .updateDetails({
        vendorAddress: this.form.vendorAddress,
        vendorDescription: this.form.vendorDescription
      })
      .subscribe({
        next: (res) => {
          this.isSavingDetails = false;
          if (res?.success) {
            this.vendor = res.data;
          this.form = {
            vendorAddress: res.data.vendorAddress || '',
            vendorDescription: res.data.vendorDescription || ''
          };
          this.errorService.showToast('Vendor details updated successfully.', 'success');
          this.isEditDetailsOpen = false;
          this.refreshAppState();
        } else {
          this.errorService.showToast(res?.message || 'Unable to update store details.', 'error');
        }
      },
        error: () => {
          this.isSavingDetails = false;
        }
      });
  }

  onUpdateBankDetails() {
    this.isSavingBank = true;

    this.vendorService
      .updateBankDetails({
        accountHolderName: this.bankForm.accountHolderName,
        accountNumber: this.bankForm.accountNumber,
        ifscCode: this.bankForm.ifscCode.toUpperCase(),
        bankName: this.bankForm.bankName,
        upiId: this.bankForm.upiId
      })
      .subscribe({
        next: (res) => {
          this.isSavingBank = false;
          if (res?.success) {
            this.vendor = res.data;
            this.bankForm = {
              accountHolderName: res.data.bankDetails?.accountHolderName || '',
              accountNumber: res.data.bankDetails?.accountNumber || '',
              ifscCode: res.data.bankDetails?.ifscCode || '',
              bankName: res.data.bankDetails?.bankName || '',
              upiId: res.data.bankDetails?.upiId || ''
            };
            this.errorService.showToast(res?.message || 'Bank details updated successfully.', 'success');
            this.isEditBankOpen = false;
            this.refreshAppState();
          } else {
            this.errorService.showToast(res?.message || 'Unable to update bank details.', 'error');
          }
        },
        error: () => {
          this.isSavingBank = false;
        }
      });
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.logoPreview = reader.result as string);
      reader.readAsDataURL(this.selectedLogo);
    }
  }

  onUpdateLogo() {
    if (!this.selectedLogo) {
      return;
    }

    this.isUploadingLogo = true;

    this.vendorService.updateLogo(this.selectedLogo).subscribe({
      next: (res) => {
        this.isUploadingLogo = false;
        if (res?.success) {
          this.vendor = res.data;
          this.selectedLogo = null;
          this.logoPreview = null;
          this.errorService.showToast('Vendor logo updated successfully.', 'success');
          this.isEditLogoOpen = false;
          this.refreshAppState();
        } else {
          this.errorService.showToast(res?.message || 'Unable to update store logo.', 'error');
        }
      },
      error: () => {
        this.isUploadingLogo = false;
      }
    });
  }

  toggleDetailsEditor() {
    this.isEditDetailsOpen = !this.isEditDetailsOpen;
  }

  toggleBankEditor() {
    this.isEditBankOpen = !this.isEditBankOpen;
  }

  toggleLogoEditor() {
    this.isEditLogoOpen = !this.isEditLogoOpen;
  }

  private refreshAppState(): void {
    this.vendorService.getProfile().subscribe({
      next: (res) => {
        if (res?.success) {
          this.vendor = res.data;
          this.appRefreshService.notify('vendor');
        }
      }
    });
  }
}

