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
    path: 'orders/:orderId',
    loadComponent: () =>
      import('./features/store/order-detail.component').then((m) => m.OrderDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'products/:productId',
    loadComponent: () =>
      import('./features/store/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
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
    data: { roles: ['vendor', 'Vendor'] },
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
          import('./features/vendor/add-product/vendor-add-product.component').then((m) => m.VendorAddProductComponent)
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
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
