// Orders API Service
import { get, post } from './client';
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
    name: string;
    email: string;
  };
  package?: {
    name: string;
    durationMonths: number;
  };
  license?: {
    licenseKey: string;
    endDate: string;
  };
}

interface CreateOrderRequest {
  packageId: string;
  paymentMethod?: string;
}

interface PaymentInfo {
  qrCode: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  amount: number;
  transferContent: string;
  vietQRUrl: string;
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
  downloadLink: undefined, // Will be added if available
});

export const ordersApi = {
  /**
   * Create a new order
   */
  create: async (
    packageId: string,
    paymentMethod = 'VND_BANK_TRANSFER'
  ): Promise<{ order: Order; payment: PaymentInfo }> => {
    const response = await post<{
      order: BackendOrder;
      payment: PaymentInfo;
    }>('/orders', { packageId, paymentMethod });

    return {
      order: toFrontendOrder(response.order),
      payment: response.payment,
    };
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    const order = await get<BackendOrder>(`/orders/${id}`);
    return toFrontendOrder(order);
  },

  /**
   * Confirm payment for an order
   */
  confirmPayment: async (orderId: string): Promise<Order> => {
    const order = await post<BackendOrder>(`/orders/${orderId}/confirm`);
    return toFrontendOrder(order);
  },

  /**
   * Get order status
   */
  getStatus: async (orderId: string): Promise<{ status: OrderStatus }> => {
    const result = await get<{ status: string }>(`/orders/${orderId}/status`);
    return { status: result.status as OrderStatus };
  },

  /**
   * Get user's orders (from users endpoint)
   */
  getMyOrders: async (
    page = 1,
    limit = 10
  ): Promise<{ orders: Order[]; total: number }> => {
    const response = await get<{
      orders: BackendOrder[];
      pagination: { total: number };
    }>(`/users/orders?page=${page}&limit=${limit}`);

    return {
      orders: response.orders.map(toFrontendOrder),
      total: response.pagination.total,
    };
  },
};
