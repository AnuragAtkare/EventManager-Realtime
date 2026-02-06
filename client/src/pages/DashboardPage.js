import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventAPI } from '../utils/api';
import { toast } from '../utils/toast';
import { Plus, Search, CalendarDays, Users, ArrowRight, X, Crown } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [search, setSearch] = useState('');

  // Create form
  const [createForm, setCreateForm] = useState({ title: '', description: '', eventType: 'small', hasCommittees: false });
  const [createLoading, setCreateLoading] = useState(false);

  // Join form
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await eventAPI.getMyEvents();
      setEvents(data.data.events);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) return toast.error('Event title is required');
    setCreateLoading(true);
    try {
      const { data } = await eventAPI.create(createForm);
      toast.success('Event created successfully!');
      setEvents((prev) => [data.data.event, ...prev]);
      setShowCreate(false);
      setCreateForm({ title: '', description: '', eventType: 'small', hasCommittees: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return toast.error('Enter the event code');
    setJoinLoading(true);
    try {
      const { data } = await eventAPI.join({ eventCode: joinCode });
      toast.success(data.message);
      setShowJoin(false);
      setJoinCode('');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join event');
    } finally {
      setJoinLoading(false);
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', padding: '88px 24px 60px', position: 'relative' }}>
      <div className="ambient-blob blob-1" style={{ opacity: 0.15 }} />
      <div className="ambient-blob blob-2" style={{ opacity: 0.15 }} />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Events</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
              Welcome, <strong>{user?.fullName || user?.displayName || (user?.firstName + ' ' + user?.middleName + ' ' + user?.lastName)}</strong> — {events.length} event{events.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setShowJoin(true)}><Search size={16} /> Join Event</button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Event</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <CalendarDays size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {events.length === 0 ? 'No events yet. Create one or join using an event code!' : 'No results match your search.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {filtered.map((event) => {
              const isHead = event.head === user._id || event.head?._id === user._id;
              return (
                <div
                  key={event._id}
                  className="glass-card"
                  onClick={() => navigate(`/event/${event._id}`)}
                  style={{ padding: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  {/* Gradient accent strip */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span className={`badge ${isHead ? 'badge-head' : 'badge-volunteer'}`}>
                      {isHead ? <><Crown size={11} /> Head</> : 'Volunteer'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {event.eventType === 'large' ? '🏛 Large' : '🎯 Small'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{event.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                    {event.description || 'No description'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={13} /> {event.participants?.length || 0} participants
                    </span>
                    <ArrowRight size={16} color="var(--accent-primary)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }} onClick={() => setShowCreate(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: '40px', background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create New Event</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
              <input className="input-field" placeholder="Tech Fest 2025" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} style={{ marginBottom: 16 }} />

              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
              <textarea className="input-field" placeholder="Brief description..." value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={3} style={{ marginBottom: 16, resize: 'vertical' }} />

              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Event Type</label>
              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                {['small', 'large'].map((type) => (
                  <button key={type} type="button" onClick={() => setCreateForm({ ...createForm, eventType: type })} style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: `2px solid ${createForm.eventType === type ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: createForm.eventType === type ? 'rgba(108,99,255,0.1)' : 'var(--bg-input)',
                    color: createForm.eventType === type ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-primary)',
                  }}>
                    {type === 'small' ? '🎯' : '🏛'} {type}
                  </button>
                ))}
              </div>

              {createForm.eventType === 'large' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer' }}>
                  <input type="checkbox" checked={createForm.hasCommittees} onChange={(e) => setCreateForm({ ...createForm, hasCommittees: e.target.checked })} style={{ accentColor: 'var(--accent-primary)', width: 18, height: 18 }} />
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Enable Committees</span>
                </label>
              )}

              <button type="submit" className="btn btn-primary" disabled={createLoading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}>
                {createLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }} onClick={() => setShowJoin(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 420, padding: '40px', background: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Join an Event</h2>
              <button onClick={() => setShowJoin(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Enter the 8-character event code shared by the organizer</p>
            <form onSubmit={handleJoin}>
              <input
                className="input-field"
                placeholder="e.g. A1B2C3D4"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                style={{ textAlign: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: 18 }}
                maxLength={8}
              />
              <button type="submit" className="btn btn-primary" disabled={joinLoading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                {joinLoading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Join Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
