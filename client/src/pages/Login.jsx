import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineAcademicCap, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-page__bg">
        <div className="auth-page__orb auth-page__orb--1"></div>
        <div className="auth-page__orb auth-page__orb--2"></div>
        <div className="auth-page__orb auth-page__orb--3"></div>
      </div>

      <div className="auth-page__container">
        {/* Left - Branding */}
        <div className="auth-page__branding">
          <div className="auth-page__brand-content">
            <HiOutlineAcademicCap className="auth-page__brand-icon" />
            <h1 className="auth-page__brand-title">Edumerge</h1>
            <p className="auth-page__brand-subtitle">
              Student Support & Ticket Management
            </p>
            <div className="auth-page__features">
              <div className="auth-page__feature">
                <span className="auth-page__feature-dot"></span>
                Raise & track academic requests instantly
              </div>
              <div className="auth-page__feature">
                <span className="auth-page__feature-dot"></span>
                Real-time status updates & notifications
              </div>
              <div className="auth-page__feature">
                <span className="auth-page__feature-dot"></span>
                SLA-driven resolution tracking
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="auth-page__form-section">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__header">
              <h2 className="auth-form__title">Welcome Back</h2>
              <p className="auth-form__subtitle">Sign in to your account to continue</p>
            </div>

            <div className="auth-form__body">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="form-input-wrapper">
                  <HiOutlineMail className="form-input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="form-input-wrapper">
                  <HiOutlineLockClosed className="form-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="form-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-form__submit"
                disabled={loading}
                id="login-button"
              >
                {loading ? (
                  <span className="auth-form__spinner"></span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="auth-form__footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-form__link">Create one</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
