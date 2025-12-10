import { Order, OrderStatus, Package, User, UserRole } from '../types';

// --- MOCK DATABASE ---
const STORAGE_KEYS = {
  USERS: 'veo3_db_users',
  ORDERS: 'veo3_db_orders',
  SESSION: 'veo3_active_session_server_side', // Simulates Redis
  CURRENT_USER: 'veo3_local_user'
};

// Seed Data
const PACKAGES: Package[] = [
  { id: 'p1', name: '1 Tháng', durationMonths: 1, originalPrice: 499000, price: 499000, discount: 0 },
  { id: 'p2', name: '2 Tháng', durationMonths: 2, originalPrice: 998000, price: 899000, discount: 10 },
  { id: 'p3', name: '3 Tháng', durationMonths: 3, originalPrice: 1497000, price: 1199000, discount: 20, isPopular: true },
  { id: 'p6', name: '6 Tháng', durationMonths: 6, originalPrice: 2994000, price: 2099000, discount: 30 },
  { id: 'p12', name: '1 Năm', durationMonths: 12, originalPrice: 5988000, price: 3599000, discount: 40 },
];

// Helpers
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
};

const saveOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

// --- AUTH & SESSION SERVICES ---

export const authService = {
  login: async (isAdmin: boolean = false): Promise<User> => {
    await delay(800);
    const user: User = {
      id: isAdmin ? 'admin_01' : `user_${Math.random().toString(36).substr(2, 9)}`,
      email: isAdmin ? 'admin@veo3.ai' : 'demo.user@gmail.com',
      name: isAdmin ? 'Quản Trị Viên' : 'Nguyễn Văn A',
      avatar: 'https://picsum.photos/100/100',
      role: isAdmin ? UserRole.ADMIN : UserRole.USER
    };
    
    // Create new session ID
    const newSessionId = Math.random().toString(36).substr(2);
    
    // Store in "Redis" (localStorage for simulation across tabs)
    const sessionData = {
      userId: user.id,
      sessionId: newSessionId,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...user, sessionId: newSessionId }));
    
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    // In a real app, we would clear the Redis key too, 
    // but for single session demo, we leave the server key to invalidate this client
  },

  getCurrentUser: (): (User & { sessionId: string }) | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  // Check if current local session matches the "server" session
  checkSessionValidity: async (): Promise<boolean> => {
    // In real app: API call to backend to validate JWT/SessionID
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;

    const serverSessionRaw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!serverSessionRaw) return false;

    const serverSession = JSON.parse(serverSessionRaw);
    
    // If the server has a different session ID for this user, force logout
    // Note: Simple logic for demo. Real app checks DB/Redis.
    if (serverSession.userId === currentUser.id && serverSession.sessionId !== currentUser.sessionId) {
      return false;
    }
    return true;
  }
};

// --- DATA SERVICES ---

export const dataService = {
  getPackages: async () => {
    await delay(300);
    return PACKAGES;
  },

  createOrder: async (userId: string, userEmail: string, pkg: Package): Promise<Order> => {
    await delay(500);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uniqueSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId,
      userEmail,
      packageId: pkg.id,
      packageName: pkg.name,
      amount: pkg.price,
      status: OrderStatus.PENDING,
      createdAt: Date.now(),
      transferContent: `VEO3 ${dateStr} ${uniqueSuffix}`
    };

    const orders = getOrders();
    orders.push(newOrder);
    saveOrders(orders);
    
    // Simulate Telegram Notification
    console.log(`[TELEGRAM BOT] New Order Created: ${newOrder.id} - ${newOrder.amount} VND`);
    
    return newOrder;
  },

  confirmPayment: async (orderId: string): Promise<Order | null> => {
    await delay(1000);
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    orders[idx].status = OrderStatus.PROCESSING;
    saveOrders(orders);

    console.log(`[TELEGRAM BOT] User confirmed payment for Order: ${orderId}. Admin please check.`);
    return orders[idx];
  },

  // ADMIN ONLY
  getAllOrders: async (): Promise<Order[]> => {
    await delay(600);
    return getOrders().sort((a, b) => b.createdAt - a.createdAt);
  },

  processOrder: async (orderId: string, action: 'APPROVE' | 'REJECT', details?: { licenseKey: string, downloadLink: string }): Promise<Order | null> => {
    await delay(1000);
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    if (action === 'APPROVE' && details) {
      orders[idx].status = OrderStatus.COMPLETED;
      orders[idx].licenseKey = details.licenseKey;
      orders[idx].downloadLink = details.downloadLink;
      console.log(`[TELEGRAM BOT] Order ${orderId} APPROVED. License sent to user.`);
    } else {
      orders[idx].status = OrderStatus.REJECTED;
      console.log(`[TELEGRAM BOT] Order ${orderId} REJECTED.`);
    }

    saveOrders(orders);
    return orders[idx];
  }
};