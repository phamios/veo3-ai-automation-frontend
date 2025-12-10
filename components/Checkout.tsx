import React, { useState } from 'react';
import { Package, Order, OrderStatus } from '../types';
import { dataService } from '../services/mockApi';
import { ArrowLeft, CheckCircle, Copy, AlertCircle, CreditCard, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface CheckoutProps {
  user: User;
  pkg: Package;
  onBack: () => void;
  onSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ user, pkg, onBack, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'VND' | 'USDT'>('VND');
  const [showUSDTAlert, setShowUSDTAlert] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectMethod = (method: 'VND' | 'USDT') => {
    if (method === 'USDT') {
      setShowUSDTAlert(true);
      return;
    }
    setPaymentMethod(method);
    initOrder();
  };

  const initOrder = async () => {
    setIsProcessing(true);
    const newOrder = await dataService.createOrder(user.id, user.email, pkg);
    setOrder(newOrder);
    setStep(2);
    setIsProcessing(false);
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    setIsProcessing(true);
    await dataService.confirmPayment(order.id);
    setStep(3);
    setIsProcessing(false);
  };

  // VietQR QuickLink
  // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>
  const qrUrl = order 
    ? `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${order.amount}&addInfo=${encodeURIComponent(order.transferContent)}&accountName=CONG TY VEO3 AI`
    : '';

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
          <p className="text-slate-400 mb-8">
            Đơn hàng của bạn đang được xử lý. Admin sẽ kiểm tra và gửi License Key cho bạn qua Email trong vòng 15 phút - 2 giờ.
          </p>
          <div className="bg-slate-800/50 p-4 rounded-xl text-left mb-6">
            <p className="text-sm text-slate-400 mb-1">Mã đơn hàng:</p>
            <p className="font-mono text-white">{order?.id}</p>
          </div>
          <div className="space-y-3">
             <button onClick={onSuccess} className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold">
              Về Trang Chủ
            </button>
            <a href="https://t.me/support_veo3" target="_blank" rel="noreferrer" className="block w-full py-3 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700">
              Liên hệ Hỗ trợ (Telegram)
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" /> Quay lại
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="glass-card p-6 rounded-2xl h-fit">
            <h3 className="text-xl font-bold text-white mb-4">Tóm tắt đơn hàng</h3>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Gói dịch vụ</span>
              <span className="text-white font-medium">{pkg.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Thời hạn</span>
              <span className="text-white font-medium">{pkg.durationMonths} Tháng</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-700">
              <span className="text-slate-400">Giá gốc</span>
              <span className="text-slate-500 line-through">{pkg.originalPrice.toLocaleString('vi-VN')}đ</span>
            </div>
            {pkg.discount > 0 && (
              <div className="flex justify-between py-3 border-b border-slate-700">
                <span className="text-slate-400">Giảm giá</span>
                <span className="text-green-400 font-medium">-{pkg.discount}%</span>
              </div>
            )}
            <div className="flex justify-between py-4 mt-2">
              <span className="text-lg text-white font-bold">Tổng cộng</span>
              <span className="text-2xl text-brand-400 font-bold">{pkg.price.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* Steps */}
          <div className="glass-card p-6 rounded-2xl">
            {step === 1 && (
              <>
                <h3 className="text-xl font-bold text-white mb-6">Chọn phương thức thanh toán</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => handleSelectMethod('VND')}
                    className="w-full p-4 rounded-xl border border-brand-500 bg-brand-900/20 flex items-center justify-between group hover:bg-brand-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-6 h-6 text-brand-400" />
                      <div className="text-left">
                        <div className="font-bold text-white">Chuyển khoản Ngân hàng (VNĐ)</div>
                        <div className="text-sm text-slate-400">VietQR, Internet Banking</div>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-brand-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSelectMethod('USDT')}
                    className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800/50 flex items-center justify-between opacity-70 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-white">$</div>
                      <div className="text-left">
                        <div className="font-bold text-slate-300">Crypto (USDT)</div>
                        <div className="text-sm text-slate-500">Mạng TRC20, BEP20</div>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">Coming Soon</span>
                  </button>
                </div>

                {isProcessing && <div className="mt-4 text-center text-slate-400 animate-pulse">Đang tạo đơn hàng...</div>}
              </>
            )}

            {step === 2 && order && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-2">Quét mã QR để thanh toán</h3>
                
                <div className="bg-white p-4 rounded-xl w-fit mx-auto">
                  <img src={qrUrl} alt="VietQR" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
                </div>

                <div className="bg-slate-800/80 p-4 rounded-xl space-y-3 text-sm">
                   <div className="flex justify-between items-center">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="text-white font-medium">MB Bank</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">0987654321</span>
                      <Copy className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
                    </div>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="text-slate-400">Chủ tài khoản:</span>
                    <span className="text-white font-medium">CONG TY VEO3 AI</span>
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                    <div className="text-slate-400 mb-1">Nội dung chuyển khoản (Bắt buộc):</div>
                    <div className="flex items-center justify-between bg-brand-900/40 border border-brand-500/50 p-3 rounded-lg">
                      <span className="text-brand-300 font-mono font-bold text-lg">{order.transferContent}</span>
                      <button className="text-brand-400 hover:text-brand-200" title="Copy">
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-yellow-500 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      Vui lòng nhập chính xác nội dung chuyển khoản để được kích hoạt tự động.
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Tôi Đã Thanh Toán
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* USDT Alert Modal */}
      {showUSDTAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-slate-400 mb-6">Thanh toán bằng USDT sẽ sớm ra mắt. Hiện tại vui lòng chọn VNĐ.</p>
            <button 
              onClick={() => setShowUSDTAlert(false)}
              className="w-full py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;