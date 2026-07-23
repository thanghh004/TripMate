import React from 'react';
import { MapPin, Mail, Globe, MessageCircle, Share2, Code2, Heart } from 'lucide-react';

const FOOTER_LINKS = {
  product: [
    'Trang chủ',
    'Khám phá chuyến đi',
    'Tạo chuyến đi',
    'Ghép nhóm du lịch',
  ],
  account: [
    'Hồ sơ cá nhân',
    'Chuyến đi của tôi',
    'Đăng ký tài khoản',
    'Đăng nhập',
  ],
  support: [
    'Trung tâm hỗ trợ',
    'Điều khoản dịch vụ',
    'Chính sách bảo mật',
    'Liên hệ chúng tôi',
  ],
};

const SOCIAL_LINKS = [
  { icon: MessageCircle, label: 'Facebook' },
  { icon: Share2, label: 'Instagram' },
  { icon: Globe, label: 'Website' },
  { icon: Code2, label: 'Github' },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Satisfy&display=swap');
        .footer-font-logo { font-family: 'Satisfy', cursive; }
      `}</style>

      <footer className="bg-slate-900 text-slate-400">
        {/* Main Footer Grid */}
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Logo */}
              <span className="footer-font-logo text-3xl text-white select-none block">
                TripMate
              </span>

              {/* Tagline */}
              <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
                Nền tảng tìm bạn đồng hành &amp; kết nối du lịch nhóm hàng đầu Việt Nam. Cùng nhau khám phá thế giới dễ dàng hơn.
              </p>

              {/* Contact badges */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <MapPin size={11} className="text-coral-400" />
                  </div>
                  <span>Việt Nam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <Mail size={11} className="text-coral-400" />
                  </div>
                  <span>support@tripmate.vn</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2 pt-1">
                {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-coral-500/20 hover:text-coral-400 text-slate-500 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Nav: Sản phẩm */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300">Sản phẩm</h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.product.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      className="text-sm text-slate-500 hover:text-slate-200 transition-colors hover:translate-x-0.5 inline-block cursor-pointer bg-transparent border-none p-0 font-normal"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nav: Tài khoản */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300">Tài khoản</h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.account.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      className="text-sm text-slate-500 hover:text-slate-200 transition-colors hover:translate-x-0.5 inline-block cursor-pointer bg-transparent border-none p-0 font-normal"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nav: Hỗ trợ */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300">Hỗ trợ</h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.support.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      className="text-sm text-slate-500 hover:text-slate-200 transition-colors hover:translate-x-0.5 inline-block cursor-pointer bg-transparent border-none p-0 font-normal"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <p>
              © {currentYear} <span className="text-slate-400 font-semibold">TripMate</span>. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5">
              Làm với
              <Heart size={12} className="text-coral-500 fill-coral-500 shrink-0" />
              bởi đội ngũ TripMate Việt Nam
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
