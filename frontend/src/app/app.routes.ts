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
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/shell/admin-shell.component').then((m) => m.AdminShellComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'Admin'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users-page/admin-users-page.component').then((m) => m.AdminUsersPageComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories-page/admin-categories-page.component').then((m) => m.AdminCategoriesPageComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products-page/admin-products-page.component').then((m) => m.AdminProductsPageComponent)
      },
      {
        path: 'products/:productId',
        loadComponent: () =>
          import('./features/admin/product-detail-page/admin-product-detail-page.component').then((m) => m.AdminProductDetailPageComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/orders-page/admin-orders-page.component').then((m) => m.AdminOrdersPageComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
