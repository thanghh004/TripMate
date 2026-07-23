import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authApi } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { KeyRound, CheckCircle2 } from 'lucide-react';

const VerifyOtpPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const email = authContext?.registeredEmail || '';
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);

  // Nếu không có email để xác thực (người dùng tự ý truy cập URL), chuyển hướng về trang đăng ký
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.verifyOtp({ email, code });
      setIsLoading(false);
      setIsSuccessState(true);
      toast.success('Xác thực tài khoản thành công!');

      setTimeout(() => {
        setIsSuccessState(false);
        navigate('/login'); // Xác thực xong, chuyển đến đăng nhập
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      if (err.response?.data) {
        toast.error(err.response.data.message || 'Mã OTP không chính xác.');
      } else {
        toast.error('Không thể kết nối đến máy chủ Backend.');
      }
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col relative overflow-hidden items-center justify-center px-4 py-12">
      {/* Font: display serif cho tiêu đề, mono cho các nhãn kiểu "vé" */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700&family=JetBrains+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
        .font-ticket { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      `}</style>

      {/* Vệt sáng nhẹ phía trên, thay cho các quả cầu mờ màu sắc rập khuôn */}
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
                Vé · TM-03
              </span>
            </div>

            <h2 className="font-display text-[28px] leading-tight font-semibold text-slate-900">
              Xác thực OTP
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Một bước cuối cùng để kích hoạt tài khoản của bạn.
            </p>

            <div className="mt-5 font-ticket text-[11px] tracking-[0.18em] text-amber-600/90 uppercase">
              Khởi hành <span className="text-slate-300 mx-1.5">→</span> Bất kỳ đâu
            </div>
          </div>

          {/* Đường chia kiểu vé, có 2 lỗ khuyết */}
          <div className="relative">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100" />
            <div className="border-t-2 border-dashed border-amber-200 mx-6" />
          </div>

          {/* Phần thân vé: form */}
          <div className="px-8 sm:px-10 pt-7 pb-8">
            {isSuccessState ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="mx-auto text-green-500 w-16 h-16 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-900">Xác thực thành công!</h3>
                <p className="text-sm text-slate-500">Đang chuyển bạn sang màn hình Đăng nhập...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mã OTP 6 chữ số đã được gửi tới Email: <b className="text-coral-500 font-bold">{email}</b>. Vui lòng kiểm tra hộp thư.
                </p>

                <Input
                  label="Mã xác thực OTP (6 chữ số)"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  icon={<KeyRound size={18} />}
                  required
                />

                <Button type="submit" isLoading={isLoading} fullWidth className="mt-6 py-3">
                  Xác nhận mã OTP
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Chân trang kiểu cuống vé */}
        <p className="font-ticket text-center text-[10px] tracking-[0.2em] text-slate-400 uppercase mt-4">
          Giữ vé này để lên chuyến tiếp theo của bạn
        </p>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
