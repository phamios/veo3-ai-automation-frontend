import React, { useState, useEffect } from 'react';
import { Check, Youtube, BarChart3, Globe, LinkIcon, FileText, Zap, Menu, X, Mail, Lock, User } from './Icons';
import { packagesApi } from '../services/api';
import { Package } from '../types';

const features = [
  { icon: Youtube, title: 'Video AI Tự Động', desc: 'Tạo hàng trăm video Youtube mỗi ngày với công nghệ Veo3 AI.' },
  { icon: Globe, title: 'SEO On-page & Off-page', desc: 'Tối ưu hóa website tự động, đề xuất từ khóa tiềm năng.' },
  { icon: BarChart3, title: 'Phân Tích Từ Khóa', desc: 'AI phân tích độ cạnh tranh và xu hướng tìm kiếm thời gian thực.' },
  { icon: FileText, title: 'Content Chuẩn SEO', desc: 'Tạo nội dung bài viết unique 100%, tối ưu cho Google.' },
  { icon: LinkIcon, title: 'Xây Dựng Backlink', desc: 'Tự động tìm kiếm và xây dựng hệ thống backlink chất lượng.' },
  { icon: Zap, title: 'Báo Cáo Real-time', desc: 'Theo dõi thứ hạng và hiệu suất video ngay lập tức.' },
];

// Format price to Vietnamese format
const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN') + 'đ';
};

interface LandingPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (email: string, password: string, name: string) => Promise<boolean>;
  authError: string | null;
  clearAuthError: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, authError, clearAuthError }) => {
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch packages on mount
  useEffect(() => {
    packagesApi.getAll()
      .then(setPackages)
      .catch(console.error);
  }, []);

  const handleLoginClick = () => {
    setIsRegisterMode(false);
    setShowModal(true);
    setMobileMenuOpen(false);
    clearAuthError();
  };

  const handleRegisterClick = () => {
    setIsRegisterMode(true);
    setShowModal(true);
    setMobileMenuOpen(false);
    clearAuthError();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setFormError(null);
    clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate confirm password for registration
    if (isRegisterMode && password !== confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    let success: boolean;
    if (isRegisterMode) {
      success = await onRegister(email, password, name);
    } else {
      success = await onLogin(email, password);
    }

    setIsLoading(false);
    if (success) {
      handleCloseModal();
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setFormError(null);
    setConfirmPassword('');
    clearAuthError();
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
             <button onClick={handleLoginClick} className="text-slate-300 hover:text-white font-medium text-sm transition-colors">Đăng nhập</button>
             <button onClick={handleRegisterClick} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20 hover:scale-105">
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
             <button onClick={handleLoginClick} className="block w-full text-left text-slate-300 py-2 font-medium">Đăng nhập</button>
             <button onClick={handleRegisterClick} className="block w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-center mt-2">Đăng ký ngay</button>
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
            Công nghệ AI mới nhất 2025
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Tự Động Hóa SEO & <br />
            <span className="gradient-text">Tạo Video Youtube với Veo3</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Giải pháp tất cả trong một giúp bạn thống trị bảng xếp hạng Google và Youtube mà không cần tốn hàng giờ làm việc thủ công.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleLoginClick} className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-brand-500/25">
              Bắt Đầu Ngay
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-lg border border-slate-700 transition-all">
              Xem Demo
            </button>
          </div>

          {/* App Download */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://drive.google.com/file/d/1E0xL-pKwJkmzQxOy2EOgOCVGR-MOjQXo/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold border border-slate-700 transition-all"
            >
              Tải App (Windows)
            </a>
            <a
              href="https://drive.google.com/file/d/1h2lGFGxZFu7iF_oCvyi25sRo77EyhP7F/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold border border-slate-700 transition-all"
            >
              Tải App (Mac)
            </a>
          </div>
          <div className="mt-2 text-slate-500 text-sm">
            Windows (.exe) • Mac (.dmg)
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
            {packages.map((pkg) => (
              <div key={pkg.id} className={`glass-card p-8 rounded-2xl relative ${pkg.isPopular ? 'border-brand-500 ring-1 ring-brand-500/50 bg-brand-900/10' : 'border-slate-700'}`}>
                {pkg.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-brand-500/30">
                    Phổ biến nhất
                  </div>
                )}
                <h3 className="text-xl font-medium text-slate-300 mb-2">{pkg.name}</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-bold text-white">{formatPrice(pkg.price)}</span>
                  {pkg.discount > 0 && <span className="text-slate-500 line-through text-sm">{formatPrice(pkg.originalPrice)}</span>}
                </div>
                <ul className="space-y-4 mb-8">
                  {(pkg.features || []).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-300">
                      <Check className="w-5 h-5 text-brand-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button onClick={handleLoginClick} className={`w-full py-3 rounded-xl font-bold transition-all ${pkg.isPopular ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
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
          <p>© 2025 Veo3 AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full relative shadow-2xl">
             <button onClick={handleCloseModal} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
               <X size={24} />
             </button>

             <div className="text-center mb-8">
               <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-brand-500/30">V</div>
               <h2 className="text-2xl font-bold text-white mb-2">
                 {isRegisterMode ? 'Tạo tài khoản mới' : 'Đăng nhập'}
               </h2>
               <p className="text-slate-400">
                 {isRegisterMode ? 'Đăng ký để bắt đầu hành trình tự động hóa.' : 'Chào mừng trở lại Veo3 AI.'}
               </p>
             </div>

             {/* Error Message */}
             {/* Error Messages */}
             {(authError || formError) && (
               <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                 {formError || authError}
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-4">
               {isRegisterMode && (
                 <div className="relative">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input
                     type="text"
                     placeholder="Họ và tên"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                     className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                   />
                 </div>
               )}

               <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input
                   type="email"
                   placeholder="Email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                 />
               </div>

               <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input
                   type="password"
                   placeholder="Mật khẩu"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   minLength={6}
                   className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                 />
               </div>

               {isRegisterMode && (
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input
                     type="password"
                     placeholder="Xác nhận mật khẩu"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     required
                     minLength={6}
                     className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                   />
                 </div>
               )}

               <button
                 type="submit"
                 disabled={isLoading}
                 className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {isLoading ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     Đang xử lý...
                   </>
                 ) : (
                   isRegisterMode ? 'Đăng ký' : 'Đăng nhập'
                 )}
               </button>
             </form>

             <div className="mt-6 text-center">
               <button
                 onClick={toggleMode}
                 className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
               >
                 {isRegisterMode ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
               </button>
             </div>

             <p className="mt-6 text-center text-xs text-slate-500 max-w-xs mx-auto">
               Bằng việc tiếp tục, bạn đồng ý với <a href="#" className="underline hover:text-slate-400">Điều khoản sử dụng</a> và <a href="#" className="underline hover:text-slate-400">Chính sách bảo mật</a> của chúng tôi.
             </p>
           </div>
         </div>
       )}
    </div>
  );
};

export default LandingPage;
