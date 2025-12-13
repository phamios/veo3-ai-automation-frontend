import React, { useEffect, useState } from 'react';
import { User, Package, Order, OrderStatus } from '../types';
import { packagesApi, ordersApi, authApi, ApiError } from '../services/api';
import { Check, User as UserIcon, LogOut, Clock, AlertCircle, FileText, RefreshCw } from './Icons';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onSelectPackage: (pkg: Package) => void;
}

// Status display helpers
const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ thanh toán',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.REJECTED]: 'Đã từ chối',
  [OrderStatus.EXPIRED]: 'Đã hết hạn',
};

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400',
  [OrderStatus.PROCESSING]: 'bg-blue-500/20 text-blue-400',
  [OrderStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
  [OrderStatus.REJECTED]: 'bg-red-500/20 text-red-400',
  [OrderStatus.EXPIRED]: 'bg-slate-500/20 text-slate-400',
};

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onSelectPackage }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    currentPlan?: string;
    planExpiresAt?: number;
  }>({
    currentPlan: user.currentPlan,
    planExpiresAt: user.planExpiresAt,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch packages
      try {
        const data = await packagesApi.getAll();
        setPackages(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Không thể tải danh sách gói dịch vụ');
        }
      } finally {
        setLoading(false);
      }

      // Fetch orders
      try {
        const result = await ordersApi.getMyOrders(1, 20);
        setOrders(result.orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setOrdersLoading(false);
      }

      try {
        const sub = await authApi.getSubscription();
        if (sub.hasActiveSubscription && sub.subscription) {
          setSubscription({
            currentPlan: sub.subscription.package.name,
            planExpiresAt: new Date(sub.subscription.endDate).getTime(),
          });
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* User Info Card */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-2 border-brand-500" />
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-slate-400">{user.email}</p>
              <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                subscription.planExpiresAt
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span>
                  {subscription.planExpiresAt
                    ? `${subscription.currentPlan || 'Đã kích hoạt'} - HSD: ${new Date(subscription.planExpiresAt).toLocaleDateString('vi-VN')}`
                    : 'Chưa có gói dịch vụ'
                  }
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>

        {/* My Orders Section */}
        {orders.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-brand-400" />
              Đơn hàng của tôi
            </h3>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Gói</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Số tiền</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Nội dung CK</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ngày tạo</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">License Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{order.packageName}</td>
                        <td className="px-6 py-4 text-brand-300 font-semibold">{order.amount.toLocaleString('vi-VN')}đ</td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-sm">{order.transferContent}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          {order.licenseKey ? (
                            <span className="font-mono text-green-400 text-sm">{order.licenseKey}</span>
                          ) : (
                            <span className="text-slate-500 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {ordersLoading && (
          <div className="mb-12 text-center py-8">
            <RefreshCw className="w-6 h-6 text-brand-400 animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Đang tải đơn hàng...</p>
          </div>
        )}

        <h3 className="text-2xl font-bold mb-8 text-white">Chọn Gói Dịch Vụ</h3>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Đang tải danh sách gói...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`glass-card p-6 rounded-2xl flex flex-col relative transition-transform hover:-translate-y-1 ${pkg.isPopular ? 'border-brand-500 ring-1 ring-brand-500/50 bg-brand-900/10' : 'border-slate-700'}`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-xs font-bold px-3 py-1 rounded-full text-white shadow-lg">
                    HOT NHẤT
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-white mb-1">{pkg.name}</h4>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-brand-300">{pkg.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                    {pkg.originalPrice > pkg.price && (
                      <div className="text-sm text-slate-500 line-through">{pkg.originalPrice.toLocaleString('vi-VN')}đ</div>
                    )}
                </div>
                
                {pkg.discount > 0 && (
                  <div className="inline-block bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded mb-4 w-fit">
                    Tiết kiệm {pkg.discount}%
                  </div>
                )}

                {/* Features list */}
                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-2 mb-4 flex-grow">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button 
                  onClick={() => onSelectPackage(pkg)}
                  className={`mt-auto w-full py-2.5 rounded-lg font-semibold transition-all ${pkg.isPopular ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                >
                  Mua Ngay
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;