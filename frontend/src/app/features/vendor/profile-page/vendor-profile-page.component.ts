import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AppRefreshService } from '../../../core/services/app-refresh.service';
import { ErrorService } from '../../../core/services/error.service';
import { VendorService } from '../../../core/services/vendor.service';
import { VendorBankModalComponent } from '../bank-modal/vendor-bank-modal.component';
import { VendorDetailsModalComponent } from '../details-modal/vendor-details-modal.component';
import { VendorEmptyStateComponent } from '../empty-state/vendor-empty-state.component';
import { VendorLogoModalComponent } from '../logo-modal/vendor-logo-modal.component';
import { VendorProfileCardComponent } from '../profile-card/vendor-profile-card.component';
import { VendorBankDetailsForm, VendorDetailsForm, VendorProfile } from '../../../core/models/vendor.models';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

@Component({
  selector: 'app-vendor-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    VendorBankModalComponent,
    VendorProfileCardComponent,
    VendorDetailsModalComponent,
    VendorLogoModalComponent,
    VendorEmptyStateComponent,
    PageHeaderComponent
  ],
  template: `
    <section class="vendor-content">
      <div class="vendor-section">
        <div class="vendor-page-header">
          <app-page-header eyebrow="Store Profile" title="Vendor profile" titleClass="!text-[1.8rem] md:!text-[2.2rem]" />
        </div>

        <div *ngIf="isLoading" class="vendor-section-body flex flex-col items-center gap-4 py-20">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-amber-700"></div>
          <p class="font-medium text-slate-500">Loading store data...</p>
        </div>

        <div *ngIf="!isLoading && vendor" class="border-t border-slate-200 vendor-section-body">
          <app-vendor-profile-card
            [vendor]="vendor"
            [logoPreview]="logoPreview"
            [totalProducts]="totalProducts"
            [totalRevenue]="totalRevenue"
            [isMetricsLoading]="isMetricsLoading"
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
      </div>
    </section>
  `
})
export class VendorProfilePageComponent implements OnInit {
  vendor: VendorProfile | null = null;
  totalProducts = 0;
  totalRevenue = 0;
  isMetricsLoading = true;
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
    this.isMetricsLoading = true;

    forkJoin({
      profile: this.vendorService.getProfile(),
      products: this.vendorService.getMyProducts(1, 100),
      analytics: this.vendorService.getVendorAnalytics()
    }).subscribe({
      next: ({ profile, products, analytics }) => {
        this.isLoading = false;
        this.isMetricsLoading = false;

        if (profile?.success) {
          this.vendor = profile.data;
          this.form = {
            vendorAddress: profile.data.vendorAddress || '',
            vendorDescription: profile.data.vendorDescription || ''
          };
          this.bankForm = {
            accountHolderName: profile.data.bankDetails?.accountHolderName || '',
            accountNumber: profile.data.bankDetails?.accountNumber || '',
            ifscCode: profile.data.bankDetails?.ifscCode || '',
            bankName: profile.data.bankDetails?.bankName || '',
            upiId: profile.data.bankDetails?.upiId || ''
          };
        }

        this.totalProducts = Number(products?.data?.totalDocs || products?.data?.docs?.length || 0);
        this.totalRevenue = Number(analytics?.summary?.totalRevenue || 0);
      },
      error: () => {
        this.isLoading = false;
        this.isMetricsLoading = false;
        this.totalProducts = 0;
        this.totalRevenue = 0;
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
    this.loadVendorProfile();
    this.appRefreshService.notify('vendor');
  }
}

