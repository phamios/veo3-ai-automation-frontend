import React, { useState } from 'react';
import { Check, Youtube, BarChart3, Globe, LinkIcon, FileText, Zap, Menu, X } from './Icons';

const features = [
  { icon: Youtube, title: 'Video AI Tự Động', desc: 'Tạo hàng trăm video Youtube mỗi ngày với công nghệ Veo3 AI.' },
  { icon: Globe, title: 'SEO On-page & Off-page', desc: 'Tối ưu hóa website tự động, đề xuất từ khóa tiềm năng.' },
  { icon: BarChart3, title: 'Phân Tích Từ Khóa', desc: 'AI phân tích độ cạnh tranh và xu hướng tìm kiếm thời gian thực.' },
  { icon: FileText, title: 'Content Chuẩn SEO', desc: 'Tạo nội dung bài viết unique 100%, tối ưu cho Google.' },
  { icon: LinkIcon, title: 'Xây Dựng Backlink', desc: 'Tự động tìm kiếm và xây dựng hệ thống backlink chất lượng.' },
  { icon: Zap, title: 'Báo Cáo Real-time', desc: 'Theo dõi thứ hạng và hiệu suất video ngay lập tức.' },
];

const plans = [
  { name: '1 Tháng', price: '499.000đ', duration: '30 ngày', features: ['Tạo 30 video/tháng', 'SEO cơ bản'] },
  { name: '3 Tháng', price: '1.199.000đ', duration: '90 ngày', oldPrice: '1.497.000đ', save: '-20%', popular: true, features: ['Tạo 150 video/tháng', 'SEO nâng cao', 'Hỗ trợ 24/7'] },
  { name: '1 Năm', price: '3.599.000đ', duration: '365 ngày', oldPrice: '5.988.000đ', save: '-40%', features: ['Không giới hạn video', 'Full tính năng AI', 'Ưu tiên hỗ trợ'] },
];

interface LandingPageProps {
  onStart: () => Promise<void>;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = () => {
    setShowModal(true);
    setMobileMenuOpen(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await onStart();
    // Component might unmount after login success, but if not:
    setIsLoading(false); 
  };

  return (
    <div className="w-full relative">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-all">
         <div className="container mx-auto px-4 h-20 flex items-center justify-between">
           {/* Logo */}
           <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-white cursor-pointer" onClick={() => window.scrollTo(0,0)}>
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">V</div>
             Veo3 AI
           </div>

           {/* Desktop Menu */}
           <div className="hidden md:flex items-center gap-8 text-slate-300 font-medium text-sm">
             <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
             <a href="#pricing" className="hover:text-white transition-colors">Bảng giá</a>
             <a href="#" className="hover:text-white transition-colors">Hướng dẫn</a>
           </div>

           {/* Auth Buttons */}
           <div className="hidden md:flex items-center gap-4">
             <button onClick={handleAuthAction} className="text-slate-300 hover:text-white font-medium text-sm transition-colors">Đăng nhập</button>
             <button onClick={handleAuthAction} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20 hover:scale-105">
               Đăng ký ngay
             </button>
           </div>

           {/* Mobile Menu Button */}
           <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
         </div>

         {/* Mobile Menu Dropdown */}
         {mobileMenuOpen && (
           <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4 shadow-xl absolute w-full left-0 top-20">
             <a href="#features" className="block text-slate-300 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Tính năng</a>
             <a href="#pricing" className="block text-slate-300 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>Bảng giá</a>
             <button onClick={handleAuthAction} className="block w-full text-left text-slate-300 py-2 font-medium">Đăng nhập</button>
             <button onClick={handleAuthAction} className="block w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-center mt-2">Đăng ký ngay</button>
           </div>
         )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900 via-slate-900 to-slate-900 -z-10" />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-brand-300 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Công nghệ AI mới nhất 2024
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Tự Động Hóa SEO & <br />
            <span className="gradient-text">Tạo Video Youtube với Veo3</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Giải pháp tất cả trong một giúp bạn thống trị bảng xếp hạng Google và Youtube mà không cần tốn hàng giờ làm việc thủ công.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleAuthAction} className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-brand-500/25">
              Bắt Đầu Ngay
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-lg border border-slate-700 transition-all">
              Xem Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Tính Năng Vượt Trội</h2>
            <p className="text-slate-400">Công cụ mạnh mẽ nhất dành cho SEOer và Youtuber</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl hover:bg-slate-800/50 transition-colors group">
                <div className="w-12 h-12 bg-brand-900/50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Bảng Giá Linh Hoạt</h2>
            <p className="text-slate-400">Chọn gói phù hợp với nhu cầu của bạn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((p, i) => (
              <div key={i} className={`glass-card p-8 rounded-2xl relative ${p.popular ? 'border-brand-500 ring-1 ring-brand-500/50 bg-brand-900/10' : 'border-slate-700'}`}>
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-brand-500/30">
                    Phổ biến nhất
                  </div>
                )}
                <h3 className="text-xl font-medium text-slate-300 mb-2">{p.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  {p.oldPrice && <span className="text-slate-500 line-through text-sm">{p.oldPrice}</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-300">
                      <Check className="w-5 h-5 text-brand-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button onClick={handleAuthAction} className={`w-full py-3 rounded-xl font-bold transition-all ${p.popular ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                  Mua Ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <h2 className="text-2xl font-bold text-white mb-4">Veo3 AI</h2>
          <p className="mb-8">Hệ thống tự động hóa hàng đầu cho Content Creator</p>
          <div className="flex justify-center gap-6 mb-8 text-sm font-medium">
            <a href="#" className="hover:text-brand-400 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Hỗ trợ</a>
          </div>
          <p>© 2024 Veo3 AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full relative shadow-2xl">
             <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
               <X size={24} />
             </button>
             
             <div className="text-center mb-8">
               <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-brand-500/30">V</div>
               <h2 className="text-2xl font-bold text-white mb-2">Chào mừng đến với Veo3 AI</h2>
               <p className="text-slate-400">Đăng nhập hoặc đăng ký để bắt đầu hành trình tự động hóa.</p>
             </div>

             <button 
               onClick={handleGoogleLogin}
               disabled={isLoading}
               className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold text-lg py-4 rounded-xl hover:bg-slate-100 transition-colors mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isLoading ? (
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin"></div>
               ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
               )}
               {isLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
             </button>

             <p className="text-center text-xs text-slate-500 max-w-xs mx-auto">
               Bằng việc tiếp tục, bạn đồng ý với <a href="#" className="underline hover:text-slate-400">Điều khoản sử dụng</a> và <a href="#" className="underline hover:text-slate-400">Chính sách bảo mật</a> của chúng tôi.
             </p>
           </div>
         </div>
       )}
    </div>
  );
};

export default LandingPage;