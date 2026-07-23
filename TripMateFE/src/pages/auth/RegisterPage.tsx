import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authApi } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Lock } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    try {
      await authApi.register({
        fullName,
        email,
        password,
      });

      if (authContext) {
        authContext.setRegisteredEmail(email);
      }

      setIsLoading(false);
      toast.success('Đăng ký tài khoản thành công! Vui lòng nhập mã OTP.');
      navigate('/verify-otp');
    } catch (err: any) {
      setIsLoading(false);
      if (err.response?.data) {
        const resData = err.response.data;
        if (resData.errors) {
          setFieldErrors(resData.errors);
        }
        toast.error(resData.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      } else {
        toast.error('Không thể kết nối đến máy chủ Backend.');
      }
    }
  };

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
                Vé · TM-02
              </span>
            </div>

            <h2 className="font-display text-[28px] leading-tight font-semibold text-slate-900">
              Đăng ký tài khoản
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Khám phá và kết nối cùng cộng đồng du lịch TripMate.
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
          <form onSubmit={handleSubmit} className="px-8 sm:px-10 pt-7 pb-8 space-y-4">
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên của bạn"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={fieldErrors['FullName']?.[0] || fieldErrors['fullName']?.[0]}
              icon={<User size={18} />}
              required
            />

            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors['Email']?.[0] || fieldErrors['email']?.[0]}
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors['Password']?.[0] || fieldErrors['password']?.[0]}
              icon={<Lock size={18} />}
              required
            />

            <Button type="submit" isLoading={isLoading} fullWidth className="mt-6 py-3">
              Đăng ký & Nhận mã OTP
            </Button>

            <div className="text-center mt-6 text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-coral-500 font-bold hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>

        {/* Chân trang kiểu cuống vé */}
        <p className="font-ticket text-center text-[10px] tracking-[0.2em] text-slate-400 uppercase mt-4">
          Giữ vé này để lên chuyến tiếp theo của bạn
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
