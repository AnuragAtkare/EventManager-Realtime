import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { toast } from '../utils/toast';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.data.user, data.data.token);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px', position: 'relative' }}>
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />

      <div className="glass-card" style={{ width: '100%', maxWidth: 440, padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 6 }}>Start managing events in seconds</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { name: 'firstName', label: 'First Name', icon: <User size={16} />, type: 'text', placeholder: 'John', required: true },
            { name: 'middleName', label: 'Middle Name (Optional)', icon: <User size={16} />, type: 'text', placeholder: 'Michael', required: false },
            { name: 'lastName', label: 'Last Name', icon: <User size={16} />, type: 'text', placeholder: 'Doe', required: true },
            { name: 'email', label: 'Email', icon: <Mail size={16} />, type: 'email', placeholder: 'you@example.com', required: true },
            { name: 'password', label: 'Password', icon: <Lock size={16} />, type: 'password', placeholder: '••••••••', required: true },
          ].map((field) => (
            <div key={field.name} style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', 
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {field.label}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  {field.icon}
                </span>
                <input
                  className="input-field"
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
          ))}

          <p style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginTop: -8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            ⚠️ Please use your real name - it will appear in official event documents
          </p>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><span>Create Account</span> <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
