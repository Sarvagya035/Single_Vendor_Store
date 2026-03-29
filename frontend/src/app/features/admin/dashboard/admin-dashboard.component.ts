import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { AdminService } from '../../../core/services/admin.service';
import {
  AdminProductRecord,
  AdminUserRecord,
  CategoryRecord,
  DashboardAnalyticsResponse
} from '../../../core/models/admin.models';
import { OrderRecord } from '../../../core/models/order.models';
import { OrderService } from '../../../core/services/order.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header.component';

type DashboardTone = 'indigo' | 'emerald' | 'sky' | 'amber' | 'rose' | 'violet';
type DashboardIcon =
  | 'revenue'
  | 'orders'
  | 'products'
  | 'customers'
  | 'pending'
  | 'delivered'
  | 'cancelled'
  | 'stock'
  | 'sales'
  | 'trend'
  | 'growth'
  | 'add'
  | 'manage'
  | 'ordersAction'
  | 'categories'
  | 'users';

interface DashboardStatCard {
  title: string;
  value: string;
  hint: string;
  icon: DashboardIcon;
  tone: DashboardTone;
  delta?: string;
  deltaTone?: 'up' | 'down' | 'flat';
}

interface QuickActionCard {
  label: string;
  description: string;
  route: string;
  icon: DashboardIcon;
  tone: DashboardTone;
}

interface ProductSalesRow {
  name: string;
  unitsSold: number;
  revenue: number;
  sku?: string;
}

interface RecentProductRow {
  name: string;
  brand: string;
  createdAt?: string;
  variantCount: number;
}

interface LowStockRow {
  name: string;
  lowestStock: number;
  lowVariantCount: number;
  sku?: string;
}

interface CustomerMetrics {
  total: number;
  newCustomers: number;
  returningCustomers: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  lastUpdatedLabel = 'just now';

  totalRevenue = 0;
  totalOrders = 0;
  totalProducts = 0;
  totalCustomers = 0;
  pendingOrders = 0;
  deliveredOrders = 0;
  cancelledOrders = 0;
  lowStockCount = 0;

  statCards: DashboardStatCard[] = [];
  quickActions: QuickActionCard[] = [
    {
      label: 'Add Product',
      description: 'Launch the product creation flow for new catalog items.',
      route: '/admin/products',
      icon: 'add',
      tone: 'indigo'
    },
    {
      label: 'Manage Products',
      description: 'Review pricing, stock, discounts, and product visibility.',
      route: '/admin/products',
      icon: 'products',
      tone: 'violet'
    },
    {
      label: 'View Orders',
      description: 'Track payments, delivery progress, and fulfillment status.',
      route: '/admin/orders',
      icon: 'ordersAction',
      tone: 'amber'
    },
    {
      label: 'Manage Categories',
      description: 'Keep the catalog taxonomy organized and easy to browse.',
      route: '/admin/categories',
      icon: 'categories',
      tone: 'sky'
    },
    {
      label: 'View Customers',
      description: 'Check customer growth and inspect user accounts.',
      route: '/admin/users',
      icon: 'users',
      tone: 'emerald'
    }
  ];

  recentOrders: OrderRecord[] = [];
  topSellingProducts: ProductSalesRow[] = [];
  recentProducts: RecentProductRow[] = [];
  lowStockProducts: LowStockRow[] = [];
  customerMetrics: CustomerMetrics = {
    total: 0,
    newCustomers: 0,
    returningCustomers: 0
  };
  customerGrowthSummary = '0 new this month';

  salesOverviewChartData: ChartData<'line'> = { labels: [], datasets: [] };
  revenueTrendChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  ordersTrendChartData: ChartData<'line'> = { labels: [], datasets: [] };
  customerGrowthChartData: ChartData<'line'> = { labels: [], datasets: [] };

  readonly lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  readonly miniLineChartOptions: ChartOptions<'line'> = {
    ...this.lineChartOptions
  };

  readonly barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  readonly toneClasses: Record<DashboardTone, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600'
  };

  readonly quickActionToneText: Record<DashboardTone, string> = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    sky: 'text-sky-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    violet: 'text-violet-600'
  };

  constructor(
    private adminService: AdminService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      users: this.adminService.getAllUsers(1, 1000),
      categories: this.adminService.getCategoryTree(),
      products: this.adminService.getAllProducts(),
      orders: this.orderService.getAdminOrders(),
      analytics: this.adminService.getDashboardAnalytics()
    }).subscribe({
      next: ({ users, categories, products, orders, analytics }) => {
        this.isLoading = false;

        const userList: AdminUserRecord[] = Array.isArray(users?.data?.users) ? users.data.users : [];
        const categoryTree: CategoryRecord[] = Array.isArray(categories?.data) ? categories.data : [];
        const productList: AdminProductRecord[] = Array.isArray(products?.data) ? products.data : [];
        const orderList: OrderRecord[] = Array.isArray(orders?.orders) ? orders.orders : [];
        const totalRevenue = Number(orders?.totalRevenue || 0);

        this.buildDashboard(userList, categoryTree, productList, orderList, totalRevenue, analytics);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Unable to load dashboard data.';
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  trackByStatCard(_: number, stat: DashboardStatCard): string {
    return stat.title;
  }

  trackByQuickAction(_: number, action: QuickActionCard): string {
    return action.label;
  }

  trackByOrder(index: number, order: OrderRecord): string {
    return order._id || String(index);
  }

  trackByProductSales(_: number, row: ProductSalesRow): string {
    return row.name;
  }

  trackByRecentProduct(_: number, row: RecentProductRow): string {
    return `${row.name}-${row.createdAt || 'recent'}`;
  }

  trackByLowStockProduct(_: number, row: LowStockRow): string {
    return `${row.name}-${row.lowestStock}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }

  shortOrderId(orderId?: string): string {
    return orderId ? orderId.slice(-8).toUpperCase() : '--------';
  }

  orderItemsLabel(order: OrderRecord): string {
    const count = this.itemCount(order);
    return `${this.formatNumber(count)} item${count === 1 ? '' : 's'}`;
  }

  customerName(order: OrderRecord): string {
    const user = order.user;
    if (user && typeof user === 'object') {
      return user.fullName || user.fullname || user.username || user.email || 'Customer';
    }
    return 'Customer';
  }

  customerEmail(order: OrderRecord): string {
    const user = order.user;
    if (user && typeof user === 'object') {
      return user.email || 'No email available';
    }
    return 'No email available';
  }

  itemCount(order: OrderRecord): number {
    return (order.orderItems || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  paymentBadgeClass(status?: string): string {
    switch ((status || 'Pending').toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      case 'failed':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  orderStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'Shipped':
        return 'bg-sky-100 text-sky-700';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  deltaClasses(direction?: 'up' | 'down' | 'flat'): string {
    switch (direction) {
      case 'up':
        return 'bg-emerald-50 text-emerald-700';
      case 'down':
        return 'bg-rose-50 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  private buildDashboard(
    users: AdminUserRecord[],
    categories: CategoryRecord[],
    products: AdminProductRecord[],
    orders: OrderRecord[],
    totalRevenue: number,
    analytics?: DashboardAnalyticsResponse
  ): void {
    const customerUsers = users.filter((user) => !this.isAdminUser(user));
    const now = new Date();
    const thirtyDaysAgo = this.addDays(now, -30);
    const sixtyDaysAgo = this.addDays(now, -60);

    const revenueLast30 = this.sumOrderValue(orders, thirtyDaysAgo, now);
    const revenuePrevious30 = this.sumOrderValue(orders, sixtyDaysAgo, thirtyDaysAgo);
    const ordersLast30 = this.countOrdersInRange(orders, thirtyDaysAgo, now);
    const ordersPrevious30 = this.countOrdersInRange(orders, sixtyDaysAgo, thirtyDaysAgo);
    const customersLast30 = customerUsers.filter((user) => this.isWithinRange(user.createdAt, thirtyDaysAgo, now)).length;
    const customersPrevious30 = customerUsers.filter((user) => this.isWithinRange(user.createdAt, sixtyDaysAgo, thirtyDaysAgo)).length;

    this.totalRevenue = analytics?.summary?.totalRevenue ?? totalRevenue;
    this.totalOrders = orders.length;
    this.totalProducts = products.length;
    this.totalCustomers = customerUsers.length;
    this.pendingOrders = analytics?.summary?.pendingOrders ?? orders.filter((order) => this.isPendingOrder(order)).length;
    this.deliveredOrders = analytics?.summary?.deliveredOrders ?? orders.filter((order) => order.orderStatus === 'Delivered').length;
    this.cancelledOrders = analytics?.summary?.cancelledOrders ?? orders.filter((order) => order.orderStatus === 'Cancelled').length;
    this.lowStockCount = this.findLowStockProducts(products).length;

    const topSellingProducts = this.buildTopSellingProducts(orders);
    const recentProducts = this.buildRecentProducts(products);
    const lowStockProducts = this.findLowStockProducts(products);
    const recentOrders = [...orders].sort((a, b) => this.toTime(b.createdAt) - this.toTime(a.createdAt)).slice(0, 8);
    const customerOrderCounts = this.buildCustomerOrderCounts(orders);
    const returningCustomers = customerUsers.filter((user) => {
      const userId = user._id;
      return !!userId && (customerOrderCounts.get(userId) || 0) > 1;
    }).length;

    this.statCards = [
      {
        title: 'Total Revenue',
        value: this.formatCurrency(totalRevenue),
        hint: 'Paid orders only',
        icon: 'revenue',
        tone: 'violet',
        delta: this.trendText(revenueLast30, revenuePrevious30),
        deltaTone: this.trendDirection(revenueLast30, revenuePrevious30)
      },
      {
        title: 'Total Orders',
        value: this.formatNumber(this.totalOrders),
        hint: 'Every order in the system',
        icon: 'orders',
        tone: 'amber',
        delta: this.trendText(ordersLast30, ordersPrevious30),
        deltaTone: this.trendDirection(ordersLast30, ordersPrevious30)
      },
      {
        title: 'Total Products',
        value: this.formatNumber(this.totalProducts),
        hint: `${this.formatNumber(this.newItemsInWindow(products, thirtyDaysAgo, now))} added this month`,
        icon: 'products',
        tone: 'indigo',
        delta: this.trendText(this.newItemsInWindow(products, thirtyDaysAgo, now), this.newItemsInWindow(products, sixtyDaysAgo, thirtyDaysAgo)),
        deltaTone: this.trendDirection(this.newItemsInWindow(products, thirtyDaysAgo, now), this.newItemsInWindow(products, sixtyDaysAgo, thirtyDaysAgo))
      },
      {
        title: 'Total Customers',
        value: this.formatNumber(this.totalCustomers),
        hint: 'Active customer accounts',
        icon: 'customers',
        tone: 'emerald',
        delta: this.trendText(customersLast30, customersPrevious30),
        deltaTone: this.trendDirection(customersLast30, customersPrevious30)
      },
      {
        title: 'Pending Orders',
        value: this.formatNumber(this.pendingOrders),
        hint: 'Awaiting fulfillment',
        icon: 'pending',
        tone: 'amber'
      },
      {
        title: 'Delivered Orders',
        value: this.formatNumber(this.deliveredOrders),
        hint: 'Completed and closed',
        icon: 'delivered',
        tone: 'sky'
      },
      {
        title: 'Cancelled Orders',
        value: this.formatNumber(this.cancelledOrders),
        hint: 'Orders reversed or aborted',
        icon: 'cancelled',
        tone: 'rose'
      },
      {
        title: 'Low Stock Products',
        value: this.formatNumber(this.lowStockCount),
        hint: 'Variants at or below 5 units',
        icon: 'stock',
        tone: 'violet'
      }
    ];

    this.recentOrders = recentOrders;
    this.topSellingProducts = topSellingProducts.slice(0, 5);
    this.recentProducts = recentProducts.slice(0, 2);
    this.lowStockProducts = lowStockProducts.slice(0, 5);
    this.customerMetrics = {
      total: analytics?.summary?.totalCustomers ?? this.totalCustomers,
      newCustomers: analytics?.summary?.newCustomers ?? customersLast30,
      returningCustomers: analytics?.summary?.returningCustomers ?? returningCustomers
    };
    this.customerGrowthSummary = `${this.formatNumber(this.customerMetrics.newCustomers)} new this month`;
    this.lastUpdatedLabel = this.formatRelativeTime(now);

    this.salesOverviewChartData = analytics
      ? this.createChartData('Revenue', analytics.charts.salesOverview.labels, analytics.charts.salesOverview.data, '#4f46e5', 'rgba(79, 70, 229, 0.12)')
      : this.buildMonthlyRevenueChart(orders, 6);
    this.revenueTrendChartData = analytics
      ? this.createBarChartData('Revenue', analytics.charts.revenueTrend.labels, analytics.charts.revenueTrend.data, 'rgba(14, 165, 233, 0.8)')
      : this.buildDailyRevenueChart(orders, 7);
    this.ordersTrendChartData = analytics
      ? this.createChartData('Orders', analytics.charts.ordersTrend.labels, analytics.charts.ordersTrend.data, '#f59e0b', 'rgba(245, 158, 11, 0.12)')
      : this.buildDailyOrdersChart(orders, 7);
    this.customerGrowthChartData = analytics
      ? this.createChartData('Customers', analytics.charts.customerGrowth.labels, analytics.charts.customerGrowth.data, '#10b981', 'rgba(16, 185, 129, 0.12)')
      : this.buildCustomerGrowthChart(customerUsers, 6);
  }

  private createChartData(
    label: string,
    labels: string[],
    data: number[],
    borderColor: string,
    backgroundColor: string
  ): ChartData<'line'> {
    return {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor,
          backgroundColor,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  }

  private createBarChartData(
    label: string,
    labels: string[],
    data: number[],
    backgroundColor: string
  ): ChartData<'bar'> {
    return {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor,
          borderRadius: 12,
          borderSkipped: false
        }
      ]
    };
  }

  private buildTopSellingProducts(orders: OrderRecord[]): ProductSalesRow[] {
    const salesMap = new Map<string, ProductSalesRow>();

    for (const order of orders) {
      for (const item of order.orderItems || []) {
        const name = item.name || 'Unnamed Product';
        const units = Number(item.quantity || 0);
        const revenue = Number(item.price || 0) * units;
        const key = `${name}-${item.sku || 'sku'}`;
        const existing = salesMap.get(key) || { name, unitsSold: 0, revenue: 0, sku: item.sku };

        existing.unitsSold += units;
        existing.revenue += revenue;
        salesMap.set(key, existing);
      }
    }

    return [...salesMap.values()].sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);
  }

  private buildRecentProducts(products: AdminProductRecord[]): RecentProductRow[] {
    return [...products]
      .sort((a, b) => this.toTime(b.createdAt) - this.toTime(a.createdAt))
      .map((product) => ({
        name: product.productName,
        brand: product.brand || 'Generic',
        createdAt: product.createdAt,
        variantCount: product.variants?.length || 0
      }));
  }

  private findLowStockProducts(products: AdminProductRecord[]): LowStockRow[] {
    return products
      .map((product) => {
        const lowVariants = (product.variants || []).filter((variant) => Number(variant.productStock || 0) <= 5);
        if (!lowVariants.length) {
          return null;
        }

        const lowestStock = lowVariants.reduce(
          (lowest, variant) => Math.min(lowest, Number(variant.productStock || 0)),
          Number(lowVariants[0]?.productStock || 0)
        );

        return {
          name: product.productName,
          lowestStock,
          lowVariantCount: lowVariants.length,
          sku: lowVariants[0]?.sku
        } as LowStockRow;
      })
      .filter((product): product is LowStockRow => Boolean(product))
      .sort((a, b) => a.lowestStock - b.lowestStock);
  }

  private buildCustomerOrderCounts(orders: OrderRecord[]): Map<string, number> {
    const counts = new Map<string, number>();

    for (const order of orders) {
      const userId = this.orderUserId(order);
      if (!userId) {
        continue;
      }

      counts.set(userId, (counts.get(userId) || 0) + 1);
    }

    return counts;
  }

  private buildMonthlyRevenueChart(orders: OrderRecord[], months: number): ChartData<'line'> {
    const buckets = this.createMonthlyBuckets(months);

    for (const order of orders) {
      const date = this.parseDate(order.createdAt);
      if (!date) {
        continue;
      }

      const bucketIndex = this.getMonthlyBucketIndex(buckets, date);
      if (bucketIndex === -1) {
        continue;
      }

      buckets[bucketIndex].value += Number(order.totalAmount || 0);
    }

    return {
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: 'Revenue',
          data: buckets.map((bucket) => bucket.value),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  }

  private buildDailyRevenueChart(orders: OrderRecord[], days: number): ChartData<'bar'> {
    const buckets = this.createDailyBuckets(days);

    for (const order of orders) {
      const date = this.parseDate(order.createdAt);
      if (!date) {
        continue;
      }

      const bucket = buckets.find((entry) => this.isSameDay(entry.date, date));
      if (!bucket) {
        continue;
      }

      bucket.value += Number(order.totalAmount || 0);
    }

    return {
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: 'Revenue',
          data: buckets.map((bucket) => bucket.value),
          backgroundColor: 'rgba(14, 165, 233, 0.8)',
          borderRadius: 12,
          borderSkipped: false
        }
      ]
    };
  }

  private buildDailyOrdersChart(orders: OrderRecord[], days: number): ChartData<'line'> {
    const buckets = this.createDailyBuckets(days);

    for (const order of orders) {
      const date = this.parseDate(order.createdAt);
      if (!date) {
        continue;
      }

      const bucket = buckets.find((entry) => this.isSameDay(entry.date, date));
      if (!bucket) {
        continue;
      }

      bucket.value += 1;
    }

    return {
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: 'Orders',
          data: buckets.map((bucket) => bucket.value),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  }

  private buildCustomerGrowthChart(users: AdminUserRecord[], months: number): ChartData<'line'> {
    const buckets = this.createMonthlyBuckets(months);

    for (const user of users) {
      if (this.isAdminUser(user)) {
        continue;
      }

      const date = this.parseDate(user.createdAt);
      if (!date) {
        continue;
      }

      const bucketIndex = this.getMonthlyBucketIndex(buckets, date);
      if (bucketIndex === -1) {
        continue;
      }

      buckets[bucketIndex].value += 1;
    }

    return {
      labels: buckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: 'Customers',
          data: buckets.map((bucket) => bucket.value),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    };
  }

  private createMonthlyBuckets(months: number): Array<{ label: string; date: Date; value: number }> {
    const buckets: Array<{ label: string; date: Date; value: number }> = [];
    const now = new Date();

    for (let offset = months - 1; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      buckets.push({
        label: date.toLocaleDateString('en-IN', { month: 'short' }),
        date,
        value: 0
      });
    }

    return buckets;
  }

  private createDailyBuckets(days: number): Array<{ label: string; date: Date; value: number }> {
    const buckets: Array<{ label: string; date: Date; value: number }> = [];
    const now = this.startOfDay(new Date());

    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = this.addDays(now, -offset);
      buckets.push({
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        date,
        value: 0
      });
    }

    return buckets;
  }

  private getMonthlyBucketIndex(
    buckets: Array<{ date: Date; value: number }>,
    date: Date
  ): number {
    return buckets.findIndex((bucket) => {
      return (
        bucket.date.getFullYear() === date.getFullYear() &&
        bucket.date.getMonth() === date.getMonth()
      );
    });
  }

  private isPendingOrder(order: OrderRecord): boolean {
    const status = String(order.orderStatus || '').toLowerCase();
    const paymentStatus = String(order.paymentInfo?.status || '').toLowerCase();
    return status === 'processing' || status === 'pending' || paymentStatus === 'pending';
  }

  private isAdminUser(user: AdminUserRecord): boolean {
    const roles = Array.isArray(user.role) ? user.role : [user.role];
    return roles.some((role) => String(role || '').toLowerCase() === 'admin');
  }

  private isWithinRange(value?: string, start?: Date, end?: Date): boolean {
    const date = this.parseDate(value);
    if (!date || !start || !end) {
      return false;
    }

    return date.getTime() >= start.getTime() && date.getTime() < end.getTime();
  }

  private countOrdersInRange(orders: OrderRecord[], start: Date, end: Date): number {
    return orders.filter((order) => this.isWithinRange(order.createdAt, start, end)).length;
  }

  private sumOrderValue(orders: OrderRecord[], start: Date, end: Date): number {
    return orders
      .filter((order) => this.isWithinRange(order.createdAt, start, end))
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }

  private newItemsInWindow(products: AdminProductRecord[], start: Date, end: Date): number {
    return products.filter((product) => this.isWithinRange(product.createdAt, start, end)).length;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return this.startOfDay(result);
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private parseDate(value?: string): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private toTime(value?: string): number {
    const date = this.parseDate(value);
    return date ? date.getTime() : 0;
  }

  private orderUserId(order: OrderRecord): string {
    if (order.user && typeof order.user === 'object') {
      return order.user._id || '';
    }

    return typeof order.user === 'string' ? order.user : '';
  }

  private trendText(current: number, previous: number): string {
    const percent = this.percentageChange(current, previous);

    if (percent === null) {
      return 'No prior data';
    }

    const direction = percent > 0 ? '+' : percent < 0 ? '-' : '';
    return `${direction}${Math.abs(percent).toFixed(0)}% vs prior 30 days`;
  }

  private trendDirection(current: number, previous: number): 'up' | 'down' | 'flat' {
    const percent = this.percentageChange(current, previous);
    if (percent === null || percent === 0) {
      return 'flat';
    }

    return percent > 0 ? 'up' : 'down';
  }

  private percentageChange(current: number, previous: number): number | null {
    if (current === 0 && previous === 0) {
      return null;
    }

    if (previous === 0) {
      return current > 0 ? 100 : null;
    }

    return ((current - previous) / previous) * 100;
  }

  private formatRelativeTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(date);
  }
}
