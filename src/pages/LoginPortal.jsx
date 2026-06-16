import React, { useState } from 'react';
import { sendOTP, verifyOTP } from '../services/api';
import { ArrowLeft, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

export default function LoginPortal({ onLoginSuccess, onGoBack }) {
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1: Phone number, 2: OTP Entry
  const [receivedOtp, setReceivedOtp] = useState(''); // Holds OTP in dev builds
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.trim().length !== 10) {
      setToastMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsLoading(true);
    setToastMessage('');
    try {
      const data = await sendOTP(phone);
      setReceivedOtp(data.otp);
      setStep(2);
    } catch (err) {
      setToastMessage(err.message || 'Failed to request code. Check connection.');
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpCode.trim().length !== 6) {
      setToastMessage('Please enter the 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setToastMessage('');
    try {
      const data = await verifyOTP(phone, otpCode);
      onLoginSuccess(
        data.access_token,
        data.role || 'customer',
        data.user?.full_name || (data.role === 'admin' ? 'Global Administrator' : 'Merchant Store')
      );
    } catch (err) {
      setToastMessage(err.message || 'The verification code entered is invalid.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glass-panel w-full max-w-md p-8 relative z-10">
        <button
          onClick={onGoBack}
          data-testid="back-button"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <h2 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
          Secure Login Portal
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          Access the Digipay system. Test admin access by typing <strong className="text-slate-200">9999999999</strong>.
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Mobile Number
              </label>
              <div className="flex items-center gap-3 bg-slate-950/80 border border-white/10 focus-within:border-brand-blue/50 rounded-2xl p-4 transition-colors">
                <Phone className="w-5 h-5 text-slate-500 shrink-0" />
                <span className="text-slate-400 font-bold text-sm border-r border-white/10 pr-3">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={isLoading}
                  data-testid="phone-input"
                  className="bg-transparent border-none text-slate-100 placeholder-slate-600 focus:outline-none flex-1 font-semibold text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              data-testid="login-button"
              className="w-full py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Requesting...
                </>
              ) : (
                'Request Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                data-testid="otp-input"
                autoFocus
                className="w-full tracking-[1em] text-center bg-slate-950/80 border border-white/10 focus-within:border-brand-blue/50 rounded-2xl p-4 text-2xl font-extrabold text-slate-100 focus:outline-none"
              />
            </div>

            {receivedOtp && (
              <div
                data-testid="otp-help-block"
                className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 text-center text-xs leading-normal text-amber-200"
              >
                <strong>Developer Code:</strong>{' '}
                <span className="font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-extrabold text-sm ml-1 select-all">
                  {receivedOtp}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              data-testid="login-button"
              className="w-full py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Verify & Continue
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtpCode('');
                setToastMessage('');
              }}
              disabled={isLoading}
              className="w-full text-center text-slate-400 hover:text-white text-xs font-semibold underline block transition-colors"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
