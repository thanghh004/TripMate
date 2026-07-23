import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { Mail, KeyRound, Lock, ArrowLeft } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

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
      handleClose();
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Khôi phục mật khẩu">
      <div className="p-6 bg-white text-slate-800">
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Nhập địa chỉ Email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi một mã OTP 6 số để giúp bạn đặt lại mật khẩu.
            </p>

            <Input
              label="Địa chỉ Email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              required
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Hủy bỏ
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Gửi mã OTP
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg">
              <span>Mã OTP đã được gửi đến <strong>{email}</strong></span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-coral-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Thay đổi Email
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

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Hủy bỏ
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Đặt lại mật khẩu
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
