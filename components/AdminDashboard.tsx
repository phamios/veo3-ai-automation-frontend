import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import { dataService } from '../services/mockApi';
import { RefreshCw, Check, X, Search, Copy, Download, User, CreditCard, Calendar } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Form handling for approval
  const [licenseKey, setLicenseKey] = useState('');
  const [downloadLink, setDownloadLink] = useState('https://veo3.ai/download/app-v1.0.zip');
  const [sendMethod, setSendMethod] = useState('EMAIL');

  const fetchOrders = async () => {
    setLoading(true);
    const data = await dataService.getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Polling for new orders
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async () => {
    if (!selectedOrder) return;
    
    // Auto generate key if empty
    const finalKey = licenseKey || `LICENSE-${Math.random().toString(36).substr(2, 8).toUpperCase()}-${Date.now()}`;
    
    await dataService.processOrder(selectedOrder.id, 'APPROVE', {
      licenseKey: finalKey,
      downloadLink
    });
    
    alert(`Đã gửi License cho user qua ${sendMethod}`);
    setSelectedOrder(null);
    fetchOrders();
  };

  const handleReject = async () => {
    if (!selectedOrder) return;
    if (confirm('Bạn chắc chắn muốn từ chối đơn hàng này?')) {
      await dataService.processOrder(selectedOrder.id, 'REJECT');
      setSelectedOrder(null);
      fetchOrders();
    }
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
              <p className="text-xs text-slate-400">Veo3 Automation System</p>
            </div>
          </div>
          <button onClick={onLogout} className="px-4 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors">
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400"><CreditCard size={20} /></div>
              <span className="text-slate-400 text-sm font-medium">Tổng đơn hàng</span>
            </div>
            <div className="text-3xl font-bold text-white">{orders.length}</div>
          </div>
          <div className="glass-card p-5 rounded-xl border border-slate-700">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><RefreshCw size={20} /></div>
              <span className="text-slate-400 text-sm font-medium">Cần xử lý</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {orders.filter(o => o.status === OrderStatus.PROCESSING).length}
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl border border-slate-700">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Check size={20} /></div>
              <span className="text-slate-400 text-sm font-medium">Doanh thu</span>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {orders.reduce((acc, curr) => curr.status === OrderStatus.COMPLETED ? acc + curr.amount : acc, 0).toLocaleString()}đ
            </div>
          </div>
           <div className="glass-card p-5 rounded-xl border border-slate-700">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><User size={20} /></div>
              <span className="text-slate-400 text-sm font-medium">User mới</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">12</div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">Quản lý đơn hàng</h2>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn, email..." 
              className="w-full md:w-64 bg-slate-800 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <button onClick={fetchOrders} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={20} />
          </button>
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-slate-300 text-sm">{order.id}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{order.userEmail}</div>
                      <div className="text-xs text-slate-500">ID: {order.userId}</div>
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
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500">Chưa có đơn hàng nào.</div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                <p className="text-sm text-slate-400">Tạo lúc: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
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
                      <label className="block text-sm font-medium text-slate-400 mb-1">License Key (Để trống để tự tạo)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={licenseKey}
                          onChange={(e) => setLicenseKey(e.target.value)}
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                        />
                        <button 
                          className="px-3 py-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                          title="Generate Random"
                          onClick={() => setLicenseKey(`KEY-${Math.random().toString(36).substr(2, 8).toUpperCase()}`)}
                        >
                          <RefreshCw size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Link Tải App</label>
                      <input 
                        type="text" 
                        value={downloadLink}
                        onChange={(e) => setDownloadLink(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Gửi qua</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="sendMethod" checked={sendMethod === 'EMAIL'} onChange={() => setSendMethod('EMAIL')} className="text-brand-500" />
                          <span className="text-white">Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="sendMethod" checked={sendMethod === 'TELEGRAM'} onChange={() => setSendMethod('TELEGRAM')} className="text-brand-500" />
                          <span className="text-white">Telegram</span>
                        </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="sendMethod" checked={sendMethod === 'ZALO'} onChange={() => setSendMethod('ZALO')} className="text-brand-500" />
                          <span className="text-white">Zalo</span>
                        </label>
                      </div>
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
                    <p>License Key: <span className="font-mono text-white">{selectedOrder.licenseKey}</span></p>
                    <p>Đã gửi qua: <span className="font-medium text-white">Email</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
              >
                Đóng
              </button>
              
              {selectedOrder.status === OrderStatus.PROCESSING && (
                <>
                  <button 
                    onClick={handleReject}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold border border-red-500/50"
                  >
                    Từ chối
                  </button>
                  <button 
                    onClick={handleApprove}
                    className="px-6 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/25"
                  >
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