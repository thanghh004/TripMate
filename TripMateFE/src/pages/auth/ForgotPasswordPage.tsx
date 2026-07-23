import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { Mail, KeyRound, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Bước 1: Gửi yêu cầu OTP quên mật khẩu
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập địa chỉ Email.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setIsLoading(false);
      toast.success('Mã OTP khôi phục mật khẩu đã được gửi về hòm thư Email của bạn!');
      setStep(2);
    } catch (err: any) {
      setIsLoading(false);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Không thể gửi yêu cầu quên mật khẩu. Vui lòng thử lại.');
      }
    }
  };

  // Bước 2: Đặt lại mật khẩu mới bằng mã OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      toast.error('Vui lòng nhập mã OTP gồm đúng 6 chữ số.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      setIsLoading(false);
      toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.');
      navigate('/login');
    } catch (err: any) {
      setIsLoading(false);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col relative overflow-hidden items-center justify-center px-4 py-12">
      {/* Font display serif & JetBrains Mono */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700&family=JetBrains+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .font-ticket { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      `}</style>

      {/* Vệt sáng nền nhẹ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(255,255,255,0.9) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Thẻ dạng boarding pass */}
        <div className="bg-white rounded-[28px] shadow-xl shadow-slate-900/[0.06] border border-slate-200/70 relative">
          {/* Phần đầu vé: thương hiệu + tiêu đề */}
          <div className="px-8 sm:px-10 pt-8 pb-7">
            <div className="flex items-center justify-end mb-6">
              <span className="font-ticket text-[10px] tracking-[0.2em] text-slate-400 uppercase">
                KHÔI PHỤC · TM-03
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-coral-50 border border-coral-100 flex items-center justify-center text-coral-600 mb-4">
              <ShieldCheck size={24} />
            </div>

            {step === 1 ? (
              <>
                <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  Quên mật khẩu?
                </h1>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Nhập địa chỉ Email đăng ký tài khoản. Chúng tôi sẽ gửi mã OTP 6 số giúp bạn khôi phục mật khẩu.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  Đặt lại mật khẩu
                </h1>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Nhập mã OTP vừa nhận từ Email và thiết lập mật khẩu mới cho tài khoản của bạn.
                </p>
              </>
            )}
          </div>

          {/* Đường chia kiểu vé, có 2 lỗ khuyết */}
          <div className="relative">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100" />
            <div className="border-t-2 border-dashed border-amber-200 mx-6" />
          </div>

          {/* Thân vé: Form nhập liệu */}
          <div className="p-8 sm:p-10 pt-7">
            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <Input
                  label="Địa chỉ Email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={18} />}
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Gửi mã OTP xác thực
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                    <span>Gửi tới <strong className="font-semibold">{email}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-coral-600 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    Đổi Email
                  </button>
                </div>

                <Input
                  label="Mã xác thực OTP (6 chữ số)"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  icon={<KeyRound size={18} />}
                  required
                />

                <Input
                  label="Mật khẩu mới"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  required
                />

                <Input
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock size={18} />}
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Xác nhận đổi mật khẩu
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Chân trang kiểu cuống vé */}
        <p className="font-ticket text-center text-[10px] tracking-[0.2em] text-slate-400 uppercase mt-4">
          Đã nhớ mật khẩu?{' '}
          <Link to="/login" className="text-coral-500 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
