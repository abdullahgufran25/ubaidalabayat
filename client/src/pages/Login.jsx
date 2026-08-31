import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const redirectPath = location.state?.from || '/account';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      addToast(res.message, 'success');
      // Navigation handled by useEffect
    } else {
      setErrorMsg(res.message);
      addToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white border border-luxury-gray rounded shadow-sm space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wider">Log In</h1>
        <p className="text-[10px] tracking-widest uppercase text-luxury-gold font-bold">
          Access your modest collection account
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Mail size={14} />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs border border-luxury-gray pl-10 pr-3 py-2.5 rounded focus:outline-none focus:border-luxury-gold"
              placeholder="ayesha@gmail.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Lock size={14} />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs border border-luxury-gray pl-10 pr-3 py-2.5 rounded focus:outline-none focus:border-luxury-gold"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full luxury-btn py-3 text-xs font-semibold flex items-center justify-center space-x-2 mt-4"
        >
          <LogIn size={14} />
          <span>{loading ? 'Logging in...' : 'Sign In'}</span>
        </button>

      </form>

      {/* Redirect registration */}
      <div className="text-center pt-4 border-t border-luxury-gray">
        <p className="text-xs text-luxury-textGray">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-luxury-goldDark font-bold hover:underline uppercase tracking-wider text-[10px]"
          >
            Create Account
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Login;
