import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { user, verifyEmail, resendOTP } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);
  // Redirect if user is already verified
  useEffect(() => {
    console.log('VerifyEmail - User state:', user); // Debug log
    console.log('VerifyEmail - User role:', user?.role); // Debug log
    console.log('VerifyEmail - Is email verified:', user?.isEmailVerified); // Debug log
    
    if (user?.isEmailVerified) {
      const isAdmin = user.role === 'admin';
      console.log('User already verified, redirecting...', { isAdmin }); // Debug log
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      const result = await verifyEmail(otpCode);
      
      if (result.success) {
        // Use the updated user data from verification response
        const verifiedUser = result.user || user;
        const isAdmin = verifiedUser?.role === 'admin';
        
        console.log('Verified user:', verifiedUser); // Debug log
        console.log('User role after verification:', verifiedUser?.role); // Debug log
        
        // Redirect based on user role after successful verification
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };
  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      const result = await resendOTP();
      
      if (result.success) {
        setCanResend(false);
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <KeyIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to {user?.email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter verification code
            </label>
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend code'}
                </button>
              ) : (
                <span className="text-gray-400">
                  Resend in {countdown}s
                </span>
              )}
            </p>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
