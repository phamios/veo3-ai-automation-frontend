import React, { useEffect, useState } from 'react';
import { User, Package } from '../types';
import { dataService } from '../services/mockApi';
import { Check, User as UserIcon, LogOut, Clock } from './Icons';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onSelectPackage: (pkg: Package) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onSelectPackage }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      const data = await dataService.getPackages();
      setPackages(data);
      setLoading(false);
    };
    fetchPackages();
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
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sm">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Trạng thái: {user.planExpiresAt ? 'Đã kích hoạt' : 'Chưa có gói dịch vụ'}</span>
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

        <h3 className="text-2xl font-bold mb-8 text-white">Chọn Gói Dịch Vụ</h3>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Đang tải danh sách gói...</div>
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