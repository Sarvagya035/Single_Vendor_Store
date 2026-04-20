import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/store/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/store/cart.component').then((m) => m.CartComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'addresses',
    loadComponent: () =>
      import('./features/store/addresses.component').then((m) => m.AddressesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/store/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/store/orders.component').then((m) => m.OrdersComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/store/wishlist.component').then((m) => m.WishlistComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders/:orderId',
    loadComponent: () =>
      import('./features/store/order-detail.component').then((m) => m.OrderDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'track-order/:orderId',
    loadComponent: () =>
      import('./features/store/track-order.component').then((m) => m.TrackOrderComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'products/:productId',
    loadComponent: () =>
      import('./features/store/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/store/products-page.component').then((m) => m.ProductsPageComponent)
  },
  {
    path: 'about-us',
    loadComponent: () =>
      import('./features/store/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/store/contact.component').then((m) => m.ContactComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password.component').then((m) => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password.component').then((m) => m.ResetPasswordComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'vendor/initial-setup',
    loadComponent: () =>
      import('./features/vendor/initial-setup-page/vendor-initial-setup-page.component').then(
        (m) => m.VendorInitialSetupPageComponent
      )
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/customer/profile/customer-profile.component').then((m) => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/edit',
    loadComponent: () =>
      import('./features/customer/edit-profile/customer-edit-profile.component').then((m) => m.EditProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'vendor',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['vendor', 'Vendor', 'admin', 'Admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/dashboard/vendor-dashboard.component').then((m) => m.VendorDashboardComponent)
          }
        ]
      },
      {
        path: 'products/add',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/add-product/vendor-add-product.component').then((m) => m.VendorAddProductComponent)
          }
        ]
      },
      {
        path: 'products/:productId/view',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/view-product-page/vendor-view-product-page.component').then(
                (m) => m.VendorViewProductPageComponent
              )
          }
        ]
      },
      {
        path: 'products/:productId/edit',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/edit-product-page/vendor-edit-product-page.component').then(
                (m) => m.VendorEditProductPageComponent
              )
          }
        ]
      },
      {
        path: 'products/:productId/restock',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/restock-page/vendor-restock-page.component').then(
                (m) => m.VendorRestockPageComponent
              )
          }
        ]
      },
      {
        path: 'products/:productId/variants',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/manage-variants-page/vendor-manage-variants-page.component').then(
                (m) => m.VendorManageVariantsPageComponent
              )
          }
        ]
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/profile-page/vendor-profile-page.component').then((m) => m.VendorProfilePageComponent)
          }
        ]
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/products-page/vendor-products-page.component').then((m) => m.VendorProductsPageComponent)
          }
        ]
      },
      {
        path: 'best-selling-products',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/best-selling-products-page/vendor-best-selling-products-page.component').then(
                (m) => m.VendorBestSellingProductsPageComponent
              )
          }
        ]
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/categories-page/vendor-categories-page.component').then(
                (m) => m.VendorCategoriesPageComponent
              )
          }
        ]
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/customers-page/vendor-customers-page.component').then(
                (m) => m.VendorCustomersPageComponent
              )
          }
        ]
      },
      {
        path: 'customers/:userId',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/customer-details-page/vendor-customer-details-page.component').then(
                (m) => m.VendorCustomerDetailsPageComponent
              )
          }
        ]
      },
      {
        path: 'customers/:userId/orders',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/customer-orders-page/vendor-customer-orders-page.component').then(
                (m) => m.VendorCustomerOrdersPageComponent
              )
          },
          {
            path: ':orderId',
            loadComponent: () =>
              import('./features/vendor/customer-order-detail-page/vendor-customer-order-detail-page.component').then(
                (m) => m.VendorCustomerOrderDetailPageComponent
              )
          }
        ]
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/orders-page/vendor-orders-page.component').then((m) => m.VendorOrdersPageComponent)
          },
          {
            path: ':orderId',
            loadComponent: () =>
              import('./features/store/order-detail.component').then((m) => m.OrderDetailComponent)
          }
        ]
      },
      {
        path: 'shipments',
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['admin', 'Admin'] },
        loadComponent: () =>
          import('./features/vendor/shell/vendor-shell.component').then((m) => m.VendorShellComponent),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/vendor/shipments-page/vendor-shipments-page.component').then(
                (m) => m.VendorShipmentsPageComponent
              )
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
