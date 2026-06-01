import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import BackgroundAnimation from '../components/BackgroundAnimation';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validate()) return;

    setIsLoading(true);

    if (isLogin) {
      // ===== LOGIN =====
      const requestBody = { email: formData.email, password: formData.password };
      console.log("Login Request Body:", requestBody);

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("Login API Response:", data);

        if (response.ok) {
          setSuccessMsg('Login Successful! Redirecting...');
          setTimeout(() => {
            navigate('/simulator');
          }, 1200);
        } else {
          setErrorMsg(data.message || 'Invalid Credentials');
        }
      } catch (error) {
        console.error("Login Error:", error);
        setErrorMsg('Could not connect to server. Is the backend running?');
      } finally {
        setIsLoading(false);
      }
    } else {
      // ===== SIGNUP =====
      const requestBody = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password
      };
      console.log("Signup Request Body:", requestBody);

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("Signup API Response:", data);

        if (response.ok) {
          setSuccessMsg('Account created successfully! Switching to Login...');
          setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMsg('');
          }, 2000);
        } else {
          setErrorMsg(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error("Signup Error:", error);
        setErrorMsg('Could not connect to server. Is the backend running?');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const switchTab = (isLoginTab) => {
    setIsLogin(isLoginTab);
    setErrors({});
    setSuccessMsg('');
    setErrorMsg('');
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-page-wrapper">
      <BackgroundAnimation />
      <div className="auth-container">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to continue' : 'Sign up to get started'}</p>
        </div>

        <div className="auth-tabs">
          <div className={`tab-slider ${!isLogin ? 'signup' : ''}`}></div>
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >
            Login
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >
            Signup
          </button>
        </div>

        {successMsg && (
          <div className="message-box success">
            <CheckCircle2 size={20} />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="message-box error">
            <AlertCircle size={20} />
            {errorMsg}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group form-animation-wrapper">
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="auth-input"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>
          )}

          <div className="input-group form-animation-wrapper" style={{ animationDelay: '0.1s' }}>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="auth-input"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group form-animation-wrapper" style={{ animationDelay: '0.2s' }}>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="auth-input"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="input-group form-animation-wrapper" style={{ animationDelay: '0.3s' }}>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="auth-input"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}

          <button type="submit" className="submit-btn form-animation-wrapper" style={{ animationDelay: '0.4s' }} disabled={isLoading}>
            {isLoading && <Loader2 className="spinner" size={20} />}
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
