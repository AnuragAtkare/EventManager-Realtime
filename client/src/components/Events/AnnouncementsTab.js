import React, { useState, useEffect } from 'react';
import { announcementAPI, committeeAPI } from '../../utils/api';
import { toast } from '../../utils/toast';
import { Plus, X, Pin, Trash2, Bell, CreditCard, Clock } from 'lucide-react';

const AnnouncementsTab = ({ event, user, isHead }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: 'global', committeeId: '', title: '', content: '', paymentAmount: '', paymentPurpose: '', paymentDeadline: '' });

  useEffect(() => {
    fetchAnnouncements();
    if (event.hasCommittees) {
      committeeAPI.getByEvent(event._id).then(({ data }) => setCommittees(data.data.committees)).catch(() => {});
    }
  }, [event._id]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await announcementAPI.getByEvent(event._id);
      setAnnouncements(data.data.announcements);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return toast.error('Title and content are required');
    if (form.type === 'payment' && (!form.paymentAmount || Number(form.paymentAmount) <= 0)) return toast.error('Payment amount must be positive');

    try {
      const { data } = await announcementAPI.create({
        eventId: event._id,
        ...form,
        paymentAmount: form.type === 'payment' ? Number(form.paymentAmount) : undefined,
      });
      toast.success('Announcement created');
      setAnnouncements((prev) => [data.data.announcement, ...prev]);
      setShowCreate(false);
      setForm({ type: 'global', committeeId: '', title: '', content: '', paymentAmount: '', paymentPurpose: '', paymentDeadline: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handlePin = async (id) => {
    try {
      await announcementAPI.pin(id);
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to pin');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementAPI.delete(id);
      toast.success('Deleted');
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast.error('Failed');
    }
  };

  const typeColors = {
    global: { bg: 'rgba(108,99,255,0.1)', border: 'var(--accent-primary)', text: 'var(--accent-primary)', label: 'Global' },
    committee: { bg: 'rgba(255,101,132,0.1)', border: 'var(--accent-secondary)', text: 'var(--accent-secondary)', label: 'Committee' },
    payment: { bg: 'rgba(0,200,83,0.1)', border: 'var(--accent-success)', text: 'var(--accent-success)', label: 'Payment' },
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Announcements ({announcements.length})</h2>
        {isHead && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create</button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Bell size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No announcements yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map((a) => {
            const tc = typeColors[a.type] || typeColors.global;
            return (
              <div key={a._id} className="glass-card" style={{ padding: '22px', borderLeft: `3px solid ${tc.border}`, position: 'relative' }}>
                {a.isPinned && (
                  <div style={{ position: 'absolute', top: 12, right: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Pin size={13} color="var(--accent-warning)" fill="var(--accent-warning)" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-warning)', fontWeight: 600 }}>Pinned</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ background: tc.bg, color: tc.text, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {a.type === 'payment' ? <><CreditCard size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{tc.label}</> : tc.label}
                  </span>
                  {a.committeeId && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      · {committees.find((c) => c._id === a.committeeId)?.name || 'Committee'}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{a.title}</h3>
                <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a.content}</p>

                {/* Payment details */}
                {a.type === 'payment' && (
                  <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(0,200,83,0.08)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-success)', fontSize: '1.1rem' }}>₹{a.paymentAmount?.toLocaleString()}</div>
                    </div>
                    {a.paymentPurpose && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Purpose</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{a.paymentPurpose}</div>
                      </div>
                    )}
                    {a.paymentDeadline && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deadline</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} /> {new Date(a.paymentDeadline).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    By {a.createdBy?.firstName && a.createdBy?.lastName 
                      ? `${a.createdBy.firstName}${a.createdBy.middleName ? ' ' + a.createdBy.middleName : ''} ${a.createdBy.lastName}` 
                      : 'Unknown'} · {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                  {isHead && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handlePin(a._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.isPinned ? 'var(--accent-warning)' : 'var(--text-muted)', padding: 4 }}>
                        <Pin size={16} />
                      </button>
                      <button onClick={() => handleDelete(a._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', padding: 4 }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }} onClick={() => setShowCreate(false)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: '36px', background: 'var(--bg-card)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>New Announcement</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate}>
              {/* Type selector */}
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {['global', 'committee', 'payment'].map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })} style={{
                    flex: 1, padding: '9px 8px', borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${form.type === t ? typeColors[t].border : 'var(--border-color)'}`,
                    background: form.type === t ? typeColors[t].bg : 'var(--bg-input)',
                    color: form.type === t ? typeColors[t].text : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'var(--font-primary)',
                  }}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Committee selector (for committee type) */}
              {form.type === 'committee' && (
                <>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Committee</label>
                  <select value={form.committeeId} onChange={(e) => setForm({ ...form, committeeId: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-primary)', fontSize: '0.88rem', marginBottom: 16, cursor: 'pointer' }}>
                    <option value="">Select committee</option>
                    {committees.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </>
              )}

              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
              <input className="input-field" placeholder="Announcement title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 14 }} />

              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Content</label>
              <textarea className="input-field" placeholder="Write your announcement..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} style={{ marginBottom: 16, resize: 'vertical' }} />

              {/* Payment fields */}
              {form.type === 'payment' && (
                <div style={{ background: 'rgba(0,200,83,0.06)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount (₹)</label>
                  <input className="input-field" type="number" placeholder="500" value={form.paymentAmount} onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })} style={{ marginBottom: 12 }} />
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Purpose</label>
                  <input className="input-field" placeholder="T-shirt + Kit" value={form.paymentPurpose} onChange={(e) => setForm({ ...form, paymentPurpose: e.target.value })} style={{ marginBottom: 12 }} />
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deadline</label>
                  <input className="input-field" type="date" value={form.paymentDeadline} onChange={(e) => setForm({ ...form, paymentDeadline: e.target.value })} />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Announcement</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTab;
