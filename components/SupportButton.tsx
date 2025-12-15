import React, { useState } from 'react';
import { Headset, X } from './Icons';

const SupportButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* FAB Button - Enhanced with gradient and glow */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40
                   w-16 h-16 rounded-full
                   bg-gradient-to-br from-brand-500 to-brand-700
                   shadow-lg shadow-brand-500/40 hover:shadow-xl hover:shadow-brand-500/60
                   flex items-center justify-center
                   transition-all duration-300 hover:scale-110
                   border-2 border-brand-400/50
                   group"
        aria-label="Hỗ trợ"
        title="Nhóm hỗ trợ Zalo"
      >
        <Headset className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />

        {/* Pulse animation ring */}
        <span className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping" />
      </button>

      {/* Centered Modal with backdrop */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-700">
              <div className="flex items-center gap-3">
                <Headset className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-lg">Hỗ trợ khách hàng</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code - Large and centered */}
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner">
                <img
                  src="/images/zalo.png"
                  alt="Zalo QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>

              <p className="text-slate-300 text-center mt-6 font-medium">
                Quét mã QR để tham gia nhóm hỗ trợ
              </p>
              <p className="text-slate-500 text-sm text-center mt-2">
                Chúng tôi sẵn sàng hỗ trợ bạn 24/7
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportButton;
