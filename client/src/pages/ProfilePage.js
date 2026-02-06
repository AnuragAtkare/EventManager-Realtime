import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { toast } from '../utils/toast';
import { User, Mail, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    middleName: user?.middleName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'avatar') {
      setPreviewAvatar(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.middleName || !form.lastName) {
      return toast.error('All name fields are required');
    }

    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      login(data.data.user, localStorage.getItem('token'));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${form.firstName} ${form.middleName} ${form.lastName}`;

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 60px', position: 'relative' }}>
      <div className="ambient-blob blob-1" style={{ opacity: 0.15 }} />
      <div className="ambient-blob blob-2" style={{ opacity: 0.15 }} />

      <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-ghost"
          style={{ marginBottom: 24, padding: '8px 16px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '40px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Edit Profile
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Update your personal information and avatar
            </p>
          </div>

          {/* Avatar Section */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Profile"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid var(--accent-primary)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: previewAvatar ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  border: '4px solid var(--accent-primary)',
                }}
              >
                {form.firstName?.charAt(0) || 'U'}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '3px solid var(--bg-card)',
                }}
              >
                <Camera size={18} color="#fff" />
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {fullName}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Mail size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {user?.email}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                First Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  className="input-field"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Middle Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  className="input-field"
                  name="middleName"
                  type="text"
                  placeholder="Michael"
                  value={form.middleName}
                  onChange={handleChange}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Last Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  className="input-field"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Avatar URL
              </label>
              <div style={{ position: 'relative' }}>
                <Camera
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  className="input-field"
                  name="avatar"
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.avatar}
                  onChange={handleChange}
                  style={{ paddingLeft: 38 }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Paste an image URL from the web (e.g., from Imgur, Cloudinary)
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '13px',
                fontSize: '0.95rem',
              }}
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
