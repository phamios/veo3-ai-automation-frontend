// Admin API Service
import { get, put } from './client';
import { Order, OrderStatus } from '../../types';

interface BackendOrder {
  id: string;
  orderNumber: string;
  userId: string;
  packageId: string;
  amount: string | number;
  currency: string;
  paymentMethod: string;
  transferContent: string;
  status: string;
  userConfirmedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  licenseId?: string;
  deliveryMethod?: string;
  deliveryContact?: string;
  deliveredAt?: string;
  adminNotes?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  package?: {
    name: string;
    durationMonths: number;
    salePrice: string | number;
  };
  license?: {
    licenseKey: string;
    endDate: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  expiredOrders: number;
  totalLicenses: number;
  activeLicenses: number;
  monthlyRevenue: number;
}

interface ApproveOrderRequest {
  maxDevices?: number;
  deliveryMethod?: string;
  deliveryContact?: string;
  adminNotes?: string;
}

interface RejectOrderRequest {
  reason: string;
}

// Convert backend order to frontend format
const toFrontendOrder = (order: BackendOrder): Order => ({
  id: order.id,
  userId: order.userId,
  userEmail: order.user?.email || '',
  packageId: order.packageId,
  packageName: order.package?.name || '',
  amount: Number(order.amount),
  status: order.status as OrderStatus,
  createdAt: new Date(order.createdAt).getTime(),
  transferContent: order.transferContent,
  licenseKey: order.license?.licenseKey,
  downloadLink: undefined,
});

export const adminApi = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    return get<DashboardStats>('/admin/dashboard');
  },

  /**
   * Get all orders with filters
   */
  getOrders: async (params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; pagination: { total: number; page: number; totalPages: number } }> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await get<{
      orders: BackendOrder[];
      pagination: { total: number; page: number; totalPages: number };
    }>(`/admin/orders?${queryParams.toString()}`);

    return {
      orders: response.orders.map(toFrontendOrder),
      pagination: response.pagination,
    };
  },

  /**
   * Get single order details
   */
  getOrder: async (id: string): Promise<BackendOrder> => {
    return get<BackendOrder>(`/admin/orders/${id}`);
  },

  /**
   * Approve an order
   */
  approveOrder: async (
    orderId: string,
    data: ApproveOrderRequest
  ): Promise<Order> => {
    const order = await put<BackendOrder>(`/admin/orders/${orderId}/approve`, data);
    return toFrontendOrder(order);
  },

  /**
   * Reject an order
   */
  rejectOrder: async (
    orderId: string,
    data: RejectOrderRequest
  ): Promise<Order> => {
    const order = await put<BackendOrder>(`/admin/orders/${orderId}/reject`, data);
    return toFrontendOrder(order);
  },
};
