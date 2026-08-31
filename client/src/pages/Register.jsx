import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !phone) {
      setErrorMsg('Please fill in all registration fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password, phone);
    setLoading(false);

    if (res.success) {
      addToast(res.message, 'success');
      navigate('/account');
    } else {
      setErrorMsg(res.message);
      addToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white border border-luxury-gray rounded shadow-sm space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-wider">Register</h1>
        <p className="text-[10px] tracking-widest uppercase text-luxury-gold font-bold">
          Create your modest fashion profile
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <User size={14} />
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs border border-luxury-gray pl-10 pr-3 py-2.5 rounded focus:outline-none focus:border-luxury-gold"
              placeholder="Ayesha Khan"
            />
          </div>
        </div>

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

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Phone Number</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Phone size={14} />
            </span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs border border-luxury-gray pl-10 pr-3 py-2.5 rounded focus:outline-none focus:border-luxury-gold"
              placeholder="03001234567"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-luxury-textGray block">Password (min 6 characters)</label>
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
          <UserPlus size={14} />
          <span>{loading ? 'Creating Account...' : 'Register'}</span>
        </button>

      </form>

      {/* Redirect login */}
      <div className="text-center pt-4 border-t border-luxury-gray">
        <p className="text-xs text-luxury-textGray">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-luxury-goldDark font-bold hover:underline uppercase tracking-wider text-[10px]"
          >
            Sign In
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Register;
