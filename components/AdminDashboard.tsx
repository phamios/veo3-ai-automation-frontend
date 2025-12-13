import React, { useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import { adminApi, ApiError } from '../services/api';
import { RefreshCw, Check, X, Search, Copy, Download, User, CreditCard, Calendar, AlertCircle, Filter } from 'lucide-react';

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

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form handling for approval
  const [maxDevices, setMaxDevices] = useState(3);
  const [deliveryMethod, setDeliveryMethod] = useState('EMAIL');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const result = await adminApi.getOrders({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        limit: 50,
      });
      setOrders(result.orders);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    }
  }, [statusFilter, searchQuery]);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      // Stats are optional, don't block UI
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchOrders(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(fetchOrders, 15000); // Polling for new orders
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleApprove = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    setError(null);

    try {
      await adminApi.approveOrder(selectedOrder.id, {
        maxDevices,
        deliveryMethod,
        adminNotes: adminNotes || undefined,
      });
      alert(`Đã cấp License và gửi qua ${deliveryMethod}`);
      setSelectedOrder(null);
      resetForm();
      fetchOrders();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể xử lý đơn hàng');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await adminApi.rejectOrder(selectedOrder.id, { reason: rejectReason });
      setSelectedOrder(null);
      resetForm();
      fetchOrders();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể từ chối đơn hàng');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setMaxDevices(3);
    setDeliveryMethod('EMAIL');
    setAdminNotes('');
    setRejectReason('');
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case OrderStatus.PROCESSING: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case OrderStatus.COMPLETED: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case OrderStatus.REJECTED: return 'text-red-400 bg-red-400/10 border-red-400/20';
      case OrderStatus.EXPIRED: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-slate-400';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'Chờ thanh toán';
      case OrderStatus.PROCESSING: return 'Chờ xác nhận';
      case OrderStatus.COMPLETED: return 'Hoàn thành';
      case OrderStatus.REJECTED: return 'Đã hủy';
      case OrderStatus.EXPIRED: return 'Hết hạn';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      {/* Admin Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Admin Portal</h1>
              <p className="text-xs text-slate-400">CONTINUO System</p>
            </div>
          </div>
          <button onClick={onLogout} className="px-4 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors">
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400"><CreditCard size={20} /></div>
              <span className="text-slate-400 text-sm font-medium">Tổng đơn hàng</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.totalOrders ?? orders.length}</div>
          </div>
          <div className="glass-card p-5 rounded-xl border border-slate-700">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><RefreshCw size={20} /></div>
              <span className="text-slate-400 text-sm font-medium">Cần xử lý</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {stats?.processingOrders ?? orders.filter(o => o.status === OrderStatus.PROCESSING).length}
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl border border-slate-700">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Check size={20} /></div>
              <span className="text-slate-400 text-sm font-medium">Doanh thu tháng</span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {(stats?.monthlyRevenue ?? 0).toLocaleString()}đ
            </div>
          </div>
           <div className="glass-card p-5 rounded-xl border border-slate-700">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><User size={20} /></div>
              <span className="text-slate-400 text-sm font-medium">Tổng users</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{stats?.totalUsers ?? 0}</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">Quản lý đơn hàng</h2>
          <div className="flex gap-4 items-center w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PROCESSING">Chờ xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="REJECTED">Đã hủy</option>
              <option value="EXPIRED">Hết hạn</option>
            </select>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass-card rounded-xl overflow-hidden border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Mã Đơn</th>
                  <th className="p-4 font-medium">Khách Hàng</th>
                  <th className="p-4 font-medium">Gói Dịch Vụ</th>
                  <th className="p-4 font-medium">Số Tiền</th>
                  <th className="p-4 font-medium">Trạng Thái</th>
                  <th className="p-4 font-medium">Ngày Tạo</th>
                  <th className="p-4 font-medium text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Đang tải...
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-mono text-slate-300 text-sm">{order.id.slice(0, 8)}...</td>
                      <td className="p-4">
                        <div className="font-medium text-white">{order.userEmail}</div>
                        <div className="text-xs text-slate-500">ID: {order.userId.slice(0, 8)}...</div>
                      </td>
                      <td className="p-4 text-slate-300">{order.packageName}</td>
                      <td className="p-4 font-bold text-white">{order.amount.toLocaleString()}đ</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-brand-400 hover:text-brand-300 text-sm font-medium"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Chi tiết đơn hàng</h3>
                <p className="text-sm text-slate-400">ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => { setSelectedOrder(null); resetForm(); }} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase font-bold">Khách hàng</div>
                  <div className="text-white font-medium">{selectedOrder.userEmail}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase font-bold">Số tiền</div>
                  <div className="text-brand-400 font-bold text-lg">{selectedOrder.amount.toLocaleString()}đ</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase font-bold">Gói dịch vụ</div>
                  <div className="text-white">{selectedOrder.packageName}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 uppercase font-bold">Nội dung chuyển khoản</div>
                  <div className="text-white font-mono bg-slate-800 px-2 py-1 rounded inline-block">
                    {selectedOrder.transferContent}
                  </div>
                </div>
              </div>

              {selectedOrder.status === OrderStatus.PROCESSING && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                  <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                    <RefreshCw size={16} /> Cần xử lý
                  </h4>
                  <p className="text-sm text-yellow-100/80 mb-4">
                    Vui lòng kiểm tra tài khoản ngân hàng. Nếu đã nhận được <b>{selectedOrder.amount.toLocaleString()}đ</b> với nội dung <b>{selectedOrder.transferContent}</b>, hãy cấp license.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Số thiết bị tối đa</label>
                      <input
                        type="number"
                        value={maxDevices}
                        onChange={(e) => setMaxDevices(parseInt(e.target.value) || 1)}
                        min={1}
                        max={10}
                        className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Gửi qua</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="deliveryMethod" checked={deliveryMethod === 'EMAIL'} onChange={() => setDeliveryMethod('EMAIL')} className="text-brand-500" />
                          <span className="text-white">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="deliveryMethod" checked={deliveryMethod === 'TELEGRAM'} onChange={() => setDeliveryMethod('TELEGRAM')} className="text-brand-500" />
                          <span className="text-white">Telegram</span>
                        </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="deliveryMethod" checked={deliveryMethod === 'ZALO'} onChange={() => setDeliveryMethod('ZALO')} className="text-brand-500" />
                          <span className="text-white">Zalo</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Ghi chú (tùy chọn)</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Ghi chú nội bộ..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <label className="block text-sm font-medium text-red-400 mb-1">Lý do từ chối (nếu từ chối)</label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.status === OrderStatus.COMPLETED && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                  <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                    <Check size={16} /> Đã hoàn thành
                  </h4>
                  <div className="text-sm text-slate-300">
                    {selectedOrder.licenseKey && (
                      <p>License Key: <span className="font-mono text-white">{selectedOrder.licenseKey}</span></p>
                    )}
                  </div>
                </div>
              )}

              {selectedOrder.status === OrderStatus.REJECTED && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                  <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <X size={16} /> Đã từ chối
                  </h4>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button
                onClick={() => { setSelectedOrder(null); resetForm(); }}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
              >
                Đóng
              </button>

              {selectedOrder.status === OrderStatus.PROCESSING && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold border border-red-500/50 disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="px-6 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/25 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing && <RefreshCw size={16} className="animate-spin" />}
                    Xác nhận & Cấp License
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
