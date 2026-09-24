import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePhone,
  HiOutlineIdentification,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    phone: '',
    studentId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Information Technology',
    'Chemical',
    'Biotechnology',
    'Other',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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
              Join your college's support platform
            </p>
            <div className="auth-page__features">
              <div className="auth-page__feature">
                <span className="auth-page__feature-dot"></span>
                Quick request submission
              </div>
              <div className="auth-page__feature">
                <span className="auth-page__feature-dot"></span>
                Transparent resolution tracking
              </div>
              <div className="auth-page__feature">
                <span className="auth-page__feature-dot"></span>
                Priority-based SLA guarantees
              </div>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="auth-page__form-section">
          <form className="auth-form auth-form--register" onSubmit={handleSubmit}>
            <div className="auth-form__header">
              <h2 className="auth-form__title">Create Account</h2>
              <p className="auth-form__subtitle">Fill in your details to get started</p>
            </div>

            <div className="auth-form__body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <div className="form-input-wrapper">
                    <HiOutlineUser className="form-input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email" className="form-label">Email *</label>
                  <div className="form-input-wrapper">
                    <HiOutlineMail className="form-input-icon" />
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      className="form-input"
                      placeholder="you@college.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-password" className="form-label">Password *</label>
                  <div className="form-input-wrapper">
                    <HiOutlineLockClosed className="form-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="reg-password"
                      name="password"
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="form-input-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
                  <div className="form-input-wrapper">
                    <HiOutlineLockClosed className="form-input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department" className="form-label">Department</label>
                  <select
                    id="department"
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="studentId" className="form-label">Student/Staff ID</label>
                  <div className="form-input-wrapper">
                    <HiOutlineIdentification className="form-input-icon" />
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      className="form-input"
                      placeholder="e.g. CS2024001"
                      value={formData.studentId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className="form-input-wrapper">
                  <HiOutlinePhone className="form-input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-form__submit"
                disabled={loading}
                id="register-button"
              >
                {loading ? (
                  <span className="auth-form__spinner"></span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="auth-form__footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-form__link">Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
